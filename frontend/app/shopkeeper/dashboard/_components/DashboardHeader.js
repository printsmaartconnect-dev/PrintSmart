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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Store size={18} />
            </span>
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-slate-900">PrintSmart</span>
              <span className="text-violet-600"></span>
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
