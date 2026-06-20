'use client'

import { useState } from 'react'
import { X, Printer, Loader2, AlertCircle, Info, FileText, Download } from 'lucide-react'
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

export default function PrintConfigModal({ order, onClose, onConfirm }) {
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)

  // Extract clean numerical price from price string
  const cleanPrice = typeof order.price === 'string' ? order.price : `₹${(order.price || 0).toFixed(2)}`

  const filesList = order.files && order.files.length > 0 ? order.files : [{ fileName: order.fileName || "" }]
  const isDirectPrintable = filesList.every(file => {
    const ext = (file.fileName || '').split('.').pop().toLowerCase()
    return ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
  })

  const handleConfirm = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      if (onConfirm) {
        await onConfirm(order)
      }
    } catch (err) {
      console.error("Error during print confirmation:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full border border-slate-100 overflow-hidden font-semibold text-slate-700 text-xs">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              {isDirectPrintable ? <Printer size={18} /> : <Download size={18} />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                {isDirectPrintable ? t('Verify Printer Settings') : t('Verify File Download')}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order #{order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* File Name Info Block */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {(order.files && order.files.length > 0 ? order.files : [{ fileName: order.fileName || "Untitled Document" }]).map((file, fileIdx) => (
              <div key={file.id || fileIdx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-650">
                <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-slate-700 truncate text-[11px]">{file.fileName}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Configuration List */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {(order.files && order.files.length > 1
              ? [
                  { label: t('Total Files'), value: order.files.length },
                  { label: t('Price'), value: cleanPrice, isHighlight: true }
                ]
              : [
                  { label: t('Pages'), value: order.pages || 1 },
                  { label: t('Copies'), value: (order.files && order.files[0]?.copies) || order.copies || 1 },
                  { label: t('Type'), value: (order.files && order.files[0]?.type) || order.type || 'B&W' },
                  { label: t('Size'), value: (order.files && order.files[0]?.size) || order.size || 'A4' },
                  { label: t('Side'), value: (order.files && order.files[0]?.side) || order.side || 'Single' },
                  { label: t('Price'), value: cleanPrice, isHighlight: true }
                ]
            ).map((item) => (
              <div key={item.label} className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{item.label}</span>
                <span className={`font-black ${item.isHighlight ? 'text-indigo-600 text-sm' : 'text-slate-800'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Warning / Setup Notice */}
          {isDirectPrintable ? (
            <div className="flex gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-amber-950">
              <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black text-amber-900 block">{t('Action Required')}</span>
                <p className="text-[10.5px] leading-relaxed text-amber-800">
                  {t('Please select the exact print settings listed above in the system print dialog when it opens.')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2.5 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-950">
              <Info size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black text-indigo-900 block">{t('Office Document')}</span>
                <p className="text-[10.5px] leading-relaxed text-indigo-800 font-semibold">
                  {t('Office files cannot be printed directly from the browser. Click confirm to download the file, then open and print it locally.')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition font-extrabold text-xs disabled:opacity-50"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md shadow-violet-200 hover:brightness-105 active:scale-98 transition font-extrabold text-xs flex items-center justify-center gap-1.5 disabled:opacity-75"
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {isDirectPrintable ? t('Preparing Print...') : t('Downloading...')}
              </>
            ) : (
              <>
                {isDirectPrintable ? <Printer size={14} /> : <Download size={14} />}
                {isDirectPrintable ? t('Confirm & Print') : t('Confirm & Download')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
