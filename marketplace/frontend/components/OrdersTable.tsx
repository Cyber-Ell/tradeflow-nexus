'use client'

import type { ReactNode } from 'react'

interface OrderRow {
  id: string
  status: string
  total: number
  createdAt: string
}

interface OrdersTableProps<T extends OrderRow> {
  orders: T[]
  renderActions: (order: T) => ReactNode
}

export default function OrdersTable<T extends OrderRow>({
  orders,
  renderActions,
}: OrdersTableProps<T>) {
  return (
    <table className="w-full">
      <thead className="bg-neutral-100 border-b border-neutral-200">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Order ID</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Status</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Total</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Date</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Actions</th>
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
            <td className="px-6 py-4 text-sm text-neutral-900">NGN {order.total.toLocaleString()}</td>
            <td className="px-6 py-4 text-sm text-neutral-600">{new Date(order.createdAt).toLocaleDateString()}</td>
            <td className="px-6 py-4">{renderActions(order)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
