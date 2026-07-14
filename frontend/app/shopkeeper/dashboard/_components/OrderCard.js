'use client'

import { useState } from 'react'
import {
  Download,
  Eye,
  FileText,
  Printer,
  X,
} from 'lucide-react'
import DocumentPreview from '../../../components/customer/DocumentPreview'

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

function CardPreviewSection({ order }) {
  const filesList = order.files && order.files.length > 0 ? order.files : [{
    fileName: order.fileName || "Untitled Document",
    fileUrl: order.fileUrl,
    thumbnailUrl: order.thumbnailUrl
  }]

  const file = filesList[0]

  return (
    <div className="mt-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 flex justify-center items-center h-[160px] w-full relative overflow-hidden">
      <div className="w-[100px] aspect-[1/1.414] bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center relative">
        <DocumentPreview
          file={file}
          thumbnailUrl={file.thumbnailUrl || null}
          isBW={file.type === 'B&W' || order.type === 'B&W'}
        />
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-bold shadow-sm transition-all duration-200 ${map[tone]
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

export default function OrderCard({ order, onStatusChange, onPaymentVerify, onPrint, onDownload, onEditBill }) {
  const [showCleanedModal, setShowCleanedModal] = useState(false);
  const handlePreview = async () => {
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
        alert('No file URL associated with this order.')
      }
    } catch (err) {
      if (err.code === "S3FileNotFound" || err.message === "S3FileNotFound") {
        setShowCleanedModal(true);
      } else {
        alert("Error: " + err.message);
      }
    }
  }

  const handlePrint = async () => {
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
          alert('No file URL associated with this order.')
        }
      }
    } catch (err) {
      if (err.code === "S3FileNotFound" || err.message === "S3FileNotFound") {
        setShowCleanedModal(true);
      } else {
        alert("Error: " + err.message);
      }
    }
  }

  const handleDownload = async () => {
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
          alert('No file URL associated with this order.')
        }
      }
    } catch (err) {
      if (err.code === "S3FileNotFound" || err.message === "S3FileNotFound") {
        setShowCleanedModal(true);
      } else {
        alert("Error: " + err.message);
      }
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
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
            #{order.id}
          </div>
          {order.filesDeleted && (
            <span
              onClick={(e) => { e.stopPropagation(); setShowCleanedModal(true); }}
              className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold text-slate-500 relative group cursor-pointer shrink-0 hover:bg-slate-200 hover:text-slate-700 transition"
              title="The uploaded files have been automatically removed after 6 hours to save storage. Click for info."
            >
              Storage Cleaned
              {/* Tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 z-10 shadow-lg">
                The uploaded files have been automatically removed after 6 hours to save storage. Click for details.
              </span>
            </span>
          )}
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-4">
        <div className="text-base font-extrabold text-slate-800 leading-snug">{order.customerName}</div>
        {order.phone && (
          <div className="text-xs font-semibold text-slate-400 mt-0.5">{order.phone}</div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {(order.files && order.files.length > 0 ? order.files : [{
          fileName: order.fileName || "Untitled Document",
          fileUrl: order.fileUrl,
          copies: order.copies,
          type: order.type,
          size: order.size,
          side: order.side,
          price: order.price,
          orderId: order.id
        }]).map((file, fileIdx) => {
          return (
            <div key={file.id || fileIdx} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 border border-pink-100">
                    <FileText size={12} className="text-pink-650" />
                  </span>
                  <span className="font-bold text-slate-700 truncate text-xs" title={file.fileName}>
                    {file.fileName}
                  </span>
                  {file.orderId && (
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-extrabold flex-shrink-0">
                      {file.orderId}
                    </span>
                  )}
                </div>
                {/* File-specific Action Icons */}
                {!order.filesDeleted && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (file.fileUrl) {
                          const url = await getPrintableUrl(file.fileUrl);
                          window.open(url, '_blank');
                        } else {
                          alert('No file URL associated with this document.');
                        }
                      }}
                      className="p-1 rounded hover:bg-violet-100 text-violet-600 transition"
                      title="Preview File"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      type="button"
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
                          alert('No file URL associated with this document.');
                        }
                      }}
                      className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition"
                      title="Print File"
                    >
                      <Printer size={12} />
                    </button>
                    <button
                      type="button"
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
                          alert('No file URL associated with this document.');
                        }
                      }}
                      className="p-1 rounded hover:bg-sky-100 text-sky-600 transition"
                      title="Download File"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                )}
              </div>
              {/* File details breakdown if not Wants to Talk */}
              {order.variant !== 'talk' && (
                <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 font-bold pl-9">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                    {file.type || order.type}
                  </span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                    {(file.copies !== undefined ? file.copies : order.copies)}x
                  </span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                    {file.size || order.size}
                  </span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                    {file.side || order.side}
                  </span>
                  {file.price && (
                    <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded">
                      {file.price}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CardPreviewSection order={order} />

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

      {order.billStatus === 'REQUESTED' && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-250 rounded-xl text-center text-xs font-bold text-amber-700 animate-pulse">
          🔔 Customer has requested the bill!
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEditBill?.(order)}
          className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-[#5D3EBC] text-xs font-bold py-2.5 px-4 rounded-xl border border-indigo-200/50 transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
        >
          <FileText size={14} /> Edit Bill
        </button>

        {order.billStatus === 'REQUESTED' && (
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("authToken");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';
                const response = await fetch(`${apiUrl}/api/orders/${order.dbId || order.id}/send-bill`, {
                  method: 'PUT',
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  }
                });
                if (response.ok) {
                  alert("Invoice sent successfully to customer My Orders page!");
                  window.location.reload();
                } else {
                  alert("Failed to send bill/invoice.");
                }
              } catch (err) {
                console.error("Error sending bill:", err);
                alert("Error sending bill/invoice.");
              }
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
          >
            Send Bill/Invoice
          </button>
        )}
      </div>

      {order.filesDeleted ? (
        <div
          onClick={() => setShowCleanedModal(true)}
          className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer select-none"
        >
          ⚠️ Storage Cleaned — Files Automatically Removed (Click for Info)
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
          <ActionButton tone="purple" icon={Eye} label="Preview" onClick={handlePreview} />
          <ActionButton tone="purple" icon={Printer} label="Print" onClick={handlePrint} />
          <ActionButton tone="blue" icon={Download} label="Download" onClick={handleDownload} />
          <ActionButton tone="red" icon={X} label="Cancel" onClick={handleCancel} />
        </div>
      )}

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
            <h3 className="font-extrabold text-slate-800 text-lg">Storage Cleaned</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              The uploaded print documents for this order were automatically and permanently deleted from storage because the order has completed 6 hours.
            </p>
            <p className="text-[11px] text-indigo-600 font-bold bg-indigo-50/50 py-2 px-3 rounded-xl border border-indigo-100/60">
              You can try to upload the file again.
            </p>
            <button
              onClick={() => setShowCleanedModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
