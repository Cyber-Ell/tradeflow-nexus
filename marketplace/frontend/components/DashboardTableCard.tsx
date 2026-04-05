'use client'

import type { ReactNode } from 'react'

interface DashboardTableCardProps {
  hasData: boolean
  emptyMessage: string
  children: ReactNode
}

export default function DashboardTableCard({
  hasData,
  emptyMessage,
  children,
}: DashboardTableCardProps) {
  if (!hasData) {
    return (
      <div className="card p-12 text-center">
        <p className="text-neutral-600">{emptyMessage}</p>
      </div>
    )
  }

  return <div className="card overflow-hidden">{children}</div>
}
