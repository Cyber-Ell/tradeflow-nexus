import { getDatabase } from '../config/database'
import { LogisticsTracking, ShipmentEvent } from '../types'
import { v4 as uuid } from 'uuid'
import axios from 'axios'
import { updateOrderStatus } from './orderService'

const GIG_LOGISTICS_KEY = process.env.GIG_LOGISTICS_API_KEY || ''
const GIG_LOGISTICS_URL = process.env.GIG_LOGISTICS_BASE_URL || 'https://api.giglogistics.com'

export async function createLogisticsTracking(
  orderId: string,
  pickupLocation: string,
  deliveryLocation: string,
  weight: number
): Promise<LogisticsTracking> {
  try {
    // Call GIG Logistics API
    const response = await axios.post(
      `${GIG_LOGISTICS_URL}/shipments/create`,
      {
        reference: orderId,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        weight,
      },
      {
        headers: {
          Authorization: `Bearer ${GIG_LOGISTICS_KEY}`,
        },
      }
    )

    const trackingId = uuid()
    const db = await getDatabase()

    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

    await db.run(
      `INSERT INTO logistics_tracking (id, orderId, trackingNumber, status, logisticsProvider, externalRef, estimatedDelivery, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [trackingId, orderId, response.data.tracking_number, 'pending', 'gig_logistics', response.data.shipment_id, estimatedDelivery.toISOString()]
    )

    await createShipmentEvent(orderId, trackingId, 'pending', pickupLocation, 'Shipment created with logistics provider')

    return getLogisticsTrackingByOrderId(orderId) as Promise<LogisticsTracking>
  } catch (error) {
    console.error('Logistics API error:', error)
    // Fallback: create tracking without external integration
    return createLocalLogisticsTracking(orderId)
  }
}

async function createLocalLogisticsTracking(orderId: string): Promise<LogisticsTracking> {
  const trackingId = uuid()
  const trackingNumber = `TRK${Date.now()}`
  const db = await getDatabase()

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

  await db.run(
    `INSERT INTO logistics_tracking (id, orderId, trackingNumber, status, logisticsProvider, estimatedDelivery, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [trackingId, orderId, trackingNumber, 'pending', 'local', estimatedDelivery.toISOString()]
  )

  await createShipmentEvent(orderId, trackingId, 'pending', 'Vendor Warehouse', 'Shipment created locally')

  const tracking = await db.get('SELECT * FROM logistics_tracking WHERE id = ?', [trackingId])
  return tracking
}

export async function getLogisticsTrackingByOrderId(orderId: string): Promise<LogisticsTracking | null> {
  const db = await getDatabase()
  return await db.get('SELECT * FROM logistics_tracking WHERE orderId = ?', [orderId]) || null
}

export async function updateLogisticsStatus(orderId: string, status: string, location?: string): Promise<LogisticsTracking> {
  const db = await getDatabase()

  const tracking = await getLogisticsTrackingByOrderId(orderId)
  if (!tracking) throw new Error('Tracking not found')

  const updates = ['status = ?']
  const values: any[] = [status]

  if (location) {
    updates.push('location = ?')
    values.push(location)
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP')
  values.push(orderId)

  await db.run(
    `UPDATE logistics_tracking SET ${updates.join(', ')} WHERE orderId = ?`,
    values
  )

  const updated = await getLogisticsTrackingByOrderId(orderId)
  if (!updated) throw new Error('Failed to update tracking')

  await createShipmentEvent(orderId, updated.id, status, location, 'Shipment status updated')

  if (status === 'picked_up' || status === 'in_transit' || status === 'out_for_delivery') {
    try {
      await updateOrderStatus(orderId, 'shipped')
    } catch (error) {
      // Ignore invalid duplicate transitions from repeated tracking updates.
    }
  }

  if (status === 'delivered') {
    await updateOrderStatus(orderId, 'delivered')
  }

  return updated
}

export async function simulateDeliveryUpdate(orderId: string): Promise<void> {
  const statuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered']
  const locations = ['Warehouse', 'Distribution Hub', 'Last Mile', 'Delivered']

  const tracking = await getLogisticsTrackingByOrderId(orderId)
  if (!tracking) return

  const currentIndex = statuses.indexOf(tracking.status)
  if (currentIndex < statuses.length - 1) {
    const nextStatus = statuses[currentIndex + 1]
    const nextLocation = locations[currentIndex + 1]
    await updateLogisticsStatus(orderId, nextStatus, nextLocation)
  }
}

export async function getShipmentEventsByOrderId(orderId: string): Promise<ShipmentEvent[]> {
  const db = await getDatabase()
  return await db.all<ShipmentEvent[]>(
    'SELECT * FROM shipment_events WHERE orderId = ? ORDER BY createdAt ASC',
    [orderId]
  )
}

async function createShipmentEvent(
  orderId: string,
  trackingId: string | undefined,
  status: string,
  location?: string,
  notes?: string
): Promise<void> {
  const db = await getDatabase()
  await db.run(
    `INSERT INTO shipment_events (id, orderId, trackingId, status, location, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [uuid(), orderId, trackingId || null, status, location || null, notes || null]
  )
}
