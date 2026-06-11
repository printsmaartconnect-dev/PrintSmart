'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Languages,
  Palette,
  Printer,
  Settings2,
  Headphones,
  Store,
  FileText,
} from 'lucide-react'

import {
  getContact,
  getLoggedInShopkeeper,
  getProfile,
  getPricing,
  getSocials,
  validatePricingRequired,
  setPricing,
  syncLocalStorageFromDb,
} from '../../onboarding/_components/onboardingStorage'

import {
  Card,
  Field,
  PrimaryButton,
  SelectInput,
  RupeeInput,
  TextInput,
} from '../../onboarding/_components/ui'

const sidebarItems = [
  {
    label: 'Print Configuration',
    href: '/shopkeeper/settings/print-configuration',
    icon: Settings2,
    description: 'Manage print prices & preferences',
    active: true,
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
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition mr-1"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
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

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0">
      <span className="text-slate-600 text-xs">{label}</span>
      <span className="font-semibold text-slate-900 text-xs">₹{value}</span>
    </div>
  )
}

export default function PrintConfigurationSettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [shopName, setShopName] = useState('Shree Ganesh Xerox & Prints')
  const [pricing, setPricingState] = useState(() => getPricing())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loggedIn = getLoggedInShopkeeper()
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    // Sync database shopkeeper details to local storage
    syncLocalStorageFromDb(loggedIn)

    try {
      const profile = getProfile()
      setShopName(profile.shopName || loggedIn.shopName || 'Shree Ganesh Xerox & Prints')
      setPricingState(getPricing())
    } catch (err) {
      console.error('Failed to load profile details in settings:', err)
    }
  }, [router])

  const onChange = (key) => (e) => {
    const value = e.target.value
    setPricingState((prev) => ({ ...prev, [key]: value }))
  }

  const pricingSummary = useMemo(() => {
    const safe = (v) => (v === '' || v == null ? '0.00' : v)
    return {
      bwA4: safe(pricing.bwA4),
      bwA3: safe(pricing.bwA3),
      bwA5: safe(pricing.bwA5),
      bwLegal: safe(pricing.bwLegal),
      bwLetter: safe(pricing.bwLetter),
      colorA4: safe(pricing.colorA4),
      colorA3: safe(pricing.colorA3),
      colorA5: safe(pricing.colorA5),
      colorLegal: safe(pricing.colorLegal),
      colorLetter: safe(pricing.colorLetter),
      bwDoubleSide: safe(pricing.bwDoubleSide),
      colorDoubleSide: safe(pricing.colorDoubleSide),
    }
  }, [pricing])

  const handleSave = async () => {
    const pricingValidation = validatePricingRequired(pricing)
    if (!pricingValidation.ok) {
      alert(`Please fill all required pricing fields: ${pricingValidation.missing.join(', ')}`)
      return
    }

    setSaving(true)
    try {
      const activeProfile = getProfile()
      const activeContact = getContact()
      const activeSocials = getSocials()

      // Save updated pricing back to the database
      const token = localStorage.getItem('authToken')
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
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
            socials: activeSocials,
            pricing: pricing,
            logoUrl: activeProfile.logoDataUrl || null,
            phone: activeContact.phoneNumber,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
          localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
          alert(t('Print configuration updated successfully!'))
        } else {
          console.error('Failed to sync pricing with database')
          alert(t('Failed to save changes to the server.'))
        }
      }

      setPricing({ ...pricing })
    } catch (err) {
      console.error('Failed to update print settings:', err)
      alert(t('An error occurred while saving print settings.'))
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
          </aside>

          {/* Main Layout Area */}
          <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">{t('Print Configuration')}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  {t('Update your printing prices and preferences.')}
                </p>
              </div>

              {/* pricing settings cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={t('Black & White Printing')} icon={Printer}>
                  <div className="space-y-4">
                    <Field label={t('A4 (Per Page)')}>
                      <RupeeInput value={pricing.bwA4} onChange={onChange('bwA4')} placeholder="1.00" />
                    </Field>
                    <Field label={t('A3 (Per Page)')}>
                      <RupeeInput value={pricing.bwA3} onChange={onChange('bwA3')} placeholder="2.00" />
                    </Field>
                    <Field label={t('A5 (Per Page)')}>
                      <RupeeInput value={pricing.bwA5} onChange={onChange('bwA5')} placeholder="1.00" />
                    </Field>
                    <Field label={t('Legal (Per Page)')}>
                      <RupeeInput value={pricing.bwLegal} onChange={onChange('bwLegal')} placeholder="1.50" />
                    </Field>
                    <Field label={t('Letter (Per Page)')}>
                      <RupeeInput value={pricing.bwLetter} onChange={onChange('bwLetter')} placeholder="1.00" />
                    </Field>
                    <Field label={t('Double Side (Per Page)')}>
                      <RupeeInput
                        value={pricing.bwDoubleSide}
                        onChange={onChange('bwDoubleSide')}
                        placeholder="1.00"
                      />
                    </Field>
                  </div>
                </Card>

                <Card title={t('Color Printing')} icon={Printer}>
                  <div className="space-y-4">
                    <Field label={t('A4 (Per Page)')}>
                      <RupeeInput value={pricing.colorA4} onChange={onChange('colorA4')} placeholder="5.00" />
                    </Field>
                    <Field label={t('A3 (Per Page)')}>
                      <RupeeInput value={pricing.colorA3} onChange={onChange('colorA3')} placeholder="8.00" />
                    </Field>
                    <Field label={t('A5 (Per Page)')}>
                      <RupeeInput value={pricing.colorA5} onChange={onChange('colorA5')} placeholder="4.00" />
                    </Field>
                    <Field label={t('Legal (Per Page)')}>
                      <RupeeInput value={pricing.colorLegal} onChange={onChange('colorLegal')} placeholder="6.00" />
                    </Field>
                    <Field label={t('Letter (Per Page)')}>
                      <RupeeInput value={pricing.colorLetter} onChange={onChange('colorLetter')} placeholder="5.00" />
                    </Field>
                    <Field label={t('Double Side (Per Page)')}>
                      <RupeeInput
                        value={pricing.colorDoubleSide}
                        onChange={onChange('colorDoubleSide')}
                        placeholder="3.00"
                      />
                    </Field>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <PrimaryButton type="button" onClick={handleSave} disabled={saving} className="px-8 py-3">
                  {t('Save Changes')}
                </PrimaryButton>
              </div>
            </div>

            {/* Right Summary Sidebar */}
            <aside className="min-w-0 xl:pt-[46px]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <FileText size={16} />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{t('Pricing Summary')}</h3>
                </div>
                <div className="space-y-1">
                  <SummaryRow label={t('B&W A4')} value={pricingSummary.bwA4} />
                  <SummaryRow label={t('B&W A3')} value={pricingSummary.bwA3} />
                  <SummaryRow label={t('B&W A5')} value={pricingSummary.bwA5} />
                  <SummaryRow label={t('B&W Legal')} value={pricingSummary.bwLegal} />
                  <SummaryRow label={t('B&W Letter')} value={pricingSummary.bwLetter} />
                  <SummaryRow label={t('Color A4')} value={pricingSummary.colorA4} />
                  <SummaryRow label={t('Color A3')} value={pricingSummary.colorA3} />
                  <SummaryRow label={t('Color A5')} value={pricingSummary.colorA5} />
                  <SummaryRow label={t('Color Legal')} value={pricingSummary.colorLegal} />
                  <SummaryRow label={t('Color Letter')} value={pricingSummary.colorLetter} />
                  <SummaryRow label={t('Double Side B&W')} value={pricingSummary.bwDoubleSide} />
                  <SummaryRow label={t('Double Side Color')} value={pricingSummary.colorDoubleSide} />
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}
