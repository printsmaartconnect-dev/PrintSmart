'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Settings, FileText, LogIn, Loader, AlertCircle, MapPin, Phone } from 'lucide-react'
import FeedbackButton from './components/FeedbackButton'
import FeedbackLink from './components/FeedbackLink'
import { setActiveShop, getActiveShop } from '../lib/shop-context'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [language, setLanguage] = useState('English')
  const [logoClickCount, setLogoClickCount] = useState(0)
  
  // QR scan state
  const [shopDetails, setShopDetails] = useState(null)
  const [loadingShop, setLoadingShop] = useState(false)
  const [shopError, setShopError] = useState(null)

  // Hidden admin access: 5 clicks on logo
  const handleLogoClick = () => {
    const newCount = logoClickCount + 1
    setLogoClickCount(newCount)

    if (newCount === 5) {
      router.push('/admin')
      setLogoClickCount(0)
    }

    // Reset counter after 3 seconds of inactivity
    setTimeout(() => {
      setLogoClickCount(0)
    }, 3000)
  }

  // Fetch shop details from QR scan
  const fetchShopDetails = async (shopId) => {
    setLoadingShop(true)
    setShopError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/shopkeeper/by-slug/${shopId}`)
      
      if (!response.ok) {
        throw new Error('Shop not found')
      }

      const data = await response.json()
      const shop = data.shopkeeper || data
      setShopDetails(shop)
      
      // Persist shop in localStorage for navigation
      setActiveShop(shop)
    } catch (err) {
      console.error('Error fetching shop:', err)
      setShopError('Shop not found. Invalid QR code or shop ID.')
      setShopDetails(null)
    } finally {
      setLoadingShop(false)
    }
  }

  // Detect QR scan on page load
  useEffect(() => {
    const shopId = searchParams.get('shopId')
    
    if (shopId) {
      // Check if we already have this shop in localStorage
      const cachedShop = getActiveShop()
      if (cachedShop && cachedShop.shopSlug === shopId) {
        // Use cached shop data
        setShopDetails(cachedShop)
        setShopError(null)
      } else {
        // Fetch fresh shop data
        fetchShopDetails(shopId)
      }
    }
  }, [searchParams])

  // Handle Take Print button
  const handleTakePrint = () => {
    const activeShop = getActiveShop()
    
    if (activeShop) {
      // QR scan detected - go directly to language page
      router.push('/customer/language')
    } else {
      // No QR scan - fallback to old flow for backward compatibility
      router.push('/take-a-print')
    }
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
          <div className="mac-dots">
            <div className="mac-dot red"></div>
            <div className="mac-dot yellow"></div>
            <div className="mac-dot green"></div>
          </div>
          <h1 className="text-2xl font-bold text-black hover:text-indigo-600 transition-colors">
            Printsmart
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium cursor-pointer hover:border-gray-300 transition"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
          </select>
          <Link href="/admin">
            <button className="p-2 hover:bg-white/50 rounded-lg transition">
              <Settings size={24} className="text-gray-700" />
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-3">
            Smart Printing.
          </h2>
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Simplified.
          </h2>
          <p className="text-gray-600 text-lg">Scan. Upload. Print. Done.</p>
        </div>

        {/* Shop Details Card (shown when QR scanned) */}
        {loadingShop && (
          <div className="w-80 max-w-md mb-6 p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center justify-center">
            <Loader className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-gray-600 font-medium">Loading shop details...</p>
          </div>
        )}

        {shopError && (
          <div className="w-80 max-w-md mb-6 p-4 bg-red-50 rounded-2xl shadow-lg border-2 border-red-200 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-900">Shop Not Found</p>
              <p className="text-sm text-red-700">{shopError}</p>
            </div>
          </div>
        )}

        {shopDetails && !shopError && (
          <div className="w-80 max-w-md mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            {/* Logo */}
            {shopDetails.logoUrl && (
              <div className="flex justify-center mb-4">
                <img
                  src={shopDetails.logoUrl}
                  alt={shopDetails.shopName}
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
              </div>
            )}

            {/* Shop Name and Category */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-1">
              {shopDetails.shopName}
            </h3>
            {shopDetails.category && (
              <p className="text-sm text-gray-600 text-center mb-4">
                {shopDetails.category}
              </p>
            )}

            {/* Address */}
            {shopDetails.address && (
              <div className="flex items-start gap-2 mb-3 text-sm text-gray-700">
                <MapPin size={16} className="flex-shrink-0 mt-0.5 text-indigo-600" />
                <p>{shopDetails.address}</p>
              </div>
            )}

            {/* Phone */}
            {shopDetails.phone && (
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
                <Phone size={16} className="text-indigo-600" />
                <p>{shopDetails.phone}</p>
              </div>
            )}

            {/* Badge */}
            <div className="text-center py-2 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 mb-4">
              <p className="text-xs font-semibold text-indigo-700">
                ✓ Verified Print Partner
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleTakePrint}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              Get Started →
            </button>
          </div>
        )}

        {/* Center Card (default when no QR) */}
        {!shopDetails && !loadingShop && !shopError && (
          <button
            onClick={handleTakePrint}
            className="glassmorphism w-80 p-8 text-center hover:shadow-glass transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">Take a Print</h3>
            <p className="text-gray-600">Scan Shop QR Code to get started</p>
          </button>
        )}

        {/* Bottom Section */}
        <div className="mt-16 w-full max-w-2xl">
          <p className="text-center text-gray-700 font-semibold mb-6">Are you a Shopkeeper?</p>
          <div className="flex gap-4 justify-center flex-wrap px-4 mb-6">
            <Link href="/shopkeeper/register" className="flex-1 min-w-48">
              <button className="w-full gradient-button py-3 px-6 flex items-center justify-center gap-2 text-white font-semibold">
                <FileText size={20} />
                Register as Shopkeeper
              </button>
            </Link>
            <Link href="/shopkeeper/login" className="flex-1 min-w-48">
              <button className="w-full gradient-button py-3 px-6 flex items-center justify-center gap-2 text-white font-semibold">
                <LogIn size={20} />
                Login as Shopkeeper
              </button>
            </Link>
          </div>

          {/* Feedback & Help Button */}
          <FeedbackLink />
        </div>
      </main>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  )
}