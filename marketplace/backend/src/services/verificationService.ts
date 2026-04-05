import { getDatabase } from '../config/database'
import { Verification, VerificationStatus } from '../types'
import { validateRequest, verificationReviewSchema, verificationSubmissionSchema } from '../utils/validation'
import { v4 as uuid } from 'uuid'

export async function submitVerification(userId: string, data: any): Promise<Verification> {
  const validated = validateRequest(verificationSubmissionSchema, data)
  const db = await getDatabase()
  const existing = await db.get<Verification>(
    'SELECT * FROM verifications WHERE userId = ?',
    [userId]
  )

  if (existing) {
    await db.run(
      `UPDATE verifications
       SET documentType = ?, documentNumber = ?, status = 'pending', notes = ?, submittedAt = CURRENT_TIMESTAMP, reviewedAt = NULL, updatedAt = CURRENT_TIMESTAMP
       WHERE userId = ?`,
      [validated.documentType, validated.documentNumber, validated.notes || null, userId]
    )
  } else {
    await db.run(
      `INSERT INTO verifications (id, userId, documentType, documentNumber, status, submittedAt, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [uuid(), userId, validated.documentType, validated.documentNumber, validated.notes || null]
    )
  }

  const verification = await getVerificationByUserId(userId)
  if (!verification) {
    throw new Error('Failed to save verification')
  }

  return verification
}

export async function getVerificationByUserId(userId: string): Promise<Verification | null> {
  const db = await getDatabase()
  return await db.get<Verification>('SELECT * FROM verifications WHERE userId = ?', [userId]) || null
}

export async function listVerifications(status?: VerificationStatus): Promise<Array<Verification & { userName: string; email: string; role: string }>> {
  const db = await getDatabase()
  let query = `
    SELECT v.*, u.name as userName, u.email, u.role
    FROM verifications v
    INNER JOIN users u ON u.id = v.userId
    WHERE 1=1
  `
  const params: string[] = []

  if (status) {
    query += ' AND v.status = ?'
    params.push(status)
  }

  query += ' ORDER BY v.submittedAt DESC'
  return await db.all(query, params)
}

export async function reviewVerification(userId: string, data: any): Promise<Verification> {
  const validated = validateRequest(verificationReviewSchema, data)
  const db = await getDatabase()
  const verification = await getVerificationByUserId(userId)

  if (!verification) {
    throw new Error('Verification not found')
  }

  await db.run(
    `UPDATE verifications
     SET status = ?, notes = ?, reviewedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
     WHERE userId = ?`,
    [validated.status, validated.notes || verification.notes || null, userId]
  )

  const updated = await getVerificationByUserId(userId)
  if (!updated) {
    throw new Error('Failed to update verification')
  }

  return updated
}
