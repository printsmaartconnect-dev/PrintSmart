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
    if (response.status === 404) {
      const data = await response.json().catch(() => ({}));
      if (data.code === "S3FileNotFound") {
        const fileErr = new Error("S3FileNotFound");
        fileErr.code = "S3FileNotFound";
        throw fileErr;
      }
    }
    if (response.ok) {
      const data = await response.json();
      return data.presignedUrl;
    }
  } catch (err) {
    if (err.code === "S3FileNotFound") {
      throw err;
    }
    console.error("Failed to get presigned URL:", err);
  }
  return fileUrl;
};

export default function RecentOrders({ 
  orders, 
  activeFilter = 'All', 
  onStatusChange, 
  onPaymentVerify, 
  onPrint, 
  onDownload, 
  onCustomBillClick, 
  onEditBill,
  viewMode = 'card'
}) {
  const { t } = useTranslation()
  const [showCleanedModal, setShowCleanedModal] = useState(false)

  const handlePreview = async (order) => {
    const filesList = order.files && order.files.length > 0 ? order.files : [order];
    let openedCount = 0;
    try {
      for (const file of filesList) {
        if (file.fileUrl) {
          const url = await getPrintableUrl(file.fileUrl);
          window.open(url, '_blank')
          openedCount++;
        }
      }
      if (openedCount === 0) {
        alert(t('No file URL associated with this order.'))
      }
    } catch (err) {
      if (err.code === "S3FileNotFound" || err.message === "S3FileNotFound") {
        setShowCleanedModal(true);
      } else {
        alert(t("Error: ") + err.message);
      }
    }
  }

  const handlePrint = async (order) => {
    try {
      if (onPrint) {
        await onPrint(order);
      } else {
        const filesList = order.files && order.files.length > 0 ? order.files : [order];
        let successCount = 0;
        for (const file of filesList) {
          if (file.fileUrl) {
            const url = await getPrintableUrl(file.fileUrl);
            window.open(url, '_blank')
            successCount++;
          }
        }
        if (successCount > 0 && onStatusChange && order.dbId) {
          await onStatusChange(order.dbId, 'Completed')
        } else if (successCount === 0) {
          alert(t('No file URL associated with this order.'))
        }
      }
    } catch (err) {
      if (err.code === "S3FileNotFound" || err.message === "S3FileNotFound") {
        setShowCleanedModal(true);
      } else {
        alert(t("Error: ") + err.message);
      }
    }
  }

  const handleDownload = async (order) => {
    try {
      if (onDownload) {
        await onDownload(order)
      } else {
        const filesList = order.files && order.files.length > 0 ? order.files : [order];
        let successCount = 0;
        for (const file of filesList) {
          if (file.fileUrl) {
            const url = await getPrintableUrl(file.fileUrl);
            window.open(url, '_blank')
            successCount++;
          }
        }
        if (successCount > 0 && onStatusChange && order.dbId) {
          await onStatusChange(order.dbId, 'Downloaded')
        } else if (successCount === 0) {
          alert(t('No file URL associated with this order.'))
        }
      }
    } catch (err) {
      if (err.code === "S3FileNotFound" || err.message === "S3FileNotFound") {
        setShowCleanedModal(true);
      } else {
        alert(t("Error: ") + err.message);
      }
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
      <div>
        {orders.length === 0 ? (
          <EmptyState activeFilter={activeFilter} />
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} onStatusChange={onStatusChange} onPaymentVerify={onPaymentVerify} onPrint={onPrint} onDownload={onDownload} onEditBill={onEditBill} />
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
                          <div className="flex items-center gap-1.5">
                            #{order.id}
                            {order.filesDeleted && (
                              <span 
                                onClick={(e) => { e.stopPropagation(); setShowCleanedModal(true); }}
                                className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold text-slate-500 relative group cursor-pointer shrink-0 hover:bg-slate-200 hover:text-slate-700 transition"
                                title={t("The uploaded files have been automatically removed after 6 hours to save storage. Click for info.")}
                              >
                                {t("Storage Cleaned")}
                                {/* Tooltip */}
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 z-10 shadow-lg">
                                  {t("The uploaded files have been automatically removed after 6 hours to save storage. Click for details.")}
                                </span>
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{order.customerName}</div>
                          {order.phone && <div className="text-[10px] text-slate-400 mt-0.5">{order.phone}</div>}
                        </td>
                        
                        {/* Document */}
                        <td className="py-3.5 px-4 max-w-[250px]">
                          <div className="space-y-1.5">
                            {(order.files && order.files.length > 0 ? order.files : [{
                              fileName: order.fileName || "Untitled Document",
                              fileUrl: order.fileUrl,
                              orderId: order.id,
                              copies: order.copies,
                              type: order.type,
                              size: order.size,
                              side: order.side,
                            }]).map((file, idx) => (
                              <div key={file.id || idx} className="flex items-center justify-between gap-1.5 p-1 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 group/file">
                                <div className="flex items-center gap-1.5 truncate min-w-0" title={file.fileName}>
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-pink-50 text-pink-655">
                                    <FileText size={10} />
                                  </span>
                                  <span className="truncate text-slate-655 font-bold text-[11px]">
                                    {file.fileName}
                                  </span>
                                  {file.orderId && (
                                    <span className="text-[9px] font-mono text-indigo-650 bg-indigo-50 px-1 rounded font-extrabold flex-shrink-0">
                                      {file.orderId}
                                    </span>
                                  )}
                                </div>
                                {/* Mini File Specific Action Icons */}
                                {!order.filesDeleted && (
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover/file:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (file.fileUrl) {
                                        const url = await getPrintableUrl(file.fileUrl);
                                        window.open(url, '_blank');
                                      } else {
                                        alert(t('No file URL associated with this document.'));
                                      }
                                    }}
                                    className="p-0.5 hover:bg-violet-100 rounded text-violet-600 transition"
                                    title={t('Preview Document')}
                                  >
                                    <Eye size={10} />
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (onPrint) {
                                        onPrint({ ...order, files: [file], fileUrl: file.fileUrl, fileName: file.fileName });
                                      } else if (file.fileUrl) {
                                        const url = await getPrintableUrl(file.fileUrl);
                                        window.open(url, '_blank');
                                        if (onStatusChange && order.dbId) {
                                          await onStatusChange(order.dbId, 'Completed');
                                        }
                                      } else {
                                        alert(t('No file URL associated with this document.'));
                                      }
                                    }}
                                    className="p-0.5 hover:bg-emerald-100 rounded text-emerald-600 transition"
                                    title={t('Print File')}
                                  >
                                    <Printer size={10} />
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (onDownload) {
                                        onDownload({ ...order, files: [file], fileUrl: file.fileUrl, fileName: file.fileName });
                                      } else if (file.fileUrl) {
                                        const url = await getPrintableUrl(file.fileUrl);
                                        window.open(url, '_blank');
                                        if (onStatusChange && order.dbId) {
                                          await onStatusChange(order.dbId, 'Downloaded');
                                        }
                                      } else {
                                        alert(t('No file URL associated with this document.'));
                                      }
                                    }}
                                    className="p-0.5 hover:bg-sky-100 rounded text-sky-600 transition"
                                    title={t('Download File')}
                                  >
                                    <Download size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                            ))}
                          </div>
                        </td>
                        
                        {/* Config */}
                        <td className="py-3.5 px-4">
                          {isTalk ? (
                            <span className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                              {t('Wants to Talk')}
                            </span>
                          ) : order.files && order.files.length > 1 ? (
                            <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded w-fit">
                                {order.files.length} {t('Files')}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">{t('Individual settings apply')}</span>
                            </div>
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
                                      ✓ {t('Mark As Paid')}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onPaymentVerify && onPaymentVerify(order.dbId, 'FAILED')}
                                      className="inline-flex items-center justify-center bg-rose-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md hover:bg-rose-700 transition"
                                    >
                                      ✕ {t('Reject Payment')}
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
                          {order.filesDeleted ? (
                            <span 
                              onClick={() => setShowCleanedModal(true)}
                              className="text-[10px] text-slate-400 font-extrabold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg block text-center uppercase tracking-wider cursor-pointer hover:bg-slate-100 hover:text-slate-600 transition"
                            >
                              ⚠️ {t('Storage Cleaned')}
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Edit Bill */}
                              <button
                                onClick={() => onEditBill?.(order)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                title={t('Edit Bill')}
                              >
                                <FileText size={14} />
                              </button>

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
                          )}
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

      {showCleanedModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center relative space-y-4">
            <button 
              onClick={() => setShowCleanedModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
              <FileText size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">{t('Storage Cleaned')}</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              {t('The uploaded print documents for this order were automatically and permanently deleted from S3 storage because the order has completed 6 hours.')}
            </p>
            <p className="text-[11px] text-indigo-600 font-bold bg-indigo-50/50 py-2 px-3 rounded-xl border border-indigo-100/60">
              {t('Order history, invoices, and analytics are preserved permanently.')}
            </p>
            <button
              onClick={() => setShowCleanedModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition"
            >
              {t('Got it')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
