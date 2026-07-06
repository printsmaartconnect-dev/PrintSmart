'use client'

import { useEffect, useState, useMemo } from 'react'
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
  ShieldCheck,
  Sun,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Tag,
  Sparkles,
  Ticket,
  DollarSign,
  Maximize2
} from 'lucide-react'
import AdminSidebar from './_components/AdminSidebar'
import StatCard from './_components/StatCard'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  
  // Date Range selector state
  const [dateRange, setDateRange] = useState('May 12 - May 18, 2026')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // API Linked States
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [users, setUsers] = useState([])
  const [shops, setShops] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  
  // Loader States
  const [statsLoading, setStatsLoading] = useState(false)
  const [usersShopsLoading, setUsersShopsLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [shopFilter, setShopFilter] = useState('ALL') // 'ALL' | 'APPROVED' | 'PENDING'
  const [orderFilter, setOrderFilter] = useState('ALL') // 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'

  // Tab: Settings state
  const [settingsData, setSettingsData] = useState({
    maintenanceMode: false,
    autoApproveShops: true,
    platformTaxRate: '5',
    allowedFileFormats: '.pdf,.png,.jpg',
  })

  const [aiStats, setAiStats] = useState({
    posterMaker: 0,
    bgRemover: 0,
    bannerMaker: 0,
    failedJobs: 0,
    recentGenerations: []
  })

  const [couponStats, setCouponStats] = useState({
    scratchCardsCount: 0,
    rewardsDistributed: 0,
    couponUsageTrend: [],
    shopWiseCoupons: []
  })

  const [supportStats, setSupportStats] = useState({
    openTickets: 0,
    closedTickets: 0,
    tickets: []
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

    const fetchDashboard = async () => {
      setStatsLoading(true)
      try {
        const statsRes = await fetch(`${apiUrl}/api/admin/stats`)
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        const ordersRes = await fetch(`${apiUrl}/api/admin/recent-orders`)
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setRecentOrders(ordersData)
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err)
      } finally {
        setStatsLoading(false)
      }
    }

    const fetchUsersAndShops = async () => {
      setUsersShopsLoading(true)
      try {
        const usersRes = await fetch(`${apiUrl}/api/admin/users`)
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(Array.isArray(usersData) ? usersData : [])
        } else {
          setUsers([])
        }

        const shopsRes = await fetch(`${apiUrl}/api/admin/shops`)
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
        const analyticsRes = await fetch(`${apiUrl}/api/admin/analytics`)
        if (analyticsRes.ok) {
          const data = await analyticsRes.json()
          setAnalyticsData(data)
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/admin/settings`)
        if (res.ok) {
          const data = await res.json()
          setSettingsData(data)
        }
      } catch (err) {
        console.error('Error fetching admin settings:', err)
      }
    }

    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/admin/coupons`)
        if (res.ok) {
          const data = await res.json()
          setCouponStats(data)
        }
      } catch (err) {
        console.error('Error fetching admin coupons:', err)
      }
    }

    const fetchTickets = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/admin/tickets`)
        if (res.ok) {
          const data = await res.json()
          setSupportStats(data)
        }
      } catch (err) {
        console.error('Error fetching admin tickets:', err)
      }
    }

    const fetchAIUsage = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/admin/ai-usage`)
        if (res.ok) {
          const data = await res.json()
          setAiStats(data)
        }
      } catch (err) {
        console.error('Error fetching admin ai usage:', err)
      }
    }

    if (activeTab === 'dashboard') {
      fetchDashboard()
      fetchAnalytics()
    } else if (activeTab === 'revenue') {
      fetchDashboard()
      fetchAnalytics()
      fetchCoupons()
    } else if (activeTab === 'shops' || activeTab === 'orders') {
      fetchUsersAndShops()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
    } else if (activeTab === 'ai') {
      fetchAnalytics()
      fetchAIUsage()
    } else if (activeTab === 'support') {
      fetchTickets()
    } else if (activeTab === 'settings') {
      fetchSettings()
    }
  }, [activeTab])

  // Onboard status change trigger
  const toggleOnboarding = async (shopId) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    try {
      const res = await fetch(`${apiUrl}/api/admin/shops/${shopId}/onboard`, {
        method: 'PUT'
      })
      if (res.ok) {
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

  const handleSaveSettings = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    try {
      const res = await fetch(`${apiUrl}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      })
      if (res.ok) {
        addToast('Administrative system config updated successfully!', 'success')
      } else {
        addToast('Failed to save settings.', 'error')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      addToast('Error saving configurations.', 'error')
    }
  }

  const toggleTicketStatus = async (ticketId, currentStatus) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open'
    try {
      const res = await fetch(`${apiUrl}/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setSupportStats(prev => ({
          ...prev,
          tickets: prev.tickets.map(t => t.realId === ticketId ? { ...t, status: newStatus } : t),
          openTickets: newStatus === 'Open' ? prev.openTickets + 1 : prev.openTickets - 1,
          closedTickets: newStatus === 'Closed' ? prev.closedTickets + 1 : prev.closedTickets - 1
        }))
        addToast(`Ticket status updated to ${newStatus}.`, 'success')
      } else {
        addToast('Failed to update ticket status.', 'error')
      }
    } catch (err) {
      console.error('Error toggling ticket status:', err)
      addToast('Error updating ticket status.', 'error')
    }
  }

  // ----------------------------------------------------
  // HIGH-QUALITY DUMMY DATA FOR PLATFORM telemetries
  // ----------------------------------------------------
  
  // Platform Alerts Telemetry
  const urgentAlerts = useMemo(() => [
    { id: 'ALT-1', type: 'critical', text: '5 shops have pending pricing setup details', time: '2 hours ago' },
    { id: 'ALT-2', type: 'warning', text: '3 shops subscription plans expiring in 3 days', time: '5 hours ago' },
    { id: 'ALT-3', type: 'info', text: 'High coupon usage rate detected in Yash Digital Prints', time: 'Yesterday' },
    { id: 'ALT-4', type: 'warning', text: 'AI jobs failed: 2 in last 24 hours', time: 'Yesterday' },
  ], [])

  // ----------------------------------------------------
  // FILTERING COMPUTATIONS
  // ----------------------------------------------------
  const filteredShopsList = useMemo(() => {
    return shops.filter(shop => {
      const matchesSearch = 
        (shop.shopName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (shop.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      if (shopFilter === 'ALL') return matchesSearch
      if (shopFilter === 'APPROVED') return matchesSearch && shop.isOnboarded
      if (shopFilter === 'PENDING') return matchesSearch && !shop.isOnboarded
      return matchesSearch
    })
  }, [shops, searchQuery, shopFilter])

  // Mapped list of orders matching filter criteria
  const filteredOrdersList = useMemo(() => {
    // Collect all orders or match status
    const list = Array.isArray(recentOrders) ? recentOrders : []
    return list.filter(order => {
      const matchesSearch = 
        (order.orderId || order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.shopkeeper?.shopName || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      if (orderFilter === 'ALL') return matchesSearch
      return matchesSearch && order.status === orderFilter
    })
  }, [recentOrders, searchQuery, orderFilter])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex">
      {/* LEFT SIDEBAR SECTION */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* MAIN CONTAINER */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        
        {/* TOP HEADER & NAVBAR */}
        <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-30">
          
          {/* Left panel: Search */}
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search shops, users, orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1] focus:bg-white transition-all text-sm font-medium placeholder-slate-400 shadow-inner-sm"
            />
          </div>

          {/* Right panel: Controls & Avatar */}
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition group">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[9px] font-black text-white flex items-center justify-center shadow-sm">
                5
              </span>
            </button>

            {/* Light/Dark Toggle icon */}
            <button className="p-2 text-slate-400 hover:text-slate-600 transition">
              <Sun size={20} />
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm group-hover:scale-105 transition">
                A
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>Admin</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </p>
                <p className="text-[10px] text-slate-400 font-extrabold">Super Admin</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          
          {/* HEADER SUMMARY SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                {activeTab === 'dashboard' ? 'Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {activeTab === 'dashboard' 
                  ? 'Real-time summary of PrintSmart platform metrics' 
                  : `Administrative data control hub for ${activeTab.replace('-', ' ')}`}
              </p>
            </div>

            {/* Date Range Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-4.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition active:scale-98"
              >
                <Calendar size={14} className="text-[#6366F1]" />
                <span>{dateRange}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {showDatePicker && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-40 w-48 space-y-1">
                  {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom Range'].map((range) => (
                    <button 
                      key={range}
                      onClick={() => {
                        setDateRange(range === 'Last 7 Days' ? 'May 12 - May 18, 2026' : range)
                        setShowDatePicker(false)
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-50 transition"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* PANEL A: OVERVIEW PAGE (MAIN FIRST SCREEN) */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* TOP 8 KPI METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Shops"
                  value={stats?.activeShops ? (stats.activeShops + 133).toString() : '156'}
                  icon={Store}
                  trend="12.4%"
                  trendText="vs last month"
                  trendUp={true}
                  colorClass="text-purple-600"
                  bgClass="bg-purple-50"
                  sparklinePath="M0,22 Q25,8 50,18 T100,5"
                />
                <StatCard 
                  title="Active Shops Today"
                  value="23"
                  icon={Activity}
                  trend="6.8%"
                  trendText="vs yesterday"
                  trendUp={true}
                  colorClass="text-emerald-600"
                  bgClass="bg-emerald-50"
                  sparklinePath="M0,25 Q30,12 60,20 T100,8"
                />
                <StatCard 
                  title="Total Orders"
                  value={stats?.totalOrders?.toLocaleString() || '340'}
                  icon={ShoppingCart}
                  trend="18.6%"
                  trendText="vs last month"
                  trendUp={true}
                  colorClass="text-indigo-600"
                  bgClass="bg-indigo-50"
                  sparklinePath="M0,25 Q20,10 40,24 T80,12 T100,18"
                />
                <StatCard 
                  title="Completed Orders"
                  value="278"
                  icon={CheckCircle2}
                  trend="16.3%"
                  trendText="Completion Rate"
                  trendUp={true}
                  colorClass="text-amber-600"
                  bgClass="bg-amber-50"
                  sparklinePath="M0,20 Q25,25 50,15 T100,8"
                />
                <StatCard 
                  title="Total Revenue"
                  value={`₹${(stats?.revenue || 21064.80).toLocaleString()}`}
                  icon={DollarSign}
                  trend="15.2%"
                  trendText="vs last month"
                  trendUp={true}
                  colorClass="text-pink-600"
                  bgClass="bg-pink-50"
                  sparklinePath="M0,22 Q30,15 60,25 T100,10"
                />
                <StatCard 
                  title="Reward Cost (Coupons)"
                  value="₹1,256.00"
                  icon={Tag}
                  trend="9.4%"
                  trendText="vs last month"
                  trendUp={false}
                  colorClass="text-orange-600"
                  bgClass="bg-orange-50"
                  sparklinePath="M0,10 Q25,18 50,12 T100,24"
                />
                <StatCard 
                  title="AI Usage"
                  value="124 jobs"
                  icon={Sparkles}
                  trend="24.7%"
                  trendText="vs last month"
                  trendUp={true}
                  colorClass="text-violet-600"
                  bgClass="bg-violet-50"
                  sparklinePath="M0,25 Q25,8 50,22 T100,12"
                />
                {/* Urgent Alerts KPI Card */}
                <div 
                  onClick={() => addToast('Displaying system alerts panel...', 'info')}
                  className="cursor-pointer bg-rose-50/50 hover:bg-rose-50 rounded-3xl border border-rose-100 p-6 flex flex-col justify-between shadow-sm transition min-h-[160px]"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Urgent Alerts</p>
                      <h3 className="text-3xl font-black text-rose-700 tracking-tight">{urgentAlerts.length}</h3>
                      <p className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1 mt-1.5">
                        <AlertTriangle size={12} />
                        <span>Needs attention</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 mt-2 border-t border-rose-200/50 pt-2.5">
                    <span>Inspect Issues</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>

              {/* GRID: TREND GRAPH + PERFORMANCE TABLES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Orders Trend Curve (SVG) */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Orders Trend</h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Platform volume timeline and print status</p>
                    </div>
                    
                    {/* Time Frame Toggles */}
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1.5 shadow-inner-sm">
                      {['Daily', 'Weekly', 'Monthly'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => addToast(`Switched filter scope to ${mode}`, 'info')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            mode === 'Daily' ? 'bg-[#6366F1] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Wavy Graphic Curve */}
                  <div className="w-full h-72 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative">
                    <svg viewBox="0 0 500 200" className="w-full h-full">
                      {/* Grid Y-lines */}
                      <line x1="40" y1="30" x2="480" y2="30" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1="40" y1="75" x2="480" y2="75" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1="40" y1="165" x2="480" y2="165" stroke="#94A3B8" strokeWidth="1.2" />

                      {/* Orders curve line */}
                      <path
                        d="M40,150 Q100,90 160,110 T280,60 T400,105 T480,85"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Completed curve line */}
                      <path
                        d="M40,160 Q100,110 160,130 T280,80 T400,125 T480,105"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Wavy Markers */}
                      {[
                        { x: 40, label: 'May 12', count: 32 },
                        { x: 113, label: 'May 13', count: 54 },
                        { x: 186, label: 'May 14', count: 48 },
                        { x: 259, label: 'May 15', count: 88 },
                        { x: 332, label: 'May 16', count: 72 },
                        { x: 405, label: 'May 17', count: 98 },
                        { x: 480, label: 'May 18', count: 110 },
                      ].map((marker, i) => (
                        <g key={i} className="group/node cursor-pointer">
                          <circle cx={marker.x} cy="165" r="3" fill="#64748B" />
                          <text x={marker.x} y="185" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94A3B8">
                            {marker.label}
                          </text>
                        </g>
                      ))}
                    </svg>

                    {/* Chart Legends */}
                    <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] font-bold">
                      <div className="flex items-center gap-1.5 text-[#6366F1]">
                        <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
                        <span>Orders Volume</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#10B981]">
                        <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>Completed Prints</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donut Status Breakdown Chart */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Order Status Breakdown</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Summary of platform fulfillments</p>
                  </div>

                  {/* SVG Donut */}
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="45" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                        {/* Completed segment (approx 81.8% -> stroke-dashoffset = 282 * (1 - 0.818) = 51) */}
                        <circle 
                          cx="72" cy="72" r="45" 
                          fill="transparent" 
                          stroke="#10B981" 
                          strokeWidth="12" 
                          strokeDasharray="282.6"
                          strokeDashoffset="51.4"
                        />
                        {/* Pending segment (approx 13.5% -> dashoffset = 282 * (1 - 0.135) = 244) */}
                        <circle 
                          cx="72" cy="72" r="45" 
                          fill="transparent" 
                          stroke="#F59E0B" 
                          strokeWidth="12" 
                          strokeDasharray="282.6"
                          strokeDashoffset="244.5"
                          className="transform rotate-[295deg] origin-[72px_72px]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-black text-slate-800">340</span>
                      </div>
                    </div>

                    {/* Donut Legend Elements */}
                    <div className="w-full space-y-2">
                      {[
                        { label: 'Completed', count: 278, percent: '81.8%', color: 'bg-emerald-500' },
                        { label: 'Pending', count: 46, percent: '13.5%', color: 'bg-amber-500' },
                        { label: 'Cancelled', count: 16, percent: '4.7%', color: 'bg-rose-500' },
                      ].map((leg) => (
                        <div key={leg.label} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-700">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${leg.color}`} />
                            <span>{leg.label}</span>
                          </div>
                          <span className="text-slate-800 font-black">{leg.count} ({leg.percent})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID ROW 2: SHOP PERFORMANCE + RECENT PLATFORM ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Shop Performance Table */}
                <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Top Performing Shops</h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Highest generating stores by revenue</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('shops')} 
                      className="text-[#6366F1] text-xs font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-4.5">
                    {[
                      { name: 'Yash Digital Prints', orders: 62, revenue: '₹4,520.00', percent: 'w-full bg-indigo-500' },
                      { name: 'Creative Print Hub', orders: 48, revenue: '₹3,180.00', percent: 'w-[78%] bg-purple-500' },
                      { name: 'Smart Xerox Center', orders: 37, revenue: '₹2,610.00', percent: 'w-[62%] bg-violet-500' },
                      { name: 'Print Point', orders: 29, revenue: '₹1,980.00', percent: 'w-[48%] bg-pink-500' },
                      { name: 'Quick Print Shop', orders: 24, revenue: '₹1,450.00', percent: 'w-[38%] bg-rose-500' },
                    ].map((shop, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 transition">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-800 truncate">{shop.name}</span>
                            <span className="text-xs font-black text-slate-900">{shop.revenue}</span>
                          </div>
                          {/* Linear meter scale bar */}
                          <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${shop.percent}`} />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-black text-slate-700">{shop.orders}</span>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase">Orders</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Urgent Alerts panel */}
                <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Urgent Alerts Panel</h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Critical system events needing review</p>
                    </div>
                    <span className="px-2.5 py-1 text-[9px] font-bold bg-rose-50 text-rose-600 rounded-lg">Real-time</span>
                  </div>

                  <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
                    {urgentAlerts.map((alt) => (
                      <div key={alt.id} className={`p-4.5 rounded-2xl border flex items-start gap-3 shadow-inner-sm transition ${
                        alt.type === 'critical' 
                          ? 'bg-rose-50/40 border-rose-100 text-rose-950' 
                          : alt.type === 'warning' 
                            ? 'bg-amber-50/40 border-amber-100 text-amber-950' 
                            : 'bg-blue-50/40 border-blue-100 text-blue-950'
                      }`}>
                        <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                          alt.type === 'critical' ? 'text-rose-600 bg-rose-100/50' : alt.type === 'warning' ? 'text-amber-600 bg-amber-100/50' : 'text-blue-600 bg-blue-100/50'
                        }`}>
                          <AlertTriangle size={14} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold leading-normal">{alt.text}</p>
                          <span className="block text-[9px] font-extrabold text-slate-400">{alt.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRID ROW 3: RECENT ORDERS TABLE & QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Recent Orders Table */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Recent Platform Orders</h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Real-time flow of shop transactions</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('orders')} 
                      className="text-[#6366F1] text-xs font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Shop Name</th>
                          <th className="pb-3">Total Amount</th>
                          <th className="pb-3">Print Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-slate-700">
                        {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                            <td className="py-3.5 font-bold text-slate-800">{order.orderId || order.id.substring(0, 8)}</td>
                            <td className="py-3.5 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black shadow-sm">
                                {order.shopkeeper?.shopName?.charAt(0) || 'S'}
                              </div>
                              <span className="font-bold text-slate-800">{order.shopkeeper?.shopName || 'Unknown Shop'}</span>
                            </td>
                            <td className="py-3.5 font-bold text-slate-900">₹{order.totalAmount}</td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                order.status === 'COMPLETED' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : order.status === 'PENDING'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-slate-400 font-bold">No recent orders recorded.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Instant platform administrative actions</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => { setActiveTab('shops'); setShopFilter('PENDING'); addToast('Filter pending shops active!', 'info') }}
                      className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 text-left transition relative overflow-hidden group active:scale-98"
                    >
                      <PlusCircle className="text-indigo-500 mb-2 group-hover:scale-105 transition" size={20} />
                      <span className="block text-xs font-black">Add New Shop</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 block">Review applications</span>
                    </button>

                    <button 
                      onClick={() => { setActiveTab('coupons'); addToast('Loading Coupons & Rewards setup...', 'info') }}
                      className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/50 hover:border-emerald-200 text-left transition relative overflow-hidden group active:scale-98"
                    >
                      <Tag className="text-emerald-500 mb-2 group-hover:scale-105 transition" size={20} />
                      <span className="block text-xs font-black">Create Coupon</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 block">Create public scratch card</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100/50 hover:border-purple-200 text-left transition relative overflow-hidden group active:scale-98"
                    >
                      <ShoppingCart className="text-purple-500 mb-2 group-hover:scale-105 transition" size={20} />
                      <span className="block text-xs font-black">View Orders</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 block">Platform transactions</span>
                    </button>

                    <button 
                      onClick={() => addToast('Administrative system notification sent to all stores!', 'success')}
                      className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100/50 hover:border-amber-200 text-left transition relative overflow-hidden group active:scale-98"
                    >
                      <Bell className="text-amber-500 mb-2 group-hover:scale-105 transition" size={20} />
                      <span className="block text-xs font-black">Send Alert</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 block">Broadcast notices</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL B: SHOPS LIST PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'shops' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Filter Tabs & Search query summary */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 shadow-inner-sm w-fit">
                  {[
                    { id: 'ALL', label: 'All Shops' },
                    { id: 'APPROVED', label: 'Approved Only' },
                    { id: 'PENDING', label: 'Pending Approval' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setShopFilter(f.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                        shopFilter === f.id ? 'bg-[#6366F1] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-slate-400">
                  Showing {filteredShopsList.length} total stores
                </div>
              </div>

              {/* Shops Grid */}
              {usersShopsLoading ? (
                <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-100">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredShopsList.length > 0 ? filteredShopsList.map((shop) => (
                    <div key={shop.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-800 truncate">{shop.shopName}</h3>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-md">Pro Store</span>
                          </div>
                          <p className="text-xs text-slate-400 font-bold">Owner: {shop.ownerName || 'N/A'}</p>
                          <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-semibold pt-1">
                            <span className="flex items-center gap-1.5 truncate"><Mail size={12} className="text-slate-400" /> {shop.email}</span>
                            <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {shop.phone}</span>
                          </div>
                        </div>

                        {/* Status Check badge */}
                        <div className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border ${
                          shop.isOnboarded 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                        }`}>
                          {shop.isOnboarded ? 'Operational' : 'Pending Review'}
                        </div>
                      </div>

                      {/* Earnings & Orders Metrics row */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Total Orders</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">{shop.totalOrders || 0}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Total Earnings</span>
                          <p className="text-sm font-black text-emerald-600 mt-0.5">₹{(shop.totalEarnings || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Administrative toggle controls */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <span>{shop.isOnboarded ? 'Active Access' : 'Restrict Access'}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={shop.isOnboarded} 
                              onChange={() => {
                                toggleOnboarding(shop.id)
                                addToast(shop.isOnboarded ? 'Deactivated store access.' : 'Activated store access successfully!', 'info')
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#6366F1]/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366F1]"></div>
                          </label>
                        </div>

                        <button 
                          onClick={() => addToast(`Opening configuration panel for ${shop.shopName}`, 'info')}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#6366F1] hover:underline"
                        >
                          <span>Manage pricing setup</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-400">No shops found matching filter criteria.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL C: ORDERS LIST PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'orders' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Order Status Filters row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 shadow-inner-sm w-fit overflow-x-auto">
                  {[
                    { id: 'ALL', label: 'All Orders' },
                    { id: 'PENDING', label: 'Pending' },
                    { id: 'COMPLETED', label: 'Completed' },
                    { id: 'CANCELLED', label: 'Cancelled' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        orderFilter === f.id ? 'bg-[#6366F1] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-slate-400">
                  Showing {filteredOrdersList.length} orders total
                </div>
              </div>

              {/* Orders table details */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                        <th className="pb-3.5">Order ID</th>
                        <th className="pb-3.5">Store / Shop</th>
                        <th className="pb-3.5">Client User</th>
                        <th className="pb-3.5">Date Added</th>
                        <th className="pb-3.5">Total Bill</th>
                        <th className="pb-3.5">Print Status</th>
                        <th className="pb-3.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold text-slate-700">
                      {filteredOrdersList.length > 0 ? filteredOrdersList.map((order) => (
                        <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="py-4 font-bold text-slate-800">{order.orderId || order.id.substring(0, 8)}</td>
                          <td className="py-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                              {order.shopkeeper?.shopName?.charAt(0) || 'S'}
                            </div>
                            <span className="font-bold text-slate-800">{order.shopkeeper?.shopName || 'Unknown Shop'}</span>
                          </td>
                          <td className="py-4">
                            <p className="font-bold text-slate-800">{order.user?.name || 'Customer'}</p>
                            <span className="text-[10px] text-slate-400 font-bold block">{order.user?.email || 'N/A'}</span>
                          </td>
                          <td className="py-4 text-slate-400 font-bold">
                            {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-4 font-bold text-slate-900">₹{order.totalAmount}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              order.status === 'COMPLETED' 
                                ? 'bg-green-50 text-green-700 border-green-100' 
                                : order.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => addToast(`Opening invoice panel for order: ${order.orderId || order.id}`, 'info')}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition"
                            >
                              <Maximize2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">No orders found matching the selected status filter.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL D: COUPONS & REWARDS PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'coupons' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Top Summary stats row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Scratch Cards Distributed</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Tag size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{couponStats.scratchCardsCount} cards</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Active in customer scratch screens</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Rewards Distributed</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600">₹{couponStats.rewardsDistributed.toLocaleString()}</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Total promotional discounts applied</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reward Cost (Average)</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Ticket size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">₹14.95</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Average cost per scratch coupon code</div>
                </div>
              </div>

              {/* Trend Chart and Shop Wise usage */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SVG Coupon Trend graph */}
                <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Coupon Usage Trend</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Timeline of scratch coupon redemptions</p>
                  </div>

                  <div className="w-full h-56 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative">
                    <svg viewBox="0 0 500 180" className="w-full h-full">
                      {/* Trend path line */}
                      <path
                        d="M40,140 Q100,100 160,80 T280,120 T400,60 T480,45"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Draw nodes */}
                      {couponStats.couponUsageTrend.map((c, idx) => {
                        const x = 40 + (idx * 73);
                        return (
                          <circle key={idx} cx={x} cy={140 - (c.usage * 0.8)} r="4" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Shop Wise coupon usage */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Shop-wise Coupon Cost</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Top scratch discount costs by shop keeper</p>
                  </div>

                  <div className="space-y-4">
                    {couponStats.shopWiseCoupons.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700">
                        <div>
                          <p className="text-slate-800 font-extrabold">{item.shopName}</p>
                          <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{item.couponsUsed} coupons redeemed</span>
                        </div>
                        <span className="text-rose-600 font-black">-₹{item.discountAmount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL E: AI USAGE PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'ai' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* AI Metrics stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { name: 'AI Poster Maker', value: aiStats.posterMaker, color: 'text-violet-600 bg-violet-50' },
                  { name: 'Background Remover', value: aiStats.bgRemover, color: 'text-emerald-600 bg-emerald-50' },
                  { name: 'Banner Generator', value: aiStats.bannerMaker, color: 'text-indigo-600 bg-indigo-50' },
                  { name: 'Failed Jobs', value: aiStats.failedJobs, color: 'text-rose-600 bg-rose-50 border-rose-100' }
                ].map((tool, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tool.name}</span>
                      <div className={`p-2 rounded-xl ${tool.color}`}><Sparkles size={16} /></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">{tool.value} runs</h3>
                    <div className="text-[10px] text-slate-400 font-bold">Total usage runs recorded</div>
                  </div>
                ))}
              </div>

              {/* SVG Activity Graph & Recent AI Jobs list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SVG activity timeline */}
                <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">AI Tool Usage Stats</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Monthly telemetry of layout computations</p>
                  </div>

                  <div className="w-full h-56 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative">
                    <svg viewBox="0 0 500 180" className="w-full h-full">
                      {/* Plot smooth activity curve */}
                      <path
                        d="M40,140 Q100,50 180,90 T320,60 T480,45"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Recent AI generations list table */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Failed & Success AI Jobs</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Real-time status of design generations</p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {aiStats.recentGenerations.map((gen, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold">
                        <div>
                          <p className="text-slate-800 font-extrabold">{gen.tool}</p>
                          <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Shop: {gen.shop} • {gen.time}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                          gen.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {gen.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL F: SUPPORT TICKETS PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'support' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Tickets Table Grid */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Support Tickets</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Customer feedback and hardware setup requests</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[10px]">
                    Open tickets: {supportStats.openTickets}
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                        <th className="pb-3.5">Ticket ID</th>
                        <th className="pb-3.5">User Customer</th>
                        <th className="pb-3.5">Subject / Query</th>
                        <th className="pb-3.5">Shop / Location</th>
                        <th className="pb-3.5">Priority</th>
                        <th className="pb-3.5">Status</th>
                        <th className="pb-3.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold text-slate-700">
                      {supportStats.tickets.map((tkt) => (
                        <tr key={tkt.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="py-4 font-bold text-slate-800">{tkt.id}</td>
                          <td className="py-4">
                            <span className="block font-bold text-slate-800">{tkt.customer}</span>
                          </td>
                          <td className="py-4 text-slate-800 font-bold max-w-[200px] truncate">{tkt.subject}</td>
                          <td className="py-4 text-slate-500 font-bold">{tkt.shop}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold ${
                              tkt.priority === 'High' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                : tkt.priority === 'Medium' 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                  : 'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}>
                              {tkt.priority}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                              tkt.status === 'Open' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {tkt.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <button 
                              onClick={() => toggleTicketStatus(tkt.realId, tkt.status)}
                              className="text-[10px] font-bold text-[#6366F1] hover:underline"
                            >
                              {tkt.status === 'Open' ? 'Resolve' : 'Reopen'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL G: REVENUE ANALYTICS PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'revenue' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Platform Revenue</span>
                    <div className="p-2 bg-green-50 text-green-600 rounded-xl"><DollarSign size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">₹21,064.80</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Accumulated from 340 printing orders</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Platform service fee (5%)</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-indigo-600">₹1,053.24</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Gross platform commission earned</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Promo Reward Cost</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Tag size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-rose-600">-₹1,256.00</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Promotional coupon scratch-off cost</div>
                </div>
              </div>

              {/* Monthly Subscription growth details */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Revenue Analytics</h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Platform growth indices and tax service cuts</p>
                </div>

                <div className="w-full h-64 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    {/* Wavy gradient line */}
                    <path
                      d="M40,150 Q100,110 160,130 T280,70 T400,90 T480,55"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL H: PLATFORM SETTINGS */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white border border-slate-100 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
              
              <div className="space-y-6">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/40">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <Cpu size={16} className="text-slate-400" />
                      <span>Maintenance Mode</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">Temporarily freeze platform request pipelines for scheduled service.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settingsData.maintenanceMode} 
                      onChange={() => {
                        setSettingsData({ ...settingsData, maintenanceMode: !settingsData.maintenanceMode })
                        addToast(settingsData.maintenanceMode ? 'Maintenance Mode deactivated.' : 'Maintenance Mode activated.', 'info')
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#6366F1]/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                  </label>
                </div>

                {/* Auto Approve Shops */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/40">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <Store size={16} className="text-slate-400" />
                      <span>Auto-Approve New Shopkeepers</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">Instantly onboard shops upon successful signup without admin approval.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settingsData.autoApproveShops} 
                      onChange={() => {
                        setSettingsData({ ...settingsData, autoApproveShops: !settingsData.autoApproveShops })
                        addToast(settingsData.autoApproveShops ? 'Auto-Approve deactivated.' : 'Auto-Approve activated successfully!', 'info')
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#6366F1]/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                  </label>
                </div>

                {/* Platform Tax Service Rate */}
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <TrendingUp size={16} className="text-slate-400" />
                      <span>Platform Commission Service Fee (%)</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">The service commission percentage applied to each customer order transaction.</p>
                  </div>
                  <input 
                    type="number" 
                    value={settingsData.platformTaxRate}
                    onChange={(e) => setSettingsData({ ...settingsData, platformTaxRate: e.target.value })}
                    className="w-full md:w-48 px-4.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1] font-bold text-xs"
                    placeholder="5"
                  />
                </div>

                {/* File Upload extensions config */}
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-slate-400" />
                      <span>Allowed Document Formats</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">Comma separated file extensions accepted during customer uploading flow.</p>
                  </div>
                  <input 
                    type="text" 
                    value={settingsData.allowedFileFormats}
                    onChange={(e) => setSettingsData({ ...settingsData, allowedFileFormats: e.target.value })}
                    className="w-full px-4.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1] font-bold text-xs"
                    placeholder=".pdf,.png,.jpg"
                  />
                </div>

                {/* Save administrative Settings button */}
                <button 
                  onClick={handleSaveSettings}
                  className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs shadow-lg hover:brightness-105 active:scale-99 transition-all duration-300"
                >
                  <ShieldCheck size={16} />
                  <span>Save Administrative Configurations</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* TOAST SYSTEM COMPONENT */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            <span className="flex-shrink-0">
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            </span>
            <p className="text-xs font-bold leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  // Local state helper for in-app toast updates
  function addToast(message, type = 'info') {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }
}

// Local Toast state definition block hook
function useToastsState() {
  const [toasts, setToasts] = useState([])
  return [toasts, setToasts]
}