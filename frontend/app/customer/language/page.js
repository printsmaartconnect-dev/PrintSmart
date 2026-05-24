'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function LanguagePage() {
  const router = useRouter()
  const [selected, setSelected] = useState(null)

  const languages = [
    { code: 'en', name: 'English', native: 'English', subtitle: 'Continue' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', subtitle: 'जारी रखें' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', subtitle: 'सुरु करा' },
  ]

  const handleContinue = () => {
    if (selected) {
      localStorage.setItem('language', selected)
      router.push('/customer/upload')
    }
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mb-8">
        <div className="step-header">
          <div className="step-number">2</div>
          <div>
            <h1 className="text-3xl font-bold text-black">Choose Language</h1>
            <p className="text-gray-600">भाषा चुनें / Select your language to continue.</p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-4xl p-6 sm:p-8 lg:p-10 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="mac-dots">
            <div className="mac-dot red"></div>
            <div className="mac-dot yellow"></div>
            <div className="mac-dot green"></div>
          </div>
          <h2 className="text-xl font-bold text-black">Printsmart</h2>
        </div>

        <h3 className="text-2xl font-bold text-black text-center mb-6">Choose Language</h3>

        {/* Language Cards */}
        <div className="space-y-3">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                selected === lang.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-black">{lang.name}</p>
                  <p className="text-sm text-gray-500">{lang.native}</p>
                </div>
                {lang.code === 'en' && (
                  <button className="px-4 py-2 text-blue-500 font-semibold hover:bg-blue-50 rounded-lg transition">
                    {lang.subtitle}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition mt-6 ${
            selected
              ? 'gradient-button'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-8 text-gray-600">
        <Shield size={16} />
        <span className="text-sm">Secured by Printsmart</span>
      </div>
    </div>
  )
}