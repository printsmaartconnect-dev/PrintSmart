'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
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
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [shopkeeperIdCode, setShopkeeperIdCode] = useState('')


  const [form, setForm] = useState(() => getProfile())
  const [contact, setContactState] = useState(() => getContact())
  const [socials, setSocialsState] = useState(() => getSocials())

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const loggedIn = getLoggedInShopkeeper()
    if (!token || !loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const shopkeeper = await response.json()
          localStorage.setItem('loggedInShopkeeper', JSON.stringify(shopkeeper))
          localStorage.setItem('shopkeeper', JSON.stringify(shopkeeper))
          setQrCodeUrl(shopkeeper.qrCodeUrl || '')
          setShopkeeperIdCode(shopkeeper.shopkeeperIdCode || shopkeeper.shopSlug || '')
          
          if (shopkeeper.isOnboarded) {
            router.replace('/shopkeeper/dashboard')
            return
          }

          if (!shopkeeper.profileCompleted) {
            // Clear any lingering localStorage onboarding data from other sessions
            localStorage.removeItem('shopkeeperProfile')
            localStorage.removeItem('shopkeeperContact')
            localStorage.removeItem('shopkeeperSocials')
            localStorage.removeItem('shopkeeperPricing')
            localStorage.removeItem('shopkeeperSetupCompleted')

            setForm({
              shopName: '',
              businessCategory: '',
              subCategory: '',
              languagePreference: '',
              shopOwnerName: shopkeeper.ownerName || '',
              businessDescription: '',
              businessEstablishedYear: '',
              gstNumber: '',
              logoDataUrl: '',
              logoUrl: shopkeeper.logoUrl || '',
            })

            setContactState({
              countryCode: '+91',
              phoneNumber: shopkeeper.phone || '',
              alternatePhone: '',
              emailAddress: shopkeeper.email || '',
              website: '',
              shopAddress: '',
            })

            setSocialsState({
              whatsapp: '',
              facebook: '',
              instagram: '',
            })

            setLogoPreview(shopkeeper.logoUrl || '')
            return
          } else {
            // If profile is completed but pricing is not, load saved DB details
            setForm({
              shopName: shopkeeper.shopName || '',
              businessCategory: shopkeeper.category || '',
              subCategory: shopkeeper.subCategory || '',
              languagePreference: shopkeeper.languagePref || '',
              shopOwnerName: shopkeeper.ownerName || '',
              businessDescription: shopkeeper.businessDescription || '',
              businessEstablishedYear: shopkeeper.businessEstablishedYear || '',
              gstNumber: shopkeeper.gstNumber || '',
              logoDataUrl: '',
              logoUrl: shopkeeper.logoUrl || '',
            })

            setContactState({
              countryCode: '+91',
              phoneNumber: shopkeeper.phone || '',
              alternatePhone: shopkeeper.alternatePhone || '',
              emailAddress: shopkeeper.email || '',
              website: shopkeeper.website || '',
              shopAddress: shopkeeper.address || '',
            })

            setSocialsState({
              whatsapp: shopkeeper.socials?.whatsapp || '',
              facebook: shopkeeper.socials?.facebook || '',
              instagram: shopkeeper.socials?.instagram || '',
            })

            setLogoPreview(shopkeeper.logoUrl || '')
            return
          }
        }
      } catch (err) {
        console.warn('Onboarding check failed, falling back:', err)
        if (isOnboardingComplete(loggedIn)) {
          router.replace('/shopkeeper/dashboard')
          return
        }
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
    }

    checkOnboardingStatus()
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
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setLogoPreview(result)
      setForm((prev) => ({ ...prev, logoDataUrl: result }))

      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const uploadUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
          const uploadResponse = await fetch(`${uploadUrl}/api/files/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            setForm((prev) => ({ ...prev, logoUrl: uploadData.fileUrl || prev.logoUrl }))
          }
        } catch (uploadErr) {
          console.warn('Logo upload failed:', uploadErr)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const onPickPaymentQr = async (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setForm((prev) => ({ ...prev, paymentQrUrl: result }))

      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const uploadUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
          const uploadResponse = await fetch(`${uploadUrl}/api/files/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            setForm((prev) => ({ ...prev, paymentQrUrl: uploadData.fileUrl || prev.paymentQrUrl }))
          }
        } catch (uploadErr) {
          console.warn('Payment QR upload failed:', uploadErr)
        }
      }
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

      const token = localStorage.getItem('authToken')
      let success = true
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
          const response = await fetch(`${apiUrl}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              shopName: form.shopName,
              ownerName: form.shopOwnerName,
              address: contact.shopAddress,
              category: form.businessCategory,
              subCategory: form.subCategory,
              languagePref: form.languagePreference,
              gstNumber: form.gstNumber,
              businessDescription: form.businessDescription,
              businessEstablishedYear: form.businessEstablishedYear,
              website: contact.website,
              alternatePhone: contact.alternatePhone,
              socials,
              pricing: null,
              logoUrl: form.logoUrl || form.logoDataUrl || null,
              phone: contact.phoneNumber,
              upiId: form.upiId,
              paymentQrUrl: form.paymentQrUrl || null,
            }),
          })
          if (response.ok) {
            const data = await response.json()
            localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
            localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
          } else {
            success = false
            const errData = await response.json().catch(() => ({}))
            alert(`Failed to save profile: ${errData.message || 'Server error'}`)
          }
        } catch (apiErr) {
          success = false
          console.warn('Failed to sync profile to backend:', apiErr)
          alert('Network connection error. Failed to sync profile with database. Please try again.')
        }
      }

      if (success) {
        router.push('/shopkeeper/onboarding/pricing-setup')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    const loggedIn = getLoggedInShopkeeper()
    const shopId = shopkeeperIdCode || loggedIn?.shopSlug || loggedIn?.id
    if (!shopId) return
    const frontendUrl = window.location.origin
    const shareUrl = `${frontendUrl}/take-a-print?shopId=${shopId}`
    navigator.clipboard.writeText(shareUrl)
    alert("Shop link copied to clipboard!")
  }

  const handleDownloadQr = async () => {
    if (!qrCodeUrl) {
      alert('QR Code not available yet. Please complete registration and try again.')
      return
    }
    try {
      const fullUrl = qrCodeUrl.startsWith('http') ? qrCodeUrl : `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrCodeUrl}`
      const response = await fetch(fullUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `shop-qr-${form.shopName || 'code'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Failed to download QR code:', err)
      const fullUrl = qrCodeUrl.startsWith('http') ? qrCodeUrl : `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrCodeUrl}`
      window.open(fullUrl, '_blank')
    }
  }

  const handlePrintQr = () => {
    if (!qrCodeUrl) return
    const fullUrl = qrCodeUrl.startsWith('http') 
      ? qrCodeUrl 
      : `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrCodeUrl}`
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${form.shopName || 'Shop'}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
            h1 { margin-bottom: 20px; font-size: 24px; color: #1e293b; }
            p { margin-top: 10px; font-size: 14px; color: #64748b; font-weight: bold; }
            img { width: 300px; height: 300px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
            @media print {
              img { width: 400px; height: 400px; }
            }
          </style>
        </head>
        <body>
          <h1>${form.shopName || 'Shop'}</h1>
          <p>Scan to upload print files</p>
          <img src="${fullUrl}" onload="window.print(); window.close();" />
          <p>Shop ID: ${shopkeeperIdCode || 'N/A'}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleShareQr = () => {
    const loggedIn = getLoggedInShopkeeper()
    const shopId = loggedIn?.id
    if (!shopId) return

    const frontendUrl = window.location.origin
    const shareUrl = `${frontendUrl}/take-a-print?shopId=${shopId}`

    if (navigator.share) {
      navigator.share({
        title: form.shopName || 'My Printing Shop',
        text: 'Scan this QR code to take a print at my shop!',
        url: shareUrl,
      }).catch((err) => console.log('Error sharing:', err))
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Shop link copied to clipboard! You can share it anywhere.'))
        .catch(() => alert(`Share URL: ${shareUrl}`))
    }
  }



  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-slate-50 transition mt-1"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Setup</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell customers about your business. This information will be visible on your shop profile.
          </p>
        </div>
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
                  <img src={logoPreview} alt="Shop logo" className="h-full w-full object-cover" />
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

              <Field label="UPI ID (for payments)" required>
                <TextInput
                  value={form.upiId || ''}
                  onChange={onFormChange('upiId')}
                  placeholder="e.g. shopname@upi"
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
            <Card title="Your Shop QR" subtitle="Scan to upload print files" icon={Tag}>
              <div className="flex flex-col items-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm flex items-center justify-center min-w-[206px] min-h-[206px] mb-3">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl.startsWith('http') ? qrCodeUrl : `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrCodeUrl}`}
                      alt="Shop QR Code"
                      className="w-[180px] h-[180px] object-contain"
                    />
                  ) : (
                    <img
                      src="/qr-placeholder.svg"
                      alt="QR placeholder"
                      className="w-[180px] h-[180px] object-contain animate-pulse"
                    />
                  )}
                </div>

                <div className="text-center mb-4">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Shop ID</div>
                  <div className="text-sm font-bold text-slate-800 break-all select-all mt-0.5">
                    {shopkeeperIdCode || '—'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <SecondaryButton
                    type="button"
                    className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                    onClick={handleCopyLink}
                  >
                    Copy Link
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                    onClick={handleDownloadQr}
                    disabled={!qrCodeUrl}
                  >
                    <Download size={12} />
                    Download
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                    onClick={handlePrintQr}
                    disabled={!qrCodeUrl}
                  >
                    Print QR
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                    onClick={handleShareQr}
                    disabled={!qrCodeUrl}
                  >
                    <Share2 size={12} />
                    Share QR
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
