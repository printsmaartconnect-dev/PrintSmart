'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Shield, AlertCircle, Loader, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import { setCurrentShop, getActiveShop } from '../../../lib/shop-context'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
]

const OTHER_LANGUAGES = [
  'Bengali', 'Punjabi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Odia', 'Urdu'
]

export default function CustomerLanguagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const { t, i18n } = useTranslation()

  const initialStep = searchParams.get('step') || 'language'
  const [step, setStep] = useState(initialStep) // 'language' or 'details'
  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [showOthers, setShowOthers] = useState(false)
  const [selectedOther, setSelectedOther] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validatingShop, setValidatingShop] = useState(false)
  const [shopError, setShopError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })

  // Auto-detect browser language or load persisted language
  useEffect(() => {
    const saved = localStorage.getItem('customerLanguage')
    if (saved) {
      const match = LANGUAGES.find(l => l.code === saved)
      if (match) {
        setSelectedLanguage(match.code)
      } else {
        setSelectedOther(saved)
      }
      i18n.changeLanguage(saved)
      return
    }

    const browserLang = navigator.language || navigator.userLanguage
    const langCode = browserLang.split('-')[0]

    // Match with available languages
    const matched = LANGUAGES.find(l => l.code === langCode)
    if (matched) {
      setSelectedLanguage(matched.code)
      i18n.changeLanguage(matched.code)
    }
  }, [i18n])

  // Validate and store shop details on load
  useEffect(() => {
    const validateShop = async () => {
      if (!shopId) {
        // Check if shop exists in localStorage (from QR scan on homepage)
        const activeShop = getActiveShop()
        
        if (step === 'language') {
          // On language step without query param, check if we have shop from QR
          if (!activeShop) {
            // No shop in localStorage and no query param - clear stale data
            localStorage.removeItem('activeShopId')
            localStorage.removeItem('activeShopSlug')
            localStorage.removeItem('selectedShop')
          }
          setShopError(null)
        } else if (step === 'details') {
          // On details step, we need a shop
          if (!activeShop) {
            setShopError(t('No printing shop selected. Please scan a QR code or enter a shop ID.'))
          }
        }
        return
      }

      // shopId is provided in query params - validate it
      setValidatingShop(true)
      setShopError(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/shopkeeper/by-slug/${shopId}`)
        if (!response.ok) {
          throw new Error('Shop not found')
        }
        const data = await response.json()
        
        // Save using helper
        setCurrentShop(data.shopkeeper)
      } catch (err) {
        console.error('Error validating shop:', err)
        setShopError(t('Invalid Shop ID. Please check the URL or scan the QR code again.'))
      } finally {
        setValidatingShop(false)
      }
    }

    validateShop()
  }, [shopId, step, t])

  const handleLanguageSelect = (code) => {
    setSelectedLanguage(code)
    setShowOthers(false)
    setSelectedOther(null)
    localStorage.setItem('customerLanguage', code)
    i18n.changeLanguage(code)
  }

  const handleOtherLanguageSelect = (lang) => {
    setSelectedOther(lang)
    setShowOthers(false)
    localStorage.setItem('customerLanguage', lang)
  }

  const handleLanguageContinue = () => {
    const finalLanguage = selectedOther || selectedLanguage
    if (finalLanguage) {
      localStorage.setItem('customerLanguage', finalLanguage)
      // Check if we have shop from query param or from QR scan localStorage
      const activeShop = getActiveShop()
      if (shopId || activeShop) {
        setStep('details')
      } else {
        router.push('/take-a-print')
      }
    }
  }

  const handleDetailsSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError(t('Please enter your name'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const finalLanguage = selectedOther || selectedLanguage

      // Create user in database
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone || null,
            email: formData.email || null,
            language: finalLanguage
          })
        }
      )

      if (!response.ok) {
        throw new Error(t('Failed to create user'))
      }

      const data = await response.json()
      const userId = data.user.id

      // Store in localStorage
      localStorage.setItem('customerSession', JSON.stringify({
        userId,
        name: formData.name,
        language: finalLanguage
      }))

      // Redirect to upload page
      const resolvedShopId = shopId || localStorage.getItem('activeShopSlug') || localStorage.getItem('activeShopId')
      const nextUrl = resolvedShopId 
        ? `/customer/upload?shopId=${resolvedShopId}&userId=${userId}`
        : `/customer/upload?userId=${userId}`
      
      router.push(nextUrl)
    } catch (err) {
      setError(err.message || t('Failed to proceed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        {step === 'details' ? (
          <button
            onClick={() => setStep('language')}
            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            aria-label="Go back to language selection"
          >
            <ArrowLeft size={18} />
            <span>{t('Go Back')}</span>
          </button>
        ) : (
          <BackButton />
        )}
        <span className="text-sm text-gray-600">
          {step === 'language' ? t('Step 1 of 6') : t('Step 3 of 6')}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {validatingShop ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center gap-3">
              <Loader size={36} className="animate-spin text-indigo-600" />
              <p className="text-gray-600 font-semibold">{t('Detecting and validating shop...')}</p>
            </div>
          ) : (
            <>
              {shopError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                  <AlertCircle className="text-amber-600 flex-shrink-0 animate-pulse" size={20} />
                  <div className="text-left">
                    <p className="font-semibold text-amber-900">{t('Shop Selection Required')}</p>
                    <p className="text-sm text-amber-700 font-medium">{shopError}</p>
                  </div>
                </div>
              )}

              {step === 'language' ? (
                <>
                  {/* Language Selection */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Choose Language')}</h1>
                    <p className="text-gray-600">{t('Select your preferred language to continue')}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-3">
                    {/* Primary Languages */}
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition ${
                          selectedLanguage === lang.code
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{t(lang.name)}</p>
                            <p className="text-sm text-gray-500">{lang.native}</p>
                          </div>
                          <span className="text-2xl">{lang.flag}</span>
                        </div>
                      </button>
                    ))}

                    {/* Others Dropdown */}
                    <button
                      onClick={() => setShowOthers(!showOthers)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition ${
                        selectedOther || showOthers
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedOther ? t(selectedOther) : t('Other Languages')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedOther ? t(selectedOther) : t('More options')}
                          </p>
                        </div>
                        <span>{showOthers ? '▼' : '▶'}</span>
                      </div>
                    </button>

                    {/* Other Languages Dropdown */}
                    {showOthers && (
                      <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                        {OTHER_LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => handleOtherLanguageSelect(lang)}
                            className={`p-2 text-sm rounded border transition ${
                              selectedOther === lang
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {t(lang)}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Continue Button */}
                    <button
                      onClick={handleLanguageContinue}
                      disabled={!selectedLanguage && !selectedOther}
                      className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                        selectedLanguage || selectedOther
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {shopId || (typeof window !== 'undefined' && (localStorage.getItem('activeShopSlug') || localStorage.getItem('activeShopId')))
                        ? t('Continue to Details →')
                        : t('Continue to Scan QR →')}
                    </button>
                    <FeedbackLink />
                  </div>
                </>
              ) : (
                <>
                  {/* Your Details */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Your Details')}</h1>
                    <p className="text-gray-600">{t('Help us personalize your experience')}</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex gap-3">
                      <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleDetailsSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    {/* Name (Required) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('Full Name')} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('Enter your name')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    {/* Phone (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('Phone Number')} <span className="text-gray-400">({t('optional')})</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('10-digit mobile number')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Email (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('Email')} <span className="text-gray-400">({t('optional')})</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('your@email.com')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          {t('Processing...')}
                        </>
                      ) : (
                        t('Continue to Upload →')
                      )}
                    </button>
                    <FeedbackLink />
                  </form>
                </>
              )}
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-8 text-gray-600">
            <Shield size={16} />
            <span className="text-sm">{t('Your data is secured')}</span>
          </div>
        </div>
      </main>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  )
}