'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Download, Home, ArrowLeft, Clock, AlertCircle, FileText, CheckCircle } from 'lucide-react'
import useTranslation from '../../../../src/hooks/useTranslation'
import BackButton from '../../../components/BackButton'
import FeedbackButton from '../../../components/FeedbackButton'
import FeedbackLink from '../../../components/FeedbackLink'
import { formatCurrency } from '../../../../lib/currency'

export default function InvoicePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchOrderDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/orders/${id}`)
        if (!response.ok) {
          throw new Error('Failed to retrieve order invoice details')
        }
        const data = await response.json()
        setOrder(data)
      } catch (err) {
        console.error('Fetch invoice details error:', err)
        setError(t('Failed to load invoice details. Please check the URL or try again.'))
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id, t])

  const handleDownloadPdf = () => {
    if (!id) return
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    window.open(`${apiUrl}/api/orders/${id}/invoice`, '_blank')
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return ''
    const dateObj = new Date(isoString)
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + t('at') + ' ' + dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Loader / Skeleton Screen
  if (loading) {
    return (
      <div className="wave-bg min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glassmorphism w-full max-w-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <FileText className="text-indigo-600 animate-bounce" size={28} />
          </div>
          <p className="text-slate-600 font-semibold text-lg animate-pulse">
            {t('Retrieving invoice database records...')}
          </p>
        </div>
      </div>
    )
  }

  // Error Screen
  if (error || !order) {
    return (
      <div className="wave-bg min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glassmorphism w-full max-w-md p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">{t('Invoice Error')}</h2>
            <p className="text-sm text-slate-500 font-medium">{error || t('Could not find invoice record.')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/customer/orders')}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm text-indigo-600 border border-indigo-150 bg-white hover:bg-indigo-50 transition"
            >
              {t('Back to Orders')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate pricing fallbacks
  const totalAmount = order.totalAmount || order.price || 0
  const subtotal = order.subtotal || (totalAmount / 1.18)
  const tax = order.tax || (totalAmount - subtotal)
  const discount = order.discount || 0
  
  // Tax breakdown (e.g. CGST + SGST 9% each)
  const cgstAmount = tax / 2
  const sgstAmount = tax / 2

  const invoiceNumber = order.invoice?.invoiceNumber || order.orderId

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      
      {/* Top Utility Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BackButton />
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
          >
            <Home size={16} />
            {t('Home')}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow transition"
          >
            <Download size={15} />
            {t('Download PDF')}
          </button>
        </div>
      </div>

      {/* Main Invoice Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans">
        
        {/* Decorative Dark Rainbow Gradient Top Line */}
        <div 
          className="h-2.5" 
          style={{
            background: 'linear-gradient(to right, #7f1d1d, #9a3412, #92400e, #15803d, #0e7490, #1e40af, #5b21b6, #6b21a8)'
          }}
        ></div>

        <div className="p-6 sm:p-10">
          
          {/* Invoice Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
            <div>
              {/* Logo / Brand */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-lg font-bold">PS</span>
                </div>
                <span className="text-lg font-extrabold tracking-tight text-slate-800">
                  {order.shopkeeper?.shopName || t('Smart Print Station')}
                </span>
              </div>
              
              {/* Merchant Details */}
              <div className="mt-4 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
                <p className="font-semibold text-slate-700">{order.shopkeeper?.shopName || t('Print Smart Partner')}</p>
                <p>{order.shopkeeper?.address || t('Address details in queue control panel')}</p>
                {order.shopkeeper?.phone && (
                  <p className="mt-1 font-medium text-slate-600">{t('Phone')}: {order.shopkeeper.phone}</p>
                )}
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider mb-2">
                {t('Tax Invoice')}
              </span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                #{invoiceNumber}
              </h1>
              
              <div className="mt-4 space-y-1 text-xs text-slate-500 sm:text-right">
                <div className="flex justify-between sm:justify-end gap-2">
                  <span>{t('Date Issued')}:</span>
                  <time className="font-semibold text-slate-700">{formatTimestamp(order.createdAt)}</time>
                </div>
                <div className="flex justify-between sm:justify-end gap-2">
                  <span>{t('Status')}:</span>
                  <span className="font-bold text-green-600">{t(order.status)}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Client & Billing Info */}
          <section className="grid sm:grid-cols-2 gap-6 my-8 text-xs sm:text-sm" aria-labelledby="billing-heading">
            <h2 id="billing-heading" class="sr-only">{t('Billing Details')}</h2>
            
            <div>
              <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t('Billed To')}</h3>
              <p class="text-sm sm:text-base font-bold text-slate-800">{order.customerName || t('Valued Customer')}</p>
              <div class="mt-1 text-slate-500 space-y-0.5">
                {order.phone && <p>{t('Phone')}: {order.phone}</p>}
                <p>{t('Payment Mode')}: {t('UPI / Digital Remit')}</p>
              </div>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Amount Paid')}</h4>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{formatCurrency(totalAmount)}</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 border border-green-150 text-green-700">
                  {t('Paid')}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-3">
                <p>{t('Remitted through PrintSmart Secure Gateway')}</p>
              </div>
            </div>
          </section>

          {/* Itemized Printing Billing Table */}
          <main class="my-8">
            <div class="overflow-x-auto rounded-xl border border-slate-100">
              <table class="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th scope="col" class="py-3 px-4 sm:px-6">{t('File & Printing Configuration')}</th>
                    <th scope="col" class="py-3 px-3 text-right w-16 sm:w-20">{t('Qty')}</th>
                    <th scope="col" class="py-3 px-3 text-right w-24 sm:w-28">{t('Rate')}</th>
                    <th scope="col" class="py-3 px-4 sm:px-6 text-right w-24 sm:w-28">{t('Amount')}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  {order.orderFiles && order.orderFiles.length > 0 ? (
                    order.orderFiles.map((file, idx) => {
                      const fileConfig = file.config || order.printConfiguration
                      const copies = fileConfig?.copies || 1
                      const printTypeLabel = fileConfig?.printType === 'COLOR' ? t('Color') : t('B&W')
                      const sizeLabel = fileConfig?.paperSize || 'A4'
                      const sidesLabel = fileConfig?.sides === 'DOUBLE' ? t('Double-sided') : t('Single-sided')
                      
                      const itemPrice = file.price || totalAmount
                      const singleUnitPrice = itemPrice / copies

                      return (
                        <tr key={file.id || idx}>
                          <td class="py-4 px-4 sm:px-6">
                            <p class="font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                              {file.customFileName || file.originalFileName}
                            </p>
                            <span class="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 block">
                              {printTypeLabel} &bull; {sizeLabel} &bull; {sidesLabel}
                            </span>
                          </td>
                          <td class="py-4 px-3 text-right font-mono text-slate-500">
                            {copies}
                          </td>
                          <td class="py-4 px-3 text-right font-mono text-slate-500">
                            {formatCurrency(singleUnitPrice)}
                          </td>
                          <td class="py-4 px-4 sm:px-6 text-right font-bold text-slate-800 font-mono">
                            {formatCurrency(itemPrice)}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    // Fallback Single Row using Order Configuration if files list is empty
                    <tr>
                      <td class="py-4 px-4 sm:px-6">
                        <p class="font-bold text-slate-800">
                          {t('Standard Document Print Job')}
                        </p>
                        <span class="text-xs text-slate-400 font-semibold mt-0.5 block">
                          {order.printConfiguration?.printType === 'COLOR' ? t('Color') : t('B&W')} &bull; 
                          {order.printConfiguration?.paperSize || 'A4'} &bull; 
                          {order.printConfiguration?.sides === 'DOUBLE' ? t('Double-sided') : t('Single-sided')}
                        </span>
                      </td>
                      <td class="py-4 px-3 text-right font-mono text-slate-500">
                        {order.printConfiguration?.copies || 1}
                      </td>
                      <td class="py-4 px-3 text-right font-mono text-slate-500">
                        {formatCurrency(totalAmount / (order.printConfiguration?.copies || 1))}
                      </td>
                      <td class="py-4 px-4 sm:px-6 text-right font-bold text-slate-800 font-mono">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>

          {/* Pricing Breakdown and Remittance Instructions */}
          <section className="flex flex-col sm:flex-row sm:justify-between gap-6 mt-8" aria-label="Calculation summary">
            
            {/* Notes & Gateway confirmation */}
            <div className="sm:max-w-xs text-xs text-slate-500 leading-relaxed">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Billing Information')}</h4>
              <p>
                {t('This is a computer-generated tax invoice issued via PrintSmart queue networks. Remittance has been successfully processed.')}
              </p>
              {order.queue && (
                <div className="mt-3 flex items-center gap-1.5 text-indigo-600 font-semibold">
                  <CheckCircle size={14} />
                  <span>{t('Queue Status Completed')}</span>
                </div>
              )}
            </div>

            {/* Financial Summary values */}
            <div className="w-full sm:w-72 text-xs sm:text-sm text-slate-500 space-y-2.5">
              <div className="flex justify-between">
                <span>{t('Subtotal')}</span>
                <span className="font-semibold text-slate-800 font-mono">{formatCurrency(subtotal)}</span>
              </div>
              
              {/* IGST / SGST Breakdowns */}
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>{t('CGST (9%)')}</span>
                <span className="font-medium font-mono">{formatCurrency(cgstAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-100 pb-3">
                <span>{t('SGST (9%)')}</span>
                <span className="font-medium font-mono">{formatCurrency(sgstAmount)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{t('Discount')}</span>
                  <span className="font-bold font-mono">-{formatCurrency(discount)}</span>
                </div>
              )}

              {/* Total Due */}
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm sm:text-base font-bold text-slate-800">{t('Total Amount')}</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">
                  {formatCurrency(totalAmount)} <span className="text-[10px] sm:text-xs font-normal text-slate-400 font-sans">INR</span>
                </span>
              </div>
            </div>
          </section>

          {/* Footer Notice */}
          <footer className="border-t border-slate-100 mt-10 pt-6 text-center text-[11px] sm:text-xs text-slate-400 space-y-1">
            <p>{t('Thank you for using PrintSmart!')}</p>
            <p className="font-medium text-slate-300">
              {order.shopkeeper?.shopName || 'PrintSmart'} &bull; {order.shopkeeper?.address || ''}
            </p>
          </footer>

        </div>
      </div>

      {/* Help Link and Feedback */}
      <div className="w-full max-w-3xl mt-4">
        <FeedbackLink />
      </div>
      <FeedbackButton />
    </div>
  )
}
