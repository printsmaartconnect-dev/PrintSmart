'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Printer, ArrowLeft, Loader2, FileText, AlertCircle, Download, CheckCircle } from 'lucide-react'

function PrintPreviewContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blobUrl, setBlobUrl] = useState('')
  const [fileType, setFileType] = useState('') // 'pdf' | 'image' | 'doc'
  const [preparingPrint, setPreparingPrint] = useState(false)
  
  const iframeRef = useRef(null)
  const imgRef = useRef(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'

  const getPresignedUrl = async (fileUrl) => {
    if (!fileUrl) return ''
    if (!fileUrl.includes('amazonaws.com')) {
      return fileUrl
    }
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${apiUrl}/api/files/presigned?fileUrl=${encodeURIComponent(fileUrl)}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        return data.presignedUrl
      }
    } catch (err) {
      console.error("Failed to get presigned URL:", err)
    }
    return fileUrl
  }

  useEffect(() => {
    if (!orderId) {
      setError(t('Order ID is missing.'))
      setLoading(false)
      return
    }

    const fetchOrderAndPrepare = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(t('Failed to retrieve order details.'))
        }
        const orderData = await response.json()
        setOrder(orderData)

        // Identify file
        const orderFile = orderData.orderFiles && orderData.orderFiles[0]
        if (!orderFile || !orderFile.fileUrl) {
          throw new Error(t('No printable file URL found for this order.'))
        }

        const fileName = orderFile.originalFileName || orderFile.customFileName || ''
        const extension = fileName.split('.').pop().toLowerCase()
        const url = await getPresignedUrl(orderFile.fileUrl)

        if (['pdf'].includes(extension)) {
          setFileType('pdf')
          setPreparingPrint(true)
          // Fetch as Blob to bypass cross-origin restrictions in iframes
          const fileRes = await fetch(url)
          if (!fileRes.ok) {
            throw new Error(t('Failed to download PDF for printing.'))
          }
          const blob = await fileRes.blob()
          const bUrl = URL.createObjectURL(blob)
          setBlobUrl(bUrl)
        } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
          setFileType('image')
          setBlobUrl(url)
        } else {
          setFileType('doc')
        }
      } catch (err) {
        console.error("Print preview error:", err)
        setError(err.message || t('An error occurred during print preparation.'))
      } finally {
        setLoading(false)
      }
    }

    fetchOrderAndPrepare()
  }, [orderId])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl && fileType === 'pdf') {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [blobUrl, fileType])

  const triggerSystemPrint = () => {
    if (fileType === 'pdf' && iframeRef.current) {
      try {
        setPreparingPrint(false)
        iframeRef.current.contentWindow.focus()
        iframeRef.current.contentWindow.print()
      } catch (err) {
        console.error("Iframe print failed:", err)
        window.open(blobUrl || order.orderFiles[0].fileUrl, '_blank')
      }
    } else if (fileType === 'image') {
      window.print()
    }
  }

  // Handle auto-printing once loaded
  useEffect(() => {
    if (fileType === 'image' && !loading && !error) {
      const timer = setTimeout(() => {
        window.print()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [fileType, loading, error])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <Loader2 size={40} className="animate-spin text-violet-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">{t('Preparing Document...')}</h2>
          <p className="text-xs text-slate-400 font-medium">
            {t('Fetching secure print config and loading document elements.')}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">{t('Print Initialization Failed')}</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/shopkeeper/dashboard')}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition text-xs"
          >
            <ArrowLeft size={16} />
            {t('Back to Dashboard')}
          </button>
        </div>
      </div>
    )
  }

  const orderFile = order?.orderFiles?.[0]
  const config = order?.printConfiguration
  const fileName = orderFile?.originalFileName || orderFile?.customFileName || 'Document'

  return (
    <div className="min-h-screen bg-[#FAF8FF] p-4 sm:p-8 font-semibold text-slate-700 text-xs">
      {/* Top Banner (Hidden in Print) */}
      <header className="no-print max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/shopkeeper/dashboard')}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            title={t('Back to Dashboard')}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Printer size={16} className="text-violet-600" />
              {t('Print Job Management')}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Order #{order.orderId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {preparingPrint && fileType === 'pdf' ? (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl text-xs">
              <Loader2 size={14} className="animate-spin text-amber-600" />
              {t('Rendering PDF...')}
            </div>
          ) : (
            (fileType === 'pdf' || fileType === 'image') && (
              <button
                onClick={triggerSystemPrint}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md hover:brightness-105 active:scale-98 transition text-xs"
              >
                <Printer size={14} />
                {t('Open Print Setup')}
              </button>
            )
          )}
        </div>
      </header>

      {/* Preview Body */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Ticket Details (Always displayed for context, but styled differently when printed) */}
        <section className={`lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 ${fileType === 'doc' ? 'lg:col-span-12 max-w-2xl mx-auto' : ''}`}>
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <FileText size={16} className="text-indigo-600" />
              {t('Print Configuration Ticket')}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {t('Match these parameters in your system print settings.')}
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{t('Customer Name')}</span>
              <p className="font-bold text-slate-800 mt-0.5 text-sm">{order.customerName}</p>
              {order.phone && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{order.phone}</p>}
            </div>

            <div className="bg-slate-50/50 border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-150">
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{t('Pages')}</span>
                <span className="font-black text-slate-800 text-sm">{config?.pageRange || 'All'}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{t('Copies')}</span>
                <span className="font-black text-slate-800 text-sm">{config?.copies || 1}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{t('Print Type')}</span>
                <span className="font-black text-slate-800 text-sm">
                  {config?.printType === 'COLOR' ? t('Color') : t('B&W')}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{t('Paper Size')}</span>
                <span className="font-black text-slate-800 text-sm">{config?.paperSize || 'A4'}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{t('Sides')}</span>
                <span className="font-black text-slate-800 text-sm">
                  {config?.sides === 'DOUBLE' ? t('Double-sided') : t('Single-sided')}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{t('Orientation')}</span>
                <span className="font-black text-slate-800 text-sm">{config?.orientation || 'Portrait'}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-400 font-bold">{t('Print Quality')}</span>
                <span className="font-black text-slate-800 text-sm">{config?.quality || 'Normal'}</span>
              </div>
            </div>

            {order.customerComment && (
              <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-2xl text-amber-900 leading-normal">
                <span className="font-black text-amber-950 block text-[10.5px] uppercase tracking-wide mb-1">{t('Customer Instructions')}</span>
                <p className="text-xs text-amber-800 font-semibold">{order.customerComment}</p>
              </div>
            )}
          </div>

          {/* Fallback Word/Excel Helper Sheet */}
          {fileType === 'doc' && (
            <div className="bg-indigo-50 border border-indigo-150 p-5 rounded-3xl space-y-4">
              <div className="space-y-1">
                <h3 className="font-black text-indigo-950 text-sm flex items-center gap-1.5">
                  <Download size={16} className="text-indigo-600 animate-bounce" />
                  {t('Word / Excel Support Notice')}
                </h3>
                <p className="text-[11px] leading-relaxed text-indigo-800 font-semibold">
                  {t('Microsoft Office files cannot be directly rendered in-browser for printing. Please download the file, open it in your desktop suite, and press Ctrl + P to print with the configurations above.')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={orderFile?.fileUrl}
                  download={fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-sm transition"
                >
                  {t('Download Document')}
                </a>
                <button
                  onClick={() => router.push('/shopkeeper/dashboard')}
                  className="flex-1 py-3 border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl font-extrabold text-xs shadow-sm transition"
                >
                  {t('Back to Dashboard')}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Visual Preview Area (Hidden in Print for PDF, but visible for Image) */}
        {fileType !== 'doc' && (
          <section className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3 mb-4 no-print flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-800">{t('Document Preview')}</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{fileName}</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-lg">
                {fileType.toUpperCase()}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center p-2 border border-slate-100 rounded-2xl bg-slate-50/50 overflow-hidden relative">
              {fileType === 'image' && blobUrl && (
                <img
                  ref={imgRef}
                  src={blobUrl}
                  alt={fileName}
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm border border-slate-200 print-document"
                />
              )}

              {fileType === 'pdf' && blobUrl && (
                <>
                  <div className="no-print absolute inset-0 bg-slate-100/30 flex items-center justify-center flex-col gap-3">
                    <Loader2 size={36} className="animate-spin text-indigo-600" />
                    <p className="text-[11px] font-bold text-slate-500">
                      {preparingPrint ? t('Preparing secure PDF iframe channel...') : t('PDF loaded. System dialog triggered.')}
                    </p>
                  </div>
                  <iframe
                    ref={iframeRef}
                    src={blobUrl}
                    onLoad={triggerSystemPrint}
                    className="w-full h-[600px] border-0 rounded-lg shadow-sm hidden-print-frame"
                  />
                </>
              )}
            </div>

            <p className="no-print text-[10px] text-slate-400 font-bold text-center mt-4 uppercase tracking-wider">
              ⚡ {t('System print dialog launches automatically. If blocked, click Open Print Setup.')}
            </p>
          </section>
        )}
      </main>

      {/* Global CSS for Print Layout */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
          }
          main {
            display: block !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          section {
            border: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .print-document {
            max-height: 100% !important;
            max-width: 100% !important;
            width: auto !important;
            height: auto !important;
            box-shadow: none !important;
            border: 0 !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .hidden-print-frame {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function PrintPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <PrintPreviewContent />
    </Suspense>
  )
}
