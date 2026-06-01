'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, MapPin, Printer, Settings2 } from 'lucide-react'
import {
  getContact,
  getLoggedInShopkeeper,
  getProfile,
  getPricing,
  getSocials,
  validatePricingRequired,
  validateProfileRequired,
  setPricing,
  setSetupCompleted,
  syncLocalStorageFromDb,
  STORAGE_KEYS,
} from '../_components/onboardingStorage'
import {
  Card,
  Field,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  RupeeInput,
  TextInput,
} from '../_components/ui'

export default function PricingSetupPage() {
  const router = useRouter()
  const summaryRef = useRef(null)

  const [saving, setSaving] = useState(false)
  const [pricing, setPricingState] = useState(() => getPricing())

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
          
          // Sync database profile to local storage so validation has matching values
          syncLocalStorageFromDb(shopkeeper)

          if (shopkeeper.isOnboarded) {
            router.replace('/shopkeeper/dashboard')
            return
          }
        }
      } catch (err) {
        console.warn('Pricing setup onboarding check failed:', err)
      }
    }

    checkOnboardingStatus()
  }, [router])

  const onChange = (key) => (e) => {
    const value = e.target.value
    setPricingState((prev) => ({ ...prev, [key]: value }))
  }

  const summary = useMemo(() => {
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
    try {
      const activeProfile = getProfile()
      const activeContact = getContact()
      const activeSocials = getSocials()

      const profileValidation = validateProfileRequired(activeProfile, activeContact)
      if (!profileValidation.ok) {
        alert(`Please complete Profile Setup first: ${profileValidation.missing.join(', ')}`)
        router.push('/shopkeeper/onboarding/profile-setup')
        return
      }

      const pricingValidation = validatePricingRequired(pricing)
      if (!pricingValidation.ok) {
        alert(`Please fill all required pricing fields: ${pricingValidation.missing.join(', ')}`)
        return
      }

      setSaving(true)

      // Send update to the backend database
      const token = localStorage.getItem("authToken")
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          const response = await fetch(`${apiUrl}/api/auth/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
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
            })
          })

          if (response.ok) {
            const data = await response.json()
            // Update local storage with fresh DB values (including slug and QR url)
            localStorage.setItem("loggedInShopkeeper", JSON.stringify(data.shopkeeper))
            localStorage.setItem("shopkeeper", JSON.stringify(data.shopkeeper))
          } else {
            console.error("Failed to sync onboarding profile with backend")
          }
        } catch (apiErr) {
          console.error("API error during onboarding save:", apiErr)
        }
      }

      setPricing({ ...pricing })
      setSetupCompleted(true)

      // Keep existing storage keys intact; add setupCompleted metadata to account if present
      const accountRaw = window.localStorage.getItem(STORAGE_KEYS.shopkeeper)
      if (accountRaw) {
        try {
          const account = JSON.parse(accountRaw)
          window.localStorage.setItem(
            STORAGE_KEYS.shopkeeper,
            JSON.stringify({ ...account, setupCompleted: true })
          )
        } catch {
          // ignore
        }
      }

      router.push('/shopkeeper/dashboard')
    } catch (err) {
      console.error("Onboarding pricing-setup save error:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-slate-50 transition mt-1 flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
        </div>
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
                <Field label="A5 (Per Page)">
                  <RupeeInput value={pricing.bwA5} onChange={onChange('bwA5')} placeholder="1.00" />
                </Field>
                <Field label="Legal (Per Page)">
                  <RupeeInput value={pricing.bwLegal} onChange={onChange('bwLegal')} placeholder="1.50" />
                </Field>
                <Field label="Letter (Per Page)">
                  <RupeeInput value={pricing.bwLetter} onChange={onChange('bwLetter')} placeholder="1.00" />
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
                <Field label="A5 (Per Page)">
                  <RupeeInput value={pricing.colorA5} onChange={onChange('colorA5')} placeholder="4.00" />
                </Field>
                <Field label="Legal (Per Page)">
                  <RupeeInput value={pricing.colorLegal} onChange={onChange('colorLegal')} placeholder="6.00" />
                </Field>
                <Field label="Letter (Per Page)">
                  <RupeeInput value={pricing.colorLetter} onChange={onChange('colorLetter')} placeholder="5.00" />
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
          </div>

          <div className="mt-6 flex justify-end">
            <PrimaryButton type="button" onClick={handleSave} disabled={saving} className="px-8">
              Save Pricing
            </PrimaryButton>
          </div>
        </div>

        {/* Right: Pricing summary */}
        <div className="xl:col-span-3" ref={summaryRef}>
          <Card title="Pricing Summary" icon={FileText}>
            <div className="space-y-3 text-sm">
              <SummaryRow label="B&W A4" value={summary.bwA4} />
              <SummaryRow label="B&W A3" value={summary.bwA3} />
              <SummaryRow label="B&W A5" value={summary.bwA5} />
              <SummaryRow label="B&W Legal" value={summary.bwLegal} />
              <SummaryRow label="B&W Letter" value={summary.bwLetter} />
              <SummaryRow label="Color A4" value={summary.colorA4} />
              <SummaryRow label="Color A3" value={summary.colorA3} />
              <SummaryRow label="Color A5" value={summary.colorA5} />
              <SummaryRow label="Color Legal" value={summary.colorLegal} />
              <SummaryRow label="Color Letter" value={summary.colorLetter} />
              <SummaryRow label="Double Side B&W" value={summary.bwDoubleSide} />
              <SummaryRow label="Double Side Color" value={summary.colorDoubleSide} />
            </div>
          </Card>
        </div>
      </div>

      {/* Small-screen sidebar substitute */}
      <div className="lg:hidden mt-6 rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MapPin size={16} className="text-violet-700" />
          Need Help?
        </div>
        <div className="mt-1 text-xs text-slate-500">We&apos;re here to help you set up your shop.</div>
        <a
          href="https://forms.gle/VBK48SwGSWm7prgUA"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          Get Support
        </a>
      </div>
    </div>
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
