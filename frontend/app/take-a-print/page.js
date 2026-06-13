'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QrCode, AlertCircle, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BackButton from '../components/BackButton'
import FeedbackButton from '../components/FeedbackButton'
import FeedbackLink from '../components/FeedbackLink'
import QRScannerModal from '../components/customer/QRScannerModal'

function TakeAPrintPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')

  const [shopDetails, setShopDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [manualShopId, setManualShopId] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  // Fetch shopkeeper details by slug
  const fetchShopDetails = async (slug) => {
    setLoading(true)
    setError(null)
    const targetSlug = slug === '0000' ? 'smart-print-hub' : slug
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}/api/shopkeeper/by-slug/${targetSlug}`
      )
      
      if (!response.ok) {
        throw new Error(t('Shop not found'))
      }

      const data = await response.json()
      setShopDetails(data.shopkeeper)
      
      // Store shop details in session
      localStorage.setItem('selectedShop', JSON.stringify(data.shopkeeper))
    } catch (err) {
      setError(err.message || t('Failed to load shop details'))
      setShopDetails(null)
    } finally {
      setLoading(false)
    }
  }

  // Load shop if shopId provided
  useEffect(() => {
    if (shopId) {
      fetchShopDetails(shopId)
    }
  }, [shopId])

  const handleContinue = () => {
    if (shopDetails) {
      // Redirect to customer language page with shop info - always show language selection step first
      const shopIdToUse = shopDetails.shopkeeperIdCode || shopDetails.shopSlug || shopDetails.id
      router.push(`/customer/language?shopId=${shopIdToUse}`)
    }
  }

  const handleManualEntry = (e) => {
    e.preventDefault()
    if (manualShopId.trim()) {
      fetchShopDetails(manualShopId.trim())
      setManualShopId('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <BackButton className="text-lg" />
        <span className="text-sm font-semibold text-gray-600">{t('Step 2 of 6')}</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-4 rounded-full">
                <QrCode size={40} className="text-indigo-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Take a Print')}</h1>
            <p className="text-gray-600">{t('Scan a shop QR code or enter shop ID')}</p>
          </div>

          {/* Shop Details Display */}
          {shopDetails && !error && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
              <div className="text-center mb-4">
                {shopDetails.logoUrl && (
                  <img
                    src={shopDetails.logoUrl}
                    alt={shopDetails.shopName}
                    className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-900">{shopDetails.shopName}</h2>
                <p className="text-gray-600 text-sm mt-1">{shopDetails.category}</p>
              </div>

              {shopDetails.address && (
                <div className="mb-3 text-center">
                  <p className="text-sm text-gray-700">📍 {shopDetails.address}</p>
                </div>
              )}

              {shopDetails.phone && (
                <div className="mb-4 text-center">
                  <p className="text-sm text-gray-700">📞 {shopDetails.phone}</p>
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {t('Continue to Shop →')}
              </button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-900">{t('Shop Not Found')}</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin text-indigo-600" size={40} />
            </div>
          )}

          {/* Manual Entry Form */}
          {!shopDetails && !loading && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2 mb-2"
              >
                {t('📷 Click to Scan QR Code')}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 font-semibold text-sm">{t('OR')}</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <form onSubmit={handleManualEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Shop ID or Code')}
                  </label>
                  <input
                    type="text"
                    value={manualShopId}
                    onChange={(e) => setManualShopId(e.target.value)}
                    placeholder={t('Enter shop ID (e.g., abc-shop-123)')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {t('Find Shop')}
                </button>
              </form>
            </div>
          )}

          <FeedbackLink />

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>{t('💡 Tip:')}</strong> {t('Ask your shopkeeper for their shop QR code or ID to get started with your print order.')}
            </p>
          </div>
        </div>
      </main>

      {/* Floating Feedback Button */}
      <FeedbackButton />

      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onScanSuccess={(resolvedId) => fetchShopDetails(resolvedId)}
        />
      )}
    </div>
  )
}

export default function TakeAPrintPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <TakeAPrintPageContent />
    </Suspense>
  )
}
