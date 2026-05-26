'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  Languages,
  Palette,
  Printer,
  Settings2,
  Headphones,
  Store,
  Sparkles,
} from 'lucide-react'

import {
  getContact,
  getLoggedInShopkeeper,
  getProfile,
  getSocials,
  setSocials,
  syncLocalStorageFromDb,
} from '../../onboarding/_components/onboardingStorage'

import {
  Card,
  Field,
  PrimaryButton,
} from '../../onboarding/_components/ui'

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
  },
  {
    label: 'Appearance',
    href: '/shopkeeper/settings/appearance',
    icon: Palette,
    description: 'Customize look & feel',
    active: true,
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

function TopHeader({ shopName }) {
  const initials = useMemo(() => {
    const name = (shopName || 'Shop').trim()
    const parts = name.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || 'S'
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
  }, [shopName])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Store size={18} />
            </span>
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-slate-900">PrintSmart</span>
              <span className="text-violet-600">.in</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-slate-600" />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm hover:bg-slate-50"
              aria-label="Profile menu"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {initials}
              </span>
              <span className="text-left leading-tight">
                <span className="block max-w-[180px] truncate text-sm font-semibold text-slate-800">
                  {shopName || 'Shop Name'}
                </span>
                <span className="block text-xs text-slate-500">Shopkeeper</span>
              </span>
              <ChevronDown size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function ColorBox({ label, colorClass, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition ${
        selected ? 'border-violet-600 bg-violet-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className={`h-8 w-12 rounded-lg ${colorClass} shadow-sm`} />
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </button>
  )
}

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? 'bg-violet-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function AppearanceSettingsPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState('Shree Ganesh Xerox & Prints')
  const [themeColor, setThemeColor] = useState('violet')
  const [layoutDensity, setLayoutDensity] = useState('comfortable')
  const [showEmail, setShowEmail] = useState(true)
  const [showPhone, setShowPhone] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loggedIn = getLoggedInShopkeeper()
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    syncLocalStorageFromDb(loggedIn)

    try {
      const profile = getProfile()
      setShopName(profile.shopName || loggedIn.shopName || 'Shree Ganesh Xerox & Prints')

      const socials = getSocials()
      if (socials?.uiPreferences) {
        const prefs = socials.uiPreferences
        if (prefs.themeColor) setThemeColor(prefs.themeColor)
        if (prefs.layoutDensity) setLayoutDensity(prefs.layoutDensity)
        if (prefs.showEmail !== undefined) setShowEmail(prefs.showEmail)
        if (prefs.showPhone !== undefined) setShowPhone(prefs.showPhone)
      }
    } catch (err) {
      console.error('Failed to load appearance preferences:', err)
    }
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const activeProfile = getProfile()
      const activeContact = getContact()
      const activeSocials = getSocials()

      const updatedSocials = {
        ...activeSocials,
        uiPreferences: {
          themeColor,
          layoutDensity,
          showEmail,
          showPhone,
        },
      }

      // Save to database
      const token = localStorage.getItem('authToken')
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
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
            languagePref: activeProfile.languagePreference,
            gstNumber: activeProfile.gstNumber,
            socials: updatedSocials,
            pricing: localStorage.getItem('shopkeeperPricing') ? JSON.parse(localStorage.getItem('shopkeeperPricing')) : undefined,
            logoUrl: activeProfile.logoDataUrl || null,
            phone: activeContact.phoneNumber,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
          localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
          setSocials(updatedSocials)
          alert('Appearance settings saved successfully!')
        } else {
          console.error('Failed to save appearance details')
          alert('Failed to save appearance details to server.')
        }
      } else {
        setSocials(updatedSocials)
        alert('Appearance settings updated locally!')
      }
    } catch (err) {
      console.error('Appearance save error:', err)
      alert('An error occurred during save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900">
      <TopHeader shopName={shopName} />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          {/* Sidebar Navigation */}
          <aside className="flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Palette size={16} />
              </span>
              <h2 className="text-[18px] font-bold text-slate-900">Settings</h2>
            </div>

            <nav className="space-y-2 p-3">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  active={item.active}
                />
              ))}
            </nav>
          </aside>

          {/* Main Layout Area */}
          <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Appearance Settings</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Customize the look, color scheme, layout structure, and visibility of details.
                </p>
              </div>

              {/* Theme Selector Card */}
              <Card title="Accent Theme Color" icon={Palette}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ColorBox
                    label="Violet"
                    colorClass="bg-violet-600"
                    selected={themeColor === 'violet'}
                    onSelect={() => setThemeColor('violet')}
                  />
                  <ColorBox
                    label="Ocean"
                    colorClass="bg-sky-500"
                    selected={themeColor === 'ocean'}
                    onSelect={() => setThemeColor('ocean')}
                  />
                  <ColorBox
                    label="Emerald"
                    colorClass="bg-emerald-500"
                    selected={themeColor === 'emerald'}
                    onSelect={() => setThemeColor('emerald')}
                  />
                  <ColorBox
                    label="Slate"
                    colorClass="bg-slate-600"
                    selected={themeColor === 'slate'}
                    onSelect={() => setThemeColor('slate')}
                  />
                </div>
              </Card>

              {/* Layout Density Card */}
              <Card title="Layout Structure" icon={Settings2}>
                <div className="space-y-4">
                  <Field label="Layout Density" description="Select structure comfort layout">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="density"
                          value="comfortable"
                          checked={layoutDensity === 'comfortable'}
                          onChange={() => setLayoutDensity('comfortable')}
                          className="text-violet-600 focus:ring-violet-500"
                        />
                        Comfortable
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="density"
                          value="compact"
                          checked={layoutDensity === 'compact'}
                          onChange={() => setLayoutDensity('compact')}
                          className="text-violet-600 focus:ring-violet-500"
                        />
                        Compact
                      </label>
                    </div>
                  </Field>
                </div>
              </Card>

              {/* Public Visibilities */}
              <Card title="Customer Page Info Visibility" icon={Sparkles}>
                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Show Shop Email</div>
                      <div className="text-xs text-slate-500 mt-1">Display your email address to scanning customers</div>
                    </div>
                    <ToggleSwitch enabled={showEmail} onToggle={() => setShowEmail(!showEmail)} />
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Show Shop Phone</div>
                      <div className="text-xs text-slate-500 mt-1">Display shop phone number on customer landing pages</div>
                    </div>
                    <ToggleSwitch enabled={showPhone} onToggle={() => setShowPhone(!showPhone)} />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <PrimaryButton type="button" onClick={handleSave} disabled={saving} className="px-8 py-3">
                  Save Customizations
                </PrimaryButton>
              </div>
            </div>

            {/* Right Preview Side panel */}
            <aside className="min-w-0 xl:pt-[46px]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                <div className="text-sm font-bold text-violet-700 mb-2">Live Preview</div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  See accent style preview for selected configuration.
                </p>
                <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`h-3 w-3 rounded-full ${
                      themeColor === 'violet' ? 'bg-violet-600' :
                      themeColor === 'ocean' ? 'bg-sky-500' :
                      themeColor === 'emerald' ? 'bg-emerald-500' : 'bg-slate-600'
                    }`} />
                    <span className="text-xs font-bold text-slate-900 uppercase">Button Sample</span>
                  </div>
                  <button
                    type="button"
                    className={`w-full py-2 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition ${
                      themeColor === 'violet' ? 'bg-violet-600 hover:bg-violet-700' :
                      themeColor === 'ocean' ? 'bg-sky-500 hover:bg-sky-600' :
                      themeColor === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600' :
                      'bg-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    Interactive Action
                  </button>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}
