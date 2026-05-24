'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FileText, ArrowLeft } from 'lucide-react'

export default function ReviewPage() {
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [config, setConfig] = useState(null)

  useEffect(() => {
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
    const printConfig = JSON.parse(localStorage.getItem('printConfig') || 'null')
    setFiles(uploadedFiles)
    setConfig(printConfig)
  }, [])

  const calculateItemPrice = (item) => {
    if (!item) return 0
    const copies = Number(item.copies || 0)
    let basePrice = 2 * copies
    if (item.printType === 'color') basePrice *= 1.5
    return basePrice
  }

  const calculatePrice = () => {
    if (!config) return 0
    if (Array.isArray(config)) {
      return config.reduce((sum, item) => sum + calculateItemPrice(item), 0)
    }
    return calculateItemPrice(config)
  }

  const price = calculatePrice()
  const total = price.toFixed(2)

  const handlePlaceOrder = async () => {
    const orderId = `ORD-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
    const newOrder = {
      orderId,
      files,
      config,
      price: total,
      timestamp: new Date().toISOString(),
    }

    const uploadedFileUrls = JSON.parse(localStorage.getItem('uploadedFileUrls') || '{}')
    const items = []
    
    if (Array.isArray(config)) {
      config.forEach((itemConfig, index) => {
        const fName = files[index] || `Document ${index + 1}`
        items.push({
          fileName: fName,
          fileUrl: uploadedFileUrls[fName] || 'http://localhost:5000/uploads/placeholder.pdf',
          price: calculateItemPrice(itemConfig),
          variant: 'standard',
          config: itemConfig
        })
      })
    } else {
      const fName = files[0] || 'Untitled document'
      items.push({
        fileName: fName,
        fileUrl: uploadedFileUrls[fName] || 'http://localhost:5000/uploads/placeholder.pdf',
        price: calculateItemPrice(config),
        variant: 'standard',
        config: config
      })
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: 'Anonymous Customer',
          phone: '',
          items,
        }),
      })

      if (response.ok) {
        console.log('Order synced to backend successfully')
      }
    } catch (err) {
      console.warn('Backend order placement failed, proceeding in offline/mock mode:', err)
    }

    // Persist order exactly once
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const exists = storedOrders.some((o) => o?.orderId === orderId)
    const nextOrders = exists ? storedOrders : [...storedOrders, newOrder]
    localStorage.setItem('orders', JSON.stringify(nextOrders))

    localStorage.setItem('currentOrder', JSON.stringify(newOrder))
    router.push('/customer/order-placed')
  }

  if (!config) return null

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mb-8">
        <div className="step-header">
          <div className="step-number">5</div>
          <div>
            <h1 className="text-3xl font-bold text-black">Order Review</h1>
            <p className="text-gray-600">Review your order details and see the final price.</p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-4xl p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="mac-dots">
              <div className="mac-dot red"></div>
              <div className="mac-dot yellow"></div>
              <div className="mac-dot green"></div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        </div>

        <h3 className="text-2xl font-bold text-black text-center mb-8">Order Review</h3>

        {/* File Display */}
        {files.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <FileText size={32} className="text-red-500 mb-2" />
            {files.length === 1 ? (
              <>
                <p className="font-semibold text-gray-700">{files[0]}</p>
                <p className="text-sm text-gray-500">12 Pages • 2.4 MB</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-700">{files.length} Documents</p>
                <div className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <p key={i} className="text-sm text-gray-600 truncate">
                      {i + 1}. {f}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Config Details */}
        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
          {Array.isArray(config) ? (
            <div className="space-y-4">
              {config.map((item, index) => {
                const title = item?.identityName?.trim() || item?.fileName || files[index] || `Document ${index + 1}`
                return (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-gray-900 mb-3 truncate">{title}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Print Type</span>
                        <span className="font-semibold text-gray-900">
                          {item.printType === 'bw' ? 'Black & White' : 'Color'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Copies</span>
                        <span className="font-semibold text-gray-900">{item.copies}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Paper Size</span>
                        <span className="font-semibold text-gray-900">{item.paperSize}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Print Sides</span>
                        <span className="font-semibold text-gray-900">
                          {item.sides === 'single' ? 'Single Side' : 'Double Side'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Pages</span>
                        <span className="font-semibold text-gray-900">
                          {item.pages === 'all' ? 'All Pages' : 'Custom Pages'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Print Type</span>
                <span className="font-semibold text-gray-900">
                  {config.printType === 'bw' ? 'Black & White' : 'Color'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Copies</span>
                <span className="font-semibold text-gray-900">{config.copies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Paper Size</span>
                <span className="font-semibold text-gray-900">{config.paperSize}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Print Sides</span>
                <span className="font-semibold text-gray-900">
                  {config.sides === 'single' ? 'Single Side' : 'Double Side'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Pages</span>
                <span className="font-semibold text-gray-900">
                  {config.pages === 'all' ? 'All Pages' : 'Custom Pages'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Price</span>
            <span className="font-bold text-gray-900">₹{price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-gray-700 font-bold text-lg">Final Total</span>
            <span className="font-bold text-gray-900 text-lg">₹{total}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          className="w-full gradient-button py-3 px-4 rounded-xl font-semibold transition text-white mb-4"
        >
          Place Order
        </button>

        {/* Terms */}
        <p className="text-center text-gray-600 text-sm">
          By placing order you agree to our{' '}
          <span className="text-blue-600 font-semibold cursor-pointer">Terms & Conditions</span>
        </p>
      </div>
    </div>
  )
}