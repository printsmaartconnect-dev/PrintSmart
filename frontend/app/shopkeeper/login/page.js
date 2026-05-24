'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Headphones, Home } from 'lucide-react'

export default function ShopkeeperLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const shopkeeper = JSON.parse(localStorage.getItem('shopkeeper') || '{}')
    if (
      shopkeeper.email === formData.email &&
      shopkeeper.password === formData.password
    ) {
      localStorage.setItem('loggedInShopkeeper', JSON.stringify(shopkeeper))
      router.push('/shopkeeper/dashboard')
    } else {
      alert('Invalid credentials!')
    }
  }

  return (
    <div className="wave-bg min-h-screen relative">
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Image Panel */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/shopkeeper_login.jpeg"
            alt="Shopkeeper login"
            className="w-full h-full md:h-screen object-cover"
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
              <h2 className="text-3xl font-bold text-black">Welcome Back!</h2>
              <p className="text-gray-600 mt-2">Login to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Gmail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  placeholder="your@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
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
                    placeholder="Enter your password"
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
                Login
              </button>
            </form>

            <div className="text-center mt-6">
              <a
                href="/shopkeeper/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Register account?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support Floating Button */}
      <a
        href="#"
        className="fixed left-5 bottom-5 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-gray-200 text-gray-800 font-semibold shadow-sm hover:bg-white transition"
        aria-label="Help & Support"
      >
        <span className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
          <Headphones size={18} className="text-blue-600" />
        </span>
        <span>Help &amp; Support</span>
      </a>
    </div>
  )
}
