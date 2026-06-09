'use client'

import { useState } from 'react'
import { MoveRight, LayoutGrid, List, Eye, Printer, Download, X, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import OrderCard from './OrderCard'

function EmptyState({ activeFilter }) {
  const { t } = useTranslation()
  const label = activeFilter === 'All' ? t('orders') : `${t(activeFilter)} ${t('orders')}`

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="text-base font-extrabold text-slate-800">{t('No orders found.')}</div>
      <p className="mt-2 text-sm text-slate-400">
        {t('Try another filter from the dock to view a different order status.')}
      </p>
    </div>
  )
}

function TableStatusPill({ status }) {
  const { t } = useTranslation()
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    Downloaded: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60',
  }
  const cls = map[status] || 'bg-slate-50 text-slate-700 border-slate-200/60'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {t(status)}
    </span>
  )
}

export default function RecentOrders({ orders, activeFilter = 'All', onStatusChange, onPaymentVerify }) {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState('table') // default to 'table' for a premium look

  const handlePreview = (order) => {
    if (order.fileUrl) {
      window.open(order.fileUrl, '_blank')
    } else {
      alert(t('No file URL associated with this order.'))
    }
  }

  const handlePrint = async (order) => {
    if (order.fileUrl) {
      window.open(order.fileUrl, '_blank')
      if (onStatusChange && order.dbId) {
        await onStatusChange(order.dbId, 'Completed')
      }
    } else {
      alert(t('No file URL associated with this order.'))
    }
  }

  const handleDownload = async (order) => {
    if (order.fileUrl) {
      window.open(order.fileUrl, '_blank')
      if (onStatusChange && order.dbId) {
        await onStatusChange(order.dbId, 'Downloaded')
      }
    } else {
      alert(t('No file URL associated with this order.'))
    }
  }

  const handleCancel = async (order) => {
    if (confirm(t('Are you sure you want to cancel this order?'))) {
      if (onStatusChange && order.dbId) {
        await onStatusChange(order.dbId, 'Cancelled')
      }
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">{t('Recent Orders Queue')}</h2>
          <p className="text-xs text-slate-400 font-medium">{t('Manage and process active customer print jobs')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle Buttons */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setViewMode('table')}
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
              onClick={() => setViewMode('card')}
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

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-violet-800 hover:underline bg-violet-50/50 px-3 py-2 rounded-xl border border-violet-100"
          >
            {t('Statistics & Analysis')} <MoveRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        {orders.length === 0 ? (
          <EmptyState activeFilter={activeFilter} />
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} onStatusChange={onStatusChange} onPaymentVerify={onPaymentVerify} />
            ))}
          </div>
        ) : (
          /* Premium Table View */
          <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">{t('Order ID')}</th>
                    <th className="py-3 px-4">{t('Customer')}</th>
                    <th className="py-3 px-4">{t('Document')}</th>
                    <th className="py-3 px-4">{t('Config')}</th>
                    <th className="py-3 px-4">{t('Price')}</th>
                    <th className="py-3 px-4">{t('Payment')}</th>
                    <th className="py-3 px-4">{t('Status')}</th>
                    <th className="py-3 px-4">{t('Time')}</th>
                    <th className="py-3 px-4 text-center">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {orders.map((order) => {
                    const isTalk = order.variant === 'talk'
                    
                    return (
                      <tr 
                        key={order.id} 
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          #{order.id}
                        </td>
                        
                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{order.customerName}</div>
                          {order.phone && <div className="text-[10px] text-slate-400 mt-0.5">{order.phone}</div>}
                        </td>
                        
                        {/* Document */}
                        <td className="py-3.5 px-4 max-w-[200px] truncate">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-pink-50 text-pink-600">
                              <FileText size={12} />
                            </span>
                            <span className="truncate text-slate-600 font-bold" title={order.fileName}>
                              {order.fileName}
                            </span>
                          </div>
                        </td>
                        
                        {/* Config */}
                        <td className="py-3.5 px-4">
                          {isTalk ? (
                            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                              {t('Wants to Talk')}
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 font-bold">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                                {t(order.type)}
                              </span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                                {order.copies}x
                              </span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                                {t(order.size)}
                              </span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                                {t(order.side)}
                              </span>
                            </div>
                          )}
                        </td>
                        
                        {/* Price */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {order.price}
                        </td>
                        
                        {/* Payment */}
                        <td className="py-3.5 px-4">
                          {order.paymentLog ? (
                            <div className="flex flex-col gap-1 text-left">
                              {order.paymentLog.paymentStatus === 'PENDING' ? (
                                <>
                                  <span className="inline-flex items-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider w-fit">
                                    ⏳ {t('Pending')} ({order.paymentLog.paymentGateway})
                                  </span>
                                  {order.paymentLog.paymentGateway === 'UPI' && (
                                    <span className="text-[10px] text-indigo-600 font-mono font-bold mt-0.5">
                                      Ref: {order.paymentLog.transactionRef}
                                    </span>
                                  )}
                                  <div className="flex gap-1.5 mt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => onPaymentVerify && onPaymentVerify(order.dbId, 'VERIFIED')}
                                      className="inline-flex items-center justify-center bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md hover:bg-emerald-700 transition"
                                    >
                                      ✓ {t('Accept')}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onPaymentVerify && onPaymentVerify(order.dbId, 'FAILED')}
                                      className="inline-flex items-center justify-center bg-rose-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md hover:bg-rose-700 transition"
                                    >
                                      ✕ {t('Reject')}
                                    </button>
                                  </div>
                                </>
                              ) : order.paymentLog.paymentStatus === 'VERIFIED' ? (
                                <span className="inline-flex items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider w-fit">
                                  ✅ {t('Paid')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-lg bg-rose-50 text-rose-700 border border-rose-200/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider w-fit">
                                  ❌ {t('Rejected')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium italic text-[11px]">—</span>
                          )}
                        </td>
                        
                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <TableStatusPill status={order.status} />
                        </td>
                        
                        {/* Time */}
                        <td className="py-3.5 px-4 text-[10px] text-slate-400 font-bold">
                          {order.timestamp}
                        </td>
                        
                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => handlePreview(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                              title={t('Preview Document')}
                            >
                              <Eye size={14} />
                            </button>
                            
                            {/* Print */}
                            <button
                              onClick={() => handlePrint(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                              title={t('Print File')}
                            >
                              <Printer size={14} />
                            </button>
                            
                            {/* Download */}
                            <button
                              onClick={() => handleDownload(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
                              title={t('Download File')}
                            >
                              <Download size={14} />
                            </button>
                            
                            {/* Cancel */}
                            <button
                              onClick={() => handleCancel(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                              title={t('Cancel Order')}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
