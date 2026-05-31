'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Check, ArrowLeft, Clock, FileText, ShoppingBag } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import Link from 'next/link'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'

export default function OrderPlacedPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const userId = searchParams.get('userId')

  const [order, setOrder] = useState(null)

  useEffect(() => {
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}')
    setOrder(currentOrder)
  }, [])

  if (!order?.orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600 font-semibold text-lg">{t('No active order found.')}</p>
      </div>
    )
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <span className="text-white text-3xl font-bold">✓</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 font-brand">{t('Order Placed')}</h1>
        <p className="text-gray-600 mt-2 font-medium">{t('Your print order has been successfully sent to the shop.')}</p>
      </div>

      {/* Success Card */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-4xl p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <span className="text-sm font-semibold text-green-600">{t('Order Completed')}</span>
        </div>

        {/* Success Animation */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center relative border border-green-200">
            <div className="absolute inset-0 rounded-full bg-green-100 opacity-30 animate-ping"></div>
            <ShoppingBag size={40} className="text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {t('Order Placed Successfully!')}
        </h2>
        <p className="text-center text-gray-600 text-sm font-medium mb-8">
          {t('You can track the progress of your printing order below.')}
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 mb-8">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-sm">
            <span className="text-gray-600 font-semibold">{t('Order ID')}</span>
            <span className="font-bold text-indigo-700 text-base">{order.orderId}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-sm">
            <span className="text-gray-600 font-semibold">{t('Printing Location')}</span>
            <span className="font-bold text-gray-800">{order.shopName || t('Smart Print Station')}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-semibold flex items-center gap-1"><Clock size={16} className="text-indigo-600" /> {t('Estimated Wait Time')}</span>
            <span className="font-bold text-green-600 text-base">
              {order.estimatedTime ? `${order.estimatedTime} ${t('mins')}` : `2–7 ${t('mins')}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/customer/orders?shopId=${shopId || ''}&userId=${userId || ''}`}>
            <button className="w-full gradient-button py-3.5 px-4 rounded-xl font-bold transition text-white shadow-md">
              {t('Go to My Orders & Track')}
            </button>
          </Link>

          <Link href={`/customer/upload?shopId=${shopId || ''}&userId=${userId || ''}`}>
            <button className="w-full py-3.5 px-4 rounded-xl font-bold transition text-indigo-600 border-2 border-indigo-600 bg-white hover:bg-indigo-50">
              {t('Upload Another Document')}
            </button>
          </Link>
        </div>

        {/* Reusable FeedbackLink */}
        <FeedbackLink />
      </div>

      <FeedbackButton />
    </div>
  )
}