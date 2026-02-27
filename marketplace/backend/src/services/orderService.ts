import { getDatabase } from '../config/database'
import { Order, OrderStatus } from '../types'
import { v4 as uuid } from 'uuid'
import { getProductById } from './productService'

export interface OrderItem {
  productId: string
  quantity: number
}

export async function createOrder(
  wholesalerId: string,
  vendorId: string,
  items: OrderItem[],
  deliveryAddress: string
): Promise<Order> {
  const db = await getDatabase()
  const orderId = uuid()
  let total = 0

  // Calculate total and verify products
  const orderItems: any[] = []
  for (const item of items) {
    const product = await getProductById(item.productId)
    if (!product) throw new Error(`Product ${item.productId} not found`)
    if (product.vendorId !== vendorId) throw new Error('Invalid product for this vendor')
    if (product.quantity < item.quantity) throw new Error(`Insufficient quantity for ${product.name}`)

    total += product.price * item.quantity
    orderItems.push({
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    })
  }

  await db.run(
    `INSERT INTO orders (id, wholesalerId, vendorId, status, total, items, deliveryAddress, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [orderId, wholesalerId, vendorId, 'pending', total, JSON.stringify(orderItems), deliveryAddress]
  )

  const order = await getOrderById(orderId)
  if (!order) throw new Error('Failed to create order')
  return order
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const db = await getDatabase()
  return await db.get('SELECT * FROM orders WHERE id = ?', [orderId]) || null
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
  return await db.all(query, params)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const db = await getDatabase()
  
  const order = await getOrderById(orderId)
  if (!order) throw new Error('Order not found')

  await db.run(
    'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [status, orderId]
  )

  const updated = await getOrderById(orderId)
  if (!updated) throw new Error('Failed to update order')
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