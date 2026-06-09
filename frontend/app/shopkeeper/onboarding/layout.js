'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  Headphones,
  Store,
  User,
} from 'lucide-react'
import {
  getLoggedInShopkeeper,
  getProfile,
  getContact,
  getPricing,
  isOnboardingComplete,
  isProfileSetupComplete,
  syncLocalStorageFromDb,
} from './_components/onboardingStorage'

function SidebarNavLink({ href, active, icon: Icon, children }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-2.5 text-violet-700 font-semibold'
          : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold'
      }
    >
      <span
        className={
          active
            ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm'
            : 'flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm'
        }
      >
        <Icon size={18} className={active ? 'text-violet-700' : 'text-slate-500'} />
      </span>
      <span className="text-sm">{children}</span>
    </Link>
  )
}

function NotificationButton() {
  return (
    <button
      type="button"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50"
      aria-label="Notifications"
    >
      <Bell size={18} className="text-slate-600" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
    </button>
  )
}

function ProfileDropdown({ shopName }) {
  const initials = useMemo(() => {
    const name = (shopName || 'Shop').trim()
    const parts = name.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || 'S'
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
  }, [shopName])

  return (
    <button
      type="button"
      className="inline-flex items-center gap-3 rounded-xl bg-white shadow-sm border border-slate-200 px-3 py-2 hover:bg-slate-50"
      aria-label="Profile menu"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-sm">
        {initials}
      </span>
      <span className="text-left leading-tight">
        <span className="block text-sm font-semibold text-slate-800 truncate max-w-[180px]">
          {shopName || 'Shop Name'}
        </span>
        <span className="block text-xs text-slate-500">Shopkeeper</span>
      </span>
      <ChevronDown size={16} className="text-slate-500" />
    </button>
  )
}

export default function OnboardingLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const loggedIn = getLoggedInShopkeeper()
    if (!token || !loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const shopkeeper = await response.json()
          localStorage.setItem('loggedInShopkeeper', JSON.stringify(shopkeeper))
          localStorage.setItem('shopkeeper', JSON.stringify(shopkeeper))
          setShopName(shopkeeper.shopName || '')
          
          if (shopkeeper.isOnboarded) {
            router.replace('/shopkeeper/dashboard')
            return
          }

          // Sync database profile properties into localStorage so validation remains in sync
          syncLocalStorageFromDb(shopkeeper)

          if (pathname?.includes('/shopkeeper/onboarding/pricing-setup')) {
            if (!shopkeeper.profileCompleted) {
              router.replace('/shopkeeper/onboarding/profile-setup')
              return
            }
          }
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('Layout onboarding check failed:', err)
        if (isOnboardingComplete(loggedIn)) {
          router.replace('/shopkeeper/dashboard')
          return
        }
      }

      const profile = getProfile()
      const contact = getContact()

      if (pathname?.includes('/shopkeeper/onboarding/pricing-setup')) {
        if (!isProfileSetupComplete(profile, contact)) {
          router.replace('/shopkeeper/onboarding/profile-setup')
          return
        }
      }
      setLoading(false)
    }

    checkOnboardingStatus()
  }, [router, pathname])

  const isProfile = pathname?.includes('/shopkeeper/onboarding/profile-setup')
  const isPricing = pathname?.includes('/shopkeeper/onboarding/pricing-setup')

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-600 font-sans">Loading onboarding...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white/70 backdrop-blur-sm">
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                <Store size={18} />
              </span>
              <span className="text-lg font-bold text-slate-900">PrintSmart</span>
            </div>
          </div>

          <nav className="px-4 space-y-2">
            <SidebarNavLink
              href="/shopkeeper/onboarding/profile-setup"
              active={!!isProfile}
              icon={User}
            >
              Profile Setup
            </SidebarNavLink>
            <SidebarNavLink
              href="/shopkeeper/onboarding/pricing-setup"
              active={!!isPricing}
              icon={Store}
            >
              Pricing Setup
            </SidebarNavLink>
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                  <Headphones size={18} className="text-violet-700" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Need Help?</div>
                  <div className="mt-1 text-xs text-slate-500">
                    We&apos;re here to help you set up your shop.
                  </div>
                </div>
              </div>

              <a
                href="https://forms.gle/VBK48SwGSWm7prgUA"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
              >
                Get Support
              </a>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-end gap-3">
              <NotificationButton />
              <ProfileDropdown shopName={shopName} />
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
