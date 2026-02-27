'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  createdAt: string
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
}

export default function VendorDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', price: '', quantity: '' })

  useEffect(() => {
    initializeAuth()
    setMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
      ])
      setProducts(productsRes.data)
      setOrders(ordersRes.data)
    } catch (error: any) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/products', {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      })
      setFormData({ name: '', price: '', quantity: '' })
      setShowProductForm(false)
      await loadData()
      toast.success('Product added successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product')
    }
  }

  if (!mounted) return null
  if (user?.role !== 'vendor') {
    router.push('/')
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Vendor Dashboard</h1>
            <p className="text-neutral-600">Manage your products and orders</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Products</h3>
              <p className="text-3xl font-bold text-primary-600">{products.length}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-primary-600">{orders.length}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-accent-600">₦{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Your Products</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="btn-primary btn-sm"
              >
                {showProductForm ? 'Cancel' : '+ Add Product'}
              </button>
            </div>

            {showProductForm && (
              <div className="card p-6 mb-6">
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      placeholder="Price"
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
                  </div>
                  <button type="submit" className="btn-primary">
                    Add Product
                  </button>
                </form>
              </div>
            )}

            {products.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Product</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Quantity</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm text-neutral-900">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">₦{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{product.quantity}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{new Date(product.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-neutral-600">No products yet. Add your first product to get started!</p>
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm font-medium text-primary-600">{order.id}</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${order.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900">₦{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-neutral-600">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}