'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Download,
  Globe,
  Image as ImageIcon,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Share2,
  Tag,
  User,
  MessageCircle,
  Facebook,
} from 'lucide-react'
import {
  getLoggedInShopkeeper,
  getContact,
  getProfile,
  getSocials,
  setProfile,
  setContact,
  setSocials,
  isOnboardingComplete,
  validateProfileRequired,
} from '../_components/onboardingStorage'
import {
  Card,
  Field,
  IconInput,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  Textarea,
  TextInput,
} from '../_components/ui'

const MAX_SHOP_NAME = 60
const MAX_DESCRIPTION = 250

export default function ProfileSetupPage() {
  const router = useRouter()

  const [logoPreview, setLogoPreview] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState(() => getProfile())
  const [contact, setContactState] = useState(() => getContact())
  const [socials, setSocialsState] = useState(() => getSocials())

  useEffect(() => {
    const loggedIn = getLoggedInShopkeeper()
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    if (isOnboardingComplete(loggedIn)) {
      router.replace('/shopkeeper/dashboard')
      return
    }

    const existing = getProfile()
    setForm(existing)
    setLogoPreview(existing.logoDataUrl || '')

    const existingContact = getContact()
    const existingSocials = getSocials()

    setContactState({
      ...existingContact,
      phoneNumber: existingContact.phoneNumber || loggedIn.phone || '',
      emailAddress: existingContact.emailAddress || loggedIn.email || '',
    })
    setSocialsState(existingSocials)
  }, [router])

  const shopNameCount = useMemo(() => (form.shopName || '').length, [form.shopName])
  const descriptionCount = useMemo(
    () => (form.businessDescription || '').length,
    [form.businessDescription]
  )

  const onFormChange = (key) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onContactChange = (key) => (e) => {
    const value = e.target.value
    setContactState((prev) => ({ ...prev, [key]: value }))
  }

  const onSocialChange = (key) => (e) => {
    const value = e.target.value
    setSocialsState((prev) => ({ ...prev, [key]: value }))
  }

  const onPickLogo = async (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setLogoPreview(result)
      setForm((prev) => ({ ...prev, logoDataUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleContinue = async () => {
    const validation = validateProfileRequired(form, contact)
    if (!validation.ok) {
      alert(`Please fill all mandatory fields: ${validation.missing.join(', ')}`)
      return
    }

    setSaving(true)
    try {
      setProfile({ ...form })
      setContact({ ...contact })
      setSocials({ ...socials })
      router.push('/shopkeeper/onboarding/pricing-setup')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile Setup</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell customers about your business. This information will be visible on your shop profile.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Business Info */}
        <div className="xl:col-span-5">
          <Card
            title="Business Information"
            subtitle="Basic details about your shop"
            icon={Building2}
            action={
              <label className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 border border-violet-100 cursor-pointer hover:bg-violet-100">
                <ImageIcon size={16} />
                Set Shop Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickLogo(e.target.files?.[0])}
                />
              </label>
            }
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                {logoPreview ? (
                  // next/image supports data URL
                  <Image src={logoPreview} alt="Shop logo" width={64} height={64} />
                ) : (
                  <ImageIcon size={22} className="text-slate-400" />
                )}
              </div>
              <div className="text-xs text-slate-500 pt-1">
                Upload a square logo for best results.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Shop Name" required hintRight={`${shopNameCount}/${MAX_SHOP_NAME}`}>
                  <TextInput
                    value={form.shopName}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, MAX_SHOP_NAME)
                      setForm((prev) => ({ ...prev, shopName: value }))
                    }}
                    placeholder="Enter shop name"
                  />
                </Field>
              </div>

              <Field label="Business Category" required>
                <SelectInput value={form.businessCategory} onChange={onFormChange('businessCategory')}>
                  <option value="">Select category...</option>
                  <option value="Printing & Photocopy">Printing &amp; Photocopy</option>
                </SelectInput>
              </Field>

              <Field label="Sub Category">
                <SelectInput value={form.subCategory} onChange={onFormChange('subCategory')}>
                  <option value="">Select sub category...</option>
                  <option value="Xerox & Digital Prints">Xerox &amp; Digital Prints</option>
                </SelectInput>
              </Field>

              <Field label="Language Preference" required>
                <SelectInput value={form.languagePreference} onChange={onFormChange('languagePreference')}>
                  <option value="">Select language...</option>
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Hindi">Hindi</option>
                </SelectInput>
              </Field>

              <Field label="Shop Owner Name">
                <TextInput
                  value={form.shopOwnerName}
                  onChange={onFormChange('shopOwnerName')}
                  placeholder="Enter owner's full name"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Business Description" required hintRight={`${descriptionCount}/${MAX_DESCRIPTION}`}>
                  <Textarea
                    value={form.businessDescription}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, MAX_DESCRIPTION)
                      setForm((prev) => ({ ...prev, businessDescription: value }))
                    }}
                    placeholder="Tell customers what you offer"
                  />
                </Field>
              </div>

              <Field label="Business Established Year">
                <TextInput
                  type="number"
                  value={form.businessEstablishedYear}
                  onChange={onFormChange('businessEstablishedYear')}
                  placeholder="e.g. 2018"
                />
              </Field>

              <Field label="GST Number (Optional)">
                <TextInput
                  value={form.gstNumber}
                  onChange={onFormChange('gstNumber')}
                  placeholder="Enter GST number"
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Middle Column: Contact Info */}
        <div className="xl:col-span-4">
          <Card
            title="Contact Information"
            subtitle="How customers can reach you"
            icon={Phone}
          >
            <div className="space-y-4">
              <Field label="Phone Number" required>
                <div className="flex gap-2">
                  <SelectInput
                    className="w-28"
                    value={contact.countryCode}
                    onChange={onContactChange('countryCode')}
                    aria-label="Country code"
                  >
                    <option value="+91">+91</option>
                  </SelectInput>
                  <TextInput
                    value={contact.phoneNumber}
                    onChange={onContactChange('phoneNumber')}
                    placeholder="98765 43210"
                    inputMode="tel"
                  />
                </div>
              </Field>

              <Field label="Alternate Phone">
                <TextInput
                  value={contact.alternatePhone}
                  onChange={onContactChange('alternatePhone')}
                  placeholder="91234 56789"
                  inputMode="tel"
                />
              </Field>

              <Field label="Email Address" required>
                <IconInput
                  icon={Mail}
                  type="email"
                  value={contact.emailAddress}
                  onChange={onContactChange('emailAddress')}
                  placeholder="you@domain.com"
                />
              </Field>

              <Field label="Website (Optional)">
                <IconInput
                  icon={Globe}
                  value={contact.website}
                  onChange={onContactChange('website')}
                  placeholder="www.yourshop.com"
                />
              </Field>

              <Field label="Shop Address" required>
                <Textarea
                  value={contact.shopAddress}
                  onChange={onContactChange('shopAddress')}
                  placeholder="Enter shop address"
                  className="min-h-[160px]"
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Right Panel: QR + Social */}
        <div className="xl:col-span-3">
          <div className="space-y-6">
            <Card
              title="Shop QR Code"
              subtitle="This will be visible on your shop profile"
              icon={Tag}
            >
              <div className="flex flex-col items-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <Image
                    src="/qr-placeholder.svg"
                    alt="QR placeholder"
                    width={180}
                    height={180}
                    priority
                  />
                </div>

                <div className="mt-4 flex w-full gap-2">
                  <SecondaryButton type="button" className="flex-1 gap-2">
                    <Download size={16} />
                    Download
                  </SecondaryButton>
                  <SecondaryButton type="button" className="flex-1 gap-2">
                    <Share2 size={16} />
                    Share
                  </SecondaryButton>
                </div>
              </div>
            </Card>

            <Card title="Social Links" subtitle="Add links visible on your profile" icon={User}>
              <div className="space-y-4">
                <Field label="WhatsApp">
                  <IconInput
                    icon={MessageCircle}
                    value={socials.whatsapp}
                    onChange={onSocialChange('whatsapp')}
                    placeholder="WhatsApp number or link"
                  />
                </Field>
                <Field label="Facebook">
                  <IconInput
                    icon={Facebook}
                    value={socials.facebook}
                    onChange={onSocialChange('facebook')}
                    placeholder="facebook.com/yourpage"
                  />
                </Field>
                <Field label="Instagram">
                  <IconInput
                    icon={Instagram}
                    value={socials.instagram}
                    onChange={onSocialChange('instagram')}
                    placeholder="instagram.com/yourhandle"
                  />
                </Field>
              </div>
            </Card>

            <div className="flex justify-end">
              <PrimaryButton type="button" onClick={handleContinue} disabled={saving} className="w-full">
                Save &amp; Continue
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Small-screen sidebar substitute */}
      <div className="lg:hidden mt-6 rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MapPin size={16} className="text-violet-700" />
          Need Help?
        </div>
        <div className="mt-1 text-xs text-slate-500">We&apos;re here to help you set up your shop.</div>
        <PrimaryButton type="button" className="mt-3 w-full">
          Get Support
        </PrimaryButton>
      </div>
    </div>
  )
}
