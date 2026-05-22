'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, MapPin, Printer, Settings2 } from 'lucide-react'
import {
  getContact,
  getLoggedInShopkeeper,
  getProfile,
  getPricing,
  validatePricingRequired,
  validateProfileRequired,
  setPricing,
  setSetupCompleted,
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
    const loggedIn = getLoggedInShopkeeper()
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }
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
    try {
      const profileValidation = validateProfileRequired(getProfile(), getContact())
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
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
              <SummaryRow label="Color A4" value={summary.colorA4} />
              <SummaryRow label="Color A3" value={summary.colorA3} />
              <SummaryRow label="Double Side B&W" value={summary.bwDoubleSide} />
              <SummaryRow label="Double Side Color" value={summary.colorDoubleSide} />
              <SummaryRow label="Express Print" value={summary.expressPrint} />
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
        <PrimaryButton type="button" className="mt-3 w-full">Get Support</PrimaryButton>
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
