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
import VendorProductsTable from '@/components/VendorProductsTable'
import ImageUploadDialog from '@/components/ImageUploadDialog'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { BadgeCheck, FileBadge2, ImagePlus, Pencil, PlusCircle, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  moq: number
  imageUrl?: string
  size?: string
  length?: string
  colors?: string[]
  specifications?: Record<string, string>
  priceTiers?: Array<{ minQuantity: number; unitPrice: number }>
  createdAt: string
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
}

interface Verification {
  documentType: string
  documentNumber: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

const vendorOrderSummaryConfig = [
  { key: 'paid', label: 'Ready To Process', tone: 'text-amber-700 bg-amber-50' },
  { key: 'processing', label: 'In Processing', tone: 'text-sky-700 bg-sky-50' },
  { key: 'shipped', label: 'Shipped', tone: 'text-indigo-700 bg-indigo-50' },
  { key: 'disputed', label: 'Disputed', tone: 'text-red-700 bg-red-50' },
] as const

export default function VendorDashboard() {
  const { user, hasHydrated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    moq: '1',
    imageUrl: '',
    size: '',
    length: '',
    colors: '',
    specifications: '',
    priceTiers: '',
  })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productSubmitting, setProductSubmitting] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [verification, setVerification] = useState<Verification | null>(null)
  const [verificationForm, setVerificationForm] = useState({ documentType: 'cac', documentNumber: '', notes: '' })
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [activeOrderFilter, setActiveOrderFilter] = useState<string>('all')
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false)

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !hasHydrated) {
      return
    }

    if (!user || user.role !== 'vendor') {
      router.push('/')
      return
    }

    loadData(user.id)
  }, [mounted, hasHydrated, router, user])

  const loadData = async (vendorId: string) => {
    setLoading(true)
    try {
      const [productsRes, ordersRes, verificationRes] = await Promise.all([
        api.get(`/products?vendorId=${vendorId}`),
        api.get('/orders'),
        api.get('/verification/me'),
      ])

      setProducts(Array.isArray(productsRes.data?.data) ? productsRes.data.data : [])
      setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : [])
      setVerification(verificationRes.data?.data || null)
    } catch (error: any) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setProductSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        moq: parseInt(formData.moq),
        imageUrl: formData.imageUrl.trim(),
        size: formData.size.trim(),
        length: formData.length.trim(),
        colors: parseColors(formData.colors),
        specifications: parseSpecifications(formData.specifications),
        priceTiers: parsePriceTiers(formData.priceTiers),
      }

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload)
        toast.success('Product updated successfully!')
      } else {
        await api.post('/products', payload)
        toast.success('Product added successfully!')
      }

      resetProductForm()
      setShowProductForm(false)
      await loadData(user.id)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setProductSubmitting(false)
    }
  }

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/verification/me', verificationForm)
      setVerification(response.data?.data || null)
      toast.success('Verification submitted')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit verification')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setShowProductForm(true)
    setFormData({
      name: product.name,
      price: String(product.price),
      quantity: String(product.quantity),
      moq: String(product.moq),
      imageUrl: product.imageUrl || '',
      size: product.size || '',
      length: product.length || '',
      colors: formatColors(product.colors),
      specifications: formatSpecifications(product.specifications),
      priceTiers: formatPriceTiers(product.priceTiers),
    })
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return
    setDeletingProductId(productId)
    try {
      await api.delete(`/products/${productId}`)
      toast.success('Product deleted')
      await loadData(user.id)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    } finally {
      setDeletingProductId(null)
    }
  }

  const resetProductForm = () => {
    setEditingProductId(null)
    setFormData({ name: '', price: '', quantity: '', moq: '1', imageUrl: '', size: '', length: '', colors: '', specifications: '', priceTiers: '' })
  }

  const handleOrderStatusUpdate = async (orderId: string, status: 'processing' | 'shipped') => {
    if (!user) return
    setUpdatingOrderId(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      toast.success(`Order moved to ${status}`)
      await loadData(user.id)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (!mounted || !hasHydrated || user?.role !== 'vendor') return null

  const vendorOrderSummary = vendorOrderSummaryConfig.map((item) => ({
    ...item,
    count: orders.filter((order) => order.status === item.key).length,
  }))
  const filteredOrders = activeOrderFilter === 'all'
    ? orders
    : orders.filter((order) => order.status === activeOrderFilter)
  const metricItems = [
    { label: 'Total Products', value: products.length, valueClassName: 'text-primary-600' },
    { label: 'Total Orders', value: orders.length, valueClassName: 'text-primary-600' },
    { label: 'Total Revenue', value: `NGN ${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}`, valueClassName: 'text-accent-600' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Vendor Dashboard</h1>
            <p className="text-neutral-600">Manage your products, pricing tiers, and compliance status</p>
          </div>

          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Verification</h2>
                <p className="text-sm text-neutral-600">Submit your business document to show buyers you are verified.</p>
              </div>
              <span className={`badge ${verification?.status === 'approved' ? 'badge-success' : verification?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'badge-primary'} inline-flex items-center gap-2`}>
                {verification?.status === 'approved' ? <BadgeCheck className="w-4 h-4" /> : <FileBadge2 className="w-4 h-4" />}
                {verification?.status || 'not_submitted'}
              </span>
            </div>

            <form onSubmit={handleSubmitVerification} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="input-field"
                value={verificationForm.documentType}
                onChange={(e) => setVerificationForm({ ...verificationForm, documentType: e.target.value })}
              >
                <option value="cac">CAC</option>
                <option value="tin">TIN</option>
                <option value="national_id">National ID</option>
                <option value="business_license">Business License</option>
              </select>
              <input
                type="text"
                className="input-field"
                placeholder="Document Number"
                value={verificationForm.documentNumber}
                onChange={(e) => setVerificationForm({ ...verificationForm, documentNumber: e.target.value })}
                required
              />
              <input
                type="text"
                className="input-field"
                placeholder="Notes (optional)"
                value={verificationForm.notes}
                onChange={(e) => setVerificationForm({ ...verificationForm, notes: e.target.value })}
              />
              <div className="md:col-span-3 flex items-center justify-between gap-4">
                <p className="text-sm text-neutral-500">
                  {verification ? `${verification.documentType.toUpperCase()}: ${verification.documentNumber}` : 'No verification submitted yet'}
                </p>
                <button type="submit" className="btn-primary btn-sm inline-flex items-center gap-2"><FileBadge2 className="w-4 h-4" />Submit Verification</button>
              </div>
            </form>
          </div>

          <DashboardMetricsGrid items={metricItems} />

          <div className="mb-8">
            <DashboardSummaryGrid
              items={vendorOrderSummary}
              activeKey={activeOrderFilter}
              onSelect={setActiveOrderFilter}
            />
          </div>

          {loading && (
            <div className="card p-6 mb-8 text-sm text-neutral-600">
              Loading vendor workspace...
            </div>
          )}

          <div className="mb-8">
            <DashboardSectionHeader
              title="Your Products"
              actions={(
                <button
                  onClick={() => {
                    if (showProductForm) {
                      resetProductForm()
                    }
                    setShowProductForm(!showProductForm)
                  }}
                  className="btn-primary btn-sm"
                >
                  {showProductForm ? 'Cancel' : <span className="inline-flex items-center gap-2"><PlusCircle className="w-4 h-4" />Add Product</span>}
                </button>
              )}
            />

            {showProductForm && (
              <div className="card p-6 mb-6">
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      className="input-field"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Base Price"
                      className="input-field"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="input-field"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="MOQ"
                      className="input-field"
                      value={formData.moq}
                      onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                      min={1}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setShowImageUploadDialog(true)}
                      >
                        <ImagePlus className="h-4 w-4" />
                        {formData.imageUrl ? 'Replace Image' : 'Upload Image'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Size"
                      className="input-field"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Length"
                      className="input-field"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    />
                  </div>
                  {formData.imageUrl && (
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                      <img src={formData.imageUrl} alt="Selected product" className="h-48 w-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Colors e.g. Black, Blue, Silver"
                    className="input-field"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Specifications e.g. Material:Steel, Finish:Matte"
                    className="input-field"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Bulk tiers e.g. 5:475000,10:450000"
                    className="input-field"
                    value={formData.priceTiers}
                    onChange={(e) => setFormData({ ...formData, priceTiers: e.target.value })}
                  />
                  <p className="text-xs text-neutral-500">Format tiers as `minimum quantity:unit price`, comma-separated.</p>
                  <div className="flex items-center gap-3">
                    <button type="submit" className="btn-primary" disabled={productSubmitting}>
                      {productSubmitting ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          resetProductForm()
                          setShowProductForm(false)
                        }}
                      >
                        Close Editor
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            <DashboardTableCard
              hasData={products.length > 0}
              emptyMessage="No products yet. Add your first product to get started!"
            >
              <VendorProductsTable
                products={products}
                renderActions={(product) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deletingProductId === product.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              />
            </DashboardTableCard>
          </div>

          <div>
            <DashboardSectionHeader
              title="Recent Orders"
              description="Filter operational states and take fulfillment actions."
              actions={(
                <DashboardFilterPills
                  items={vendorOrderSummary}
                  activeKey={activeOrderFilter}
                  onChange={setActiveOrderFilter}
                  includeAll
                  allLabel="All Orders"
                />
              )}
            />
            <DashboardTableCard
              hasData={filteredOrders.length > 0}
              emptyMessage={activeOrderFilter === 'all' ? 'No orders yet' : `No ${activeOrderFilter.replace(/_/g, ' ')} orders right now`}
            >
              <OrdersTable
                orders={filteredOrders}
                renderActions={(order) => (
                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'paid' && (
                      <button
                        type="button"
                        className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 hover:bg-amber-200"
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleOrderStatusUpdate(order.id, 'processing')}
                      >
                        {updatingOrderId === order.id ? 'Updating...' : 'Start Processing'}
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        type="button"
                        className="rounded-lg bg-sky-100 px-3 py-2 text-sm text-sky-800 hover:bg-sky-200"
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleOrderStatusUpdate(order.id, 'shipped')}
                      >
                        {updatingOrderId === order.id ? 'Updating...' : 'Mark Shipped'}
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
      <ImageUploadDialog
        open={showImageUploadDialog}
        currentImage={formData.imageUrl}
        onClose={() => setShowImageUploadDialog(false)}
        onSelect={(imageUrl) => setFormData((current) => ({ ...current, imageUrl }))}
        onRemove={() => setFormData((current) => ({ ...current, imageUrl: '' }))}
      />
    </>
  )
}

function parsePriceTiers(value: string): Array<{ minQuantity: number; unitPrice: number }> {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [minQuantity, unitPrice] = entry.split(':')
      return {
        minQuantity: Number(minQuantity),
        unitPrice: Number(unitPrice),
      }
    })
    .filter((tier) => Number.isFinite(tier.minQuantity) && Number.isFinite(tier.unitPrice))
}

function formatPriceTiers(priceTiers?: Array<{ minQuantity: number; unitPrice: number }>): string {
  return (priceTiers || [])
    .map((tier) => `${tier.minQuantity}:${tier.unitPrice}`)
    .join(',')
}

function parseColors(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function formatColors(colors?: string[]): string {
  return (colors || []).join(', ')
}

function parseSpecifications(value: string): Record<string, string> {
  return Object.fromEntries(
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [key, ...rest] = entry.split(':')
        return [key?.trim() || '', rest.join(':').trim()]
      })
      .filter(([key, entryValue]) => key && entryValue)
  )
}

function formatSpecifications(specifications?: Record<string, string>): string {
  return Object.entries(specifications || {})
    .map(([key, value]) => `${key}:${value}`)
    .join(', ')
}
