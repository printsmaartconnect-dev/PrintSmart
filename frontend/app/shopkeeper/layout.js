'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BottomDock from './dashboard/_components/BottomDock'
import { bottomDockItems } from './dashboard/_components/mockData'

export default function ShopkeeperLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [counts, setCounts] = useState({ pending: 0, completed: 0, downloaded: 0, cancelled: 0 })
  const [shopkeeperIdCode, setShopkeeperIdCode] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide dock on login, register, onboarding, print-preview pages
  const isAuthOrOnboarding = 
    pathname?.startsWith('/shopkeeper/login') ||
    pathname?.startsWith('/shopkeeper/register') ||
    pathname?.startsWith('/shopkeeper/onboarding') ||
    pathname?.startsWith('/shopkeeper/print-preview')

  // Fetch counts and sync shopkeeper id slug
  useEffect(() => {
    if (isAuthOrOnboarding) return

    const token = localStorage.getItem("authToken")
    const loggedIn = localStorage.getItem("loggedInShopkeeper")
    if (!token || !loggedIn) return

    try {
      const shop = JSON.parse(loggedIn)
      if (shop && shop.shopSlug) {
        setShopkeeperIdCode(shop.shopSlug)
      }
    } catch (e) {}

    const fetchCounts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
        const response = await fetch(`${apiUrl}/api/orders/shopkeeper/all`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          const pending = data.filter((o) => o.status !== "COMPLETED" && o.status !== "DOWNLOADED" && o.status !== "CANCELLED").length
          const completed = data.filter((o) => o.status === "COMPLETED" || o.status === "DOWNLOADED").length
          const downloaded = data.filter((o) => o.status === "DOWNLOADED").length
          const cancelled = data.filter((o) => o.status === "CANCELLED").length
          setCounts({ pending, completed, downloaded, cancelled })
        }
      } catch (err) {
        console.error("Failed to fetch order counts for dock:", err)
      }
    }

    fetchCounts()
    // Poll counts every 10 seconds to keep badges updated everywhere
    const interval = setInterval(fetchCounts, 10000)
    return () => clearInterval(interval)
  }, [pathname, isAuthOrOnboarding])

  if (!mounted) {
    return <>{children}</>
  }

  // Map the dock items with dynamic badge counts and correct addOrder href
  const mappedDockItems = bottomDockItems.map(item => {
    if (item.key === 'pending') return { ...item, badge: counts.pending ? String(counts.pending) : null }
    if (item.key === 'completed') return { ...item, badge: counts.completed ? String(counts.completed) : null }
    if (item.key === 'downloaded') return { ...item, badge: counts.downloaded ? String(counts.downloaded) : null }
    if (item.key === 'cancelled') return { ...item, badge: counts.cancelled ? String(counts.cancelled) : null }
    if (item.key === 'addOrder' && shopkeeperIdCode) {
      return { ...item, href: `/customer/language?shopkeeperAddOrder=true&shopId=${shopkeeperIdCode}` }
    }
    return item
  })

  // Read active filter from URL query params for highlighting
  let activeFilter = 'All'
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const filterParam = params.get('filter')
    if (filterParam === 'pending') activeFilter = t('Pending')
    else if (filterParam === 'completed') activeFilter = t('Completed')
    else if (filterParam === 'downloaded') activeFilter = t('Downloaded')
    else if (filterParam === 'cancelled') activeFilter = t('Cancelled')
    else if (filterParam === 'all') activeFilter = t('All')
    else if (pathname === '/shopkeeper/dashboard') activeFilter = t('Pending')
  }

  const handleFilterChange = (filterLabel) => {
    let key = 'all'
    if (filterLabel === t('Pending')) key = 'pending'
    else if (filterLabel === t('Completed')) key = 'completed'
    else if (filterLabel === t('Downloaded')) key = 'downloaded'
    else if (filterLabel === t('Cancelled')) key = 'cancelled'

    router.push(`/shopkeeper/dashboard?filter=${key}`)
  }

  const handleCustomClick = (key) => {
    if (key === 'customBill') {
      router.push('/shopkeeper/dashboard?openCustomBill=true')
    }
  }

  return (
    <>
      {children}
      {!isAuthOrOnboarding && (
        <BottomDock 
          items={mappedDockItems} 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onCustomClick={handleCustomClick}
        />
      )}
    </>
  )
}
