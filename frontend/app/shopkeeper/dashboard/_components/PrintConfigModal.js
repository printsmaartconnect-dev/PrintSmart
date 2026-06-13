'use client'

import { useState } from 'react'
import { X, Printer, Loader2, AlertCircle, Info, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const getPrintableUrl = async (fileUrl) => {
  if (!fileUrl) return '';
  if (!fileUrl.includes('amazonaws.com')) {
    return fileUrl;
  }
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
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

export default function PrintConfigModal({ order, shopName, onClose, onPrintComplete }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePrintNow = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = await getPrintableUrl(order.fileUrl)
      if (!url) {
        throw new Error(t('No file URL found for this order.'))
      }

      // Fetch file as blob to allow same-origin printing bypass
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(t('Failed to fetch file for printing.'))
      }
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      // Create hidden iframe
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.src = blobUrl

      document.body.appendChild(iframe)

      iframe.onload = () => {
        try {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(iframe)
            URL.revokeObjectURL(blobUrl)
          }, 15000)
        } catch (printErr) {
          console.error("Iframe print blocked or failed, falling back to new window:", printErr)
          window.open(url, '_blank')
        }
      }
    } catch (err) {
      console.warn("Direct iframe print failed, falling back to new window:", err)
      try {
        const url = await getPrintableUrl(order.fileUrl)
        if (url) {
          window.open(url, '_blank')
        } else {
          setError(t('Could not resolve file URL.'))
        }
      } catch (fallbackErr) {
        setError(t('Could not open file.'))
      }
    } finally {
      setLoading(false)
      if (onPrintComplete) {
        onPrintComplete()
      }
    }
  }

  // Extract clean numerical price from price string
  const cleanPrice = typeof order.price === 'string' ? order.price : `₹${(order.price || 0).toFixed(2)}`

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full border border-slate-100 overflow-hidden font-semibold text-slate-700 text-xs">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">{t('Verify Printer Settings')}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order #{order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* File Name Info Block */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600">
            <FileText size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{t('Document to Print')}</span>
              <p className="font-bold text-slate-700 truncate text-xs">{order.fileName}</p>
            </div>
          </div>

          {/* Configuration List */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {[
              { label: t('Pages'), value: order.pages || 1 },
              { label: t('Copies'), value: order.copies || 1 },
              { label: t('Type'), value: order.type || 'B&W' },
              { label: t('Size'), value: order.size || 'A4' },
              { label: t('Side'), value: order.side || 'Single' },
              { label: t('Price'), value: cleanPrice, isHighlight: true }
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{item.label}</span>
                <span className={`font-black ${item.isHighlight ? 'text-indigo-600 text-sm' : 'text-slate-800'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Warning / Setup Notice */}
          <div className="flex gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-amber-950">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-amber-900 block">{t('Action Required')}</span>
              <p className="text-[10.5px] leading-relaxed text-amber-800">
                {t('Please select the exact print settings listed above in the system print dialog when it opens.')}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-[11px] leading-normal font-bold">
              <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition font-extrabold text-xs"
            disabled={loading}
          >
            {t('Cancel')}
          </button>
          <button
            onClick={handlePrintNow}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md shadow-violet-200 hover:brightness-105 active:scale-98 transition font-extrabold text-xs flex items-center justify-center gap-1.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t('Preparing...')}
              </>
            ) : (
              <>
                <Printer size={14} />
                {t('Open Print Dialog')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
