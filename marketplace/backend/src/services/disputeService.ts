import { getDatabase } from '../config/database'
import { Dispute, DisputeStatus } from '../types'
import { v4 as uuid } from 'uuid'
import { getOrderById, updateOrderStatus } from './orderService'
import { createNotification } from './notificationService'

export async function createDispute(input: {
  orderId: string
  openedByUserId: string
  reason: string
  description?: string
}): Promise<Dispute> {
  const db = await getDatabase()
  const order = await getOrderById(input.orderId)
  if (!order) throw new Error('Order not found')

  const existingOpenDispute = await db.get<Dispute>(
    "SELECT * FROM disputes WHERE orderId = ? AND status IN ('open', 'under_review')",
    [input.orderId]
  )

  if (existingOpenDispute) {
    throw new Error('An active dispute already exists for this order')
  }

  const disputeId = uuid()
  await db.run(
    `INSERT INTO disputes (id, orderId, openedByUserId, reason, description, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [disputeId, input.orderId, input.openedByUserId, input.reason, input.description || null]
  )

  await updateOrderStatus(input.orderId, 'disputed')

  await Promise.all([
    createNotification({
      userId: order.vendorId,
      type: 'dispute_opened',
      title: 'Order dispute opened',
      message: `A dispute has been opened for order ${order.id}.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    }),
    createNotification({
      userId: order.wholesalerId,
      type: 'dispute_opened',
      title: 'Dispute submitted',
      message: `Your dispute for order ${order.id} is now under review.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    }),
  ])

  const dispute = await getDisputeById(disputeId)
  if (!dispute) throw new Error('Failed to create dispute')
  return dispute
}

export async function getDisputeById(disputeId: string): Promise<Dispute | null> {
  const db = await getDatabase()
  return await db.get<Dispute>('SELECT * FROM disputes WHERE id = ?', [disputeId]) || null
}

export async function listDisputes(filter?: { orderId?: string; userId?: string; status?: DisputeStatus }): Promise<Dispute[]> {
  const db = await getDatabase()
  let query = 'SELECT * FROM disputes WHERE 1=1'
  const params: string[] = []

  if (filter?.orderId) {
    query += ' AND orderId = ?'
    params.push(filter.orderId)
  }

  if (filter?.userId) {
    query += ' AND openedByUserId = ?'
    params.push(filter.userId)
  }

  if (filter?.status) {
    query += ' AND status = ?'
    params.push(filter.status)
  }

  query += ' ORDER BY createdAt DESC'
  return await db.all<Dispute[]>(query, params)
}

export async function updateDisputeStatus(disputeId: string, status: DisputeStatus, resolution?: string): Promise<Dispute> {
  const db = await getDatabase()
  const dispute = await getDisputeById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  await db.run(
    `UPDATE disputes
     SET status = ?, resolution = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, resolution || null, disputeId]
  )

  const updated = await getDisputeById(disputeId)
  if (!updated) throw new Error('Failed to update dispute')

  const order = await getOrderById(updated.orderId)
  if (order && status === 'resolved') {
    await createNotification({
      userId: order.vendorId,
      type: 'dispute_resolved',
      title: 'Dispute resolved',
      message: `The dispute for order ${order.id} has been resolved.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    })
    await createNotification({
      userId: order.wholesalerId,
      type: 'dispute_resolved',
      title: 'Dispute resolved',
      message: `The dispute for order ${order.id} has been resolved.`,
      relatedEntityType: 'order',
      relatedEntityId: order.id,
    })
  }

  return updated
}
