'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveShop } from '../../../lib/shop-context'
import BackButton from '../BackButton'
import useTranslation from '../../../src/hooks/useTranslation'

export default function CustomerHeader({ stepText }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [shopDetails, setShopDetails] = useState(null)

  useEffect(() => {
    // Retrieve active shop details from localStorage
    const activeShop = getActiveShop()
    if (activeShop) {
      setShopDetails(activeShop)
    }
  }, [])

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

      {/* Right: Step Indicator */}
      <div className="flex items-center gap-2">
        {stepText && (
          <span className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
            {t(stepText)}
          </span>
        )}
      </div>
    </header>
  )
}
