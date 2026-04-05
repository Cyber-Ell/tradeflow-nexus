'use client'

interface DashboardMetricItem {
  label: string
  value: string | number
  valueClassName?: string
}

interface DashboardMetricsGridProps {
  items: DashboardMetricItem[]
  columnsClassName?: string
  className?: string
}

export default function DashboardMetricsGrid({
  items,
  columnsClassName = 'md:grid-cols-3',
  className = 'mb-8',
}: DashboardMetricsGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${columnsClassName} ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="card p-6">
          <h3 className="mb-2 text-sm font-medium text-neutral-600">{item.label}</h3>
          <p className={`text-3xl font-bold ${item.valueClassName || 'text-primary-600'}`}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
