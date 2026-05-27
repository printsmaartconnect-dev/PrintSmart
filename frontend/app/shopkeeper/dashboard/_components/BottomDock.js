'use client'

import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  Crown,
  Download,
  FileText,
  Sparkles,
  Settings,
  Ticket,
  User,
  XCircle,
} from 'lucide-react'

const iconMap = {
  profile: User,
  settings: Settings,
  subscription: Crown,
  allOrders: FileText,
  pending: Clock,
  completed: CheckCircle2,
  downloaded: Download,
  cancelled: XCircle,
  coupon: Ticket,
  printsmartAi: Sparkles,
}

const filterItems = new Set(['pending', 'completed', 'downloaded', 'cancelled'])

function DockItem({ item, activeFilter, onFilterChange }) {
  const Icon = iconMap[item.key] || User
  const isFilterItem = filterItems.has(item.key)
  const isActive = isFilterItem && activeFilter === item.label
  const isAiItem = item.key === 'printsmartAi'

  const content = (
    <>
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm transition ${
          isAiItem
            ? 'rounded-full border-purple-200 bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)]'
            : isActive
              ? 'border-violet-200 bg-violet-50 text-violet-700'
              : 'border-slate-200 bg-white text-violet-700'
        }`}
      >
        {isAiItem ? (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-fuchsia-200 animate-ping" />
        ) : null}
        <Icon size={18} className={isAiItem ? 'text-white' : 'text-violet-700'} />
        {item.badge ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className={`text-[11px] font-semibold ${isActive ? 'text-violet-700' : 'text-slate-600'}`}>
        {item.label}
      </span>
    </>
  )

  const className =
    `relative flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition ${
      isActive ? 'bg-violet-50' : 'hover:bg-slate-50'
    }`

  if (item.href) {
    return (
      <Link href={item.href} className={className} aria-label={item.label}>
        {content}
      </Link>
    )
  }

  if (isFilterItem) {
    return (
      <button
        type="button"
        className={className}
        aria-label={item.label}
        aria-pressed={isActive}
        onClick={() => onFilterChange?.(item.label)}
      >
        {content}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={item.label}
    >
      {content}
    </button>
  )
}

export default function BottomDock({ items, activeFilter, onFilterChange }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="rounded-[28px] bg-white/80 backdrop-blur border border-slate-200 shadow-md px-3 py-2">
        <div className="flex items-center gap-1">
          {items.map((i) => (
            <DockItem
              key={i.key}
              item={i}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
