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
  Maximize2,
  Gift,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  HelpCircle,
  Share,
  Download,
  SlidersHorizontal,
  Trash,
  MoreVertical,
  Pencil,
  Eye,
  MessageCircle
} from 'lucide-react'
import AdminSidebar from './_components/AdminSidebar'
import StatCard from './_components/StatCard'
import PlatformGrowthChart from './_components/PlatformGrowthChart'
import RewardsAnalyticsChart from './_components/RewardsAnalyticsChart'
import AIUsageOverview from './_components/AIUsageOverview'

const formatRevenue = (value) => {
  if (value === undefined || value === null) return '₹0';
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
};

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const [adminName, setAdminName] = useState('Jayant')
  const [adminRole, setAdminRole] = useState('Founder')
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [adminLogs, setAdminLogs] = useState([])
  const [selectedShopId, setSelectedShopId] = useState(null)
  const [shopStatusFilter, setShopStatusFilter] = useState('ALL')
  const [shopPlanFilter, setShopPlanFilter] = useState('ALL')
  const [shopCityFilter, setShopCityFilter] = useState('ALL')
  const [shopJoinFilter, setShopJoinFilter] = useState('ALL')
  
  // Date Range selector state
  const [dateRange, setDateRange] = useState('May 12 - May 18, 2026')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // API Linked States
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [users, setUsers] = useState([])
  const [shops, setShops] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [couponsList, setCouponsList] = useState([])
  const [feedbackList, setFeedbackList] = useState([])
  const [shopOrdersDetail, setShopOrdersDetail] = useState(null)
  const [shopOrdersLoading, setShopOrdersLoading] = useState(false)
  
  // Loader States
  const [statsLoading, setStatsLoading] = useState(false)
  const [usersShopsLoading, setUsersShopsLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';
  console.log('Active API URL (Admin):', apiUrl);

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [shopFilter, setShopFilter] = useState('ALL') // 'ALL' | 'APPROVED' | 'PENDING'
  const [orderFilter, setOrderFilter] = useState('ALL') // 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  const [userFilter, setUserFilter] = useState('ALL') // 'ALL' | 'ENGLISH' | 'HINDI'

  // Tab: Settings state
  const [settingsData, setSettingsData] = useState({
    maintenanceMode: false,
    autoApproveShops: true,
    platformTaxRate: '5',
    allowedFileFormats: '.pdf,.png,.jpg',
  })

  // Detailed Settings states matching mockup
  const [couponSystemStatus, setCouponSystemStatus] = useState(true)
  const [freePrintCardStatus, setFreePrintCardStatus] = useState(true)
  const [halfOffCardStatus, setHalfOffCardStatus] = useState(true)
  const [monetaryCouponsStatus, setMonetaryCouponsStatus] = useState(true)
  const [aiStudioStatus, setAiStudioStatus] = useState(true)
  const [aiPosterMakerStatus, setAiPosterMakerStatus] = useState(true)
  const [aiBannerMakerStatus, setAiBannerMakerStatus] = useState(true)
  const [aiImageEnhancerStatus, setAiImageEnhancerStatus] = useState(true)
  const [dailyAiLimit, setDailyAiLimit] = useState('10000')
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are improving PrintSmart. Please visit again shortly.')

  // CRUD Dialog Modal States
  const [isShopModalOpen, setIsShopModalOpen] = useState(false)
  const [editingShop, setEditingShop] = useState(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)

  const logAdminAction = (action) => {
    const name = localStorage.getItem('adminName') || 'Unknown Admin'
    const email = localStorage.getItem('adminEmail') || ''
    const currentLogs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]')
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    const formattedDate = new Date().toLocaleDateString('en-US', options)
    
    const newLog = {
      id: 'LOG-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      adminName: name,
      adminEmail: email,
      action: action,
      timestamp: formattedDate
    }
    
    localStorage.setItem('adminActivityLogs', JSON.stringify([newLog, ...currentLogs].slice(0, 50)))
  }

  // Basic check for admin session
  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) {
      router.push('/admin')
      return
    }
    const name = localStorage.getItem('adminName')
    const role = localStorage.getItem('adminRole')
    if (name) setAdminName(name)
    if (role) setAdminRole(role)
    setLoading(false)

    if (!sessionStorage.getItem('adminSessionLogged')) {
      logAdminAction('Signed in to admin dashboard')
      sessionStorage.setItem('adminSessionLogged', 'true')
    }
  }, [router])

  // Reload logs when modal is opened
  useEffect(() => {
    if (isLogsModalOpen) {
      const logs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]')
      setAdminLogs(logs)
    }
  }, [isLogsModalOpen])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/settings`)
      if (res.ok) {
        const data = await res.json()
        setSettingsData({
          maintenanceMode: data.maintenanceMode === true || data.maintenanceMode === 'true',
          autoApproveShops: data.autoApproveShops === true || data.autoApproveShops === 'true',
          platformTaxRate: String(data.platformTaxRate || '5'),
          allowedFileFormats: String(data.allowedFileFormats || '.pdf,.png,.jpg'),
        })
      }
    } catch (err) {
      console.error('Failed to fetch platform settings', err)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...settingsData,
          dailyAiLimit,
          maintenanceMessage
        })
      })
      if (res.ok) {
        logAdminAction('Saved administrative configurations')
        addToast('Administrative system configurations updated successfully!', 'success')
      } else {
        addToast('Failed to save settings', 'error')
      }
    } catch (err) {
      console.error('Failed to save settings', err)
      addToast('Error saving settings', 'error')
    }
  }

  const fetchFeedback = async () => {
    setFeedbackLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/admin/feedback`)
      if (res.ok) {
        const data = await res.json()
        setFeedbackList(Array.isArray(data.feedback) ? data.feedback : [])
      }
    } catch (err) {
      console.error('Failed to fetch support feedback', err)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleUpdateFeedbackStatus = async (feedbackId, nextStatus) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      if (res.ok) {
        addToast('Feedback status updated!', 'success')
        fetchFeedback()
      } else {
        addToast('Failed to update status', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error updating status', 'error')
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this support feedback?')) return
    try {
      const res = await fetch(`${apiUrl}/api/admin/feedback/${feedbackId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        addToast('Feedback deleted!', 'success')
        fetchFeedback()
      } else {
        addToast('Failed to delete feedback', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error deleting feedback', 'error')
    }
  }

  const fetchCoupons = async () => {
    setCouponsLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/admin/coupons`)
      if (res.ok) {
        const data = await res.json()
        setCouponsList(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch coupons', err)
    } finally {
      setCouponsLoading(false)
    }
  }

  const handleSaveUser = async (userForm) => {
    try {
      const isEdit = !!editingUser
      const url = isEdit ? `${apiUrl}/api/admin/users/${editingUser.id}` : `${apiUrl}/api/admin/users`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })
      if (res.ok) {
        addToast(isEdit ? 'User updated successfully!' : 'User created successfully!', 'success')
        setIsUserModalOpen(false)
        setEditingUser(null)
        const usersRes = await fetch(`${apiUrl}/api/admin/users`)
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(Array.isArray(usersData) ? usersData : [])
        }
      } else {
        const data = await res.json()
        addToast(data.message || 'Failed to save user', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error saving user', 'error')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        addToast('User deleted successfully', 'success')
        setUsers(users.filter(u => u.id !== userId))
      } else {
        addToast('Failed to delete user', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error deleting user', 'error')
    }
  }

  const handleSaveShop = async (shopForm) => {
    try {
      const isEdit = !!editingShop
      const url = isEdit ? `${apiUrl}/api/admin/shops/${editingShop.id}` : `${apiUrl}/api/admin/shops`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopForm)
      })
      if (res.ok) {
        logAdminAction(isEdit ? `Updated shop: ${shopForm.shopName}` : `Created new shop: ${shopForm.shopName}`)
        addToast(isEdit ? 'Shop updated successfully!' : 'Shop created successfully!', 'success')
        setIsShopModalOpen(false)
        setEditingShop(null)
        const shopsRes = await fetch(`${apiUrl}/api/admin/shops`)
        if (shopsRes.ok) {
          const shopsData = await shopsRes.json()
          setShops(Array.isArray(shopsData) ? shopsData : [])
        }
      } else {
        const data = await res.json()
        addToast(data.message || 'Failed to save shop', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error saving shop', 'error')
    }
  }

  const handleDeleteShop = async (shopId) => {
    if (!confirm('Are you sure you want to delete this shop?')) return
    try {
      const res = await fetch(`${apiUrl}/api/admin/shops/${shopId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        logAdminAction(`Deleted shop ID: ${shopId}`)
        addToast('Shop deleted successfully', 'success')
        setShops(shops.filter(s => s.id !== shopId))
      } else {
        addToast('Failed to delete shop', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error deleting shop', 'error')
    }
  }

  const handleSaveCoupon = async (couponForm) => {
    try {
      const isEdit = !!editingCoupon
      const url = isEdit ? `${apiUrl}/api/admin/coupons/${editingCoupon.id}` : `${apiUrl}/api/admin/coupons`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm)
      })
      if (res.ok) {
        logAdminAction(isEdit ? `Updated coupon: ${couponForm.code}` : `Created new coupon: ${couponForm.code}`)
        addToast(isEdit ? 'Coupon updated successfully!' : 'Coupon created successfully!', 'success')
        setIsCouponModalOpen(false)
        setEditingCoupon(null)
        fetchCoupons()
      } else {
        const data = await res.json()
        addToast(data.message || 'Failed to save coupon', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error saving coupon', 'error')
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      const res = await fetch(`${apiUrl}/api/admin/coupons/${couponId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        logAdminAction(`Deleted coupon ID: ${couponId}`)
        addToast('Coupon deleted successfully', 'success')
        setCouponsList(couponsList.filter(c => c.id !== couponId))
      } else {
        addToast('Failed to delete coupon', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast('Error deleting coupon', 'error')
    }
  }

  // Fetch data depending on active tab
  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) return

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

    if (activeTab === 'dashboard' || activeTab === 'revenue') {
      fetchDashboard()
      fetchAnalytics()
    } else if (activeTab === 'shops' || activeTab === 'orders' || activeTab === 'users') {
      fetchUsersAndShops()
    } else if (activeTab === 'analytics' || activeTab === 'ai') {
      fetchAnalytics()
    } else if (activeTab === 'settings') {
      fetchSettings()
    } else if (activeTab === 'coupons') {
      fetchCoupons()
    } else if (activeTab === 'support') {
      fetchFeedback()
    }
  }, [activeTab])

  // Fetch detailed shop orders and daily stats when a shop is selected
  useEffect(() => {
    if (!selectedShopId) {
      setShopOrdersDetail(null)
      return
    }
    const fetchShopOrders = async () => {
      setShopOrdersLoading(true)
      try {
        const res = await fetch(`${apiUrl}/api/admin/shops/${selectedShopId}/orders-detail`)
        if (res.ok) {
          const data = await res.json()
          setShopOrdersDetail(data)
        }
      } catch (err) {
        console.error('Error fetching shop orders detail:', err)
      } finally {
        setShopOrdersLoading(false)
      }
    }
    fetchShopOrders()
  }, [selectedShopId])

  // Onboard status change trigger
  const toggleOnboarding = async (shopId) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/shops/${shopId}/onboard`, {
        method: 'PUT'
      })
      if (res.ok) {
        logAdminAction(`Toggled onboarding status for shop ID: ${shopId}`)
        setShops(shops.map(shop => 
          shop.id === shopId ? { ...shop, isOnboarded: !shop.isOnboarded } : shop
        ))
      }
    } catch (err) {
      console.error('Failed to toggle shop onboarding:', err)
    }
  }

  const handleLogout = () => {
    logAdminAction('Signed out of admin dashboard')
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('adminName')
    localStorage.removeItem('adminRole')
    sessionStorage.removeItem('adminSessionLogged')
    router.push('/admin')
  }

  // ----------------------------------------------------
  // HIGH-QUALITY DUMMY DATA FOR PLATFORM telemetries
  // ----------------------------------------------------
  
  // TODO: Connect AI Usage panels to backend aggregated logs when ready
  const aiStats = useMemo(() => ({
    posterMaker: 1240,
    bgRemover: 3820,
    bannerMaker: 850,
    imageEnhancer: 1980,
    textToImage: 1150,
    failedJobs: 4,
    recentGenerations: [
      { id: 'GEN-849', tool: 'AI Poster Maker', shop: 'Yash Digital Prints', time: '10 mins ago', status: 'Success' },
      { id: 'GEN-848', tool: 'Background Remover', shop: 'Creative Print Hub', time: '23 mins ago', status: 'Success' },
      { id: 'GEN-847', tool: 'Banner Generator', shop: 'Smart Xerox Center', time: '1 hour ago', status: 'Success' },
      { id: 'GEN-846', tool: 'AI Poster Maker', shop: 'Print Point', time: '2 hours ago', status: 'Failed' },
    ]
  }), [])

  // TODO: Connect Coupons & Rewards telemetry to backend model when available
  const couponStats = useMemo(() => ({
    scratchCardsCount: 840,
    rewardsDistributed: 12560,
    couponUsageTrend: [
      { date: 'May 12', usage: 42 },
      { date: 'May 13', usage: 55 },
      { date: 'May 14', usage: 68 },
      { date: 'May 15', usage: 50 },
      { date: 'May 16', usage: 82 },
      { date: 'May 17', usage: 95 },
      { date: 'May 18', usage: 110 }
    ],
    shopWiseCoupons: [
      { shopName: 'Yash Digital Prints', couponsUsed: 220, discountAmount: 4400 },
      { shopName: 'Creative Print Hub', couponsUsed: 180, discountAmount: 3600 },
      { shopName: 'Smart Xerox Center', couponsUsed: 140, discountAmount: 2800 },
      { shopName: 'Print Point', couponsUsed: 95, discountAmount: 1900 },
    ]
  }), [])

  // TODO: Integrate support tickets table to live db models
  const supportStats = useMemo(() => ({
    openTickets: 5,
    closedTickets: 24,
    tickets: [
      { id: 'TKT-101', customer: 'Rohan Sharma', subject: 'Refund request for cancelled order', shop: 'Yash Digital Prints', priority: 'High', status: 'Open', time: '2 hours ago' },
      { id: 'TKT-102', customer: 'Amit Patel', subject: 'Printer connection failure via USB', shop: 'Creative Print Hub', priority: 'High', status: 'Open', time: '4 hours ago' },
      { id: 'TKT-103', customer: 'Sita Gupta', subject: 'Coupon discount not applied', shop: 'Smart Xerox Center', priority: 'Medium', status: 'Open', time: '1 day ago' },
      { id: 'TKT-104', customer: 'Vijay Shah', subject: 'Invoice PDF download failing', shop: 'Print Point', priority: 'Low', status: 'Closed', time: '2 days ago' },
      { id: 'TKT-105', customer: 'Neha Patel', subject: 'Paper size dimensions configuration', shop: 'Quick Print Shop', priority: 'Low', status: 'Closed', time: '3 days ago' },
    ]
  }), [])

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
        (shop.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.shopkeeperIdCode || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      // Status Filter
      if (shopStatusFilter !== 'ALL') {
        const isActive = shop.isOnboarded;
        if (shopStatusFilter === 'ACTIVE' && !isActive) return false;
        if (shopStatusFilter === 'INACTIVE' && isActive) return false;
      }

      // Plan Filter
      if (shopPlanFilter !== 'ALL') {
        const isPremium = shop.totalOrders >= 40 || shop.totalEarnings > 5000;
        if (shopPlanFilter === 'PREMIUM' && !isPremium) return false;
        if (shopPlanFilter === 'FREE' && isPremium) return false;
      }

      // City Filter
      if (shopCityFilter !== 'ALL') {
        const city = (shop.address || '').split(',')[0].trim().toLowerCase();
        if (city !== shopCityFilter.toLowerCase()) return false;
      }

      // Join Date Filter
      if (shopJoinFilter !== 'ALL') {
        const diffDays = (new Date() - new Date(shop.createdAt)) / (1000 * 60 * 60 * 24);
        if (shopJoinFilter === 'TODAY' && diffDays > 1) return false;
        if (shopJoinFilter === 'WEEK' && diffDays > 7) return false;
        if (shopJoinFilter === 'MONTH' && diffDays > 30) return false;
      }
      
      // Support old tab filter for backwards compatibility
      if (shopFilter === 'APPROVED' && !shop.isOnboarded) return false;
      if (shopFilter === 'PENDING' && shop.isOnboarded) return false;

      return matchesSearch
    })
  }, [shops, searchQuery, shopFilter, shopStatusFilter, shopPlanFilter, shopCityFilter, shopJoinFilter])

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
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onShowLogs={() => setIsLogsModalOpen(true)} />
      
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
              <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 font-black text-sm shadow-sm group-hover:scale-105 transition">
                {adminName ? adminName[0].toUpperCase() : 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>{adminName}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </p>
                <p className="text-[10px] text-slate-400 font-extrabold">{adminRole}</p>
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
            <div className="space-y-8 animate-fadeIn text-slate-700">
              
              {/* TOP SECTION: WELCOME BANNER & TODAY'S SUMMARY */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Welcome Card */}
                <div className="lg:col-span-2 bg-gradient-to-r from-violet-50 via-indigo-50 to-slate-50 border border-slate-100 rounded-[28px] p-8 flex items-center justify-between min-h-[200px] shadow-sm relative overflow-hidden group">
                  <div className="space-y-4 max-w-md relative z-10">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                      Welcome back, {adminName}! 👋
                    </h2>
                    <p className="text-xs font-black text-violet-600 uppercase tracking-widest">
                      Welcome to PrintSmart Control Center
                    </p>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      Monitor your platform performance, manage shops, rewards, AI usage and much more.
                    </p>
                    <button 
                      onClick={() => addToast('Opening detailed analytics summary...', 'info')}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-violet-600/20 active:scale-98 transition-all duration-300"
                    >
                      View Analytics
                    </button>
                  </div>

                  {/* 3D-style abstract graphic SVG */}
                  <div className="hidden md:block pr-4 relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <svg viewBox="0 0 200 120" className="w-52 h-auto drop-shadow-md">
                      <defs>
                        <linearGradient id="cylinderGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="50%" stopColor="#A78BFA" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                        <linearGradient id="donutGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C084FC" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="140" cy="60" rx="32" ry="18" fill="none" stroke="url(#donutGrad)" strokeWidth="8" strokeDasharray="120 40" />
                      <ellipse cx="140" cy="63" rx="32" ry="18" fill="none" stroke="#4F46E5" strokeWidth="8" strokeDasharray="70 90" opacity="0.3" />
                      <path d="M30,90 L30,45 A8,4 0 0,1 46,45 L46,90 A8,4 0 0,1 30,90 Z" fill="url(#cylinderGrad)" />
                      <ellipse cx="38" cy="45" rx="8" ry="4" fill="#C084FC" />
                      <path d="M60,90 L60,30 A8,4 0 0,1 76,30 L76,90 A8,4 0 0,1 60,90 Z" fill="url(#cylinderGrad)" />
                      <ellipse cx="68" cy="30" rx="8" ry="4" fill="#C084FC" />
                      <path d="M90,95 L90,55 A8,4 0 0,1 106,55 L106,95 A8,4 0 0,1 90,95 Z" fill="url(#cylinderGrad)" />
                      <ellipse cx="98" cy="55" rx="8" ry="4" fill="#C084FC" />
                    </svg>
                  </div>
                </div>

                {/* Today's Summary Card */}
                <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                    <Activity size={16} className="text-violet-600" />
                    <h3 className="text-xs font-bold text-slate-800">Today's Summary</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Active Shops', val: stats?.today?.activeShops !== undefined ? stats.today.activeShops.toString() : '0', color: 'text-emerald-600 bg-emerald-50' },
                      { label: 'Orders', val: stats?.today?.orders !== undefined ? stats.today.orders.toString() : '0', color: 'text-blue-600 bg-blue-50' },
                      { label: 'AI Jobs', val: stats?.today?.aiJobs !== undefined ? stats.today.aiJobs.toString() : '0', color: 'text-violet-600 bg-violet-50' },
                      { label: 'Revenue', val: stats?.today?.revenue !== undefined ? `₹${stats.today.revenue.toLocaleString()}` : '₹0', color: 'text-pink-600 bg-pink-50' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.color.replace('bg-', 'bg-')}`} />
                          <span className="text-sm font-black text-slate-800">{item.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* TOP KPI STRIP (8 metric cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  {
                    title: 'Total Shops',
                    value: stats?.totalShopkeepers !== undefined ? stats.totalShopkeepers.toString() : '0',
                    icon: Store,
                    trend: stats?.trends?.shops ?? '0.0%',
                    trendText: 'vs last month',
                    trendUp: stats?.trends?.shopsUp ?? true,
                    color: 'text-purple-600 bg-purple-50'
                  },
                  {
                    title: 'Active Shops',
                    value: stats?.activeShops !== undefined ? stats.activeShops.toString() : '0',
                    icon: Activity,
                    trend: stats?.trends?.activeShops ?? '0.0%',
                    trendText: 'vs yesterday',
                    trendUp: stats?.trends?.activeShopsUp ?? true,
                    color: 'text-emerald-600 bg-emerald-50'
                  },
                  {
                    title: 'Total Orders',
                    value: stats?.totalOrders !== undefined ? stats.totalOrders.toLocaleString() : '0',
                    icon: ShoppingCart,
                    trend: stats?.trends?.orders ?? '0.0%',
                    trendText: 'vs last month',
                    trendUp: stats?.trends?.ordersUp ?? true,
                    color: 'text-blue-600 bg-blue-50'
                  },
                  {
                    title: 'Monthly Rev',
                    value: stats?.monthlyRevenue !== undefined ? formatRevenue(stats.monthlyRevenue) : '₹0',
                    icon: DollarSign,
                    trend: stats?.trends?.revenue ?? '0.0%',
                    trendText: 'vs last month',
                    trendUp: stats?.trends?.revenueUp ?? true,
                    color: 'text-pink-600 bg-pink-50'
                  },
                  {
                    title: 'Rewards Gen',
                    value: stats?.scratchCardsGenerated !== undefined ? stats.scratchCardsGenerated.toLocaleString() : '0',
                    icon: Gift,
                    trend: stats?.trends?.rewards ?? '0.0%',
                    trendText: 'vs last month',
                    trendUp: stats?.trends?.rewardsUp ?? true,
                    color: 'text-orange-600 bg-orange-50'
                  },
                  {
                    title: 'AI Gen Runs',
                    value: stats?.aiGenRuns !== undefined ? stats.aiGenRuns.toLocaleString() : '0',
                    icon: Sparkles,
                    trend: stats?.trends?.ai ?? '0.0%',
                    trendText: 'vs last month',
                    trendUp: stats?.trends?.aiUp ?? true,
                    color: 'text-indigo-600 bg-indigo-50'
                  },
                  {
                    title: 'Open Tickets',
                    value: stats?.openTickets !== undefined ? stats.openTickets.toString() : '0',
                    icon: MessageSquare,
                    trend: stats?.openTickets > 0 ? 'Support' : 'Clean',
                    trendText: 'Tickets',
                    trendUp: stats?.openTickets === 0,
                    color: 'text-rose-600 bg-rose-50'
                  },
                  {
                    title: 'Alerts',
                    value: stats?.alertsCount !== undefined ? stats.alertsCount.toString() : '0',
                    icon: AlertTriangle,
                    trend: stats?.alertsCount > 0 ? 'Attention' : 'Clean',
                    trendText: stats?.alertsCount > 0 ? 'Needs review' : 'No warnings',
                    trendUp: stats?.alertsCount === 0,
                    color: 'text-amber-600 bg-amber-50'
                  }
                ].map((kpi, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block truncate max-w-[80px]">{kpi.title}</span>
                      <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                        <kpi.icon size={12} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">{kpi.value}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[8px] font-black ${kpi.trend === 'Attention' || kpi.trend === 'Support' ? 'text-rose-600' : kpi.trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {kpi.trend}
                        </span>
                        <span className="text-[7px] text-slate-400 font-bold block truncate max-w-[50px]">{kpi.trendText}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MIDDLE SECTION: GRAPH & LIVE ACTIVITY FEED */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Platform Growth Chart */}
                <div className="lg:col-span-8">
                  <PlatformGrowthChart apiUrl={apiUrl} />
                </div>

                {/* Live Activity Feed */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between min-h-[380px] hover:shadow-md transition duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Live Activity</h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Real-time platform action timeline</p>
                    </div>
                    <button 
                      onClick={() => addToast('Displaying complete system activities...', 'info')}
                      className="text-violet-600 text-xs font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[280px] pr-1.5">
                    {[
                      { text: 'New shop "Shree Graphics" joined', time: '2 mins ago', color: 'border-emerald-500 bg-emerald-50 text-emerald-600', icon: PlusCircle },
                      { text: 'AI Poster generated by Ganesh Xerox', time: '5 mins ago', color: 'border-violet-500 bg-violet-50 text-violet-600', icon: Sparkles },
                      { text: 'Reward scratched by Customer (₹50 OFF)', time: '8 mins ago', color: 'border-amber-500 bg-amber-50 text-amber-600', icon: Gift },
                      { text: 'Subscription activated by Modern Prints', time: '15 mins ago', color: 'border-blue-500 bg-blue-50 text-blue-600', icon: CheckCircle2 },
                      { text: 'Support ticket created by Smart Print Hub', time: '20 mins ago', color: 'border-rose-500 bg-rose-50 text-rose-600', icon: HelpCircle },
                      { text: 'Coupon generated for 50% OFF', time: '25 mins ago', color: 'border-pink-500 bg-pink-50 text-pink-600', icon: Tag }
                    ].map((act, i) => (
                      <div key={i} className="flex gap-3 text-xs leading-normal">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${act.color.split(' ')[0]} ${act.color.split(' ')[1]}`}>
                          <act.icon size={14} className={act.color.split(' ')[2]} />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <p className="font-bold text-slate-700">{act.text}</p>
                          <span className="block text-[9px] text-slate-400 font-extrabold">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* BOTTOM SECTION: DEEP DIVES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Top Performing Shops */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Top Performing Shops</h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Highest order volume generators</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('shops')}
                      className="text-violet-600 text-xs font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto no-scrollbar flex-1 py-2">
                    <table className="w-full text-left border-collapse min-w-[340px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[8px] font-black">
                          <th className="pb-2">Shop Name</th>
                          <th className="pb-2 text-right">Orders</th>
                          <th className="pb-2 text-right">Revenue</th>
                          <th className="pb-2 text-right">Rewards</th>
                          <th className="pb-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] font-bold text-slate-600">
                        {(shops.length > 0 ? shops : [
                          { shopName: 'Ganesh Xerox', address: 'Pune', totalOrders: 412, totalEarnings: 8200, isOnboarded: true },
                          { shopName: 'Smart Prints', address: 'Mumbai', totalOrders: 382, totalEarnings: 7800, isOnboarded: true },
                          { shopName: 'Modern Graphics', address: 'Nagpur', totalOrders: 298, totalEarnings: 5600, isOnboarded: true },
                          { shopName: 'Fast Copy Center', address: 'Nashik', totalOrders: 243, totalEarnings: 4300, isOnboarded: true }
                        ]).slice(0, 4).map((shop, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                            <td className="py-2.5">
                              <span className="block font-black text-slate-800 leading-tight">{shop.shopName}</span>
                              <span className="text-[8px] text-slate-400 font-semibold block">{shop.address?.split(',')[0] || 'Maharashtra'}</span>
                            </td>
                            <td className="py-2.5 text-right font-black">{shop.totalOrders || 24}</td>
                            <td className="py-2.5 text-right font-black text-slate-800">₹{(shop.totalEarnings || 240).toLocaleString()}</td>
                            <td className="py-2.5 text-right text-slate-400">{Math.floor((shop.totalOrders || 24) * 0.15) || 5}</td>
                            <td className="py-2.5 text-center">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black rounded-md">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rewards Donut Chart */}
                <div className="lg:col-span-4">
                  <RewardsAnalyticsChart 
                    totalRewards={stats?.scratchCardsGenerated || 92821} 
                    rewardCost={stats?.couponsRedeemed ? (stats.couponsRedeemed * 10) : 2140} 
                  />
                </div>

                {/* AI Progress Overview */}
                <div className="lg:col-span-3">
                  <AIUsageOverview stats={stats} />
                </div>

              </div>

              {/* FOOTER SECTION: IMPORTANT ALERTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Alerts Card 1 */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
                  <div className="space-y-2">
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg w-fit"><AlertTriangle size={14} /></div>
                    <h4 className="text-xs font-black text-slate-800">Subscription Expiring</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">12 shops subscription expiring in 3 days</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('shops'); addToast('Showing shops list...', 'info') }}
                    className="text-[#6366F1] hover:text-[#4F46E5] text-[9px] font-black flex items-center gap-1 mt-3"
                  >
                    <span>View Shops</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {/* Alerts Card 2 */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
                  <div className="space-y-2">
                    <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg w-fit"><Cpu size={14} /></div>
                    <h4 className="text-xs font-black text-slate-800">AI API Usage High</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">AI generations limit reaching 80% of node limits</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('ai'); addToast('Loading AI settings details...', 'info') }}
                    className="text-[#6366F1] hover:text-[#4F46E5] text-[9px] font-black flex items-center gap-1 mt-3"
                  >
                    <span>View Details</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {/* Alerts Card 3 */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
                  <div className="space-y-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg w-fit"><HelpCircle size={14} /></div>
                    <h4 className="text-xs font-black text-slate-800">Support Tickets Pending</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">8 tickets waiting for platform admin response</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('support'); addToast('Loading support ticket dashboard...', 'info') }}
                    className="text-[#6366F1] hover:text-[#4F46E5] text-[9px] font-black flex items-center gap-1 mt-3"
                  >
                    <span>View Tickets</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {/* Alerts Card 4 */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
                  <div className="space-y-2">
                    <div className="p-1.5 bg-pink-50 text-pink-600 rounded-lg w-fit"><DollarSign size={14} /></div>
                    <h4 className="text-xs font-black text-slate-800">Revenue Collection Pending</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">₹12,450 payment pending invoice claims from 7 shops</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('revenue'); addToast('Opening revenue and invoicing claims...', 'info') }}
                    className="text-[#6366F1] hover:text-[#4F46E5] text-[9px] font-black flex items-center gap-1 mt-3"
                  >
                    <span>View Payments</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {/* Grow Your Platform Promotional Card */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:brightness-[1.02] transition-all">
                  <div className="space-y-1.5 relative z-10">
                    <h4 className="text-xs font-black">Grow Your Platform</h4>
                    <p className="text-[9px] text-indigo-100 font-semibold leading-normal">Unlock premium tools and detailed diagnostics.</p>
                  </div>
                  
                  {/* Floating rocket graphic */}
                  <div className="absolute right-1 bottom-1 w-20 h-20 opacity-20 pointer-events-none select-none">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-white">
                      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18Z" />
                    </svg>
                  </div>

                  <button 
                    onClick={() => addToast('PrintSmart premium package options loaded.', 'success')}
                    className="bg-white hover:bg-slate-50 text-indigo-700 px-3.5 py-2 rounded-xl font-bold text-[9px] tracking-wide shadow-md active:scale-98 transition relative z-10 w-fit mt-3"
                  >
                    Upgrade Now
                  </button>
                </div>

              </div>

            </div>
          )}
          {/* ---------------------------------------------------- */}
          {/* PANEL B: SHOPS LIST PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'shops' && (
            <div className="space-y-8 animate-fadeIn text-slate-700">
              
              {/* TITLE BAR SECTION */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">Shop Management</h1>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Manage and monitor all shop partners on PrintSmart platform
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setEditingShop(null); setIsShopModalOpen(true) }}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4.5 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-violet-600/20 active:scale-98 transition flex items-center gap-1.5"
                  >
                    <span>+ Add Shop</span>
                  </button>
                  <button 
                    onClick={() => addToast('Exporting shops CSV list...', 'success')}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Share size={13} />
                    <span>Export</span>
                  </button>
                  <button 
                    onClick={() => addToast('Broadcast announcement prompt...', 'info')}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Bell size={13} />
                    <span>Send Announcement</span>
                  </button>
                </div>
              </div>

              {/* KPI STRIP ROW (5 Metrics cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  {
                    title: 'Total Shops',
                    value: shops.length.toString(),
                    trend: '↗ 12.4% vs last month',
                    color: 'text-purple-600 bg-purple-50'
                  },
                  {
                    title: 'Active Shops',
                    value: shops.filter(s => s.isOnboarded).length.toString(),
                    trend: '↗ 8.7% vs yesterday',
                    color: 'text-emerald-600 bg-emerald-50'
                  },
                  {
                    title: 'New Shops (This Month)',
                    value: shops.filter(shop => {
                      if (!shop.createdAt) return false;
                      const createdAtDate = new Date(shop.createdAt);
                      const now = new Date();
                      return createdAtDate.getFullYear() === now.getFullYear() && createdAtDate.getMonth() === now.getMonth();
                    }).length.toString(),
                    trend: '↗ 18.6% vs last month',
                    color: 'text-blue-600 bg-blue-50'
                  },
                  {
                    title: 'Premium Shops',
                    value: shops.filter(s => s.totalOrders >= 40 || s.totalEarnings > 5000).length.toString(),
                    trend: '↗ 15.2% vs last month',
                    color: 'text-amber-600 bg-amber-50'
                  },
                  {
                    title: 'Inactive Shops',
                    value: shops.filter(s => !s.isOnboarded).length.toString(),
                    trend: '↘ 4.3% vs last month',
                    trendUp: false,
                    color: 'text-rose-600 bg-rose-50'
                  }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-24">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">{kpi.title}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-black text-slate-800">{kpi.value}</span>
                      <span className={`text-[8px] font-black ${kpi.trendUp === false ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {kpi.trend.split(' ')[0]} {kpi.trend.split(' ')[1]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* DUAL COLUMNS SIDE-BY-SIDE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Shops Table list */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                  
                  {/* Search and drop-down filters row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    {/* Search query box */}
                    <div className="sm:col-span-4 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search name, city or Shop ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white transition"
                      />
                    </div>

                    {/* Filter Status */}
                    <div className="sm:col-span-2">
                      <select 
                        value={shopStatusFilter} 
                        onChange={(e) => setShopStatusFilter(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="ALL">Status: All</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>

                    {/* Filter Plan */}
                    <div className="sm:col-span-2">
                      <select 
                        value={shopPlanFilter} 
                        onChange={(e) => setShopPlanFilter(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="ALL">Plan: All</option>
                        <option value="FREE">Free</option>
                        <option value="PREMIUM">Premium</option>
                      </select>
                    </div>

                    {/* Filter City */}
                    <div className="sm:col-span-2">
                      <select 
                        value={shopCityFilter} 
                        onChange={(e) => setShopCityFilter(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="ALL">City: All</option>
                        {Array.from(new Set(shops.map(s => (s.address || '').split(',')[0].trim()).filter(Boolean))).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Join Date */}
                    <div className="sm:col-span-2">
                      <select 
                        value={shopJoinFilter} 
                        onChange={(e) => setShopJoinFilter(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="ALL">Join Date: All</option>
                        <option value="TODAY">Joined Today</option>
                        <option value="WEEK">Last 7 Days</option>
                        <option value="MONTH">Last 30 Days</option>
                      </select>
                    </div>

                  </div>

                  {/* Dynamic Table list */}
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                          <th className="pb-3.5 pl-2"><input type="checkbox" className="rounded border-slate-300" /></th>
                          <th className="pb-3.5">Shop Details</th>
                          <th className="pb-3.5">State</th>
                          <th className="pb-3.5 text-right">Orders</th>
                          <th className="pb-3.5 text-right">Revenue</th>
                          <th className="pb-3.5 text-center">Plan</th>
                          <th className="pb-3.5 text-center">Status</th>
                          <th className="pb-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-slate-700">
                        {usersShopsLoading ? (
                          <tr>
                            <td colSpan="8" className="py-12 text-center text-slate-400 font-bold">Loading shop entries...</td>
                          </tr>
                        ) : filteredShopsList.length > 0 ? filteredShopsList.map((shop) => {
                          const isPremium = shop.totalOrders >= 40 || shop.totalEarnings > 5000;
                          const isSelected = selectedShopId === shop.id || (!selectedShopId && filteredShopsList[0]?.id === shop.id);
                          return (
                            <tr 
                              key={shop.id} 
                              onClick={() => setSelectedShopId(shop.id)}
                              className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                                isSelected ? 'bg-violet-50/40 hover:bg-violet-50/50' : ''
                              }`}
                            >
                              <td className="py-4.5 pl-2" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className="rounded border-slate-300" />
                              </td>
                              <td className="py-4.5 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-black shadow-inner-sm">
                                  {shop.shopName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="block font-black text-slate-800 leading-tight">{shop.shopName}</span>
                                  <span className="text-[10px] text-slate-400 font-bold block">{shop.ownerName || 'Unknown Owner'}</span>
                                </div>
                              </td>
                              <td className="py-4.5 text-slate-500 font-semibold">
                                {((shop.address || '').split(',')[1]?.trim() || 'Maharashtra').toLowerCase().includes('maharashtra') ? 'maharashtra' : ((shop.address || '').split(',')[1]?.trim() || 'Mahar.')}
                              </td>
                              <td className="py-4.5 text-right font-black text-slate-800">{shop.totalOrders}</td>
                              <td className="py-4.5 text-right font-black text-slate-900">₹{shop.totalEarnings.toLocaleString()}</td>
                              <td className="py-4.5 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  isPremium ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {isPremium ? 'Premium' : 'Free'}
                                </span>
                              </td>
                              <td className="py-4.5 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  shop.isOnboarded ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {shop.isOnboarded ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-4.5" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                  <button onClick={() => setSelectedShopId(shop.id)} className="p-1 hover:text-violet-600 transition" title="View details"><Eye size={13} /></button>
                                  <button onClick={() => { setEditingShop(shop); setIsShopModalOpen(true) }} className="p-1 hover:text-blue-600 transition" title="Edit"><Pencil size={13} /></button>
                                  <button onClick={() => addToast(`Opening chat support window for ${shop.shopName}...`, 'info')} className="p-1 hover:text-emerald-600 transition" title="Chat"><MessageCircle size={13} /></button>
                                  <button onClick={() => handleDeleteShop(shop.id)} className="p-1 hover:text-rose-600 transition" title="Delete"><Trash size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="8" className="py-12 text-center text-slate-400 font-bold">No shops recorded in database.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination widget */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
                    <span>Showing 1 to {filteredShopsList.length} of {shops.length} shops</span>
                    
                    <div className="flex items-center bg-slate-50 border border-slate-200/50 rounded-xl p-1 gap-1">
                      <button className="px-2.5 py-1 text-slate-400 hover:text-slate-700 text-[10px]">‹</button>
                      <button className="px-2.5 py-1 bg-violet-600 text-white rounded-lg shadow-sm text-[10px]">1</button>
                      <button className="px-2.5 py-1 hover:text-slate-700 text-[10px]">›</button>
                    </div>
                  </div>

                </div>

                {/* Right side: Detailed Shop Panel card */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6 hover:shadow-md transition duration-300">
                  {(() => {
                    const shop = shops.find(s => s.id === selectedShopId) || filteredShopsList[0] || null;
                    if (!shop) {
                      return (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-bold space-y-2">
                          <Store size={32} className="text-slate-300" />
                          <p>No shop selected</p>
                        </div>
                      )
                    }

                    const isPremium = shop.totalOrders >= 40 || shop.totalEarnings > 5000;
                    return (
                      <div className="space-y-6">
                        {/* Selected Header */}
                        <div className="flex items-start justify-between relative border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-base font-black shadow-inner-sm">
                              {shop.shopName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                              <h3 className="text-sm font-black text-slate-800">{shop.shopName}</h3>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${shop.isOnboarded ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span className="text-[10px] text-slate-400 font-bold">{shop.isOnboarded ? 'Active' : 'Inactive'}</span>
                              </div>
                              <span className="text-[9px] font-mono text-slate-400 block">ID: PS-{shop.shopkeeperIdCode || shop.id.substring(0, 5)}</span>
                            </div>
                          </div>
                          <button onClick={() => setSelectedShopId(null)} className="text-slate-300 hover:text-slate-500 font-bold text-sm">✕</button>
                        </div>

                        {/* Plan and Verified badges */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg ${
                            isPremium ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isPremium ? 'Premium Plan' : 'Free Plan'}
                          </span>
                          <span className="px-2.5 py-1 text-[9px] font-black bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={10} className="fill-emerald-100" />
                            <span>Verified</span>
                          </span>
                        </div>

                        {/* OWNER DETAILS Section */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Owner Details</h4>
                          
                          <div className="space-y-2 text-xs font-semibold text-slate-600">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Owner Name</span>
                              <span className="text-slate-800 font-black">{shop.ownerName || 'N/A'}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Phone Number</span>
                              <div className="flex items-center gap-1.5 text-slate-800 font-black">
                                <span>{shop.phone}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-slate-400">Email</span>
                              <span className="text-slate-800 font-black truncate max-w-[150px]">{shop.email}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-400">City</span>
                              <span className="text-slate-800 font-black">{(shop.address || 'Maharashtra').split(',')[0]}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-400">Joined On</span>
                              <span className="text-slate-800 font-black">
                                {new Date(shop.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PERFORMANCE OVERVIEW Section */}
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Performance Overview</h4>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                              <span className="text-[14px] font-black text-slate-800 block leading-tight">{shop.totalOrders}</span>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Total Orders</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                              <span className="text-[14px] font-black text-slate-800 block leading-tight">₹{shop.totalEarnings}</span>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Total Rev</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                              <span className="text-[14px] font-black text-slate-800 block leading-tight">
                                {shopOrdersDetail?.orders ? shopOrdersDetail.orders.filter(o => o.rewardLog).length : Math.floor(shop.totalOrders * 0.15)}
                              </span>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Rewards Given</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                              <span className="text-[14px] font-black text-slate-800 block leading-tight">
                                {shopOrdersDetail?.orders ? shopOrdersDetail.orders.filter(o => o.status === 'COMPLETED').length : shop.totalOrders}
                              </span>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Compl. Jobs</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                              <span className="text-[14px] font-black text-slate-800 block leading-tight">
                                {shop.totalOrders > 0 ? `${Math.round(((shopOrdersDetail?.orders ? shopOrdersDetail.orders.filter(o => o.status === 'COMPLETED').length : shop.totalOrders) / (shop.totalOrders || 1)) * 100)}%` : '100%'}
                              </span>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Comp. Rate</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                              <span className="text-[14px] font-black text-slate-800 block leading-tight">5.0 ★</span>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Rating</span>
                            </div>
                          </div>
                        </div>

                        {/* ORDERS PER DAY BREAKDOWN */}
                        {shopOrdersDetail?.dailyStats && (
                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Orders per Day (Last 14 Days)</h4>
                            <div className="space-y-2 text-xs font-semibold text-slate-600 max-h-[120px] overflow-y-auto pr-1 no-scrollbar">
                              {shopOrdersDetail.dailyStats.filter(d => d.count > 0).length > 0 ? (
                                shopOrdersDetail.dailyStats.filter(d => d.count > 0).map((day, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 text-[10px]">
                                    <span className="text-slate-500 font-bold">{day.date}</span>
                                    <span className="bg-violet-50 text-violet-700 font-black px-2 py-0.5 rounded text-[9px]">
                                      {day.count} orders • ₹{day.revenue}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-[9px] text-slate-400 font-bold italic block py-1">No orders recorded in the last 14 days</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* REAL-TIME PRINT SPECIFICATIONS & TIMES */}
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Recent Print Log & Times</h4>
                          {shopOrdersLoading ? (
                            <p className="text-[9px] text-slate-400 font-bold animate-pulse py-2">Loading orders detail...</p>
                          ) : shopOrdersDetail?.orders && shopOrdersDetail.orders.length > 0 ? (
                            <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1.5 no-scrollbar">
                              {shopOrdersDetail.orders.map((ord, idx) => {
                                const config = ord.printConfiguration || {};
                                const timeStr = new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                });
                                const dateStr = new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short'
                                });
                                return (
                                  <div key={idx} className="flex justify-between items-start text-[10px] border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                                    <div className="space-y-0.5 flex-1 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-extrabold text-slate-800">{ord.orderId || ord.id.substring(0, 8)}</span>
                                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-black ${
                                          ord.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                        }`}>{ord.status}</span>
                                      </div>
                                      <span className="text-slate-400 block font-bold">
                                        {config.copies || 1} copies • {config.printType || 'BW'} • {config.paperSize || 'A4'} • {config.sides || 'SINGLE'}
                                      </span>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                      <span className="block font-black text-slate-700 leading-none">{timeStr}</span>
                                      <span className="text-[7px] text-slate-400 font-extrabold block mt-0.5">{dateStr}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[9px] text-slate-400 font-bold italic py-2">No order logs found for this shop</p>
                          )}
                        </div>

                      </div>
                    )
                  })()}
                </div>

              </div>

              {/* BOTTOM SECTION: ANALYTICS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-8">
                
                {/* Top Revenue Shops ranking list */}
                <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-black text-slate-800">Top Revenue Shops</h3>
                      <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Ranking list based on gross billing</p>
                    </div>
                    <span className="text-[9px] font-black text-violet-600 uppercase">This Month</span>
                  </div>

                  <div className="space-y-3.5">
                    {shops.slice().sort((a,b) => b.totalEarnings - a.totalEarnings).slice(0, 5).map((shop, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-bold">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-black text-slate-400">{i + 1}</span>
                          <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-black shadow-inner-sm">
                            {shop.shopName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="block text-slate-800 font-extrabold">{shop.shopName}</span>
                            <span className="text-[9px] text-slate-400">{(shop.address || 'Maharashtra').split(',')[0]}</span>
                          </div>
                        </div>
                        <span className="font-black text-slate-800">₹{shop.totalEarnings.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Distribution Donut Chart (Replaces the Health Score chart) */}
                <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-black text-slate-800">Shops Plan Distribution</h3>
                      <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Ratio of active Premium vs Free tiers</p>
                    </div>
                  </div>

                  {(() => {
                    const total = shops.length || 1;
                    const premiumCount = shops.filter(s => s.totalOrders >= 40 || s.totalEarnings > 5000).length;
                    const freeCount = total - premiumCount;
                    const premiumPercent = Math.round((premiumCount / total) * 100);
                    const freePercent = 100 - premiumPercent;

                    const radius = 45;
                    const circumference = 2 * Math.PI * radius; // ~282.7
                    const strokePremium = (premiumPercent / 100) * circumference;

                    return (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-28 h-28">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                            <circle 
                              cx="56" 
                              cy="56" 
                              r={radius} 
                              fill="transparent" 
                              stroke="#8B5CF6" 
                              strokeWidth="10" 
                              strokeDasharray={`${strokePremium} ${circumference - strokePremium}`}
                              strokeDashoffset="0"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-xl font-black text-slate-800">{shops.length}</span>
                            <span className="text-[7px] text-slate-400 font-extrabold uppercase">Shops</span>
                          </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-2 text-[9px] font-bold">
                          <div className="p-2 bg-purple-50 rounded-xl flex items-center justify-between text-purple-700">
                            <span>Premium ({premiumCount})</span>
                            <span className="font-black">{premiumPercent}%</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-slate-600">
                            <span>Free ({freeCount})</span>
                            <span className="font-black">{freePercent}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Top Cities progress timeline */}
                <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-black text-slate-800">Shops by City</h3>
                      <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Top regional operational centers</p>
                    </div>
                    <span className="text-[9px] font-black text-violet-600 cursor-pointer hover:underline" onClick={() => addToast('Displaying all regional cities logs...', 'info')}>View All</span>
                  </div>

                  <div className="space-y-3.5">
                    {(() => {
                      const citiesMap = {};
                      shops.forEach(s => {
                        const city = (s.address || 'Maharashtra').split(',')[0].trim();
                        citiesMap[city] = (citiesMap[city] || 0) + 1;
                      });
                      const sortedCities = Object.entries(citiesMap).sort((a,b) => b[1] - a[1]).slice(0, 4);
                      const maxCityCount = sortedCities[0] ? sortedCities[0][1] : 10;

                      return sortedCities.map(([city, count], idx) => {
                        const widthPercent = Math.max(Math.round((count / maxCityCount) * 100), 20);
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                              <span>{city}</span>
                              <span className="font-black text-slate-800">{count} shops</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${widthPercent}%` }} />
                            </div>
                          </div>
                        )
                      });
                    })()}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PANEL NEW: USERS LIST PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Filter Tabs & Search query summary */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 shadow-inner-sm w-fit">
                  {[
                    { id: 'ALL', label: 'All Users' },
                    { id: 'ENGLISH', label: 'English UI' },
                    { id: 'HINDI', label: 'Hindi UI' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setUserFilter(f.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                        userFilter === f.id ? 'bg-[#6366F1] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditingUser(null); setIsUserModalOpen(true) }}
                    className="px-4 py-2 bg-[#6366F1] text-white font-bold rounded-xl text-xs hover:brightness-105 transition"
                  >
                    + Add New User
                  </button>
                  <div className="text-xs font-bold text-slate-400">
                    Showing {users.filter(u => {
                      const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
                      if (userFilter === 'ALL') return matchesSearch;
                      return matchesSearch && u.language === userFilter;
                    }).length} users total
                  </div>
                </div>
              </div>

              {/* Users list table details */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                        <th className="pb-3.5">User ID</th>
                        <th className="pb-3.5">Name</th>
                        <th className="pb-3.5">Email</th>
                        <th className="pb-3.5">Phone</th>
                        <th className="pb-3.5">Language</th>
                        <th className="pb-3.5">Date Joined</th>
                        <th className="pb-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold text-slate-700">
                      {users.length > 0 ? users.filter(u => {
                        const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
                        if (userFilter === 'ALL') return matchesSearch;
                        return matchesSearch && u.language === userFilter;
                      }).map((u) => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="py-4 font-mono text-slate-500 font-bold">{u.id.substring(0, 8)}...</td>
                          <td className="py-4 font-bold text-slate-800">{u.name || 'Anonymous User'}</td>
                          <td className="py-4 text-slate-600">{u.email}</td>
                          <td className="py-4 text-slate-500">{u.phone || 'N/A'}</td>
                          <td className="py-4 text-slate-500">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/50 rounded-md font-bold text-[10px]">
                              {u.language}
                            </span>
                          </td>
                          <td className="py-4 text-slate-400 font-bold">
                            {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => { setEditingUser(u); setIsUserModalOpen(true) }}
                                className="text-[11px] font-bold text-[#6366F1] hover:underline"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-[11px] font-bold text-rose-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">No users found in database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

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
                  <h3 className="text-2xl font-black text-slate-800">{stats?.scratchCardsGenerated || couponsList.length} cards</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Active in customer scratch screens</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Redeemed Coupons</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600">{stats?.couponsRedeemed || 0} cards</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Total promotional discounts applied</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reward Cost (Average)</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Ticket size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">₹{(stats?.couponsRedeemed ? (stats?.couponsRedeemed * 10) : 125.00).toFixed(2)}</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Discounts calculated dynamically (₹10/scratch)</div>
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

              {/* Coupons table details */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Reward Cards & Coupons</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">CRUD management for scratch card coupons</p>
                  </div>
                  <button
                    onClick={() => { setEditingCoupon(null); setIsCouponModalOpen(true) }}
                    className="px-4 py-2 bg-[#6366F1] text-white font-bold rounded-xl text-xs hover:brightness-105 transition"
                  >
                    + Create Coupon Code
                  </button>
                </div>

                {couponsLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                          <th className="pb-3.5">Coupon ID</th>
                          <th className="pb-3.5">Order ID</th>
                          <th className="pb-3.5">Shop ID</th>
                          <th className="pb-3.5">Reward Type</th>
                          <th className="pb-3.5">Category</th>
                          <th className="pb-3.5 text-center">Scratched</th>
                          <th className="pb-3.5 text-center">Applied</th>
                          <th className="pb-3.5">Message</th>
                          <th className="pb-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-slate-700">
                        {couponsList.length > 0 ? couponsList.map((cp) => (
                          <tr key={cp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                            <td className="py-4 font-bold text-slate-800">{cp.id.substring(0, 8)}...</td>
                            <td className="py-4 font-mono text-[11px] text-slate-500">{cp.orderId}</td>
                            <td className="py-4 font-mono text-[11px] text-slate-500">{cp.shopId}</td>
                            <td className="py-4 text-indigo-700 font-bold">{cp.rewardType}</td>
                            <td className="py-4">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                                {cp.rewardCategory}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cp.scratched ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'}`}>
                                {cp.scratched ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cp.applied ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                                {cp.applied ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-4 text-slate-500 italic max-w-[150px] truncate">{cp.rewardMessage || '—'}</td>
                            <td className="py-4">
                              <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => { setEditingCoupon(cp); setIsCouponModalOpen(true) }}
                                  className="text-[11px] font-bold text-[#6366F1] hover:underline"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteCoupon(cp.id)}
                                  className="text-[11px] font-bold text-rose-600 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="9" className="py-12 text-center text-slate-400 font-bold">No coupons found in database.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
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
                    Open tickets: {feedbackList.filter(f => f.status === 'OPEN').length}
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                        <th className="pb-3.5">Ticket ID</th>
                        <th className="pb-3.5">User Customer</th>
                        <th className="pb-3.5">Subject / Query</th>
                        <th className="pb-3.5">Message</th>
                        <th className="pb-3.5">Rating</th>
                        <th className="pb-3.5">Status</th>
                        <th className="pb-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold text-slate-700">
                      {feedbackLoading ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">Loading support feedback...</td>
                        </tr>
                      ) : feedbackList.length > 0 ? feedbackList.map((tkt) => (
                        <tr key={tkt.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="py-4 font-mono text-[11px] text-slate-500 font-bold">{tkt.id.substring(0, 8)}...</td>
                          <td className="py-4">
                            <span className="block font-bold text-slate-800">{tkt.user?.name || 'Customer'}</span>
                            <span className="text-[10px] text-slate-400 font-bold block">{tkt.user?.email || 'N/A'}</span>
                          </td>
                          <td className="py-4 text-slate-800 font-bold max-w-[150px] truncate" title={tkt.subject}>{tkt.subject}</td>
                          <td className="py-4 text-slate-500 font-semibold max-w-[200px] truncate" title={tkt.message}>{tkt.message}</td>
                          <td className="py-4 font-bold text-amber-500">
                            {tkt.rating ? `${'★'.repeat(tkt.rating)}${'☆'.repeat(5 - tkt.rating)}` : '—'}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                              tkt.status === 'OPEN' 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                : tkt.status === 'IN_PROGRESS'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {tkt.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-3">
                              {tkt.status !== 'RESOLVED' && (
                                <button 
                                  onClick={() => handleUpdateFeedbackStatus(tkt.id, 'RESOLVED')}
                                  className="text-[10px] font-bold text-green-600 hover:underline"
                                >
                                  Resolve
                                </button>
                              )}
                              {tkt.status === 'OPEN' && (
                                <button 
                                  onClick={() => handleUpdateFeedbackStatus(tkt.id, 'IN_PROGRESS')}
                                  className="text-[10px] font-bold text-amber-600 hover:underline"
                                >
                                  Progress
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteFeedback(tkt.id)}
                                className="text-[10px] font-bold text-rose-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">No feedback submissions found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

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
            <div className="space-y-8 animate-fadeIn text-slate-700 max-w-5xl">
              
              {/* TITLE AND HEADER DESCRIPTION */}
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Settings</h1>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Manage platform preferences and configurations
                </p>
              </div>

              {/* CARD 1: ADMIN ACCOUNT */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm space-y-4 hover:shadow-md transition duration-300">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl"><Users size={18} /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Admin Account</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Manage your admin profile and account details</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToast('Admin details editing is locked.', 'warning')}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Pencil size={11} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold pt-1">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Name</label>
                    <input 
                      type="text" 
                      value={adminName} 
                      disabled
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-bold focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Email</label>
                    <input 
                      type="text" 
                      value={localStorage.getItem('adminEmail') || 'admin@printsmart.in'} 
                      disabled
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-bold focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Mobile Number</label>
                    <input 
                      type="text" 
                      value="+91 98765 43210" 
                      disabled
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-bold focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => addToast('Change password dialog prompted.', 'info')}
                    className="border border-violet-200 hover:bg-violet-50 text-violet-700 px-4 py-2 rounded-xl font-bold text-[10px] flex items-center gap-1.5 shadow-sm transition"
                  >
                    <span>Change Password</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: COUPON SYSTEM */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition duration-300 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl"><Gift size={18} /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Coupon System</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Enable or disable the entire coupon (scratch card) system</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Coupon System Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        couponSystemStatus ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {couponSystemStatus ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Scratch card system is currently active and generating rewards for users.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setCouponSystemStatus(!couponSystemStatus)
                      addToast(couponSystemStatus ? 'Coupon system disabled.' : 'Coupon system activated successfully!', 'info')
                    }}
                    className={`border px-4 py-2 rounded-xl font-bold text-[10px] transition shadow-sm ${
                      couponSystemStatus 
                        ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {couponSystemStatus ? 'Disable Coupon System' : 'Enable Coupon System'}
                  </button>
                </div>

                {/* Vector Gift box Illustration */}
                <div className="flex justify-center items-center">
                  <svg viewBox="0 0 240 240" className="w-28 h-28 text-violet-500">
                    <path fill="#EEF2F6" d="M120,30 C70.29,30 30,70.29 30,120 C30,169.71 70.29,210 120,210 C169.71,210 210,169.71 210,120 C210,70.29 169.71,30 120,30 Z" />
                    <rect x="75" y="100" width="90" height="70" rx="10" fill="#8B5CF6" />
                    <rect x="65" y="85" width="110" height="20" rx="6" fill="#A78BFA" />
                    <path d="M120,45 C130,45 135,70 120,85 C105,70 110,45 120,45 Z" fill="#FBBF24" />
                    <path d="M120,45 C110,45 105,70 120,85 C135,70 130,45 120,45 Z" fill="#F59E0B" />
                    <rect x="110" y="85" width="20" height="85" fill="#FBBF24" />
                  </svg>
                </div>
              </div>

              {/* CARD 3: MONETARY COUPONS */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100/60">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><Tag size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Monetary Coupons</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Control monetary based reward cards (cost bearing coupons)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="space-y-4">
                    {/* Free Print Card switch */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/20">
                      <div>
                        <span className="block text-xs font-black text-slate-700">Free Print Card</span>
                        <span className="text-[10px] text-slate-400 font-bold">Allows users to win free print reward cards.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={freePrintCardStatus}
                          onChange={() => setFreePrintCardStatus(!freePrintCardStatus)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-600/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                      </label>
                    </div>

                    {/* 50% OFF Card switch */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/20">
                      <div>
                        <span className="block text-xs font-black text-slate-700">50% OFF Card</span>
                        <span className="text-[10px] text-slate-400 font-bold">Allows users to win 50% OFF discount cards.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={halfOffCardStatus}
                          onChange={() => setHalfOffCardStatus(!halfOffCardStatus)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-600/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Monetary Coupons Detailed panel right */}
                  <div className="bg-slate-50/30 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between h-full">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Monetary Coupons Status</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-bold">Enabled</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold leading-normal">Monetary based reward cards are active.</p>
                    </div>
                    <button 
                      onClick={() => addToast('Monetary coupons disabled temporarily.', 'info')}
                      className="w-full border border-rose-200 hover:bg-rose-50 text-rose-600 py-2.5 rounded-xl font-bold text-[10px] transition shadow-sm mt-3"
                    >
                      Disable Monetary Coupons
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 4: AI SETTINGS */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100/60">
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl"><Sparkles size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">AI Settings</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Manage AI Studio and its features</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  {[
                    { label: 'AI Studio', state: aiStudioStatus, setState: setAiStudioStatus },
                    { label: 'Poster Maker', state: aiPosterMakerStatus, setState: setAiPosterMakerStatus },
                    { label: 'Banner Maker', state: aiBannerMakerStatus, setState: setAiBannerMakerStatus },
                    { label: 'Image Enhancer', state: aiImageEnhancerStatus, setState: setAiImageEnhancerStatus },
                  ].map((ai, i) => (
                    <div key={i} className="flex justify-between items-center p-3.5 border border-slate-100 bg-slate-50/20 rounded-xl">
                      <div>
                        <span className="block font-black text-slate-700 leading-tight">{ai.label}</span>
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5 block">{ai.state ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={ai.state}
                          onChange={() => ai.setState(!ai.state)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-600/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-2">
                  <div className="sm:col-span-10 space-y-1.5">
                    <label className="text-slate-400 font-bold block text-xs">Daily AI Job Limit</label>
                    <input 
                      type="number" 
                      value={dailyAiLimit}
                      onChange={(e) => setDailyAiLimit(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button 
                      onClick={handleSaveSettings}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 rounded-xl transition shadow-sm shadow-violet-600/10 active:scale-98"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 5: MAINTENANCE MODE */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100/60">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl"><Cpu size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Maintenance Mode</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Put the platform under maintenance to temporarily disable access</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Maintenance Mode Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        settingsData.maintenanceMode ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {settingsData.maintenanceMode ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {settingsData.maintenanceMode ? 'Platform is currently closed for maintenance.' : 'Platform is live and accessible to all users.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Maintenance Message</label>
                    <textarea 
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[10px] font-semibold focus:outline-none"
                    />
                    <span className="text-[8px] text-slate-400 font-bold block text-right mt-0.5">{maintenanceMessage.length}/200</span>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        const nextVal = !settingsData.maintenanceMode;
                        setSettingsData({ ...settingsData, maintenanceMode: nextVal })
                        logAdminAction(nextVal ? 'Activated maintenance mode' : 'Deactivated maintenance mode')
                        addToast(nextVal ? 'Maintenance Mode activated.' : 'Maintenance Mode deactivated.', 'info')
                      }}
                      className="w-full md:w-fit bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4.5 py-3 rounded-xl transition shadow-md active:scale-98"
                    >
                      {settingsData.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 6: SECURITY */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100/60">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><ShieldCheck size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Security</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Secure your account and manage login activities</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  {[
                    { title: 'Change Password', desc: 'Update your password' },
                    { title: 'Login History', desc: 'View recent login activity' },
                    { title: 'Active Sessions', desc: 'Manage active devices' },
                    { title: 'Two-Factor Auth', desc: 'Add extra security' },
                  ].map((sec, i) => (
                    <div 
                      key={i} 
                      onClick={() => addToast(`Opening security section: ${sec.title}`, 'info')}
                      className="p-4 border border-slate-100 hover:border-slate-200 bg-slate-50/20 hover:bg-slate-50/40 rounded-xl flex items-center justify-between cursor-pointer group transition"
                    >
                      <div>
                        <span className="block font-black text-slate-700 group-hover:text-violet-600 transition">{sec.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">{sec.desc}</span>
                      </div>
                      <span className="text-slate-300 group-hover:text-violet-500 transition-transform group-hover:translate-x-0.5">➔</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 7: SYSTEM INFORMATION */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition duration-300 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100/60">
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl"><SlidersHorizontal size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">System Information</h3>
                    <p className="text-[10px] text-slate-400 font-bold">View platform information and system status</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'PrintSmart Version', val: 'v1.0.0', sub: 'Latest Version' },
                    { label: 'Server Status', val: 'Online', sub: 'All systems operational', badge: true },
                    { label: 'Database Status', val: 'Connected', sub: 'Last checked 1m ago', badge: true },
                    { label: 'Last Backup', val: 'Today, 02:15 AM', sub: 'Automated Daily' },
                    { label: 'Platform Uptime', val: '99.9%', sub: 'Last 30 days' },
                  ].map((inf, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between min-h-[90px]">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block truncate">{inf.label}</span>
                      <div className="mt-2">
                        {inf.badge ? (
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-black">{inf.val}</span>
                        ) : (
                          <span className="text-sm font-black text-slate-800 block">{inf.val}</span>
                        )}
                        <span className="text-[8px] text-slate-400 font-extrabold mt-1 block truncate">{inf.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOOTER AUTOMATICALLY SAVED */}
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-extrabold tracking-widest uppercase py-4">
                <ShieldCheck size={12} className="text-slate-300" />
                <span>All changes are saved automatically</span>
              </div>

            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Analytics Dashboard</h1>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Detailed indices of platform growth, AI usage, and reward distributions
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <PlatformGrowthChart apiUrl={apiUrl} />
                </div>
                <div className="lg:col-span-4">
                  <AIUsageOverview stats={aiStats} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6">
                  <RewardsAnalyticsChart totalRewards={couponStats.rewardsDistributed} rewardCost={couponStats.scratchCardsCount * 15} />
                </div>
                <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Print Configuration Ratio</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Distribution of Black & White vs Color prints</p>
                  </div>
                  {analyticsData?.printTypeDistribution ? (
                    <div className="space-y-5 my-auto">
                      {analyticsData.printTypeDistribution.map((dist, idx) => {
                        const totalPrints = analyticsData.printTypeDistribution.reduce((acc, curr) => acc + curr._count.id, 0) || 1;
                        const percent = Math.round((dist._count.id / totalPrints) * 100);
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${dist.printType === 'BW' ? 'bg-slate-700' : 'bg-violet-500'}`} />
                                <span>{dist.printType === 'BW' ? 'Black & White' : 'Color'}</span>
                              </span>
                              <span>{dist._count.id} prints ({percent}%)</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${dist.printType === 'BW' ? 'bg-slate-700' : 'bg-violet-500'}`} 
                                style={{ width: `${percent}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                      <p className="text-xs">No print configuration data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* SHOP CRUD MODAL */}
      {isShopModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">{editingShop ? 'Edit Shop' : 'Add New Shop'}</h3>
              <button onClick={() => { setIsShopModalOpen(false); setEditingShop(null) }} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const data = Object.fromEntries(fd);
              handleSaveShop(data);
            }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Shop Name</label>
                <input required type="text" name="shopName" defaultValue={editingShop?.shopName || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Owner Name</label>
                <input type="text" name="ownerName" defaultValue={editingShop?.ownerName || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Email</label>
                <input required type="email" name="email" defaultValue={editingShop?.email || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              {editingShop ? (
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold block">Reset Password (Optional)</label>
                  <input type="password" name="password" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" placeholder="Leave blank to keep current" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold block">Password</label>
                  <input required type="password" name="password" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Phone</label>
                <input required type="text" name="phone" defaultValue={editingShop?.phone || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">UPI ID</label>
                <input type="text" name="upiId" defaultValue={editingShop?.upiId || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Address</label>
                <textarea name="address" defaultValue={editingShop?.address || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" rows={2} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsShopModalOpen(false); setEditingShop(null) }} className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] text-white rounded-xl font-bold shadow-md">Save Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER CRUD MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => { setIsUserModalOpen(false); setEditingUser(null) }} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const data = Object.fromEntries(fd);
              handleSaveUser(data);
            }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Full Name</label>
                <input required type="text" name="name" defaultValue={editingUser?.name || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Email</label>
                <input required type="email" name="email" defaultValue={editingUser?.email || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Phone</label>
                <input type="text" name="phone" defaultValue={editingUser?.phone || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Language Preferred</label>
                <select name="language" defaultValue={editingUser?.language || 'ENGLISH'} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl">
                  <option value="ENGLISH">ENGLISH</option>
                  <option value="HINDI">HINDI</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsUserModalOpen(false); setEditingUser(null) }} className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] text-white rounded-xl font-bold shadow-md">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON CRUD MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden text-xs font-semibold text-slate-700">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">{editingCoupon ? 'Edit Coupon' : 'Create Coupon Code'}</h3>
              <button onClick={() => { setIsCouponModalOpen(false); setEditingCoupon(null) }} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const data = Object.fromEntries(fd);
              data.scratched = data.scratched === 'true';
              data.applied = data.applied === 'true';
              handleSaveCoupon(data);
            }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Order ID (Linked)</label>
                <input required type="text" name="orderId" defaultValue={editingCoupon?.orderId || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" placeholder="e.g. ord-123" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Shop ID (Linked)</label>
                <input required type="text" name="shopId" defaultValue={editingCoupon?.shopId || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" placeholder="e.g. 5A-12345" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Reward Type (Discount description)</label>
                <input required type="text" name="rewardType" defaultValue={editingCoupon?.rewardType || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" placeholder="e.g. ₹5 Discount" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Reward Category</label>
                <select name="rewardCategory" defaultValue={editingCoupon?.rewardCategory || 'MONETARY'} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl">
                  <option value="MONETARY">MONETARY</option>
                  <option value="NON_MONETARY">NON_MONETARY</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Scratched Status</label>
                <select name="scratched" defaultValue={String(editingCoupon?.scratched || false)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Applied Status</label>
                <select name="applied" defaultValue={String(editingCoupon?.applied || false)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl">
                  <option value="true">Yes (Redeemed)</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold block">Reward Message</label>
                <input type="text" name="rewardMessage" defaultValue={editingCoupon?.rewardMessage || ''} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl" placeholder="Message to customer" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsCouponModalOpen(false); setEditingCoupon(null) }} className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#6366F1] text-white rounded-xl font-bold shadow-md">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN LOGS OVERLAY MODAL */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-violet-600 animate-pulse" />
                  <span>Admin Activity Logs</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  Chronological trail of admin sessions and sign-ins on the PrintSmart platform
                </p>
              </div>
              <button 
                onClick={() => setIsLogsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3.5 pr-2 no-scrollbar">
              {adminLogs.length > 0 ? (
                adminLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl flex justify-between items-start text-xs hover:border-slate-300 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">{log.adminName}</span>
                        <span className="text-[9px] text-slate-400 font-bold">({log.adminEmail})</span>
                      </div>
                      <p className="text-slate-500 font-semibold">{log.action}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold tracking-tight text-right whitespace-nowrap">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 font-bold space-y-2">
                  <Activity size={24} className="mx-auto text-slate-300" />
                  <p>No activity logs recorded yet</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to clear all admin activity logs?')) {
                    localStorage.removeItem('adminActivityLogs')
                    setAdminLogs([])
                    addToast('Activity logs cleared successfully!', 'info')
                  }
                }}
                className="text-rose-600 hover:text-rose-700 font-black text-[10px] hover:underline"
              >
                Clear Log History
              </button>
              <button 
                onClick={() => setIsLogsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

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