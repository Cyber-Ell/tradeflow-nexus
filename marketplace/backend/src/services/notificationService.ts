import { getDatabase } from '../config/database'
import { Notification } from '../types'
import { v4 as uuid } from 'uuid'

export async function createNotification(input: {
  userId: string
  type: string
  title: string
  message: string
  relatedEntityType?: string
  relatedEntityId?: string
}): Promise<Notification> {
  const db = await getDatabase()
  const id = uuid()

  await db.run(
    `INSERT INTO notifications (id, userId, type, title, message, relatedEntityType, relatedEntityId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      id,
      input.userId,
      input.type,
      input.title,
      input.message,
      input.relatedEntityType || null,
      input.relatedEntityId || null,
    ]
  )

  const notification = await db.get<Notification>('SELECT * FROM notifications WHERE id = ?', [id])
  if (!notification) throw new Error('Failed to create notification')
  return notification
}

export async function listNotificationsByUser(userId: string): Promise<Notification[]> {
  const db = await getDatabase()
  return await db.all<Notification[]>(
    'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  )
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  const db = await getDatabase()
  await db.run(
    `UPDATE notifications
     SET readAt = COALESCE(readAt, CURRENT_TIMESTAMP)
     WHERE id = ? AND userId = ?`,
    [notificationId, userId]
  )
}
