'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Headphones, MapPin, Printer, Settings2, Store, User } from 'lucide-react'

import DashboardHeader from '../../dashboard/_components/DashboardHeader'
import BottomDock from '../../dashboard/_components/BottomDock'
import { bottomDockItems } from '../../dashboard/_components/mockData'

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

import { Card, Field, PrimaryButton, SecondaryButton, SelectInput, RupeeInput, TextInput } from '../../onboarding/_components/ui'

export default function PricingSetupEditPage() {
  const router = useRouter()
  const summaryRef = useRef(null)

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [shopName, setShopName] = useState('')
  const [pricing, setPricingState] = useState({
    bwA4: '1.00',
    bwA3: '2.00',
    bwDoubleSide: '1.00',
    colorA4: '5.00',
    colorA3: '8.00',
    colorDoubleSide: '3.00',
    expressPrint: '10.00',
    autoDeleteAfterHours: '24 hrs',
    customAutoDeleteHours: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const loggedIn = getLoggedInShopkeeper()
    if (!token || !loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    setShopName(loggedIn.shopName || '')

    const fetchShopProfile = async () => {
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
          syncLocalStorageFromDb(shopkeeper)

          if (shopkeeper.pricing) {
            // Load pricing from backend
            let parsedPricing = shopkeeper.pricing
            if (typeof parsedPricing === 'string') {
              try {
                parsedPricing = JSON.parse(parsedPricing)
              } catch {
                parsedPricing = {}
              }
            }
            setPricingState((prev) => ({
              ...prev,
              ...parsedPricing,
            }))
          }
        }
      } catch (err) {
        console.warn('Failed to fetch pricing details from backend:', err)
        // Fallback to local storage
        const localPricing = getPricing()
        if (localPricing) {
          setPricingState((prev) => ({ ...prev, ...localPricing }))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchShopProfile()
  }, [router])

  const onChange = (key) => (e) => {
    const value = e.target.value
    setPricingState((prev) => ({ ...prev, [key]: value }))
  }

  const showCustomAutoDelete = pricing.autoDeleteAfterHours === 'Custom'

  const summary = useMemo(() => {
    const safe = (v) => (v === '' || v == null ? '0.00' : v)
    return {
      bwA4: safe(pricing.bwA4),
      bwA3: safe(pricing.bwA3),
      colorA4: safe(pricing.colorA4),
      colorA3: safe(pricing.colorA3),
      bwDoubleSide: safe(pricing.bwDoubleSide),
      colorDoubleSide: safe(pricing.colorDoubleSide),
      expressPrint: safe(pricing.expressPrint),
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

      const token = localStorage.getItem('authToken')
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shopName: activeProfile.shopName,
            ownerName: activeProfile.shopOwnerName,
            address: activeContact.shopAddress,
            category: activeProfile.businessCategory,
            subCategory: activeProfile.subCategory,
            languagePref: activeProfile.languagePreference,
            gstNumber: activeProfile.gstNumber,
            businessDescription: activeProfile.businessDescription,
            businessEstablishedYear: activeProfile.businessEstablishedYear,
            website: activeContact.website,
            alternatePhone: activeContact.alternatePhone,
            socials: activeSocials,
            pricing: pricing,
            logoUrl: activeProfile.logoDataUrl || activeProfile.logoUrl || null,
            phone: activeContact.phoneNumber,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
          localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
          syncLocalStorageFromDb(data.shopkeeper)
          alert('Pricing updated successfully!')
        } else {
          alert('Failed to save pricing details to backend.')
        }
      } else {
        setPricing({ ...pricing })
        alert('Pricing saved locally!')
      }
    } catch (err) {
      console.error('Error saving pricing details:', err)
      alert('An error occurred while saving pricing.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader shopName={shopName} notificationCount={9} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-28">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:flex w-72 flex-col rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                  <Store size={18} />
                </span>
                <span className="text-lg font-bold text-slate-900">PrintSmart</span>
              </div>
            </div>

            <nav className="px-4 space-y-2">
              <SidebarNavItem href="/shopkeeper/profile" active={false} icon={User}>
                Profile Setup
              </SidebarNavItem>
              <SidebarNavItem href="/shopkeeper/profile/pricing" active={true} icon={Store}>
                Pricing Setup
              </SidebarNavItem>
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

                <PrimaryButton
                  type="button"
                  className="mt-4 w-full"
                  onClick={() => router.push('/shopkeeper/support')}
                >
                  Get Support
                </PrimaryButton>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Pricing Setup</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Set your print pricing and service charges. You can change these anytime.
                </p>
              </div>
              <SecondaryButton
                type="button"
                className="gap-2 self-start"
                onClick={() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <FileText size={16} />
                Pricing Summary
              </SecondaryButton>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left: Pricing cards */}
              <div className="xl:col-span-9">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card title="Black & White Printing" icon={Printer}>
                    <div className="space-y-4">
                      <Field label="A4 (Per Page)">
                        <RupeeInput value={pricing.bwA4} onChange={onChange('bwA4')} placeholder="1.00" />
                      </Field>
                      <Field label="A3 (Per Page)">
                        <RupeeInput value={pricing.bwA3} onChange={onChange('bwA3')} placeholder="2.00" />
                      </Field>
                      <Field label="Double Side (Per Page)">
                        <RupeeInput
                          value={pricing.bwDoubleSide}
                          onChange={onChange('bwDoubleSide')}
                          placeholder="1.00"
                        />
                      </Field>
                    </div>
                  </Card>

                  <Card title="Color Printing" icon={Printer}>
                    <div className="space-y-4">
                      <Field label="A4 (Per Page)">
                        <RupeeInput value={pricing.colorA4} onChange={onChange('colorA4')} placeholder="5.00" />
                      </Field>
                      <Field label="A3 (Per Page)">
                        <RupeeInput value={pricing.colorA3} onChange={onChange('colorA3')} placeholder="8.00" />
                      </Field>
                      <Field label="Double Side (Per Page)">
                        <RupeeInput
                          value={pricing.colorDoubleSide}
                          onChange={onChange('colorDoubleSide')}
                          placeholder="3.00"
                        />
                      </Field>
                    </div>
                  </Card>

                  <Card title="Other Settings" icon={Settings2}>
                    <div className="space-y-4">
                      <Field label="Express Print (Extra Charges)">
                        <RupeeInput
                          value={pricing.expressPrint}
                          onChange={onChange('expressPrint')}
                          placeholder="10.00"
                        />
                      </Field>
                      <Field label="Auto Delete After (Hours)">
                        <SelectInput
                          value={pricing.autoDeleteAfterHours}
                          onChange={(e) =>
                            setPricingState((prev) => ({
                              ...prev,
                              autoDeleteAfterHours: e.target.value,
                            }))
                          }
                        >
                          <option value="1 hrs">1 hrs</option>
                          <option value="24 hrs">24 hrs</option>
                          <option value="Custom">Custom</option>
                        </SelectInput>
                      </Field>

                      {showCustomAutoDelete ? (
                        <Field label="Custom Hours">
                          <TextInput
                            type="number"
                            min={1}
                            value={pricing.customAutoDeleteHours || ''}
                            onChange={(e) =>
                              setPricingState((prev) => ({
                                ...prev,
                                customAutoDeleteHours: e.target.value,
                              }))
                            }
                            placeholder="Enter hours"
                            inputMode="numeric"
                          />
                        </Field>
                      ) : null}
                    </div>
                  </Card>
                </div>

                <div className="mt-6 flex justify-end">
                  <PrimaryButton type="button" onClick={handleSave} disabled={saving} className="px-8">
                    {saving ? 'Saving...' : 'Save Pricing'}
                  </PrimaryButton>
                </div>
              </div>

              {/* Right: Pricing summary */}
              <div className="xl:col-span-3" ref={summaryRef}>
                <Card title="Pricing Summary" icon={FileText}>
                  <div className="space-y-3 text-sm">
                    <SummaryRow label="B&W A4" value={summary.bwA4} />
                    <SummaryRow label="B&W A3" value={summary.bwA3} />
                    <SummaryRow label="Color A4" value={summary.colorA4} />
                    <SummaryRow label="Color A3" value={summary.colorA3} />
                    <SummaryRow label="Double Side B&W" value={summary.bwDoubleSide} />
                    <SummaryRow label="Double Side Color" value={summary.colorDoubleSide} />
                    <SummaryRow label="Express Print" value={summary.expressPrint} />
                  </div>
                </Card>
              </div>
            </div>

            {/* Small-screen substitute help & setup buttons */}
            <div className="lg:hidden mt-6 rounded-2xl bg-white shadow-sm border border-slate-200 p-4 space-y-4">
              <div className="flex gap-2">
                <SecondaryButton type="button" className="flex-1" onClick={() => router.push('/shopkeeper/profile')}>
                  Profile Setup
                </SecondaryButton>
                <PrimaryButton type="button" className="flex-1">
                  Pricing Setup
                </PrimaryButton>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MapPin size={16} className="text-violet-700" />
                  Need Help?
                </div>
                <div className="mt-1 text-xs text-slate-500">We&apos;re here to help you set up your shop.</div>
                <PrimaryButton type="button" className="mt-3 w-full" onClick={() => router.push('/shopkeeper/support')}>
                  Get Support
                </PrimaryButton>
              </div>
            </div>
          </section>
        </div>
      </div>

      <BottomDock items={bottomDockItems} />
    </div>
  )
}

function SidebarNavItem({ active, icon: Icon, children, href }) {
  const base = active
    ? 'flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-2.5 text-violet-700 font-semibold w-full'
    : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold w-full'

  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon size={18} className={active ? 'text-violet-700' : 'text-slate-500'} />
      </span>
      <span className="text-sm">{children}</span>
    </>
  )

  const router = useRouter()

  return (
    <button type="button" onClick={() => router.push(href)} className={base}>
      {inner}
    </button>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">₹{value}</span>
    </div>
  )
}
