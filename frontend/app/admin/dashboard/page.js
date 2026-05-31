'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LogOut, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Search, 
  Bell, 
  Store, 
  PieChart, 
  Settings, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Activity, 
  Cpu, 
  ShieldCheck 
} from 'lucide-react'
import AdminSidebar from './_components/AdminSidebar'
import StatCard from './_components/StatCard'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  // Tab: Dashboard
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  // Tab: Users & Shops
  const [users, setUsers] = useState([])
  const [shops, setShops] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [usersShopsLoading, setUsersShopsLoading] = useState(false)

  // Tab: Analytics
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Tab: Settings
  const [settingsData, setSettingsData] = useState({
    maintenanceMode: false,
    autoApproveShops: true,
    platformTaxRate: '5',
    allowedFileFormats: '.pdf,.png,.jpg',
  })

  // Basic check for admin session
  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) {
      router.push('/admin')
      return
    }
    setLoading(false)
  }, [router])

  // Fetch data depending on active tab
  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) return

    const fetchDashboard = async () => {
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/stats')
        const statsData = await statsRes.json()
        setStats(statsData)

        const ordersRes = await fetch('http://localhost:5000/api/admin/recent-orders')
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData)
      } catch (err) {
        console.error('Error fetching admin stats:', err)
      }
    }

    const fetchUsersAndShops = async () => {
      setUsersShopsLoading(true)
      try {
        const usersRes = await fetch('http://localhost:5000/api/admin/users')
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(Array.isArray(usersData) ? usersData : [])
        } else {
          setUsers([])
        }

        const shopsRes = await fetch('http://localhost:5000/api/admin/shops')
        if (shopsRes.ok) {
          const shopsData = await shopsRes.json()
          setShops(Array.isArray(shopsData) ? shopsData : [])
        } else {
          setShops([])
        }
      } catch (err) {
        console.error('Error fetching users and shops:', err)
        setUsers([])
        setShops([])
      } finally {
        setUsersShopsLoading(false)
      }
    }

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true)
      try {
        const analyticsRes = await fetch('http://localhost:5000/api/admin/analytics')
        const data = await analyticsRes.json()
        setAnalyticsData(data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    if (activeTab === 'dashboard') {
      fetchDashboard()
    } else if (activeTab === 'users') {
      fetchUsersAndShops()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
    }
  }, [activeTab])

  const toggleOnboarding = async (shopId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/shops/${shopId}/onboard`, {
        method: 'PUT'
      })
      if (res.ok) {
        // Optimistically update frontend state
        setShops(shops.map(shop => 
          shop.id === shopId ? { ...shop, isOnboarded: !shop.isOnboarded } : shop
        ))
      }
    } catch (err) {
      console.error('Failed to toggle shop onboarding:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  // Filtered lists for Users & Shops
  const filteredUsers = Array.isArray(users) ? users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  const filteredShops = Array.isArray(shops) ? shops.filter(s => 
    (s.shopName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search shops, users, orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500 font-medium">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Panels */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Platform Orders" 
                  value={stats?.totalOrders?.toLocaleString() || '0'} 
                  icon={ShoppingCart} 
                  trend="12.5" 
                  trendUp={true}
                  colorClass="text-blue-600"
                  bgClass="bg-blue-50"
                />
                <StatCard 
                  title="Platform Revenue" 
                  value={`₹${(stats?.revenue || 0).toLocaleString()}`} 
                  icon={TrendingUp} 
                  trend="8.2" 
                  trendUp={true}
                  colorClass="text-green-600"
                  bgClass="bg-green-50"
                />
                <StatCard 
                  title="Active Shops" 
                  value={stats?.activeShops?.toLocaleString() || '0'} 
                  icon={Store} 
                  trend="4.1" 
                  trendUp={true}
                  colorClass="text-purple-600"
                  bgClass="bg-purple-50"
                />
                <StatCard 
                  title="Active Customers" 
                  value={stats?.activeCustomers?.toLocaleString() || '0'} 
                  icon={Users} 
                  trend="15.4" 
                  trendUp={true}
                  colorClass="text-pink-600"
                  bgClass="bg-pink-50"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Platform Orders</h2>
                    <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">View All</button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-4 pt-2 font-semibold text-gray-400 text-sm">Order ID</th>
                          <th className="pb-4 pt-2 font-semibold text-gray-400 text-sm">Shop</th>
                          <th className="pb-4 pt-2 font-semibold text-gray-400 text-sm">Amount</th>
                          <th className="pb-4 pt-2 font-semibold text-gray-400 text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentOrders.length > 0 ? recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                            <td className="py-4 font-semibold text-gray-900">{order.orderId || order.id.substring(0,8)}</td>
                            <td className="py-4 text-gray-600 font-medium flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {order.shopkeeper?.shopName?.charAt(0) || 'S'}
                              </div>
                              {order.shopkeeper?.shopName || 'Unknown Shop'}
                            </td>
                            <td className="py-4 font-semibold text-gray-900">₹{order.totalAmount}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold
                                ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                                ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${order.status === 'PRINTING' || order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' : ''}
                                ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                              `}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-gray-500">No recent orders found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('users')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 hover:border-blue-200 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Store size={24} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Shops List</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-green-50/50 hover:bg-green-50 border border-green-100/50 hover:border-green-200 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Users List</span>
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100/50 hover:border-purple-200 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <PieChart size={24} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Analytics</span>
                    </button>
                    <button onClick={() => setActiveTab('settings')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100/50 hover:border-orange-200 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <Settings size={24} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: USERS & SHOPS */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-fadeIn">
              {usersShopsLoading ? (
                <div className="h-64 flex items-center justify-center bg-white/80 rounded-3xl border border-white/20">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Shopkeepers Management */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Store className="text-purple-600" />
                      Platform Shops ({filteredShops.length})
                    </h2>
                    
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {filteredShops.length > 0 ? filteredShops.map((shop) => (
                        <div key={shop.id} className="p-5 rounded-2xl border border-gray-100/80 bg-white shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                          <div className="space-y-1">
                            <h3 className="font-bold text-gray-900">{shop.shopName}</h3>
                            <p className="text-sm text-gray-500 font-medium">Owner: {shop.ownerName || 'N/A'}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Mail size={12} /> {shop.email}</span>
                              <span className="flex items-center gap-1"><Phone size={12} /> {shop.phone}</span>
                            </div>
                            <div className="pt-2 flex gap-4 text-xs font-semibold text-gray-700">
                              <span>Orders: <strong className="text-indigo-600">{shop.totalOrders}</strong></span>
                              <span>Earnings: <strong className="text-green-600">₹{shop.totalEarnings}</strong></span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${shop.isOnboarded ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              {shop.isOnboarded ? 'Approved' : 'Pending Approval'}
                            </span>
                            
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={shop.isOnboarded} 
                                onChange={() => toggleOnboarding(shop.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center py-8 text-gray-500">No shops found matching filter.</p>
                      )}
                    </div>
                  </div>

                  {/* Registered Users Management */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Users className="text-blue-600" />
                      Platform Users ({filteredUsers.length})
                    </h2>
                    
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <div key={user.id} className="p-5 rounded-2xl border border-gray-100/80 bg-white shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                          <div className="space-y-1">
                            <h3 className="font-bold text-gray-900">{user.name || 'Anonymous User'}</h3>
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                              <Mail size={14} /> {user.email}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar size={12} /> Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                              Language: {user.language}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center py-8 text-gray-500">No users found matching filter.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fadeIn">
              {analyticsLoading ? (
                <div className="h-64 flex items-center justify-center bg-white/80 rounded-3xl border border-white/20">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : analyticsData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Line Chart Card (SVG) */}
                  <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp className="text-blue-600" />
                      Daily Orders & Revenue Trend (Last 7 Days)
                    </h3>
                    
                    {/* SVG Chart */}
                    <div className="w-full h-64 bg-white/50 rounded-2xl border border-gray-100 p-4 relative">
                      <svg viewBox="0 0 500 200" className="w-full h-full">
                        {/* Grid lines */}
                        <line x1="40" y1="30" x2="480" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="40" y1="80" x2="480" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="40" y1="130" x2="480" y2="130" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1.5" />
                        
                        {/* Plot trend line */}
                        {(() => {
                          const trends = analyticsData.dailyTrends || [];
                          if (trends.length === 0) return null;
                          const maxCount = Math.max(...trends.map(t => t.count), 1);
                          const points = trends.map((t, index) => {
                            const x = 40 + (index * (440 / (trends.length - 1 || 1)));
                            const y = 170 - (t.count * (130 / maxCount));
                            return `${x},${y}`;
                          }).join(' ');

                          return (
                            <>
                              <polyline
                                fill="none"
                                stroke="url(#blueGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={points}
                                className="drop-shadow-[0_4px_6px_rgba(59,130,246,0.2)]"
                              />
                              
                              {/* Definitions for gradient */}
                              <defs>
                                <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#3B82F6" />
                                  <stop offset="100%" stopColor="#6366F1" />
                                </linearGradient>
                              </defs>

                              {/* Interactive circles and labels */}
                              {trends.map((t, index) => {
                                const x = 40 + (index * (440 / (trends.length - 1 || 1)));
                                const y = 170 - (t.count * (130 / maxCount));
                                return (
                                  <g key={index} className="group/dot cursor-pointer">
                                    <circle cx={x} cy={y} r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                                    <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E293B" className="opacity-0 group-hover/dot:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow">
                                      {t.count} orders
                                    </text>
                                    <text x={x} y="190" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="semibold">
                                      {t.date}
                                    </text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* Service Type Doughnut Card (SVG) */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <PieChart className="text-purple-600" />
                      Popular Services
                    </h3>

                    {(() => {
                      const bwCount = analyticsData.printTypeDistribution?.find(p => p.printType === 'BW')?._count?.id || 0;
                      const colorCount = analyticsData.printTypeDistribution?.find(p => p.printType === 'COLOR')?._count?.id || 0;
                      const total = bwCount + colorCount || 1;
                      
                      const bwPercent = Math.round((bwCount / total) * 100);
                      const colorPercent = Math.round((colorCount / total) * 100);
                      
                      // Circumference of radius 40 circle is ~251
                      const bwDash = (bwPercent / 100) * 251.2;
                      const colorDash = 251.2 - bwDash;

                      return (
                        <div className="flex flex-col items-center justify-center space-y-6">
                          <div className="relative w-36 h-36">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle 
                                cx="72" cy="72" r="40" 
                                fill="transparent" 
                                stroke="#E2E8F0" 
                                strokeWidth="16" 
                              />
                              <circle 
                                cx="72" cy="72" r="40" 
                                fill="transparent" 
                                stroke="#3B82F6" 
                                strokeWidth="16" 
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - bwDash}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-xs text-gray-400 font-semibold uppercase">Total Files</span>
                              <span className="text-2xl font-bold text-gray-900">{total}</span>
                            </div>
                          </div>

                          <div className="w-full space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/30 border border-blue-100/20">
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-semibold text-gray-700">Black & White Print</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{bwPercent}% ({bwCount})</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-300"></div>
                                <span className="text-sm font-semibold text-gray-700">Color Print</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{colorPercent}% ({colorCount})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Order Status Distribution Card (SVG Bar Chart) */}
                  <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status Distribution</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {['PENDING', 'ACCEPTED', 'PRINTING', 'COMPLETED', 'CANCELLED'].map((status) => {
                        const count = analyticsData.statusDistribution?.find(s => s.status === status)?._count?.id || 0;
                        const maxCount = Math.max(...(analyticsData.statusDistribution?.map(s => s._count?.id) || [1]), 1);
                        const percentHeight = Math.max((count / maxCount) * 100, 5);

                        const colorMap = {
                          PENDING: 'bg-yellow-500',
                          ACCEPTED: 'bg-indigo-500',
                          PRINTING: 'bg-blue-500',
                          COMPLETED: 'bg-green-500',
                          CANCELLED: 'bg-red-500',
                        }

                        const textMap = {
                          PENDING: 'Pending',
                          ACCEPTED: 'Accepted',
                          PRINTING: 'Printing',
                          COMPLETED: 'Completed',
                          CANCELLED: 'Cancelled',
                        }

                        return (
                          <div key={status} className="p-5 rounded-2xl border border-gray-100 bg-white flex flex-col items-center justify-between space-y-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{textMap[status]}</span>
                            
                            {/* Graphic Bar */}
                            <div className="w-8 h-32 bg-slate-50 rounded-full relative overflow-hidden flex items-end">
                              <div 
                                className={`w-full rounded-full transition-all duration-1000 ${colorMap[status]}`} 
                                style={{ height: `${percentHeight}%` }}
                              />
                            </div>
                            
                            <span className="text-xl font-bold text-slate-800">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">Failed to aggregate analytics datasets.</p>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Settings className="text-orange-500" />
                Global Platform Settings
              </h2>

              <div className="space-y-6">
                {/* Maintenance Mode Toggle */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-white">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Cpu size={18} className="text-gray-400" />
                      Maintenance Mode
                    </h3>
                    <p className="text-sm text-gray-500">Temporarily freeze platform requests for scheduled service.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settingsData.maintenanceMode} 
                      onChange={() => setSettingsData({ ...settingsData, maintenanceMode: !settingsData.maintenanceMode })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Auto Approve Shops */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-white">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Store size={18} className="text-gray-400" />
                      Auto-Approve New Shopkeepers
                    </h3>
                    <p className="text-sm text-gray-500">Instantly activate shops upon successful signup without admin approval.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settingsData.autoApproveShops} 
                      onChange={() => setSettingsData({ ...settingsData, autoApproveShops: !settingsData.autoApproveShops })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Platform Commission Rate */}
                <div className="p-5 rounded-2xl border border-gray-100 bg-white space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp size={18} className="text-gray-400" />
                      Platform Service Fee (%)
                    </h3>
                    <p className="text-sm text-gray-500">The platform tax percentage added to each customer printing order.</p>
                  </div>
                  <input 
                    type="number" 
                    value={settingsData.platformTaxRate}
                    onChange={(e) => setSettingsData({ ...settingsData, platformTaxRate: e.target.value })}
                    className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    placeholder="5"
                  />
                </div>

                {/* File Formats */}
                <div className="p-5 rounded-2xl border border-gray-100 bg-white space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-gray-400" />
                      Allowed Upload Formats
                    </h3>
                    <p className="text-sm text-gray-500">Comma separated file extensions accepted during customer print flow.</p>
                  </div>
                  <input 
                    type="text" 
                    value={settingsData.allowedFileFormats}
                    onChange={(e) => setSettingsData({ ...settingsData, allowedFileFormats: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-700"
                    placeholder=".pdf,.png,.jpg"
                  />
                </div>

                {/* Save Settings Trigger */}
                <button className="w-full gradient-button flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                  <ShieldCheck size={20} />
                  Save Administrative Settings
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}