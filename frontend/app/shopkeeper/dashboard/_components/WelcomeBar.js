'use client'

import { Crown, Clock, CheckCircle2, Download, XCircle, LayoutGrid, List } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function WelcomeBar({ 
  shopName, 
  shopkeeperIdCode, 
  memberSince, 
  subscriptionPlan,
  pendingCount = 0,
  completedCount = 0,
  downloadedCount = 0,
  cancelledCount = 0,
  viewMode = 'card',
  onViewModeChange
}) {
  const { t } = useTranslation()

  const formatDate = (dateString) => {
    if (!dateString) return '12 Jan 2024'
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const month = date.toLocaleString('en-US', { month: 'short' })
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
    } catch (e) {
      return '12 Jan 2024'
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100">
            <Crown size={18} className="text-violet-700" />
          </div>
          <div>
            <div className="text-sm text-slate-500">{t('Welcome back,')}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {shopName || 'Shop Name'}
              </h1>
              {subscriptionPlan && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 border border-violet-100">
                  <Crown size={14} />
                  {t(subscriptionPlan)}
                </span>
              )}
              {shopkeeperIdCode && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  {t('Shop ID:')} {shopkeeperIdCode}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Mini Stats strip */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2">
            {/* Pending */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 min-w-[110px] sm:min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-100">
                <Clock size={14} className="text-orange-600" />
              </span>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{t('Pending')}</div>
                <div className="text-sm font-extrabold text-orange-600 mt-0.5 leading-none">{pendingCount}</div>
              </div>
            </div>

            {/* Completed */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 min-w-[110px] sm:min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                <CheckCircle2 size={14} className="text-emerald-600" />
              </span>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{t('Completed')}</div>
                <div className="text-sm font-extrabold text-emerald-600 mt-0.5 leading-none">{completedCount}</div>
              </div>
            </div>

            {/* Downloaded */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 min-w-[110px] sm:min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 border border-sky-100">
                <Download size={14} className="text-sky-600" />
              </span>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{t('Downloaded')}</div>
                <div className="text-sm font-extrabold text-sky-600 mt-0.5 leading-none">{downloadedCount}</div>
              </div>
            </div>

            {/* Cancelled */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 min-w-[110px] sm:min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 border border-rose-100">
                <XCircle size={14} className="text-rose-600" />
              </span>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{t('Cancelled')}</div>
                <div className="text-sm font-extrabold text-rose-600 mt-0.5 leading-none">{cancelledCount}</div>
              </div>
            </div>
          </div>

          {/* Member Card */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2 flex flex-col justify-center h-[54px] min-w-[130px]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{t('Active')}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('Member Since')}</div>
            <div className="text-xs font-bold text-slate-800">{formatDate(memberSince)}</div>
          </div>

          {/* Toggle buttons */}
          {onViewModeChange && (
            <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50/50">
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white text-violet-700 shadow-sm border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={t('Table View')}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('card')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'card' 
                    ? 'bg-white text-violet-700 shadow-sm border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={t('Grid Card View')}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
