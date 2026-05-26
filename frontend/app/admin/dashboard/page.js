'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Users, ShoppingCart, TrendingUp } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    router.push('/admin')
  }

  const stats = [
    { label: 'Total Orders', value: '1,234', icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Active Shops', value: '45', icon: Users, color: 'text-purple-600' },
    { label: 'Revenue', value: '₹45,000', icon: TrendingUp, color: 'text-green-600' },
  ]

  return (
    <div className="wave-bg min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Printsmart Admin</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-black mb-8">Dashboard Overview</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="glassmorphism p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-brand/10 rounded-xl flex items-center justify-center">
                  <stat.icon size={28} className={stat.color} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="glassmorphism p-6 rounded-xl">
          <h3 className="text-xl font-bold text-black mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">#ORD-00125</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">₹10.00</td>
                  <td className="py-3 px-4 text-gray-600">5 mins ago</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">#ORD-00124</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">₹15.50</td>
                  <td className="py-3 px-4 text-gray-600">1 hour ago</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">#ORD-00123</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      Printing
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">₹8.75</td>
                  <td className="py-3 px-4 text-gray-600">2 hours ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}