'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Bell,
  Globe2,
  Languages,
  Headphones,
  FileText,
  Palette,
  Printer,
  Sparkles,
  Settings2,
  Crown,
  SquareUserRound,
} from 'lucide-react'

import {
  getProfile,
  getContact,
  getSocials,
} from '../../onboarding/_components/onboardingStorage'

const sidebarItems = [
  {
    label: 'Print Configuration',
    href: '/shopkeeper/settings/print-configuration',
    icon: Settings2,
    description: 'Manage print prices & preferences',
  },
  {
    label: 'Language & Accessibility',
    href: '/shopkeeper/settings/language-accessibility',
    icon: Languages,
    description: 'Manage language & accessibility',
    active: true,
  },
  {
    label: 'Appearance',
    href: '/shopkeeper/settings/appearance',
    icon: Palette,
    description: 'Customize look & feel',
  },
  {
    label: 'Hardware & Printer',
    href: '/shopkeeper/settings/printers-support',
    icon: Printer,
    description: 'Printers, queue, quality & support',
  },
  {
    label: 'Support & Feedback',
    href: '/shopkeeper/settings/support-feedback',
    icon: Headphones,
    description: 'Get help & send feedback',
  },
]

const supportedLanguages = [
  { label: 'English', active: true },
  { label: 'हिंदी', active: false },
  { label: 'मराठी', active: false },
  { label: 'ગુજરાતી', active: false },
  { label: 'اردو', active: false },
]

const previewStats = [
  { labelKey: 'allOrders', value: '12', tone: 'violet' },
  { labelKey: 'pending', value: '8', tone: 'orange' },
  { labelKey: 'completed', value: '128', tone: 'green' },
  { labelKey: 'downloaded', value: '36', tone: 'blue' },
]

function toneStyles(tone) {
  switch (tone) {
    case 'violet':
      return 'bg-violet-50 text-violet-700 border-violet-100'
    case 'orange':
      return 'bg-orange-50 text-orange-700 border-orange-100'
    case 'green':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'blue':
      return 'bg-sky-50 text-sky-700 border-sky-100'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function SidebarItem({ href, icon: Icon, label, description, active }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
        active
          ? 'border-violet-200 bg-violet-50 text-violet-700 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-violet-600'
          : 'border-transparent bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          active ? 'border-violet-100 bg-white text-violet-700' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5">{label}</span>
        <span className="mt-0.5 block text-xs leading-4 text-slate-500">{description}</span>
      </span>
    </Link>
  )
}

function PremiumPlanCard() {
  return (
    <div className="rounded-[22px] border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
          <Crown size={20} />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="text-sm font-semibold text-slate-900">You are on</div>
          <div className="text-sm font-extrabold text-violet-700">Premium Plan</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500">Valid till 12 Jan 2025</div>

      <button
        type="button"
        onClick={() => console.log('open modal')}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm ring-1 ring-violet-100 transition hover:bg-violet-50"
      >
        View Plan Details <span className="ml-2">→</span>
      </button>
    </div>
  )
}

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
        enabled ? 'bg-violet-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SettingsRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 px-0 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">{description}</div>
        </div>
      </div>
      <div className="sm:min-w-[220px] sm:pl-6">{children}</div>
    </div>
  )
}

function PreviewStat({ labelKey, value, tone, language = 'en' }) {
  const langCode = LANG_MAP[language] || 'en'
  const label = PREVIEW_TRANSLATIONS[langCode]?.[labelKey] || labelKey
  
  return (
    <div className={`rounded-2xl border p-3 shadow-sm ${toneStyles(tone)}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">{label}</div>
      <div className="mt-2 text-lg font-extrabold tracking-tight">{value}</div>
    </div>
  )
}

function PreviewCard({ language = 'English' }) {
  const langCode = LANG_MAP[language] || 'en'
  const trans = PREVIEW_TRANSLATIONS[langCode] || PREVIEW_TRANSLATIONS.en
  
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:px-5 sm:py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
            <span className="text-[12px] font-bold">PS</span>
          </div>
          <div className="text-sm font-extrabold tracking-tight text-slate-900">PrintSmart</div>
        </div>
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
          <Bell size={16} />
          <span className="absolute right-[-1px] top-[-1px] h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {previewStats.map((item) => (
          <PreviewStat key={item.labelKey} {...item} language={language} />
        ))}
      </div>

      <div className="mt-4 rounded-[22px] border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">{trans.recentOrder}</div>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600 ring-1 ring-orange-100">
            {trans.pendingStatus}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{trans.orderId}</div>
          <div className="text-sm font-semibold text-slate-900">{trans.customerName}</div>
          <div className="text-xs text-slate-500">{trans.phone}</div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-50 text-rose-500 ring-1 ring-rose-100">
              <FileText size={12} />
            </span>
            <span>{trans.fileName}</span>
          </div>
          <button
            type="button"
            onClick={() => console.log('open modal')}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(124,58,237,0.25)]"
          >
            {trans.viewDetails}
          </button>
        </div>
      </div>
    </div>
  )
}

const LANG_MAP = {
  'English': 'en',
  'हिंदी': 'hi',
  'मराठी': 'mr',
  'en': 'English',
  'hi': 'हिंदी',
  'mr': 'मराठी'
}

const PREVIEW_TRANSLATIONS = {
  en: {
    allOrders: 'ALL ORDERS',
    pending: 'PENDING',
    completed: 'COMPLETED',
    downloaded: 'DOWNLOADED',
    recentOrder: 'Recent Order',
    pendingStatus: 'Pending',
    orderId: '#ORD-00145',
    customerName: 'Aman Kumar',
    phone: '+91 98765 43210',
    fileName: 'Project_Report.pdf',
    viewDetails: 'View Details'
  },
  hi: {
    allOrders: 'सभी ऑर्डर',
    pending: 'लंबित',
    completed: 'पूर्ण',
    downloaded: 'डाउनलोड किया गया',
    recentOrder: 'हाल का ऑर्डर',
    pendingStatus: 'लंबित',
    orderId: '#ORD-00145',
    customerName: 'अमन कुमार',
    phone: '+91 98765 43210',
    fileName: 'Project_Report.pdf',
    viewDetails: 'विवरण देखें'
  },
  mr: {
    allOrders: 'सर्व ऑर्डर',
    pending: 'प्रलंबित',
    completed: 'पूर्ण',
    downloaded: 'डाउनलोड केले',
    recentOrder: 'अलीकडील ऑर्डर',
    pendingStatus: 'प्रलंबित',
    orderId: '#ORD-00145',
    customerName: 'अमन कुमार',
    phone: '+91 98765 43210',
    fileName: 'Project_Report.pdf',
    viewDetails: 'तपशील पहा'
  }
}

export default function LanguageAccessibilityPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [shopName, setShopName] = useState('Shree Ganesh Xerox & Prints')
  const [autoDetect, setAutoDetect] = useState(true)
  const [appLanguage, setAppLanguage] = useState('English')

  const updateLanguageInDb = async (language) => {
    try {
      const code = LANG_MAP[language] || 'en'
      localStorage.setItem('customerLanguage', code)
      localStorage.setItem('language', code)
      i18n.changeLanguage(code)
      window.dispatchEvent(new Event('printsmart-language-change'))

      const token = localStorage.getItem('authToken')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const activeProfile = getProfile()
      const activeContact = getContact()
      const activeSocials = getSocials()

      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: activeProfile.shopName,
          ownerName: activeProfile.shopOwnerName,
          address: activeContact.shopAddress,
          category: activeProfile.businessCategory,
          subCategory: activeProfile.subCategory,
          languagePref: language,
          gstNumber: activeProfile.gstNumber,
          businessDescription: activeProfile.businessDescription,
          businessEstablishedYear: activeProfile.businessEstablishedYear,
          website: activeContact.website,
          alternatePhone: activeContact.alternatePhone,
          socials: activeSocials,
          pricing: localStorage.getItem('shopkeeperPricing') ? JSON.parse(localStorage.getItem('shopkeeperPricing')) : undefined,
          logoUrl: activeProfile.logoDataUrl || activeProfile.logoUrl || null,
          phone: activeContact.phoneNumber,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
        localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
        
        const updatedProfile = { ...activeProfile, languagePreference: language }
        localStorage.setItem('shopkeeperProfile', JSON.stringify(updatedProfile))
      }
    } catch (err) {
      console.error('Failed to sync language preference with backend:', err)
    }
  }

  const detectBrowserLanguage = () => {
    if (typeof window === 'undefined') return
    const browserLang = navigator.language || navigator.userLanguage || ''
    const langCode = browserLang.split('-')[0].toLowerCase()

    let detected = 'English'
    if (langCode === 'hi') {
      detected = 'हिंदी'
    } else if (langCode === 'mr') {
      detected = 'मराठी'
    }

    setAppLanguage(detected)
    localStorage.setItem('shopkeeperLanguage', detected)
    
    const code = LANG_MAP[detected] || 'en'
    localStorage.setItem('customerLanguage', code)
    i18n.changeLanguage(code)

    updateLanguageInDb(detected)
  }

  const handleToggleAutoDetect = (value) => {
    setAutoDetect(value)
    localStorage.setItem('shopkeeperAutoLanguage', String(value))
    if (value) {
      detectBrowserLanguage()
    }
  }

  const handleLanguageChange = (value) => {
    setAppLanguage(value)
    localStorage.setItem('shopkeeperLanguage', value)
    setAutoDetect(false)
    localStorage.setItem('shopkeeperAutoLanguage', 'false')
    updateLanguageInDb(value)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('loggedInShopkeeper')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.shopName) setShopName(String(parsed.shopName))
        else if (parsed?.shop) setShopName(String(parsed.shop))
        else if (parsed?.name) setShopName(String(parsed.name))
      }
    } catch {
      // ignore invalid localStorage
    }

    const storedAuto = localStorage.getItem('shopkeeperAutoLanguage')
    const initialAuto = storedAuto !== 'false'
    setAutoDetect(initialAuto)

    const storedLang = localStorage.getItem('shopkeeperLanguage')
    if (storedLang) {
      setAppLanguage(storedLang)
      const code = LANG_MAP[storedLang] || 'en'
      localStorage.setItem('language', code)
      localStorage.setItem('customerLanguage', code)
      i18n.changeLanguage(code)
      window.dispatchEvent(new Event('printsmart-language-change'))
    } else if (initialAuto) {
      detectBrowserLanguage()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900">
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <aside className="flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Settings2 size={16} />
              </span>
              <h2 className="text-[18px] font-bold text-slate-900">{t('Settings')}</h2>
            </div>

            <nav className="space-y-2 p-3">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  label={t(item.label)}
                  description={t(item.description)}
                  active={item.active}
                />
              ))}
            </nav>

            <div className="mt-auto p-4 pt-1">
              <PremiumPlanCard />
            </div>
          </aside>

          <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/shopkeeper/dashboard"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition flex-shrink-0"
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">{t('Language & Accessibility')}</h1>
                  <p className="mt-2 text-sm text-slate-500">
                    {t('Choose your preferred language and accessibility options for a better experience.')}
                  </p>
                </div>
              </div>

              <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:px-7">
                <h2 className="text-lg font-bold text-slate-900">{t('Language Settings')}</h2>

                <div className="mt-4 divide-y divide-slate-100">
                  <SettingsRow
                    icon={Globe2}
                    title={t('App Language')}
                    description={t('Select your preferred language for the platform')}
                  >
                    <div className="flex justify-end">
                      <select
                        value={appLanguage}
                        onChange={(event) => handleLanguageChange(event.target.value)}
                        className="h-11 w-full max-w-[140px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                      >
                        <option>English</option>
                        <option>हिंदी</option>
                        <option>मराठी</option>
                      </select>
                    </div>
                  </SettingsRow>

                  <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-[330px]">
                      <div className="text-sm font-semibold text-slate-900">{t('Supported Languages')}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {t('Application will be available in the following languages')}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {[...supportedLanguages].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                            item.active
                              ? 'border-violet-100 bg-violet-50 text-violet-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="min-w-0 xl:pt-[46px]">
              <div className="rounded-[28px] border border-slate-200 bg-gradient-to-b from-violet-50 via-white to-white px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                <div className="text-sm font-bold text-violet-700">{t('Preview')}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t('This is how the platform will look with your selected settings.')}
                </p>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  <PreviewCard language={appLanguage} />
                </div>

                <div className="mt-5 flex items-start gap-2 text-sm text-slate-500">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                    <Sparkles size={14} />
                  </span>
                  <span className="leading-6">
                    {t('Changes will be applied instantly across the platform.')}
                  </span>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}