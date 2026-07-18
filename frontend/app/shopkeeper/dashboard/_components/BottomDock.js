'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Crown,
  Download,
  FileText,
  Sparkles,
  Settings,
  Store,
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
  coupon: Store,
  printsmartAi: Sparkles,
  addOrder: Plus,
  customBill: FileText,
}

const filterItems = new Set(['pending', 'completed', 'downloaded', 'cancelled'])

function DockItem({ item, activeFilter, onFilterChange, onCustomClick }) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const Icon = iconMap[item.key] || User
  const isFilterItem = filterItems.has(item.key)
  const translatedLabel = t(item.label)
  
  // Highlighting is active if either it is a filter item matching the active state, or it is a page link matching current pathname
  const isCurrentPage = item.href && (pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)))
  const isActive = (isFilterItem && activeFilter === translatedLabel) || isCurrentPage

  const isAiItem = item.key === 'printsmartAi'
  const isAddOrderItem = item.key === 'addOrder'
  const isCouponItem = item.key === 'coupon'

  const content = (
    <>
      <span
        className={`relative flex h-10 w-10 items-center justify-center transition-all duration-300 ${
          isAiItem
            ? 'rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.55)] border border-violet-400/30'
            : isCouponItem
              ? 'rounded-full border border-indigo-200 bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105'
              : isAddOrderItem
                ? 'rounded-[14px] bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-[0_4px_12px_rgba(59,130,246,0.3)] scale-105'
                : isActive
                  ? 'text-[#5D3EBC]'
                  : 'text-slate-600'
        }`}
      >
        {isAiItem ? (
          <>
            <span className="text-[11px] font-black tracking-wider text-white">AI</span>
            <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">✨</span>
            <span className="absolute -bottom-1.5 -left-1 text-[8px] animate-pulse delay-100">✨</span>
          </>
        ) : isCouponItem ? (
          <>
            <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-indigo-200 animate-ping" />
            <Icon size={18} className="text-white" />
          </>
        ) : (
          <Icon size={19} className={isAddOrderItem ? 'text-white' : isActive ? 'text-[#5D3EBC]' : 'text-slate-600 group-hover:text-slate-800'} />
        )}
        
        {item.badge ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-[#FF3B30] px-1.5 py-0.5 text-[9px] font-black text-white border-2 border-white shadow-sm flex items-center justify-center h-[18px] min-w-[18px]">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className={`text-[9.5px] tracking-tight text-center truncate w-full transition-colors duration-300 ${isActive ? 'text-[#5D3EBC] font-extrabold' : 'text-slate-500 font-semibold group-hover:text-slate-700'}`} title={translatedLabel}>
        {translatedLabel}
      </span>
    </>
  )

  const className =
    `relative flex flex-col items-center justify-between h-[74px] w-[80px] shrink-0 rounded-[20px] p-2 transition-all duration-300 hover:scale-105 origin-bottom select-none cursor-pointer group ${
      isActive
        ? 'bg-[#ECE9F8]/80 border border-violet-300 shadow-[0_4px_16px_rgba(124,58,237,0.08)]'
        : 'hover:bg-violet-50/50 border border-slate-200/60'
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
      onClick={() => onCustomClick?.(item.key)}
    >
      {content}
    </button>
  )
}

export default function BottomDock({ items, activeFilter, onFilterChange, onCustomClick }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95vw] sm:w-max max-w-full overflow-x-auto no-scrollbar rounded-[32px] bg-white/95 backdrop-blur-xl border-2 border-indigo-500/30 shadow-[0_15px_35px_rgba(124,58,237,0.12)] px-4 py-2 hover:border-indigo-500/50 hover:shadow-[0_20px_45px_rgba(124,58,237,0.18)] transition-all duration-300">
      <div className="flex items-end justify-start md:justify-center gap-2 flex-nowrap min-w-max">
        {items.map((i) => (
          <DockItem
            key={i.key}
            item={i}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            onCustomClick={onCustomClick}
          />
        ))}
      </div>
    </div>
  )
}
