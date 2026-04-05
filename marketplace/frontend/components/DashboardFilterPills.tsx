'use client'

interface FilterItem {
  key: string
  label: string
}

interface DashboardFilterPillsProps {
  items: FilterItem[]
  activeKey: string
  onChange: (key: string) => void
  includeAll?: boolean
  allLabel?: string
}

export default function DashboardFilterPills({
  items,
  activeKey,
  onChange,
  includeAll = false,
  allLabel = 'All',
}: DashboardFilterPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {includeAll && (
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            activeKey === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          onClick={() => onChange('all')}
        >
          {allLabel}
        </button>
      )}
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            activeKey === item.key
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
