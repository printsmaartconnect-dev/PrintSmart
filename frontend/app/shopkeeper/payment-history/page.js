'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search, RefreshCw, AlertCircle, Info } from 'lucide-react'

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-650 text-white shadow-sm font-bold text-lg">
        ₹
      </span>
      <div className="text-lg font-extrabold tracking-tight">
        <span className="text-slate-900">PrintSmart</span>
        <span className="text-indigo-650"> Payments</span>
      </div>
    </div>
  )
}

export default function PaymentHistoryPage() {
  const router = useRouter()
  const { t } = useTranslation()
  
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.replace('/shopkeeper/login')
      return
    }

    const fetchPaymentHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
        const response = await fetch(`${apiUrl}/api/payment/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to load payment records')
        }
        const data = await response.json()
        setPayments(data)
      } catch (err) {
        console.error('Fetch payment history error:', err)
        setError(err.message || 'Error occurred while loading payment history')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentHistory()
  }, [refreshKey, router])

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments
    const query = searchQuery.toLowerCase()
    return payments.filter(p => {
      const paymentId = (p.razorpayPaymentId || '').toLowerCase()
      const orderId = (p.order?.orderId || '').toLowerCase()
      const customer = (p.order?.customerName || '').toLowerCase()
      return paymentId.includes(query) || orderId.includes(query) || customer.includes(query)
    })
  }, [payments, searchQuery])

  const statusPillColors = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/60',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200/60',
    REFUNDED: 'bg-slate-100 text-slate-700 border-slate-300/60'
  }

  const formatTimestamp = (isoString) => {
    const dateObj = new Date(isoString)
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f4f6]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(79,70,229,0.08),transparent_52%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="w-full rounded-2xl border border-white bg-white/70 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-xl mb-6 sm:px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/shopkeeper/dashboard')}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <LogoMark />
          </div>
          
          <button
            type="button"
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 text-slate-500 hover:text-indigo-650 hover:bg-slate-100 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <main className="flex-grow bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">{t('Online Payment History')}</h2>
              <p className="text-xs text-slate-400 font-semibold">{t('View and reconcile automatic Razorpay transactions')}</p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search payment id, order, customer...')}
                className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex gap-3">
              <AlertCircle className="text-rose-600 flex-shrink-0" size={20} />
              <p className="text-xs text-rose-700 font-bold">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650 mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold text-sm">{t('Loading payment records...')}</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
              <Info size={40} className="mx-auto text-slate-350 mb-3" />
              <p className="text-slate-800 font-extrabold">{t('No payment records found')}</p>
              <p className="text-xs text-slate-450 mt-1 font-semibold">{t('Transactions will appear here once customers pay online.')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm animate-fade-in">
              <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">{t('Payment ID')}</th>
                    <th className="py-3 px-4">{t('Order ID')}</th>
                    <th className="py-3 px-4">{t('Customer')}</th>
                    <th className="py-3 px-4 text-right">{t('Amount')}</th>
                    <th className="py-3 px-4">{t('Method')}</th>
                    <th className="py-3 px-4">{t('Status')}</th>
                    <th className="py-3 px-4">{t('Date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono text-indigo-650 font-extrabold">
                        {payment.razorpayPaymentId || <span className="text-slate-400 font-semibold italic">N/A (Pending)</span>}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {payment.order?.orderId || payment.orderId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{payment.order?.customerName || t('Anonymous')}</div>
                        {payment.order?.phone && <div className="text-[10px] text-slate-400 mt-0.5">{payment.order.phone}</div>}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-850">
                        ₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold capitalize text-slate-500">
                        {payment.paymentMethod || <span className="text-slate-400">N/A</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${statusPillColors[payment.paymentStatus] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-semibold">
                        {formatTimestamp(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
