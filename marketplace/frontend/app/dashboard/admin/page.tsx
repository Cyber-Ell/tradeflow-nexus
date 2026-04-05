'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DashboardSummaryGrid from '@/components/DashboardSummaryGrid'
import DashboardFilterPills from '@/components/DashboardFilterPills'
import DashboardSectionHeader from '@/components/DashboardSectionHeader'
import DashboardTableCard from '@/components/DashboardTableCard'
import DashboardMetricsGrid from '@/components/DashboardMetricsGrid'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Vendor {
  id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface Verification {
  userId: string
  userName: string
  email: string
  role: string
  documentType: string
  documentNumber: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  notes?: string
}

interface Dispute {
  id: string
  orderId: string
  reason: string
  description?: string
  status: 'open' | 'under_review' | 'resolved' | 'rejected'
  resolution?: string
  createdAt: string
}

const disputeSummaryConfig = [
  { key: 'open', label: 'Open', tone: 'text-red-700 bg-red-50' },
  { key: 'under_review', label: 'Under Review', tone: 'text-amber-700 bg-amber-50' },
  { key: 'resolved', label: 'Resolved', tone: 'text-green-700 bg-green-50' },
  { key: 'rejected', label: 'Rejected', tone: 'text-slate-700 bg-slate-100' },
] as const

const verificationSummaryConfig = [
  { key: 'pending', label: 'Pending', tone: 'text-amber-700 bg-amber-50' },
  { key: 'approved', label: 'Approved', tone: 'text-green-700 bg-green-50' },
  { key: 'rejected', label: 'Rejected', tone: 'text-red-700 bg-red-50' },
] as const

const vendorSummaryConfig = [
  { key: 'pending', label: 'Pending Vendors', tone: 'text-amber-700 bg-amber-50' },
  { key: 'approved', label: 'Approved Vendors', tone: 'text-green-700 bg-green-50' },
  { key: 'rejected', label: 'Rejected Vendors', tone: 'text-red-700 bg-red-50' },
] as const

export default function AdminDashboard() {
  const { user, hasHydrated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewingDisputeId, setReviewingDisputeId] = useState<string | null>(null)
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({})
  const [activeDisputeFilter, setActiveDisputeFilter] = useState<string>('all')
  const [activeVerificationFilter, setActiveVerificationFilter] = useState<string>('pending')
  const [activeVendorFilter, setActiveVendorFilter] = useState<string>('pending')

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !hasHydrated) {
      return
    }

    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }

    loadData()
  }, [mounted, hasHydrated, router, user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [vendorsResponse, verificationsResponse, disputesResponse] = await Promise.all([
        api.get('/admin/vendors'),
        api.get('/admin/verifications'),
        api.get('/admin/disputes'),
      ])

      setVendors(Array.isArray(vendorsResponse.data?.data) ? vendorsResponse.data.data : [])
      setVerifications(Array.isArray(verificationsResponse.data?.data) ? verificationsResponse.data.data : [])
      setDisputes(Array.isArray(disputesResponse.data?.data) ? disputesResponse.data.data : [])
    } catch (error: any) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (vendorId: string) => {
    try {
      await api.post(`/admin/vendors/${vendorId}/approve`)
      toast.success('Vendor approved')
      loadData()
    } catch (error: any) {
      toast.error('Failed to approve vendor')
    }
  }

  const handleReject = async (vendorId: string) => {
    try {
      await api.post(`/admin/vendors/${vendorId}/reject`)
      toast.success('Vendor rejected')
      loadData()
    } catch (error: any) {
      toast.error('Failed to reject vendor')
    }
  }

  const handleReviewVerification = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      await api.post(`/admin/verifications/${userId}/review`, { status })
      toast.success(`Verification ${status}`)
      loadData()
    } catch (error: any) {
      toast.error('Failed to review verification')
    }
  }

  const handleUpdateDispute = async (disputeId: string, status: Dispute['status']) => {
    setReviewingDisputeId(disputeId)
    try {
      await api.post(`/admin/disputes/${disputeId}/status`, {
        status,
        resolution: resolutionDrafts[disputeId] || undefined,
      })
      toast.success(`Dispute ${status}`)
      await loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update dispute')
    } finally {
      setReviewingDisputeId(null)
    }
  }

  if (!mounted || !hasHydrated || user?.role !== 'admin') return null

  const pendingVendors = vendors.filter((v) => v.status === 'pending')
  const approvedVendors = vendors.filter((v) => v.status === 'approved')
  const rejectedVendors = vendors.filter((v) => v.status === 'rejected')
  const pendingVerifications = verifications.filter((v) => v.status === 'pending')
  const openDisputes = disputes.filter((dispute) => dispute.status === 'open' || dispute.status === 'under_review')
  const disputeSummary = disputeSummaryConfig.map((item) => ({
    ...item,
    count: disputes.filter((dispute) => dispute.status === item.key).length,
  }))
  const verificationSummary = verificationSummaryConfig.map((item) => ({
    ...item,
    count: verifications.filter((verification) => verification.status === item.key).length,
  }))
  const vendorSummary = vendorSummaryConfig.map((item) => ({
    ...item,
    count: vendors.filter((vendor) => vendor.status === item.key).length,
  }))
  const filteredDisputes = activeDisputeFilter === 'all'
    ? disputes
    : disputes.filter((dispute) => dispute.status === activeDisputeFilter)
  const filteredVerifications = activeVerificationFilter === 'all'
    ? verifications
    : verifications.filter((verification) => verification.status === activeVerificationFilter)
  const filteredVendors = activeVendorFilter === 'all'
    ? vendors
    : vendors.filter((vendor) => vendor.status === activeVendorFilter)
  const metricItems = [
    { label: 'Total Vendors', value: vendors.length, valueClassName: 'text-primary-600' },
    { label: 'Pending Approvals', value: pendingVendors.length, valueClassName: 'text-yellow-600' },
    { label: 'Approved Vendors', value: approvedVendors.length, valueClassName: 'text-green-600' },
    { label: 'Pending Verifications', value: pendingVerifications.length, valueClassName: 'text-accent-600' },
    { label: 'Open Disputes', value: openDisputes.length, valueClassName: 'text-red-600' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container-custom py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
            <p className="text-neutral-600">Manage vendors, approvals, and verification reviews</p>
          </div>

          <DashboardMetricsGrid items={metricItems} columnsClassName="md:grid-cols-5" />

          {loading && (
            <div className="card p-6 mb-8 text-sm text-neutral-600">
              Loading admin controls...
            </div>
          )}

          <div className="mb-8">
            <DashboardSectionHeader
              title="Dispute Queue"
              description="Filter incoming disputes by operational state."
              actions={(
                <DashboardFilterPills
                  items={disputeSummary}
                  activeKey={activeDisputeFilter}
                  onChange={setActiveDisputeFilter}
                  includeAll
                  allLabel="All Disputes"
                />
              )}
            />
            <div className="mb-6">
              <DashboardSummaryGrid
                items={disputeSummary}
                activeKey={activeDisputeFilter}
                onSelect={setActiveDisputeFilter}
              />
            </div>
            <DashboardTableCard
              hasData={filteredDisputes.length > 0}
              emptyMessage={activeDisputeFilter === 'all' ? 'No disputes submitted yet' : `No ${activeDisputeFilter.replace(/_/g, ' ')} disputes right now`}
            >
                <table className="w-full">
                  <thead className="bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Order</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Reason</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Opened</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Resolution</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredDisputes.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-neutral-50 align-top">
                        <td className="px-6 py-4 text-sm font-medium text-primary-600">{dispute.orderId}</td>
                        <td className="px-6 py-4 text-sm text-neutral-700">
                          <div className="font-medium text-neutral-900">{dispute.reason}</div>
                          {dispute.description && <div className="mt-1 text-neutral-500">{dispute.description}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${dispute.status === 'resolved' ? 'badge-success' : dispute.status === 'rejected' ? 'bg-red-100 text-red-700' : 'badge-primary'}`}>
                            {dispute.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{new Date(dispute.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <textarea
                            className="input-field min-h-24"
                            placeholder="Add resolution note"
                            value={resolutionDrafts[dispute.id] ?? dispute.resolution ?? ''}
                            onChange={(event) =>
                              setResolutionDrafts((current) => ({
                                ...current,
                                [dispute.id]: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {dispute.status !== 'under_review' && dispute.status !== 'resolved' && (
                              <button
                                type="button"
                                className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 hover:bg-amber-200"
                                disabled={reviewingDisputeId === dispute.id}
                                onClick={() => handleUpdateDispute(dispute.id, 'under_review')}
                              >
                                Review
                              </button>
                            )}
                            {dispute.status !== 'resolved' && (
                              <button
                                type="button"
                                className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700 hover:bg-green-200"
                                disabled={reviewingDisputeId === dispute.id}
                                onClick={() => handleUpdateDispute(dispute.id, 'resolved')}
                              >
                                Resolve
                              </button>
                            )}
                            {dispute.status !== 'rejected' && (
                              <button
                                type="button"
                                className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"
                                disabled={reviewingDisputeId === dispute.id}
                                onClick={() => handleUpdateDispute(dispute.id, 'rejected')}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </DashboardTableCard>
          </div>

          <div className="mb-8">
            <DashboardSectionHeader
              title="Verification Reviews"
              description="Switch between pending, approved, and rejected verification records."
              actions={(
                <DashboardFilterPills
                  items={verificationSummary}
                  activeKey={activeVerificationFilter}
                  onChange={setActiveVerificationFilter}
                />
              )}
            />
            <div className="mb-6">
              <DashboardSummaryGrid
                items={verificationSummary}
                activeKey={activeVerificationFilter}
                onSelect={setActiveVerificationFilter}
                columnsClassName="md:grid-cols-3"
              />
            </div>
            <DashboardTableCard
              hasData={filteredVerifications.length > 0}
              emptyMessage={activeVerificationFilter === 'all' ? 'No verification records yet' : `No ${activeVerificationFilter} verification records right now`}
            >
                <table className="w-full">
                  <thead className="bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Business</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Document</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Submitted</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredVerifications.map((verification) => (
                      <tr key={verification.userId} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm text-neutral-900">
                          <div className="font-medium">{verification.userName}</div>
                          <div className="text-neutral-500">{verification.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{verification.role}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {verification.documentType.toUpperCase()} / {verification.documentNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{new Date(verification.submittedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm space-x-2 flex">
                          <button
                            onClick={() => handleReviewVerification(verification.userId, 'approved')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewVerification(verification.userId, 'rejected')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </DashboardTableCard>
          </div>

          <div className="mb-8">
            <DashboardSectionHeader
              title="Vendor Queue"
              description="Move between pending, approved, and rejected vendor accounts."
              actions={(
                <DashboardFilterPills
                  items={vendorSummary}
                  activeKey={activeVendorFilter}
                  onChange={setActiveVendorFilter}
                />
              )}
            />
            <div className="mb-6">
              <DashboardSummaryGrid
                items={vendorSummary}
                activeKey={activeVendorFilter}
                onSelect={setActiveVendorFilter}
                columnsClassName="md:grid-cols-3"
              />
            </div>
            <DashboardTableCard
              hasData={filteredVendors.length > 0}
              emptyMessage={activeVendorFilter === 'all' ? 'No vendors available' : `No ${activeVendorFilter} vendors right now`}
            >
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
                    {filteredVendors.map((vendor) => (
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
            </DashboardTableCard>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
