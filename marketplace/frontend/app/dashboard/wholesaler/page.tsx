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
  vendor: string
  createdAt: string
}

interface Cart {
  id: string
  items: number
  total: number
}

export default function WholesalerDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
    setMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const productsRes = await api.get('/products')
      setProducts(productsRes.data)
    } catch (error: any) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post('/cart', { productId, quantity: 1 })
      toast.success('Added to cart')
      loadData()
    } catch (error: any) {
      toast.error('Failed to add to cart')
    }
  }

  if (!mounted) return null
  if (user?.role !== 'wholesaler') {
    router.push('/')
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Wholesaler Dashboard</h1>
            <p className="text-neutral-600">Browse and order products from verified vendors</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Available Products</h3>
              <p className="text-3xl font-bold text-primary-600">{products.length}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Cart Items</h3>
              <p className="text-3xl font-bold text-accent-600">0</p>
            </div>
          </div>

          {/* Products Catalog */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Available Products</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="card overflow-hidden hover:shadow-lg transition">
                    <div className="bg-neutral-200 h-40"></div>
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-900 mb-2">{product.name}</h3>
                      <p className="text-sm text-neutral-600 mb-3">By {product.vendor}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-primary-600">₦{product.price.toLocaleString()}</p>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="btn-primary btn-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-neutral-600">No products available yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}