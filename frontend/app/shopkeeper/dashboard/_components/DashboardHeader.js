'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Bell, ChevronDown, Store, LogOut, ArrowLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'

const mockNotifications = [
  {
    title: "System Update from Admin",
    message: "New premium templates are now available for your customer landing page. Configure them in settings!",
    time: "2 hours ago"
  },
  {
    title: "Onboarding Reminder",
    message: "Please ensure your alternate contact number is verified to avoid missing system updates.",
    time: "1 day ago"
  },
  {
    title: "Welcome to PrintSmart",
    message: "Your shop is fully active. Customers can now scan your QR code and send high-speed print orders instantly!",
    time: "3 days ago"
  }
]

import { useSocket } from '../../../../hooks/useSocket'
import { useSocketContext } from '../../../../contexts/SocketProvider'

function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [unreadCount, setUnreadCount] = useState(1)
  const dropdownRef = useRef(null)
  const { joinRoom, leaveRoom } = useSocketContext()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedInShopkeeper")
    if (loggedIn) {
      try {
        const shop = JSON.parse(loggedIn)
        if (shop && shop.id) {
          joinRoom(`shop:${shop.id}`)
          return () => {
            leaveRoom(`shop:${shop.id}`)
          }
        }
      } catch (e) {
        console.error("Failed to join socket room in Header:", e)
      }
    }
  }, [joinRoom, leaveRoom])

  useSocket("notification-created", (notif) => {
    console.log("[Socket] Notification received in header:", notif)
    setNotifications((prev) => [
      {
        title: notif.title,
        message: notif.message,
        time: "Just now"
      },
      ...prev
    ])
    setUnreadCount((prev) => prev + 1)
  })

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpenDropdown}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition active:scale-95"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 flex items-center justify-center text-[7px] text-white font-extrabold" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl py-3 z-50 animate-scaleIn">
          <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-bold">New</span>
            )}
          </div>
          <div className="mt-2 max-h-60 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
            {notifications.map((notif, index) => (
              <div key={index} className="p-3.5 hover:bg-violet-500/5 transition cursor-pointer text-left">
                <div className="text-xs font-bold text-slate-800">{notif.title}</div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">{notif.message}</div>
                <div className="text-[9px] text-slate-400 mt-1.5 font-bold">{notif.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('loggedInShopkeeper')
    localStorage.removeItem('shopkeeper')
    // Redirect to login page
    window.location.href = '/shopkeeper/login'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="relative inline-flex h-10 w-10 sm:w-auto sm:px-3 items-center justify-center gap-1.5 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition text-slate-600 font-semibold text-xs"
      aria-label="Logout"
    >
      <LogOut size={16} className="flex-shrink-0" />
      <span className="hidden sm:inline">Logout</span>
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
      className="inline-flex items-center gap-2 rounded-xl bg-white shadow-sm border border-slate-200 p-2 sm:px-3 sm:py-2 hover:bg-slate-50"
      aria-label="Profile menu"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex-shrink-0">
        {initials}
      </span>
      <span className="hidden sm:block text-left leading-tight">
        <span className="block text-sm font-semibold text-slate-800 truncate max-w-[100px] md:max-w-[180px]">
          {shopName || 'Shop Name'}
        </span>
        <span className="block text-xs text-slate-500">Shopkeeper</span>
      </span>
      <ChevronDown size={16} className="hidden sm:block text-slate-500 flex-shrink-0" />
    </button>
  )
}

export default function DashboardHeader({ shopName }) {
  const pathname = usePathname()
  const showBackButton = pathname !== '/shopkeeper/dashboard'

  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-slate-250 bg-white text-slate-700 hover:bg-slate-50 transition mr-1 animate-fadeIn font-black text-xs shadow-sm hover:text-slate-900 hover:border-slate-350 active:scale-95 cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Store size={18} />
            </span>
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-slate-900">PrintSmart</span>
              <span className="text-violet-600"></span>
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 sm:block">
            <div className="relative pointer-events-auto flex items-center gap-1.5 overflow-hidden rounded-full border border-violet-100/80 bg-white/75 px-5 py-2 shadow-sm shadow-violet-100 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md">
              <span className="absolute inset-0 bg-gradient-to-r from-violet-50 via-indigo-50 to-sky-50 opacity-80" />
              <span className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 opacity-90 shadow-[0_0_14px_rgba(99,102,241,0.35)] animate-pulse" />
              <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-400/80" />
              <div className="relative z-10 flex items-center gap-2 pl-3 pr-2">
                <span className="block text-sm font-extrabold uppercase tracking-[0.25em] text-transparent bg-gradient-to-r from-violet-700 via-indigo-600 to-sky-600 bg-clip-text">
                  Dashboard
                </span>
                <span className="text-[10px] text-slate-300 font-light select-none">|</span>
                <span className="inspired-text">
                  inspired by the steve jobs.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationButton />
            <ProfileDropdown shopName={shopName} />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
