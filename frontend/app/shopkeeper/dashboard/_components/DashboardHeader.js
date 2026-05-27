'use client'

import { useMemo } from 'react'
import { Bell, ChevronDown, Store } from 'lucide-react'

function NotificationButton() {
  return (
    <button
      type="button"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50"
      aria-label="Notifications"
    >
      <Bell size={18} className="text-slate-600" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
    </button>
  )
}

function ProfileDropdown({ shopName }) {
  const initials = useMemo(() => {
    const name = (shopName || 'Shop').trim()
    const parts = name.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || 'S'
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
  }, [shopName])

  return (
    <button
      type="button"
      className="inline-flex items-center gap-3 rounded-xl bg-white shadow-sm border border-slate-200 px-3 py-2 hover:bg-slate-50"
      aria-label="Profile menu"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-sm">
        {initials}
      </span>
      <span className="text-left leading-tight">
        <span className="block text-sm font-semibold text-slate-800 truncate max-w-[180px]">
          {shopName || 'Shop Name'}
        </span>
        <span className="block text-xs text-slate-500">Shopkeeper</span>
      </span>
      <ChevronDown size={16} className="text-slate-500" />
    </button>
  )
}

export default function DashboardHeader({ shopName }) {
  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Store size={18} />
            </span>
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-slate-900">PrintSmart</span>
              <span className="text-violet-600"></span>
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 sm:block">
            <div className="relative overflow-hidden rounded-full border border-violet-100/80 bg-white/75 px-5 py-2.5 shadow-sm shadow-violet-100 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md">
              <span className="absolute inset-0 bg-gradient-to-r from-violet-50 via-indigo-50 to-sky-50 opacity-80" />
              <span className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 opacity-90 shadow-[0_0_14px_rgba(99,102,241,0.35)] animate-pulse" />
              <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-400/80" />
              <span className="relative z-10 block px-3 text-sm font-extrabold uppercase tracking-[0.34em] text-transparent bg-gradient-to-r from-violet-700 via-indigo-600 to-sky-600 bg-clip-text">
                Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationButton />
            <ProfileDropdown shopName={shopName} />
          </div>
        </div>
      </div>
    </header>
  )
}
