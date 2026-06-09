'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Plus, Minus, Maximize2, Rotate3d, Layout, Check, Settings, FileText, AlertCircle } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import FilePreviewSection from '../../components/customer/FilePreviewSection'
import CustomerHeader from '../../components/customer/CustomerHeader'
import { getActiveShop } from '../../../lib/shop-context'

const PAPER_SIZES = ['A4', 'A3', 'A5', 'Legal', 'Letter', 'Executive', 'Ledger', 'Tabloid']
function ConfigurationPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const userId = searchParams.get('userId')
  const isShopkeeper = searchParams.get('shopkeeperAddOrder') === 'true'

  const [uploadedFiles, setUploadedFiles] = useState([])
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(isShopkeeper)
  const [customerComment, setCustomerComment] = useState('')
  const [shopDetails, setShopDetails] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedComment = localStorage.getItem('customerComment')
    if (savedComment) {
      setCustomerComment(savedComment)
    }
  }, [])

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

    // Resolve shop from local storage first, then fall back to API lookup by slug
    const resolveShop = async () => {
      const activeShop = getActiveShop()
      if (activeShop) {
        setShopDetails(activeShop)
        return
      }

      const storedShop = localStorage.getItem('selectedShop')
      if (storedShop) {
        try {
          const parsedShop = JSON.parse(storedShop)
          if (parsedShop) {
            setShopDetails(parsedShop)
            return
          }
        } catch (err) {
          console.error('Error loading selected shop:', err)
        }
      }

      const resolvedShopId = shopId || localStorage.getItem('activeShopSlug') || localStorage.getItem('activeShopId')
      if (!resolvedShopId) return

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/shopkeeper/by-slug/${resolvedShopId}`)
        if (response.ok) {
          const data = await response.json()
          setShopDetails(data.shopkeeper)
        }
      } catch (err) {
        console.error('Error fetching shop keeper:', err)
      }
    }

    resolveShop()
  }, [shopId])

  const defaultConfig = {
    printType: 'BW',
    copies: 1,
    paperSize: 'A4',
    sides: 'SINGLE',
    orientation: 'PORTRAIT',
    pageRange: 'all'
  }

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

  useEffect(() => {
    // Load uploaded files from session/localStorage
    const filesStr = localStorage.getItem('uploadedFiles')
    if (filesStr) {
      try {
        const files = JSON.parse(filesStr)
        setUploadedFiles(files)
        setConfigs(files.map(() => ({ ...defaultConfig })))
      } catch (err) {
        console.error('Error loading files:', err)
      }
    }
  }, [])

  useEffect(() => {
    if (isShopkeeper) {
      setShowConfig(true)
    }
  }, [isShopkeeper])

  const handleConfigChange = (docIndex, key, value) => {
    setConfigs(prev => 
      prev.map((cfg, idx) => 
        idx === docIndex ? { ...cfg, [key]: value } : cfg
      )
    )
  }

  const handleContinue = async () => {
    if (uploadedFiles.length === 0) {
      alert(t('No files uploaded. Please upload files first.'))
      let uploadUrl = `/customer/language?shopId=${shopId}&userId=${userId}`
      if (isShopkeeper) {
        uploadUrl += `&shopkeeperAddOrder=true`
      }
      router.push(uploadUrl)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Save customer comment
      if (customerComment.trim()) {
        localStorage.setItem('customerComment', customerComment.trim())
      } else {
        localStorage.removeItem('customerComment')
      }

      // Store configuration in localStorage
      const fileConfigs = uploadedFiles.map((file, idx) => ({
        ...file,
        config: configs[idx] || defaultConfig
      }))
      
      localStorage.setItem('printConfigurations', JSON.stringify(fileConfigs))

      // Build items array for API call
      const items = fileConfigs.map((item) => ({
        fileName: item.customFileName || item.originalFileName,
        fileUrl: item.fileUrl,
        fileSize: item.fileSize || 0,
        price: calculateItemPrice(item),
        variant: item.variant || 'standard',
        config: item.config
      }))

      let resolvedUserId = userId || customerInfo?.userId || null
      if (resolvedUserId === 'undefined' || resolvedUserId === 'null' || resolvedUserId === '') {
        resolvedUserId = null
      }

      let resolvedShopkeeperId = shopDetails?.id || localStorage.getItem('activeShopId') || null
      if (resolvedShopkeeperId === 'undefined' || resolvedShopkeeperId === 'null' || resolvedShopkeeperId === '') {
        resolvedShopkeeperId = null
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resolvedUserId,
          shopkeeperId: resolvedShopkeeperId,
          customerName: customerInfo?.name || 'Anonymous Customer',
          phone: customerInfo?.phone || '',
          customerComment: customerComment.trim() || null,
          items,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || t('Failed to place print order'))
      }

      const result = await response.json()
      
      // Store currentOrder
      localStorage.setItem('currentOrder', JSON.stringify(result.order || result))

      if (isShopkeeper) {
        router.push('/shopkeeper/dashboard')
      } else {
        router.push(`/customer/orders?shopId=${shopId || ''}&userId=${resolvedUserId || ''}`)
      }
    } catch (err) {
      console.error('Order creation error:', err)
      setError(err.message || t('Error occurred while submitting order details.'))
    } finally {
      setLoading(false)
    }
  }

  const handleTalkFirst = async () => {
    if (uploadedFiles.length === 0) {
      alert(t('No files uploaded. Please upload files first.'))
      let uploadUrl = `/customer/language?shopId=${shopId}&userId=${userId}`
      if (isShopkeeper) {
        uploadUrl += `&shopkeeperAddOrder=true`
      }
      router.push(uploadUrl)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Save customer comment
      if (customerComment.trim()) {
        localStorage.setItem('customerComment', customerComment.trim())
      } else {
        localStorage.removeItem('customerComment')
      }

      // Store configuration in localStorage with variant 'talk'
      const fileConfigs = uploadedFiles.map((file, idx) => ({
        ...file,
        variant: 'talk',
        config: configs[idx] || defaultConfig
      }))
      
      localStorage.setItem('printConfigurations', JSON.stringify(fileConfigs))

      // Build items array for API call
      const items = fileConfigs.map((item) => ({
        fileName: item.customFileName || item.originalFileName,
        fileUrl: item.fileUrl,
        fileSize: item.fileSize || 0,
        price: 0,
        variant: 'talk',
        config: item.config
      }))

      let resolvedUserId = userId || customerInfo?.userId || null
      if (resolvedUserId === 'undefined' || resolvedUserId === 'null' || resolvedUserId === '') {
        resolvedUserId = null
      }

      let resolvedShopkeeperId = shopDetails?.id || localStorage.getItem('activeShopId') || null
      if (resolvedShopkeeperId === 'undefined' || resolvedShopkeeperId === 'null' || resolvedShopkeeperId === '') {
        resolvedShopkeeperId = null
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resolvedUserId,
          shopkeeperId: resolvedShopkeeperId,
          customerName: customerInfo?.name || 'Anonymous Customer',
          phone: customerInfo?.phone || '',
          customerComment: customerComment.trim() || null,
          items,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || t('Failed to place print order'))
      }

      const result = await response.json()
      
      // Store currentOrder
      localStorage.setItem('currentOrder', JSON.stringify(result.order || result))

      if (isShopkeeper) {
        router.push('/shopkeeper/dashboard')
      } else {
        router.push(`/customer/orders?shopId=${shopId || ''}&userId=${resolvedUserId || ''}`)
      }
    } catch (err) {
      console.error('Order creation error:', err)
      setError(err.message || t('Error occurred while submitting order details.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col">
      {/* Header */}
      <CustomerHeader stepText={t('Step 2 of 3')} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-brand">{t('Print Configuration')}</h1>
            <p className="text-gray-600">{t('Customize print settings for your files')}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3 max-w-5xl mx-auto">
              <AlertCircle className="text-red-650 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {uploadedFiles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600 mb-4 font-semibold">{t('No files uploaded yet')}</p>
              <button
                onClick={() => router.push(`/customer/language?shopId=${shopId}&userId=${userId}`)}
                className="gradient-button text-white font-semibold py-2.5 px-6 rounded-lg transition"
              >
                {t('Go to Upload Page')}
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Top Option Selector */}
              {!isShopkeeper && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleTalkFirst}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-violet-200 bg-violet-50/50 hover:bg-violet-50 text-violet-800 font-bold transition-all transform hover:scale-[1.01] shadow-sm text-center w-full focus:outline-none"
                  >
                    <span className="text-2xl mb-1.5">💬</span>
                    <span className="text-sm font-extrabold">{t('Send Talk Request & Go to Orders →')}</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">{t('Skip layout configuration & talk directly')}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowConfig(!showConfig)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.01] text-center w-full focus:outline-none ${
                      showConfig 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md' 
                        : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/60 text-indigo-700/80 hover:text-indigo-800 shadow-sm'
                    }`}
                  >
                    <span className="text-2xl mb-1.5">⚙️</span>
                    <span className="text-sm font-extrabold">{t('I Want to Configure Print Layout')}</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">{t('Set copies, color options, paper size, etc.')}</span>
                  </button>
                </div>
              )}

              {/* Customer Comment Field */}
              <div className="max-w-5xl mx-auto rounded-[36px] bg-white shadow-xl border border-purple-100 p-8 md:p-10 backdrop-blur-sm mb-6">
                <label className="block text-sm font-semibold text-gray-750 mb-2">
                  {t('Customer Comment')} <span className="text-gray-400 font-normal">({t('optional')})</span>
                </label>
                <textarea
                  value={customerComment}
                  onChange={(e) => setCustomerComment(e.target.value)}
                  placeholder={t('Add any special instructions or comments for the shopkeeper...')}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-semibold text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">{customerComment.length}/500</p>
              </div>

              {showConfig && (
                <>
                  {/* File-wise Configuration */}
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="max-w-5xl mx-auto rounded-[36px] bg-white shadow-xl border border-purple-100 p-8 md:p-10 backdrop-blur-sm mb-8">
                      {/* Reusable File Preview Section */}
                      <FilePreviewSection
                        file={file}
                        thumbnailUrl={file.thumbnailUrl}
                        isBW={configs[idx]?.printType === 'BW'}
                        isLoading={false}
                      />

                      {/* Settings Title Header */}
                      <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <Settings size={20} className="text-indigo-600 animate-spin-slow" />
                          {t('Document {{num}} Settings', { num: idx + 1 })}
                        </h3>
                      </div>

                      {/* Configuration Options */}
                      <div className="space-y-5">
                        {/* Print Type */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Print Type')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'printType', 'BW')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.printType === 'BW'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('Black & White')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'printType', 'COLOR')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.printType === 'COLOR'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('🎨 Color')}
                            </button>
                          </div>
                        </div>

                        {/* Number of Copies */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Copies')}
                          </label>
                          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg w-fit border border-gray-200">
                            <button
                              type="button"
                              onClick={() =>
                                handleConfigChange(idx, 'copies', Math.max(1, (configs[idx]?.copies || 1) - 1))
                              }
                              className="p-2 hover:bg-gray-200 rounded transition"
                            >
                              <Minus size={20} className="text-gray-700" />
                            </button>
                            <input
                              type="number"
                              value={configs[idx]?.copies || 1}
                              onChange={(e) => handleConfigChange(idx, 'copies', Math.max(1, parseInt(e.target.value) || 1))}
                              min="1"
                              max="999"
                              className="w-16 text-center text-2xl font-bold text-gray-900 bg-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleConfigChange(idx, 'copies', Math.min(999, (configs[idx]?.copies || 1) + 1))
                              }
                              className="p-2 hover:bg-gray-200 rounded transition"
                            >
                              <Plus size={20} className="text-gray-700" />
                            </button>
                          </div>
                        </div>

                        {/* Paper Size */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Paper Size')}
                          </label>
                          <select
                            value={configs[idx]?.paperSize || 'A4'}
                            onChange={(e) => handleConfigChange(idx, 'paperSize', e.target.value)}
                            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {PAPER_SIZES.map(size => (
                              <option key={size} value={size}>{t(size)}</option>
                            ))}
                          </select>
                        </div>

                        {/* Print Sides */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Print Sides')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'sides', 'SINGLE')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.sides === 'SINGLE'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('Single-sided')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'sides', 'DOUBLE')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 ${
                                configs[idx]?.sides === 'DOUBLE'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {t('Double-sided')}
                            </button>
                          </div>
                        </div>

                        {/* Orientation */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Orientation')}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'orientation', 'PORTRAIT')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 flex items-center justify-center gap-2 ${
                                configs[idx]?.orientation === 'PORTRAIT'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <Maximize2 size={18} />
                              {t('Portrait')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfigChange(idx, 'orientation', 'LANDSCAPE')}
                              className={`py-3 px-4 rounded-lg font-bold transition border-2 flex items-center justify-center gap-2 ${
                                configs[idx]?.orientation === 'LANDSCAPE'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <Rotate3d size={18} />
                              {t('Landscape')}
                            </button>
                          </div>
                        </div>

                        {/* Print Quality removed per requirement */}

                        {/* Page Range */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {t('Pages to Print')}
                          </label>
                          <select
                            value={configs[idx]?.pageRange || 'all'}
                            onChange={(e) => handleConfigChange(idx, 'pageRange', e.target.value)}
                            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="all">{t('All Pages')}</option>
                            <option value="custom">{t('Custom Pages')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons */}
                  <div className="max-w-md mx-auto space-y-3 pt-4">
                    <button
                      onClick={handleContinue}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition shadow-md text-base"
                    >
                      {loading ? t('Placing Order...') : t('Confirm Order & Print →')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        let uploadUrl = `/customer/language?shopId=${shopId}&userId=${userId}`
                        if (isShopkeeper) {
                          uploadUrl += `&shopkeeperAddOrder=true`
                        }
                        router.push(uploadUrl)
                      }}
                      className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-xl transition"
                    >
                      {t('Back to Setup')}
                    </button>
                  </div>
                </>
              )}

              {/* Reusable FeedbackLink */}
              <div className="max-w-md mx-auto text-center mt-4">
                <FeedbackLink />
              </div>
            </div>
          )}
        </div>
      </main>

      <FeedbackButton />
    </div>
  )
}

export default function ConfigurationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ConfigurationPageContent />
    </Suspense>
  )
}