'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FileText, MapPin, Phone, Clock, Store, AlertCircle, ShieldCheck } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import DocumentPreview from '../../components/customer/DocumentPreview'
import { getActiveShop } from '../../../lib/shop-context'

export default function ReviewPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const userId = searchParams.get('userId')

  const [filesWithConfig, setFilesWithConfig] = useState([])
  const [shopDetails, setShopDetails] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingShop, setFetchingShop] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load customer session details
    const sessionStr = localStorage.getItem('customerSession')
    if (sessionStr) {
      try {
        setCustomerInfo(JSON.parse(sessionStr))
      } catch (err) {
        console.error('Error loading customer session:', err)
      }
    }

    // Load configurations from localStorage
    const configsStr = localStorage.getItem('printConfigurations')
    if (configsStr) {
      try {
        setFilesWithConfig(JSON.parse(configsStr))
      } catch (err) {
        console.error('Error loading configurations:', err)
      }
    }

    // Resolve shop from local storage first, then fall back to API lookup by slug
    const resolveShop = async () => {
      const activeShop = getActiveShop()
      if (activeShop) {
        setShopDetails(activeShop)
        setFetchingShop(false)
        return
      }

      const storedShop = localStorage.getItem('selectedShop')
      if (storedShop) {
        try {
          const parsedShop = JSON.parse(storedShop)
          if (parsedShop) {
            setShopDetails(parsedShop)
            setFetchingShop(false)
            return
          }
        } catch (err) {
          console.error('Error loading selected shop:', err)
        }
      }

      const resolvedShopId = shopId || localStorage.getItem('activeShopSlug') || localStorage.getItem('activeShopId')
      if (!resolvedShopId) {
        setError(t('No shop selected.'))
        setFetchingShop(false)
        return
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/shopkeeper/by-slug/${resolvedShopId}`)
        if (!response.ok) {
          throw new Error(t('Could not find shop keeper details.'))
        }
        const data = await response.json()
        setShopDetails(data.shopkeeper)
      } catch (err) {
        console.error('Error fetching shop keeper:', err)
        setError(t('Failed to fetch shop keeper details.'))
      } finally {
        setFetchingShop(false)
      }
    }

    resolveShop()
  }, [shopId])

  // Calculate pricing based on shop keeper settings or fallbacks
  const calculateItemPrice = (item) => {
    if (!item || !item.config) return 0
    if (item.variant === 'talk') return 0
    const copies = Number(item.config.copies || 1)
    
    // Fallback standard rates
    let pageRate = 2.0 // standard B&W A4
    
    if (shopDetails && shopDetails.pricing) {
      const pricing = shopDetails.pricing
      const isColor = item.config.printType === 'COLOR'
      const isA3 = item.config.paperSize === 'A3'
      const isDouble = item.config.sides === 'DOUBLE'

      if (isColor) {
        pageRate = isA3 ? parseFloat(pricing.colorA3 || 8.0) : parseFloat(pricing.colorA4 || 5.0)
        if (isDouble) pageRate += parseFloat(pricing.colorDoubleSide || 3.0)
      } else {
        pageRate = isA3 ? parseFloat(pricing.bwA3 || 2.0) : parseFloat(pricing.bwA4 || 1.0)
        if (isDouble) pageRate += parseFloat(pricing.bwDoubleSide || 1.0)
      }
    } else {
      // Standard local pricing logic
      if (item.config.printType === 'COLOR') {
        pageRate = item.config.paperSize === 'A3' ? 8.0 : 5.0
        if (item.config.sides === 'DOUBLE') pageRate += 3.0
      } else {
        pageRate = item.config.paperSize === 'A3' ? 2.0 : 1.0
        if (item.config.sides === 'DOUBLE') pageRate += 1.0
      }
    }

    return pageRate * copies
  }

  const calculateSubtotal = () => {
    return filesWithConfig.reduce((sum, item) => sum + calculateItemPrice(item), 0)
  }

  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.18 // GST 18%
  const total = subtotal + tax

  const handlePlaceOrder = async () => {
    if (filesWithConfig.length === 0) {
      alert(t('No files available for placing an order.'))
      return
    }

    setLoading(true)
    setError(null)

    const items = filesWithConfig.map((item) => ({
      fileName: item.customFileName || item.originalFileName,
      fileUrl: item.fileUrl,
      fileSize: item.fileSize || 0,
      price: calculateItemPrice(item) * 1.18, // including tax proportion
      variant: item.variant || 'standard',
      config: item.config
    }))

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || customerInfo?.userId || null,
          shopkeeperId: shopDetails?.id || localStorage.getItem('activeShopId') || null,
          customerName: customerInfo?.name || 'Anonymous Customer',
          phone: customerInfo?.phone || '',
          items,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || t('Failed to place print order'))
      }

      const result = await response.json()
      
      // Store the created order details in localStorage for the Order Placed page
      const primaryOrder = result.orders[0]
      localStorage.setItem('currentOrder', JSON.stringify({
        orderId: primaryOrder.orderId,
        estimatedTime: primaryOrder.estimatedTime,
        price: total.toFixed(2),
        shopName: shopDetails?.shopName || 'Shop'
      }))

      router.push(`/customer/order-placed?shopId=${shopId}&userId=${userId}`)
    } catch (err) {
      console.error('Order creation error:', err)
      setError(err.message || t('Error occurred while submitting order details.'))
    } finally {
      setLoading(false)
    }
  }

  if (fetchingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600 font-semibold animate-pulse text-lg">{t('Fetching shop information...')}</p>
      </div>
    )
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-5xl mb-8">
        <div className="step-header">
          <div className="step-number">6</div>
          <div>
            <h1 className="text-3xl font-bold text-black font-brand">{t('Order Review')}</h1>
            <p className="text-gray-600">{t('Review details, billing, and place order')}</p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="max-w-5xl w-full mx-auto rounded-[36px] bg-white shadow-xl border border-purple-100 p-8 md:p-10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <span className="text-sm font-semibold text-gray-600">{t('Step 6 of 6')}</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Shop details card */}
        {shopDetails && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-indigo-950 flex items-center gap-2 mb-3">
              <Store size={20} className="text-indigo-600" />
              {t('Printing Shop Details')}
            </h3>
            <div className="space-y-2 text-sm text-indigo-900">
              <p className="font-bold text-base text-gray-900">{shopDetails.shopName}</p>
              <p className="flex items-center gap-1.5 font-medium"><MapPin size={16} className="text-indigo-500" /> {shopDetails.address || t('Address not listed')}</p>
              <p className="flex items-center gap-1.5 font-medium"><Phone size={16} className="text-indigo-500" /> {shopDetails.phone || t('N/A')}</p>
              <p className="flex items-center gap-1.5 font-medium"><Clock size={16} className="text-indigo-500" /> {t('Estimated Time: 2–7 mins (based on queue)')}</p>
            </div>
          </div>
        )}

        {/* File Config Summary */}
        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
          <h4 className="font-bold text-gray-800 mb-2">{t('Print Configuration Summary:')}</h4>
          {filesWithConfig.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Small Thumbnail Preview */}
                <div className="w-12 h-12 bg-white rounded border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                  <DocumentPreview
                    file={item}
                    thumbnailUrl={item.thumbnailUrl}
                    isBW={item.config?.printType === 'BW'}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">{item.customFileName}</p>
                  {item.variant === 'talk' ? (
                    <div className="text-xs text-violet-700 font-bold bg-violet-50 px-2.5 py-1 rounded-lg mt-1 w-fit border border-violet-100 flex items-center gap-1.5 animate-pulse">
                      <span>💬 {t('I Want to Talk with Shopkeeper First')}</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 font-semibold mt-1">
                      <span>{t('Type')}: {item.config?.printType === 'COLOR' ? t('Color') : t('B&W')}</span>
                      <span>{t('Copies')}: {item.config?.copies || 1}</span>
                      <span>{t('Size')}: {t(item.config?.paperSize || 'A4')}</span>
                      <span>{t('Sides')}: {item.config?.sides === 'DOUBLE' ? t('Double-sided') : t('Single-sided')}</span>
                      <span>{t('Orientation')}: {t(item.config?.orientation || 'PORTRAIT')}</span>
                      <span>{t('Quality')}: {t(item.config?.quality || 'NORMAL')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-gray-900 font-brand">₹{calculateItemPrice(item).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="bg-slate-50 p-5 rounded-xl border border-gray-200 mb-8 space-y-3 text-sm">
          <div className="flex justify-between items-center text-gray-700 font-medium">
            <span>{t('Subtotal')}</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700 font-medium">
            <span>{t('GST (18%)')}</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold text-lg text-gray-900">
            <span>{t('Total Cost')}</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !shopDetails}
            className="w-full gradient-button py-3.5 px-4 rounded-xl font-bold transition text-white shadow-md text-base"
          >
            {loading ? t('Placing Order...') : t('Place Order & Print')}
          </button>

          <p className="text-center text-gray-600 text-xs flex items-center justify-center gap-1 font-semibold">
            <ShieldCheck size={16} className="text-indigo-600" />
            {t('Secure payment & order processing.')}
          </p>

          <div className="text-center pt-2">
            {/* Reusable Help & Support */}
            <FeedbackLink />
          </div>
        </div>
      </div>

      <FeedbackButton />
    </div>
  )
}