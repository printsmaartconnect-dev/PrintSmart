'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Building2,
  Download,
  Globe,
  Headphones,
  Image as ImageIcon,
  Instagram,
  Mail,
  MessageCircle,
  Facebook,
  Phone,
  Share2,
  Store,
  Tag,
  User,
} from 'lucide-react'

import DashboardHeader from '../dashboard/_components/DashboardHeader'
import BottomDock from '../dashboard/_components/BottomDock'
import { bottomDockItems } from '../dashboard/_components/mockData'

import {
  getContact,
  getLoggedInShopkeeper,
  getProfile,
  getSocials,
  syncLocalStorageFromDb,
} from '../onboarding/_components/onboardingStorage'

import { Card, Field, PrimaryButton, SecondaryButton } from '../onboarding/_components/ui'
import { ReadOnlyBox, ReadOnlyIconBox, ReadOnlyTextarea } from './_components/ReadOnlyField'

const DEFAULT_PROFILE = {
  shopName: '',
  businessCategory: '',
  subCategory: '',
  languagePreference: '',
  shopOwnerName: '',
  businessDescription: '',
  businessEstablishedYear: '',
  gstNumber: '',
  logoDataUrl: '',
  shopkeeperIdCode: '',
  shopSlug: '',
}

const DEFAULT_CONTACT = {
  countryCode: '+91',
  phoneNumber: '',
  alternatePhone: '',
  emailAddress: '',
  website: '',
  shopAddress: '',
}

const DEFAULT_SOCIALS = {
  whatsapp: '',
  facebook: '',
  instagram: '',
}

function SidebarNavItem({ active, icon: Icon, children, href }) {
  const base =
    active
      ? 'flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-2.5 text-violet-700 font-semibold'
      : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold'

  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon size={18} className={active ? 'text-violet-700' : 'text-slate-500'} />
      </span>
      <span className="text-sm">{children}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={base}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={base} role="presentation">
      {inner}
    </div>
  )
}

export default function ShopkeeperProfileViewPage() {
  const router = useRouter()
  const pathname = usePathname()

  // Keep first render deterministic across server and client to avoid hydration mismatch.
  const [profile, setProfileState] = useState(DEFAULT_PROFILE)
  const [contact, setContactState] = useState(DEFAULT_CONTACT)
  const [socials, setSocialsState] = useState(DEFAULT_SOCIALS)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrDetails, setQrDetails] = useState({
    shopId: '',
    slug: '',
    qrCodeUrl: '',
    qrValue: ''
  })
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    const loggedIn = getLoggedInShopkeeper()
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    // Sync database shopkeeper details to local storage
    syncLocalStorageFromDb(loggedIn)

    const p = getProfile()
    const c = getContact()
    const s = getSocials()

    setProfileState(p)
    setContactState({
      ...c,
      phoneNumber: c.phoneNumber || loggedIn.phone || '',
      emailAddress: c.emailAddress || loggedIn.email || '',
    })
    setSocialsState(s)
    setQrCodeUrl(loggedIn.qrCodeUrl || '')

    // Fetch QR Details from backend
    const fetchQrDetails = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) return
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/shopkeeper/me/qr`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setQrDetails(data)
        }
      } catch (err) {
        console.error("Failed to fetch QR details:", err)
      }
    }
    fetchQrDetails()
  }, [router])

  const handleCopyLink = () => {
    const linkToCopy = qrDetails.qrValue || (qrCodeUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${qrCodeUrl}` : '')
    if (linkToCopy) {
      navigator.clipboard.writeText(linkToCopy)
      alert("Shop link copied to clipboard!")
    }
  }

  const handleDownloadQR = () => {
    const targetUrl = qrDetails.qrCodeUrl || qrCodeUrl
    if (targetUrl) {
      const fullUrl = targetUrl.startsWith('/') 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${targetUrl}` 
        : targetUrl;
      
      const link = document.createElement('a')
      link.href = fullUrl
      link.download = `shop-qr-${qrDetails.slug || profile.shopSlug || 'code'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrintQR = () => {
    const targetUrl = qrDetails.qrCodeUrl || qrCodeUrl
    if (targetUrl) {
      const fullUrl = targetUrl.startsWith('/') 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${targetUrl}` 
        : targetUrl;
      
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${profile.shopName || 'Shop'}</title>
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
            <h1>${profile.shopName || 'Shop'}</h1>
            <p>Scan to upload print files</p>
            <img src="${fullUrl}" onload="window.print(); window.close();" />
            <p>Shop ID: ${qrDetails.shopId || qrDetails.slug || profile.shopSlug || 'N/A'}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleShareQR = async () => {
    const linkToShare = qrDetails.qrValue || (qrCodeUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${qrCodeUrl}` : '')
    if (navigator.share && linkToShare) {
      try {
        await navigator.share({
          title: profile.shopName || 'PrintSmart Shop',
          text: 'Scan to upload print files and print directly at our shop!',
          url: linkToShare
        })
      } catch (err) {
        console.error('Web Share failed:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleRegenerateQr = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return
    setRegenerating(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/shopkeeper/regenerate-qr`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQrDetails({
          shopId: data.shopId,
          slug: data.slug,
          qrCodeUrl: data.qrCodeUrl,
          qrValue: data.qrValue
        })
        alert("QR Code regenerated successfully!")
      } else {
        alert("Failed to regenerate QR code.")
      }
    } catch (err) {
      console.error("Regenerate QR failed:", err)
      alert("Error regenerating QR code.")
    } finally {
      setRegenerating(false)
    }
  }

  const shopName = useMemo(() => profile.shopName || 'Shree Ganesh Xerox & Prints', [profile.shopName])

  const isProfileActive = pathname?.includes('/shopkeeper/profile')

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
              <SidebarNavItem
                href="/shopkeeper/profile"
                active={!!isProfileActive}
                icon={User}
              >
                Profile Setup
              </SidebarNavItem>
              <SidebarNavItem
                active={false}
                icon={Store}
              >
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Profile Setup</h1>
              <p className="mt-1 text-sm text-slate-500">
                Tell customers about your business. This information will be visible on your shop profile.
              </p>

              <div className="mt-4 rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3 text-sm text-violet-800">
                To request changes to your profile details, please use the Help &amp; Support option.
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Business Info */}
              <div className="xl:col-span-5">
                <Card
                  title="Business Information"
                  subtitle="Basic details about your shop"
                  icon={Building2}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {profile.logoDataUrl ? (
                        <Image src={profile.logoDataUrl} alt="Shop logo" width={64} height={64} />
                      ) : (
                        <ImageIcon size={22} className="text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 pt-1">
                      Shop logo is managed via support.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Field label="Shop Name" required>
                        <ReadOnlyBox value={profile.shopName} />
                      </Field>
                    </div>

                    <Field label="Business Category" required>
                      <ReadOnlyBox value={profile.businessCategory} placeholder="Printing & Photocopy" />
                    </Field>

                    <Field label="Sub Category">
                      <ReadOnlyBox value={profile.subCategory} placeholder="Xerox & Digital Prints" />
                    </Field>

                    <Field label="Language Preference" required>
                      <ReadOnlyBox value={profile.languagePreference} placeholder="Select language..." />
                    </Field>

                    <Field label="Shop Owner Name">
                      <ReadOnlyBox value={profile.shopOwnerName} placeholder="—" />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Business Description" required>
                        <ReadOnlyTextarea value={profile.businessDescription} className="min-h-[110px]" />
                      </Field>
                    </div>

                    <Field label="Business Established Year">
                      <ReadOnlyBox value={profile.businessEstablishedYear} placeholder="—" />
                    </Field>

                    <Field label="GST Number (Optional)">
                      <ReadOnlyBox value={profile.gstNumber} placeholder="—" />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Shopkeeper ID">
                        <ReadOnlyBox value={profile.shopSlug || '—'} />
                      </Field>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Middle Column: Contact Info */}
              <div className="xl:col-span-4">
                <Card title="Contact Information" subtitle="How customers can reach you" icon={Phone}>
                  <div className="space-y-4">
                    <Field label="Phone Number" required>
                      <div className="flex gap-2">
                        <ReadOnlyBox value={contact.countryCode} className="w-28 text-center" />
                        <ReadOnlyBox value={contact.phoneNumber} placeholder="—" />
                      </div>
                    </Field>

                    <Field label="Alternate Phone">
                      <ReadOnlyBox value={contact.alternatePhone} placeholder="—" />
                    </Field>

                    <Field label="Email Address" required>
                      <ReadOnlyIconBox icon={Mail} value={contact.emailAddress} placeholder="—" />
                    </Field>

                    <Field label="Website (Optional)">
                      <ReadOnlyIconBox icon={Globe} value={contact.website} placeholder="—" />
                    </Field>

                    <Field label="Shop Address" required>
                      <ReadOnlyTextarea value={contact.shopAddress} className="min-h-[160px]" />
                    </Field>
                  </div>
                </Card>
              </div>

              {/* Right Panel: QR + Social */}
              <div className="xl:col-span-3">
                <div className="space-y-6">
                  <Card title="Your Shop QR" subtitle="Scan to upload print files" icon={Tag}>
                    <div className="flex flex-col items-center">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm relative w-[180px] h-[180px] flex items-center justify-center mb-3">
                        {qrDetails.qrCodeUrl ? (
                          <img
                            src={qrDetails.qrCodeUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${qrDetails.qrCodeUrl}` : qrDetails.qrCodeUrl}
                            alt="Shop QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : qrCodeUrl ? (
                          <img
                            src={qrCodeUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${qrCodeUrl}` : qrCodeUrl}
                            alt="Shop QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img src="/qr-placeholder.svg" alt="QR placeholder" className="w-full h-full object-contain" />
                        )}
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Shop ID</div>
                        <div className="text-sm font-bold text-slate-800 break-all select-all mt-0.5">
                          {qrDetails.shopId || profile.shopkeeperIdCode || '—'}
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
                          onClick={handleDownloadQR}
                        >
                          <Download size={12} />
                          Download
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                          onClick={handlePrintQR}
                        >
                          Print QR
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                          onClick={handleShareQR}
                        >
                          <Share2 size={12} />
                          Share QR
                        </SecondaryButton>
                      </div>

                      <button
                        type="button"
                        onClick={handleRegenerateQr}
                        disabled={regenerating}
                        className="mt-4 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition disabled:text-slate-400"
                      >
                        {regenerating ? 'Regenerating...' : 'Regenerate QR Code'}
                      </button>
                    </div>
                  </Card>

                  <Card title="Social Links" subtitle="Visible on your profile" icon={User}>
                    <div className="space-y-4">
                      <Field label="WhatsApp">
                        <ReadOnlyIconBox icon={MessageCircle} value={socials.whatsapp} placeholder="—" />
                      </Field>
                      <Field label="Facebook">
                        <ReadOnlyIconBox icon={Facebook} value={socials.facebook} placeholder="—" />
                      </Field>
                      <Field label="Instagram">
                        <ReadOnlyIconBox icon={Instagram} value={socials.instagram} placeholder="—" />
                      </Field>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Small-screen help card (matches onboarding pattern) */}
            <div className="lg:hidden mt-6 rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Headphones size={16} className="text-violet-700" />
                Need Help?
              </div>
              <div className="mt-1 text-xs text-slate-500">We&apos;re here to help you set up your shop.</div>
              <PrimaryButton type="button" className="mt-3 w-full" onClick={() => router.push('/shopkeeper/support')}>
                Get Support
              </PrimaryButton>
            </div>
          </section>
        </div>
      </div>

      <BottomDock items={bottomDockItems} />
    </div>
  )
}
