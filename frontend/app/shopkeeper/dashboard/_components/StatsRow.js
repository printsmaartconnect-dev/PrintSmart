'use client'

import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Clock,
  Download,
  XCircle,
} from 'lucide-react'

const toneMap = {
  orange: {
    icon: Clock,
    ring: 'bg-orange-50 border-orange-100',
    iconColor: 'text-orange-600',
    count: 'text-orange-600',
  },
  green: {
    icon: CheckCircle2,
    ring: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    count: 'text-emerald-600',
  },
  blue: {
    icon: Download,
    ring: 'bg-sky-50 border-sky-100',
    iconColor: 'text-sky-600',
    count: 'text-sky-600',
  },
  red: {
    icon: XCircle,
    ring: 'bg-rose-50 border-rose-100',
    iconColor: 'text-rose-600',
    count: 'text-rose-600',
  },
}

function StatCard({ label, count, tone }) {
  const { t } = useTranslation()
  const cfg = toneMap[tone]
  const Icon = cfg.icon

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 min-w-[220px] md:min-w-0 flex-shrink-0 md:flex-shrink">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${cfg.ring}`}>
          <Icon size={20} className={cfg.iconColor} />
        </span>
        <div>
          <div className="text-xs font-semibold text-slate-500">{label}</div>
          <div className={`mt-0.5 text-2xl font-extrabold ${cfg.count}`}>{count}</div>
        </div>
      </div>

    </div>
  )
}

export default function StatsRow({ stats }) {
  return (
    <div className="flex flex-row overflow-x-auto gap-5 pb-4 md:grid md:grid-cols-2 xl:grid-cols-4 md:pb-0 no-scrollbar">
      {stats.map((s) => (
        <StatCard key={s.key} label={s.label} count={s.count} tone={s.tone} />
      ))}
    </div>
  )
}
