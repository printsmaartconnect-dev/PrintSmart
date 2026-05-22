'use client'

import {
  Download,
  Eye,
  FileText,
  Printer,
  X,
} from 'lucide-react'

function TopBorder({ type }) {
  const isColor = type === 'Color'
  return (
    <div
      className={
        'absolute left-0 top-0 h-1 w-full rounded-t-2xl ' +
        (isColor
          ? 'bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-sky-500 to-violet-600'
          : 'bg-gradient-to-r from-slate-900 via-slate-700 to-slate-400')
      }
    />
  )
}

function StatusPill({ status }) {
  const map = {
    Pending: 'bg-orange-50 text-orange-700 border-orange-100',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Downloaded: 'bg-sky-50 text-sky-700 border-sky-100',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  }
  const cls = map[status] || 'bg-slate-50 text-slate-700 border-slate-100'

  return (
    <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  )
}

function DetailGrid({ order }) {
  const cells = [
    { label: 'Pages', value: String(order.pages) },
    { label: 'Copies', value: String(order.copies) },
    { label: 'Type', value: order.type },
    { label: 'Size', value: order.size },
    { label: 'Side', value: order.side },
    { label: 'Price', value: order.price },
  ]

  return (
    <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
      {cells.map((c) => (
        <div key={c.label} className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold">{c.label}</span>
          <span className="text-slate-900 font-bold">{c.value}</span>
        </div>
      ))}
    </div>
  )
}

function CustomerWantsToTalk() {
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
      <div className="flex items-center justify-center">
        {/* Lightweight placeholder illustration (no external asset) */}
        <svg width="170" height="90" viewBox="0 0 170 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M48 62c10 0 18-8 18-18S58 26 48 26 30 34 30 44s8 18 18 18Z" stroke="#111827" strokeWidth="2"/>
          <path d="M36 44c0-8 6-14 14-14" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
          <path d="M48 62c-16 0-28 10-28 22" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="130" cy="44" r="18" fill="#0B0F1A"/>
          <path d="M130 62c16 0 28 10 28 22" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="mt-2 text-center text-violet-800 font-extrabold">
        Customer Wants to Talk
      </div>
    </div>
  )
}

function ActionButton({ tone, icon: Icon, label }) {
  const map = {
    purple: 'bg-violet-50 text-violet-700 border-violet-100',
    blue: 'bg-sky-50 text-sky-700 border-sky-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold shadow-sm hover:bg-white ${
        map[tone]
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

export default function OrderCard({ order }) {
  return (
    <div className="relative rounded-2xl bg-white shadow-sm border border-slate-200 p-5 min-w-[280px]">
      <TopBorder type={order.type} />

      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-extrabold text-slate-900">#{order.id}</div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-3">
        <div className="text-base font-extrabold text-slate-900">{order.customerName}</div>
        <div className="text-sm font-semibold text-slate-600">{order.phone}</div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
          <FileText size={16} className="text-rose-600" />
        </span>
        <span className="font-semibold text-slate-700 truncate">{order.fileName}</span>
      </div>

      {order.variant === 'talk' ? <CustomerWantsToTalk /> : <DetailGrid order={order} />}

      <div className="mt-4 text-xs font-semibold text-slate-500">{order.timestamp}</div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <ActionButton tone="purple" icon={Eye} label="Preview" />
        <ActionButton tone="purple" icon={Printer} label="Print" />
        <ActionButton tone="blue" icon={Download} label="Download" />
        <ActionButton tone="red" icon={X} label="Cancel" />
      </div>
    </div>
  )
}
