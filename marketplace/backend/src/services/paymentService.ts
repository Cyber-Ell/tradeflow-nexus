import { getDatabase } from '../config/database'
import { Payment, PaymentStatus } from '../types'
import { v4 as uuid } from 'uuid'
import axios from 'axios'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''
const PAYSTACK_URL = 'https://api.paystack.co'

export async function initializePayment(orderId: string, amount: number, email: string): Promise<string> {
  try {
    const response = await axios.post(
      `${PAYSTACK_URL}/transaction/initialize`,
      {
        reference: orderId,
        amount: Math.round(amount * 100),
        email,
        metadata: { orderId },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    )

    const paymentId = uuid()
    const db = await getDatabase()

    await db.run(
      `INSERT INTO payments (id, orderId, amount, status, paymentMethod, paystackRef, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [paymentId, orderId, amount, 'pending', 'paystack', response.data.data.reference]
    )

    return response.data.data.authorization_url
  } catch (error) {
    throw new Error('Failed to initialize payment')
  }
}

export async function verifyPayment(reference: string): Promise<{ success: boolean; orderId?: string }> {
  try {
    const response = await axios.get(
      `${PAYSTACK_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    )

    if (response.data.data.status === 'success') {
      const orderId = response.data.data.metadata.orderId

      // Hold payment in escrow for 3 days (typical delivery time)
      const escrowReleaseDate = new Date()
      escrowReleaseDate.setDate(escrowReleaseDate.getDate() + 3)

      const db = await getDatabase()
      const payment = await db.get('SELECT id FROM payments WHERE paystackRef = ?', [reference])

      if (payment) {
        await db.run(
          `UPDATE payments SET status = ?, escrowHeldUntil = ?, updatedAt = CURRENT_TIMESTAMP WHERE paystackRef = ?`,
          ['completed', escrowReleaseDate.toISOString(), reference]
        )
      }

      return { success: true, orderId }
    }

    return { success: false }
  } catch (error) {
    throw new Error('Failed to verify payment')
  }
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const db = await getDatabase()
  return await db.get('SELECT * FROM payments WHERE orderId = ?', [orderId]) || null
}

export async function releaseEscrowPayment(orderId: string): Promise<void> {
  const db = await getDatabase()
  const payment = await getPaymentByOrderId(orderId)

  if (!payment) throw new Error('Payment not found')
  if (payment.status !== 'completed') throw new Error('Payment not completed')

  // In production, this would transfer funds to vendor
  // For now, just update status
  await db.run(
    `UPDATE payments SET status = 'released', updatedAt = CURRENT_TIMESTAMP WHERE orderId = ?`,
    [orderId]
  )
}

export async function refundPayment(orderId: string): Promise<void> {
  const db = await getDatabase()
  const payment = await getPaymentByOrderId(orderId)

  if (!payment) throw new Error('Payment not found')

  // In production, call Paystack refund API
  await db.run(
    `UPDATE payments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE orderId = ?`,
    ['refunded', orderId]
  )
}