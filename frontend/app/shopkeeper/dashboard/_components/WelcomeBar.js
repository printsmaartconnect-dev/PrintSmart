'use client'

import { Crown } from 'lucide-react'

export default function WelcomeBar({ shopName }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100">
            <Crown size={18} className="text-violet-700" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Welcome back,</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {shopName || 'Shop Name'}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 border border-violet-100">
                <Crown size={14} />
                Premium Plan
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Member Since</div>
          <div className="text-sm font-semibold text-slate-800">12 Jan 2024</div>
        </div>
      </div>
    </div>
  )
}
