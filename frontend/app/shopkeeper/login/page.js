'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Headphones, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getLoggedInShopkeeper,
  isOnboardingComplete,
} from '../onboarding/_components/onboardingStorage'

export default function ShopkeeperLoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
        localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
        const destination = '/shopkeeper/dashboard'
        router.push(destination)
        return
      }
      
      const errorData = await response.json()
      alert(errorData.message || 'Invalid credentials!')
    } catch (err) {
      console.warn('Backend connection failed, trying fallback mockup authentication:', err)
      const shopkeeper = JSON.parse(localStorage.getItem('shopkeeper') || '{}')
      if (
        shopkeeper.email === formData.email &&
        shopkeeper.password === formData.password
      ) {
        localStorage.setItem('loggedInShopkeeper', JSON.stringify(shopkeeper))
        router.push('/shopkeeper/dashboard')
      } else {
        alert('Invalid credentials! (Fallback mode)')
      }
    }
  }

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1028741369527-mockclientid.apps.googleusercontent.com'
    if (!clientId) return

    const initializeGoogle = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const tokenRes = await fetch('http://localhost:5000/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })
            if (!tokenRes.ok) {
              const errorData = await tokenRes.json()
              alert((errorData.message || 'Google login failed') + (errorData.error ? '\nDetails: ' + errorData.error : ''))
              return
            }
            const data = await tokenRes.json()
            localStorage.setItem('authToken', data.token)
            localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
            localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
            const destination = '/shopkeeper/dashboard'
            router.push(destination)
          } catch (authErr) {
            console.error('Google auth response failed:', authErr)
            alert('Google authentication failed')
          } finally {
            setGoogleLoading(false)
          }
        },
      })

      const container = document.getElementById('google-signin-button')
      window.google.accounts.id.renderButton(
        container,
        {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: container ? Math.min(container.offsetWidth, 400) : 360,
        }
      )
    }

    if (window.google && window.google.accounts && window.google.accounts.id) {
      initializeGoogle()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogle
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [router])

  return (
    <div className="wave-bg min-h-screen relative">
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Image Panel */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/shopkeeper_login.jpeg"
            alt="Shopkeeper login"
            className="w-full h-full md:h-screen object-cover object-left"
          />
        </div>

        {/* Form Panel */}
        <div className="flex-1 md:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-10 md:py-0">
          <div className="glassmorphism w-full max-w-md sm:max-w-lg p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white/80 text-gray-800 hover:bg-white transition"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white/80 text-gray-800 hover:bg-white transition"
                  aria-label="Home"
                >
                  <Home size={18} />
                </button>

                <div className="mac-dots ml-2">
                  <div className="mac-dot red"></div>
                  <div className="mac-dot yellow"></div>
                  <div className="mac-dot green"></div>
                </div>
              </div>
              <h1 className="text-lg font-bold text-black">PrintSmart</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black">{t('Welcome Back!')}</h2>
              <p className="text-gray-600 mt-2">{t('Login to continue')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('Gmail')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  placeholder={t('your@gmail.com')}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('Password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition pr-12"
                    placeholder={t('Enter your password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full gradient-button py-3 px-4 rounded-xl font-semibold transition text-white mt-6"
              >
                {t('Login')}
              </button>

              <div className="w-full flex justify-center mt-3">
                <div id="google-signin-button" className="w-full max-w-[380px]"></div>
              </div>
            </form>

            <div className="text-center mt-6">
              <a
                href="/shopkeeper/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                {t('Register account?')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support Floating Button */}
      <a
        href="https://forms.gle/VBK48SwGSWm7prgUA"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-5 bottom-5 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-gray-200 text-gray-800 font-semibold shadow-sm hover:bg-white transition"
        aria-label={t('Help & Support')}
      >
        <span className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
          <Headphones size={18} className="text-blue-600" />
        </span>
        <span>Help &amp; Support</span>
      </a>
    </div>
  )
}
