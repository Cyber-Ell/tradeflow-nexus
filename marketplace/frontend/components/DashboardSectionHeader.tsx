'use client'

import type { ReactNode } from 'react'

interface DashboardSectionHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export default function DashboardSectionHeader({
  title,
  description,
  actions,
  className = 'mb-6',
}: DashboardSectionHeaderProps) {
  return (
    <div className={`${className} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
