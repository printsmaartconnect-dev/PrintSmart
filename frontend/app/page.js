'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, FileText, LogIn } from 'lucide-react'
import FeedbackButton from './components/FeedbackButton'
import FeedbackLink from './components/FeedbackLink'

export default function Home() {
  const router = useRouter()
  const [language, setLanguage] = useState('English')
  const [logoClickCount, setLogoClickCount] = useState(0)

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

        {/* Center Card */}
        <Link href="/customer/language">
          <div className="glassmorphism w-80 p-8 text-center hover:shadow-glass transition transform hover:-translate-y-1 cursor-pointer">
            <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">Take a Print</h3>
            <p className="text-gray-600">Scan Shop QR Code to get started</p>
          </div>
        </Link>

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