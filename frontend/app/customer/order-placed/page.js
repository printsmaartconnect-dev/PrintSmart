'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OrderPlacedPage() {
  const router = useRouter()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}')
    setOrder(currentOrder)
  }, [])

  if (!order?.orderId) return null

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Number */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-4xl font-bold">6</span>
        </div>
        <h1 className="text-3xl font-bold text-black">Order Placed</h1>
        <p className="text-gray-600 mt-2">Your print order has been successfully placed.</p>
      </div>

      {/* Success Card */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-4xl p-6 sm:p-8 lg:p-10">
        {/* Mac Dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="mac-dots">
            <div className="mac-dot red"></div>
            <div className="mac-dot yellow"></div>
            <div className="mac-dot green"></div>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Success Animation */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-green-100 opacity-30 animate-pulse"></div>
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="30" fill="#d1fae5" />
              <path
                d="M24 32L30 38L42 26"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="checkmark"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-black text-center mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-center text-gray-600 mb-8">Your file has been sent to the shop.</p>

        {/* Order Details */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4 mb-8">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Order ID</span>
            <span className="font-bold text-gray-900">{order.orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Estimated Time</span>
            <span className="font-bold text-gray-900">10-15 mins</span>
          </div>
        </div>

        {/* Buttons */}
        <Link href="/customer/orders">
          <button className="w-full gradient-button py-3 px-4 rounded-xl font-semibold transition text-white mb-4">
            Go to My Orders
          </button>
        </Link>

        <Link href="/customer/upload">
          <button className="w-full py-3 px-4 rounded-xl font-semibold transition text-blue-600 border-2 border-blue-600 hover:bg-blue-50">
            Upload Another File
          </button>
        </Link>
      </div>
    </div>
  )
}