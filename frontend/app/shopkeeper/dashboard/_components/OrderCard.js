'use client'

import { useState } from 'react'
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
        'absolute left-0 top-0 h-1.5 w-full rounded-t-2xl ' +
        (isColor
          ? 'bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 via-indigo-500 to-purple-500'
          : 'bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400')
      }
    />
  )
}

function StatusPill({ status }) {
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    Downloaded: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60',
  }
  const cls = map[status] || 'bg-slate-50 text-slate-700 border-slate-200/60'

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${cls}`}>
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
    <div className="mt-4 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
      {cells.map((c) => (
        <div key={c.label} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
          <span className="text-slate-400 font-medium">{c.label}</span>
          <span className="text-slate-800 font-bold">{c.value}</span>
        </div>
      ))}
    </div>
  )
}

function CustomerWantsToTalk() {
  return (
    <div className="mt-4 rounded-xl bg-violet-50/50 border border-violet-100/60 p-4">
      <div className="flex items-center justify-center">
        <svg width="140" height="70" viewBox="0 0 170 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M48 62c10 0 18-8 18-18S58 26 48 26 30 34 30 44s8 18 18 18Z" stroke="#4f46e5" strokeWidth="2.5"/>
          <path d="M36 44c0-8 6-14 14-14" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M48 62c-16 0-28 10-28 22" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="130" cy="44" r="18" fill="#4f46e5"/>
          <path d="M130 62c16 0 28 10 28 22" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="mt-2 text-center text-indigo-700 font-bold text-xs uppercase tracking-wider">
        Customer Wants to Talk
      </div>
    </div>
  )
}

function ActionButton({ tone, icon: Icon, label, onClick }) {
  const map = {
    purple: 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-600 hover:text-white hover:border-violet-600',
    blue: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-600 hover:text-white hover:border-sky-600',
    red: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-bold shadow-sm transition-all duration-200 ${
        map[tone]
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

const getPrintableUrl = async (fileUrl) => {
  if (!fileUrl) return '';
  if (!fileUrl.includes('amazonaws.com')) {
    return fileUrl;
  }
  try {
    const token = localStorage.getItem("authToken");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';
    const response = await fetch(`${apiUrl}/api/files/presigned?fileUrl=${encodeURIComponent(fileUrl)}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.presignedUrl;
    }
  } catch (err) {
    console.error("Failed to get presigned URL:", err);
  }
  return fileUrl;
};

export default function OrderCard({ order, onStatusChange, onPaymentVerify, onPrint, onDownload }) {
  const handlePreview = async () => {
    if (order.fileUrl) {
      const url = await getPrintableUrl(order.fileUrl);
      window.open(url, '_blank')
    } else {
      alert('No file URL associated with this order.')
    }
  }

  const handlePrint = async () => {
    if (onPrint) {
      onPrint(order);
    } else if (order.fileUrl) {
      const url = await getPrintableUrl(order.fileUrl);
      window.open(url, '_blank')
      if (onStatusChange && order.dbId) {
        await onStatusChange(order.dbId, 'Completed')
      }
    } else {
      alert('No file URL associated with this order.')
    }
  }

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(order)
    } else if (order.fileUrl) {
      const url = await getPrintableUrl(order.fileUrl);
      window.open(url, '_blank')
      if (onStatusChange && order.dbId) {
        await onStatusChange(order.dbId, 'Downloaded')
      }
    } else {
      alert('No file URL associated with this order.')
    }
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      if (onStatusChange && order.dbId) {
        await onStatusChange(order.dbId, 'Cancelled')
      }
    }
  }

  return (
    <div className="relative rounded-2xl bg-white shadow-sm border border-slate-100 p-5 w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-200">
      <TopBorder type={order.type} />

      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
          #{order.id}
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-4">
        <div className="text-base font-extrabold text-slate-800 leading-snug">{order.customerName}</div>
        {order.phone && (
          <div className="text-xs font-semibold text-slate-400 mt-0.5">{order.phone}</div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2.5 text-xs bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 border border-pink-100">
          <FileText size={14} className="text-pink-600" />
        </span>
        <span className="font-semibold text-slate-600 truncate" title={order.fileName}>
          {order.fileName}
        </span>
      </div>

      {order.variant === 'talk' ? <CustomerWantsToTalk /> : <DetailGrid order={order} />}

      {order.paymentLog && (
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Payment Status:</span>
            {order.paymentLog.paymentStatus === 'PENDING' ? (
              <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                ⏳ Pending ({order.paymentLog.paymentGateway})
              </span>
            ) : order.paymentLog.paymentStatus === 'VERIFIED' ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                ✅ Verified
              </span>
            ) : (
              <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200/50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                ❌ Rejected
              </span>
            )}
          </div>
          {order.paymentLog.paymentGateway === 'UPI' && (
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400 font-semibold">Ref No:</span>
              <span className="text-indigo-600 font-bold">{order.paymentLog.transactionRef}</span>
            </div>
          )}
          {order.paymentLog.paymentStatus === 'PENDING' && (
            <div className="flex gap-2 pt-1.5 border-t border-slate-150">
              <button
                type="button"
                onClick={() => onPaymentVerify && onPaymentVerify(order.dbId, 'VERIFIED')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold py-1.5 rounded-lg transition"
              >
                Mark As Paid
              </button>
              <button
                type="button"
                onClick={() => onPaymentVerify && onPaymentVerify(order.dbId, 'FAILED')}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold py-1.5 rounded-lg transition"
              >
                Reject Payment
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Customer Comment (Optional)</label>
        <textarea
          value={order.customerComment || ''}
          readOnly
          placeholder="No comment provided by customer"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none resize-none cursor-default"
          rows={2}
        />
      </div>

      <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {order.timestamp}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
        <ActionButton tone="purple" icon={Eye} label="Preview" onClick={handlePreview} />
        <ActionButton tone="purple" icon={Printer} label="Print" onClick={handlePrint} />
        <ActionButton tone="blue" icon={Download} label="Download" onClick={handleDownload} />
        <ActionButton tone="red" icon={X} label="Cancel" onClick={handleCancel} />
      </div>
    </div>
  )
}
