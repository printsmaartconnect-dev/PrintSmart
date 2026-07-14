'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveShop } from '../../../lib/shop-context'
import BackButton from '../BackButton'
import useTranslation from '../../../src/hooks/useTranslation'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
]

const OTHER_LANGUAGES = [
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
]

export default function CustomerHeader({ stepText, shopDetails: propShopDetails }) {
  const { t, language, setLanguage } = useTranslation()
  const router = useRouter()
  const [shopDetails, setShopDetails] = useState(null)

  useEffect(() => {
    if (propShopDetails) {
      setShopDetails(propShopDetails)
      return
    }

    const activeShop = getActiveShop()
    if (activeShop) {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const queryShopId = params.get('shopId')
        if (queryShopId && activeShop.shopSlug !== queryShopId && activeShop.id !== queryShopId) {
          setShopDetails(null)
          return
        }
      }
      setShopDetails(activeShop)
    }
  }, [propShopDetails])

  const handleLogoClick = () => {
    router.push('/')
  }

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-150 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Left: Back Button & Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        <BackButton className="text-xs sm:text-sm border border-gray-200 px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 shadow-xs transition" />
        <div 
          className="hidden sm:flex items-center gap-2 cursor-pointer select-none" 
          onClick={handleLogoClick}
        >
          <div className="mac-dots">
            <div className="mac-dot red"></div>
            <div className="mac-dot yellow flex-shrink-0"></div>
            <div className="mac-dot green flex-shrink-0"></div>
          </div>
          <span className="text-base font-bold text-black font-brand hover:text-indigo-650 transition-colors">
            Printsmart
          </span>
        </div>
      </div>

      {/* Middle: Shopkeeper Details */}
      {shopDetails ? (
        <div className="text-center flex-1 px-2 max-w-xs sm:max-w-md mx-auto">
          <span className="font-extrabold text-sm sm:text-base text-gray-900 block leading-tight truncate">
            {shopDetails.shopName}
          </span>
          {shopDetails.phone && (
            <span className="text-[10px] sm:text-xs text-gray-500 font-semibold block mt-0.5 truncate">
              📞 {shopDetails.phone}
            </span>
          )}
        </div>
      ) : (
        <div className="flex-1"></div>
      )}

      {/* Right: Language Dropdown & Step Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        <select
          value={language || 'en'}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
          {OTHER_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              🇮🇳 {lang.name}
            </option>
          ))}
        </select>

        {stepText && (
          <span className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
            {t(stepText)}
          </span>
        )}
      </div>
    </header>
  )
}
