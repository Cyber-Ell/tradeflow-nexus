'use client'

import { useEffect, useMemo, useState } from 'react'
import { CircleAlert, CreditCard, Package, Truck, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface OrderItem {
  id?: string
  productId?: string
  productName?: string
  name?: string
  unitPrice?: number
  price?: number
  quantity: number
}

interface Payment {
  status: string
  amount: number
  paymentMethod?: string
  paystackRef?: string
  escrowHeldUntil?: string
}

interface Tracking {
  trackingNumber?: string
  status: string
  location?: string
  logisticsProvider?: string
  estimatedDelivery?: string
}

interface ShipmentEvent {
  id: string
  status: string
  location?: string
  notes?: string
  createdAt: string
}

interface Dispute {
  id: string
  reason: string
  description?: string
  status: string
  resolution?: string
  createdAt: string
}

interface OrderDetails {
  order: {
    id: string
    status: string
    total: number
    items: string
    deliveryAddress?: string
    orderItems?: OrderItem[]
    createdAt: string
    updatedAt: string
  }
  payment?: Payment | null
  tracking?: Tracking | null
  shipmentEvents?: ShipmentEvent[]
  disputes?: Dispute[]
}

interface OrderDetailsDrawerProps {
  orderId: string | null
  open: boolean
  onClose: () => void
}

export default function OrderDetailsDrawer({ orderId, open, onClose }: OrderDetailsDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<OrderDetails | null>(null)

  useEffect(() => {
    if (!open || !orderId) {
      return
    }

    loadDetails(orderId)
  }, [open, orderId])

  const loadDetails = async (id: string) => {
    setLoading(true)
    try {
      const response = await api.get(`/orders/${id}`)
      setDetails(response.data?.data || null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const items = useMemo(() => {
    if (details?.order?.orderItems?.length) {
      return details.order.orderItems
    }

    if (!details?.order?.items) {
      return []
    }

    try {
      const parsed = JSON.parse(details.order.items)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [details])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/45 backdrop-blur-sm">
      <button type="button" className="flex-1 cursor-default" onClick={onClose} aria-label="Close order details" />
      <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Order details</p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-900">{orderId}</h2>
          </div>
          <button
            type="button"
            className="rounded-lg bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {loading && (
            <div className="card p-6 text-sm text-neutral-600">
              Loading order details...
            </div>
          )}

          {!loading && details && (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <div className="card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Status</p>
                  <p className="mt-2 text-lg font-semibold text-neutral-900">{details.order.status}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Total</p>
                  <p className="mt-2 text-lg font-semibold text-neutral-900">NGN {details.order.total.toLocaleString()}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Created</p>
                  <p className="mt-2 text-lg font-semibold text-neutral-900">{new Date(details.order.createdAt).toLocaleDateString()}</p>
                </div>
              </section>

              <section className="card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Items</h3>
                </div>
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={item.id || `${item.productId || item.name}-${index}`} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-neutral-900">{item.productName || item.name || 'Product'}</p>
                            <p className="mt-1 text-sm text-neutral-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-neutral-900">
                            NGN {Number(item.unitPrice ?? item.price ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No order items available.</p>
                )}
              </section>

              <section className="card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Payment</h3>
                </div>
                {details.payment ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow label="Status" value={details.payment.status} />
                    <InfoRow label="Amount" value={`NGN ${details.payment.amount.toLocaleString()}`} />
                    <InfoRow label="Method" value={details.payment.paymentMethod || 'Not set'} />
                    <InfoRow label="Reference" value={details.payment.paystackRef || 'Not available'} />
                    <InfoRow label="Escrow release" value={details.payment.escrowHeldUntil ? new Date(details.payment.escrowHeldUntil).toLocaleString() : 'Not scheduled'} />
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No payment record yet.</p>
                )}
              </section>

              <section className="card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Shipment</h3>
                </div>
                {details.tracking ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <InfoRow label="Status" value={details.tracking.status} />
                      <InfoRow label="Tracking number" value={details.tracking.trackingNumber || 'Pending assignment'} />
                      <InfoRow label="Current location" value={details.tracking.location || 'Not available'} />
                      <InfoRow label="Provider" value={details.tracking.logisticsProvider || 'Not available'} />
                      <InfoRow label="Estimated delivery" value={details.tracking.estimatedDelivery ? new Date(details.tracking.estimatedDelivery).toLocaleString() : 'Not available'} />
                      <InfoRow label="Delivery address" value={details.order.deliveryAddress || 'Not available'} />
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-400">Shipment events</p>
                      {details.shipmentEvents && details.shipmentEvents.length > 0 ? (
                        <div className="space-y-3">
                          {details.shipmentEvents.map((event) => (
                            <div key={event.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium text-neutral-900">{event.status}</p>
                                  <p className="mt-1 text-sm text-neutral-500">{event.location || 'Location unavailable'}</p>
                                  {event.notes && <p className="mt-1 text-sm text-neutral-600">{event.notes}</p>}
                                </div>
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                                  {new Date(event.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-500">No shipment events recorded yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">Tracking has not been created yet.</p>
                )}
              </section>

              <section className="card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <CircleAlert className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-neutral-900">Disputes</h3>
                </div>
                {details.disputes && details.disputes.length > 0 ? (
                  <div className="space-y-3">
                    {details.disputes.map((dispute) => (
                      <div key={dispute.id} className="rounded-xl border border-red-100 bg-red-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-neutral-900">{dispute.reason}</p>
                            {dispute.description && <p className="mt-1 text-sm text-neutral-600">{dispute.description}</p>}
                            {dispute.resolution && <p className="mt-2 text-sm text-neutral-700">Resolution: {dispute.resolution}</p>}
                          </div>
                          <span className="badge bg-white text-red-700">{dispute.status}</span>
                        </div>
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                          {new Date(dispute.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No disputes attached to this order.</p>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  )
}
