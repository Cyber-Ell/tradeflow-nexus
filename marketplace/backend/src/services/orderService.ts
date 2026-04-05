import { getDatabase } from '../config/database'
import { Order, OrderItem, OrderStatus } from '../types'
import { v4 as uuid } from 'uuid'
import { getEffectiveProductPrice, getProductById } from './productService'
import { createNotification } from './notificationService'

export interface CreateOrderItemInput {
  productId: string
  quantity: number
}

export async function createOrder(
  wholesalerId: string,
  vendorId: string,
  items: CreateOrderItemInput[],
  deliveryAddress: string
): Promise<Order> {
  const db = await getDatabase()
  const orderId = uuid()
  let total = 0

  // Calculate total and verify products
  const orderItems: Array<{
    id: string
    orderId: string
    productId: string
    productName: string
    unitPrice: number
    quantity: number
  }> = []

  for (const item of items) {
    const product = await getProductById(item.productId)
    if (!product) throw new Error(`Product ${item.productId} not found`)
    if (product.vendorId !== vendorId) throw new Error('Invalid product for this vendor')
    if (product.quantity < item.quantity) throw new Error(`Insufficient quantity for ${product.name}`)

    const effectiveUnitPrice = await getEffectiveProductPrice(item.productId, item.quantity)

    total += effectiveUnitPrice * item.quantity
    orderItems.push({
      id: uuid(),
      orderId,
      productId: item.productId,
      productName: product.name,
      unitPrice: effectiveUnitPrice,
      quantity: item.quantity,
    })
  }

  await db.exec('BEGIN')

  try {
    await db.run(
      `INSERT INTO orders (id, wholesalerId, vendorId, status, total, items, deliveryAddress, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        orderId,
        wholesalerId,
        vendorId,
        'pending_payment',
        total,
        JSON.stringify(orderItems.map((item) => ({
          productId: item.productId,
          name: item.productName,
          price: item.unitPrice,
          quantity: item.quantity,
        }))),
        deliveryAddress,
      ]
    )

    for (const item of orderItems) {
      await db.run(
        `INSERT INTO order_items (id, orderId, productId, productName, unitPrice, quantity, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [item.id, item.orderId, item.productId, item.productName, item.unitPrice, item.quantity]
      )
    }

    await db.exec('COMMIT')
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }

  const order = await getOrderById(orderId)
  if (!order) throw new Error('Failed to create order')

  await Promise.all([
    createNotification({
      userId: wholesalerId,
      type: 'order_created',
      title: 'Order created',
      message: `Order ${order.id} has been created and is awaiting payment.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    }),
    createNotification({
      userId: vendorId,
      type: 'new_order',
      title: 'New order received',
      message: `A new order ${order.id} is awaiting payment confirmation.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    }),
  ])

  return order
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const db = await getDatabase()
  const order = await db.get<Order>('SELECT * FROM orders WHERE id = ?', [orderId]) || null
  if (!order) {
    return null
  }

  order.orderItems = await getOrderItemsByOrderId(order.id)
  return order
}

export async function getOrders(filter?: {
  wholesalerId?: string
  vendorId?: string
  status?: OrderStatus
}): Promise<Order[]> {
  const db = await getDatabase()
  let query = 'SELECT * FROM orders WHERE 1=1'
  const params: any[] = []

  if (filter?.wholesalerId) {
    query += ' AND wholesalerId = ?'
    params.push(filter.wholesalerId)
  }
  if (filter?.vendorId) {
    query += ' AND vendorId = ?'
    params.push(filter.vendorId)
  }
  if (filter?.status) {
    query += ' AND status = ?'
    params.push(filter.status)
  }

  query += ' ORDER BY createdAt DESC'
  const orders = await db.all<Order[]>(query, params)

  return Promise.all(
    orders.map(async (order) => ({
      ...order,
      orderItems: await getOrderItemsByOrderId(order.id),
    }))
  )
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const db = await getDatabase()
  
  const order = await getOrderById(orderId)
  if (!order) throw new Error('Order not found')
  ensureValidOrderStatusTransition(order.status, status)

  await db.run(
    'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [status, orderId]
  )

  const updated = await getOrderById(orderId)
  if (!updated) throw new Error('Failed to update order')

  if (updated.status !== order.status) {
    await notifyOrderStatusChange(updated)
  }

  return updated
}

export async function updateOrderTracking(orderId: string, trackingNumber: string): Promise<Order> {
  const db = await getDatabase()
  
  const order = await getOrderById(orderId)
  if (!order) throw new Error('Order not found')

  await db.run(
    'UPDATE orders SET trackingNumber = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [trackingNumber, orderId]
  )

  const updated = await getOrderById(orderId)
  if (!updated) throw new Error('Failed to update order')
  return updated
}

async function getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
  const db = await getDatabase()
  return await db.all<OrderItem[]>(
    'SELECT * FROM order_items WHERE orderId = ? ORDER BY createdAt ASC',
    [orderId]
  )
}

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'disputed'],
  processing: ['shipped', 'cancelled', 'disputed'],
  shipped: ['delivered', 'disputed'],
  delivered: ['completed', 'disputed'],
  completed: [],
  cancelled: [],
  disputed: ['processing', 'shipped', 'delivered', 'completed', 'cancelled'],
}

function ensureValidOrderStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): void {
  if (currentStatus === nextStatus) {
    return
  }

  if (!ORDER_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)) {
    throw new Error(`Cannot move order from ${currentStatus} to ${nextStatus}`)
  }
}

async function notifyOrderStatusChange(order: Order): Promise<void> {
  const statusText = order.status.replace(/_/g, ' ')

  await Promise.all([
    createNotification({
      userId: order.vendorId,
      type: 'order_status_updated',
      title: 'Order status updated',
      message: `Order ${order.id} is now ${statusText}.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    }),
    createNotification({
      userId: order.wholesalerId,
      type: 'order_status_updated',
      title: 'Order status updated',
      message: `Order ${order.id} is now ${statusText}.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    }),
  ])
}
