'use client'

interface SummaryItem {
  key: string
  label: string
  tone?: string
  count: number
}

interface DashboardSummaryGridProps {
  items: SummaryItem[]
  activeKey?: string
  columnsClassName?: string
  onSelect?: (key: string) => void
}

export default function DashboardSummaryGrid({
  items,
  activeKey,
  columnsClassName = 'md:grid-cols-4',
  onSelect,
}: DashboardSummaryGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${columnsClassName}`}>
      {items.map((item) => {
        const className = `card p-5 text-left ${item.tone || ''} ${
          onSelect ? 'transition hover:-translate-y-0.5' : ''
        } ${activeKey === item.key ? 'ring-2 ring-primary-500' : ''}`

        const content = (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{item.label}</p>
            <p className="mt-3 text-3xl font-bold">{item.count}</p>
          </>
        )

        if (!onSelect) {
          return (
            <div key={item.key} className={className}>
              {content}
            </div>
          )
        }

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={className}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
