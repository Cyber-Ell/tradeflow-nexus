'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Vendor {
  id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
    setMounted(true)
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const response = await api.get('/admin/vendors')
      setVendors(response.data)
    } catch (error: any) {
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (vendorId: string) => {
    try {
      await api.post(`/admin/vendors/${vendorId}/approve`)
      toast.success('Vendor approved')
      loadVendors()
    } catch (error: any) {
      toast.error('Failed to approve vendor')
    }
  }

  const handleReject = async (vendorId: string) => {
    try {
      await api.post(`/admin/vendors/${vendorId}/reject`)
      toast.success('Vendor rejected')
      loadVendors()
    } catch (error: any) {
      toast.error('Failed to reject vendor')
    }
  }

  if (!mounted) return null
  if (user?.role !== 'admin') {
    router.push('/')
    return null
  }

  const pendingVendors = vendors.filter((v) => v.status === 'pending')
  const approvedVendors = vendors.filter((v) => v.status === 'approved')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
            <p className="text-neutral-600">Manage vendors and monitor platform activity</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Vendors</h3>
              <p className="text-3xl font-bold text-primary-600">{vendors.length}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Pending Approvals</h3>
              <p className="text-3xl font-bold text-yellow-600">{pendingVendors.length}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Approved Vendors</h3>
              <p className="text-3xl font-bold text-green-600">{approvedVendors.length}</p>
            </div>
          </div>

          {/* Pending Vendors */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Pending Vendor Approvals</h2>
            {pendingVendors.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Applied</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {pendingVendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">{vendor.name}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{vendor.email}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm space-x-2 flex">
                          <button
                            onClick={() => handleApprove(vendor.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(vendor.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-neutral-600">No pending vendors</p>
              </div>
            )}
          </div>

          {/* Approved Vendors */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Approved Vendors</h2>
            {approvedVendors.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Approved</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {approvedVendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">{vendor.name}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{vendor.email}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="badge-success">Approved</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-neutral-600">No approved vendors</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}