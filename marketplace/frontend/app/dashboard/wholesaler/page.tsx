'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OrderDetailsDrawer from '@/components/OrderDetailsDrawer'
import DashboardSummaryGrid from '@/components/DashboardSummaryGrid'
import DashboardFilterPills from '@/components/DashboardFilterPills'
import DashboardSectionHeader from '@/components/DashboardSectionHeader'
import DashboardTableCard from '@/components/DashboardTableCard'
import DashboardMetricsGrid from '@/components/DashboardMetricsGrid'
import OrdersTable from '@/components/OrdersTable'
import ProductCatalogGrid from '@/components/ProductCatalogGrid'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: string
  vendorId: string
  name: string
  price: number
  moq: number
  imageUrl?: string
  size?: string
  length?: string
  colors?: string[]
  specifications?: Record<string, string>
  vendor?: string
  verificationStatus?: 'pending' | 'approved' | 'rejected' | null
  priceTiers?: Array<{ minQuantity: number; unitPrice: number }>
  createdAt: string
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
}

interface DisputeFormState {
  reason: string
  description: string
}

const wholesalerOrderSummaryConfig = [
  { key: 'pending_payment', label: 'Awaiting Payment', tone: 'text-amber-700 bg-amber-50' },
  { key: 'processing', label: 'Processing', tone: 'text-sky-700 bg-sky-50' },
  { key: 'shipped', label: 'In Transit', tone: 'text-indigo-700 bg-indigo-50' },
  { key: 'disputed', label: 'Disputed', tone: 'text-red-700 bg-red-50' },
] as const

export default function WholesalerDashboard() {
  const { user, hasHydrated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [addresses, setAddresses] = useState<Record<string, string>>({})
  const [submittingProductId, setSubmittingProductId] = useState<string | null>(null)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null)
  const [activeDisputeOrderId, setActiveDisputeOrderId] = useState<string | null>(null)
  const [submittingDisputeOrderId, setSubmittingDisputeOrderId] = useState<string | null>(null)
  const [disputeForms, setDisputeForms] = useState<Record<string, DisputeFormState>>({})
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [activeOrderFilter, setActiveOrderFilter] = useState<string>('all')

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !hasHydrated) {
      return
    }

    if (!user || user.role !== 'wholesaler') {
      router.push('/')
      return
    }

    loadData()
  }, [mounted, hasHydrated, router, user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
      ])

      setProducts(Array.isArray(productsRes.data?.data) ? productsRes.data.data : [])
      setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : [])
    } catch (error: any) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async (product: Product) => {
    const quantity = Number(quantities[product.id] || product.moq)
    const deliveryAddress = (addresses[product.id] || '').trim()

    if (!Number.isFinite(quantity) || quantity < product.moq) {
      toast.error(`Minimum order quantity for ${product.name} is ${product.moq}`)
      return
    }

    if (!deliveryAddress) {
      toast.error('Delivery address is required')
      return
    }

    setSubmittingProductId(product.id)
    try {
      await api.post('/orders', {
        vendorId: product.vendorId,
        items: [{ productId: product.id, quantity }],
        deliveryAddress,
      })
      toast.success(`Order placed for ${product.name}`)
      setQuantities((current) => ({ ...current, [product.id]: String(product.moq) }))
      setAddresses((current) => ({ ...current, [product.id]: '' }))
      await loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setSubmittingProductId(null)
    }
  }

  const handleInitializePayment = async (orderId: string) => {
    if (!user) return
    setPayingOrderId(orderId)
    try {
      const response = await api.post(`/orders/${orderId}/payment/initialize`, {
        email: user.email,
      })
      const paymentUrl = response.data?.data?.paymentUrl
      if (!paymentUrl) {
        throw new Error('Payment URL not returned')
      }

      window.open(paymentUrl, '_blank', 'noopener,noreferrer')
      toast.success('Payment window opened')
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to initialize payment')
    } finally {
      setPayingOrderId(null)
    }
  }

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirmingOrderId(orderId)
    try {
      await api.post(`/orders/${orderId}/confirm-delivery`)
      toast.success('Delivery confirmed')
      await loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm delivery')
    } finally {
      setConfirmingOrderId(null)
    }
  }

  const handleSubmitDispute = async (orderId: string) => {
    const form = disputeForms[orderId]
    const reason = form?.reason?.trim()
    const description = form?.description?.trim()

    if (!reason) {
      toast.error('Dispute reason is required')
      return
    }

    setSubmittingDisputeOrderId(orderId)
    try {
      await api.post(`/orders/${orderId}/disputes`, {
        reason,
        description,
      })
      toast.success('Dispute opened')
      setActiveDisputeOrderId(null)
      setDisputeForms((current) => ({
        ...current,
        [orderId]: { reason: '', description: '' },
      }))
      await loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to open dispute')
    } finally {
      setSubmittingDisputeOrderId(null)
    }
  }

  if (!mounted || !hasHydrated || user?.role !== 'wholesaler') return null

  const wholesalerOrderSummary = wholesalerOrderSummaryConfig.map((item) => ({
    ...item,
    count: orders.filter((order) => order.status === item.key).length,
  }))
  const filteredOrders = activeOrderFilter === 'all'
    ? orders
    : orders.filter((order) => order.status === activeOrderFilter)
  const metricItems = [
    { label: 'Available Products', value: products.length, valueClassName: 'text-primary-600' },
    { label: 'Active Orders', value: orders.length, valueClassName: 'text-accent-600' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Wholesaler Dashboard</h1>
            <p className="text-neutral-600">Browse products with MOQ and tiered wholesale pricing</p>
          </div>

          <DashboardMetricsGrid items={metricItems} columnsClassName="md:grid-cols-2" />

          <div className="mb-8">
            <DashboardSummaryGrid
              items={wholesalerOrderSummary}
              activeKey={activeOrderFilter}
              onSelect={setActiveOrderFilter}
            />
          </div>

          {loading && (
            <div className="card p-6 mb-8 text-sm text-neutral-600">
              Loading wholesale catalog...
            </div>
          )}

          <div>
            <DashboardSectionHeader title="Available Products" />
            <DashboardTableCard
              hasData={products.length > 0}
              emptyMessage="No products available yet"
            >
              <ProductCatalogGrid
                products={products}
                renderFooter={(product) => (
                  <div className="mt-4 space-y-3 rounded-lg border border-neutral-200 bg-white p-3">
                    <input
                      type="number"
                      min={product.moq}
                      className="input-field"
                      value={quantities[product.id] ?? String(product.moq)}
                      onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))}
                      placeholder={`Quantity (min ${product.moq})`}
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={addresses[product.id] ?? ''}
                      onChange={(event) => setAddresses((current) => ({ ...current, [product.id]: event.target.value }))}
                      placeholder="Delivery address"
                    />
                    <button
                      type="button"
                      className="btn-primary w-full"
                      disabled={submittingProductId === product.id}
                      onClick={() => handlePlaceOrder(product)}
                    >
                      {submittingProductId === product.id ? 'Placing order...' : 'Place Bulk Order'}
                    </button>
                  </div>
                )}
              />
            </DashboardTableCard>
          </div>

          <div className="mt-12">
            <DashboardSectionHeader
              title="Your Orders"
              description="Track created orders and move pending ones into payment."
              actions={(
                <DashboardFilterPills
                  items={wholesalerOrderSummary}
                  activeKey={activeOrderFilter}
                  onChange={setActiveOrderFilter}
                  includeAll
                  allLabel="All Orders"
                />
              )}
            />

            <DashboardTableCard
              hasData={filteredOrders.length > 0}
              emptyMessage={activeOrderFilter === 'all' ? 'No orders placed yet' : `No ${activeOrderFilter.replace(/_/g, ' ')} orders right now`}
            >
              <OrdersTable
                orders={filteredOrders}
                renderActions={(order) => (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      {order.status === 'pending_payment' && (
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          onClick={() => handleInitializePayment(order.id)}
                          disabled={payingOrderId === order.id}
                        >
                          {payingOrderId === order.id ? 'Opening...' : 'Pay Now'}
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={confirmingOrderId === order.id}
                        >
                          {confirmingOrderId === order.id ? 'Confirming...' : 'Confirm Delivery'}
                        </button>
                      )}
                      {!['completed', 'cancelled', 'disputed'].includes(order.status) && (
                        <button
                          type="button"
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                          onClick={() =>
                            setActiveDisputeOrderId((current) => current === order.id ? null : order.id)
                          }
                        >
                          Open Dispute
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        View Details
                      </button>
                    </div>
                    {activeDisputeOrderId === order.id && (
                      <div className="mt-3 space-y-3 rounded-xl border border-red-100 bg-red-50 p-3">
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Reason"
                          value={disputeForms[order.id]?.reason || ''}
                          onChange={(event) =>
                            setDisputeForms((current) => ({
                              ...current,
                              [order.id]: {
                                reason: event.target.value,
                                description: current[order.id]?.description || '',
                              },
                            }))
                          }
                        />
                        <textarea
                          className="input-field min-h-24"
                          placeholder="Describe the issue"
                          value={disputeForms[order.id]?.description || ''}
                          onChange={(event) =>
                            setDisputeForms((current) => ({
                              ...current,
                              [order.id]: {
                                reason: current[order.id]?.reason || '',
                                description: event.target.value,
                              },
                            }))
                          }
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            disabled={submittingDisputeOrderId === order.id}
                            onClick={() => handleSubmitDispute(order.id)}
                          >
                            {submittingDisputeOrderId === order.id ? 'Submitting...' : 'Submit Dispute'}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => setActiveDisputeOrderId(null)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              />
            </DashboardTableCard>
          </div>
        </div>
      </main>
      <Footer />
      <OrderDetailsDrawer
        orderId={selectedOrderId}
        open={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  )
}
