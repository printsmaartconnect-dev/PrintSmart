'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Crown,
  Download,
  FileText,
  Sparkles,
  Settings,
  Home,
  User,
  XCircle,
  Plus,
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
  coupon: Home,
  printsmartAi: Sparkles,
  addOrder: Plus,
}

const filterItems = new Set(['pending', 'completed', 'downloaded', 'cancelled'])

function DockItem({ item, activeFilter, onFilterChange }) {
  const { t } = useTranslation()
  const Icon = iconMap[item.key] || User
  const isFilterItem = filterItems.has(item.key)
  const translatedLabel = t(item.label)
  const isActive = isFilterItem && activeFilter === translatedLabel
  const isAiItem = item.key === 'printsmartAi'
  const isAddOrderItem = item.key === 'addOrder'
  const isCouponItem = item.key === 'coupon'

  const content = (
    <>
      <span
        className={`relative flex h-10 w-10 items-center justify-center transition ${
          isAiItem
            ? 'rounded-full border border-purple-200 bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)]'
            : isCouponItem
              ? 'rounded-full border border-indigo-200 bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] scale-105'
              : isAddOrderItem
                ? 'rounded-[14px] bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-[0_4px_10px_rgba(59,130,246,0.3)] scale-105'
                : isActive
                  ? 'rounded-2xl text-violet-600 scale-105'
                  : 'rounded-2xl text-slate-600'
        }`}
      >
        {isAiItem ? (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-fuchsia-200 animate-ping" />
        ) : null}
        {isCouponItem ? (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-indigo-200 animate-ping" />
        ) : null}
        <Icon size={20} className={isAiItem || isAddOrderItem || isCouponItem ? 'text-white' : isActive ? 'text-violet-600' : 'text-slate-700'} />
        {item.badge ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className={`text-[9.5px] font-bold tracking-tight text-center truncate w-full ${isActive ? 'text-violet-600 font-black' : 'text-slate-600'}`} title={translatedLabel}>
        {translatedLabel}
      </span>
    </>
  )

  const className =
    `relative flex flex-col items-center justify-between h-[72px] w-[78px] rounded-2xl p-2 transition-all duration-200 hover:scale-110 origin-bottom select-none ${
      isActive ? 'bg-violet-500/15 border border-violet-500/20 shadow-[0_4px_12px_rgba(124,58,237,0.08)]' : 'hover:bg-violet-500/5'
    }`

  if (item.href) {
    return (
      <Link href={item.href} className={className} aria-label={translatedLabel}>
        {content}
      </Link>
    )
  }

  if (isFilterItem) {
    return (
      <button
        type="button"
        className={className}
        aria-label={translatedLabel}
        aria-pressed={isActive}
        onClick={() => onFilterChange?.(translatedLabel)}
      >
        {content}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={translatedLabel}
    >
      {content}
    </button>
  )
}

export default function BottomDock({ items, activeFilter, onFilterChange }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 w-max max-w-[95vw] overflow-x-auto no-scrollbar">
      <div className="rounded-[28px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)] px-4 py-2 hover:shadow-[0_16px_50px_rgba(0,0,0,0.16)] transition-all duration-300">
        <div className="flex items-end justify-center gap-1.5 flex-nowrap">
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
