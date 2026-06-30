'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function AdminPage() {
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
    // Admin credentials
    const allowedAdmins = [
      { email: 'jayantghate13@gmail.com', password: 'Founder', name: 'Jayant', role: 'Founder' },
      { email: 'yashg19@gmail.com', password: 'Co-founder', name: 'Yash', role: 'Co-founder' },
      { email: 'printsmaart.connect@gmail.com', password: 'Admin123', name: 'Visiting Admin', role: 'Admin' }
    ]

    const matchedAdmin = allowedAdmins.find(
      (admin) => admin.email.toLowerCase() === formData.email.trim().toLowerCase() && admin.password === formData.password
    )

    if (matchedAdmin) {
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', matchedAdmin.email)
      localStorage.setItem('adminName', matchedAdmin.name)
      localStorage.setItem('adminRole', matchedAdmin.role)
      router.push('/admin/dashboard')
    } else {
      alert('Invalid admin credentials!')
    }
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="glassmorphism w-full max-w-md p-8">
        {/* Admin Branding */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center">
            <Shield size={32} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-black text-center mb-2">Admin Panel</h2>
        <p className="text-gray-600 text-center mb-8">Enter your admin credentials to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Admin Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
              placeholder="admin@example.com"
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full gradient-button py-3 px-4 rounded-xl font-semibold transition text-white mt-6"
          >
            Access Admin Panel
          </button>
        </form>

      </div>
    </div>
  )
}