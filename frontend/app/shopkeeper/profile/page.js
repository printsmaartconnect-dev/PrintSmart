'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Download,
  Facebook,
  Globe,
  Headphones,
  Image as ImageIcon,
  Instagram,
  Mail,
  MessageCircle,
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
  getPricing,
  getProfile,
  getSocials,
  STORAGE_KEYS,
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

function SidebarButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold transition ' +
        (active
          ? 'bg-violet-50 text-violet-700'
          : 'text-slate-600 hover:bg-slate-100')
      }
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon size={18} className={active ? 'text-violet-700' : 'text-slate-500'} />
      </span>
      <span className="text-sm">{label}</span>
    </button>
  )
}

function PricingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  )
}

export default function ShopkeeperProfileViewPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [contact, setContact] = useState(DEFAULT_CONTACT)
  const [socials, setSocials] = useState(DEFAULT_SOCIALS)
  const [pricing, setPricing] = useState(() => getPricing())

  useEffect(() => {
    const loggedIn = getLoggedInShopkeeper()
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    syncLocalStorageFromDb(loggedIn)
    setProfile(getProfile())
    setContact(getContact())
    setSocials(getSocials())
    setPricing(getPricing())
  }, [router])

  const handleShare = () => {
    const url = `${window.location.origin}/s/${profile.shopSlug || ''}`
    navigator.clipboard.writeText(url).then(
      () => alert('Your public shop URL has been copied to the clipboard!'),
      () => alert('Could not copy the URL. Please copy it manually from your browser.'),
    )
  }

  const handleDownloadQr = () => {
    const link = document.createElement('a')
    link.href = '/qr-placeholder.svg'
    link.download = `shop-qr-${profile.shopSlug || 'code'}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('loggedInShopkeeper')
      localStorage.removeItem('authToken')
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
      router.replace('/shopkeeper/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <DashboardHeader shopName={profile.shopName} />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px] xl:items-start">
          <aside className="flex flex-col gap-4">
            <Card>
              <div className="flex flex-col items-center">
                <div className="relative mb-3 h-24 w-24 rounded-full overflow-hidden">
                  {profile.logoDataUrl ? (
                    <Image
                      src={profile.logoDataUrl}
                      alt="Shop Logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-violet-100">
                      <ImageIcon size={40} className="text-violet-400" />
                    </div>
                  )}
                </div>
                <h1 className="text-center text-xl font-extrabold">{profile.shopName || 'Shop Name'}</h1>
                <p className="text-center text-sm text-slate-500">@{profile.shopSlug || 'shop-slug'}</p>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <SecondaryButton onClick={handleShare} icon={Share2}>
                  Share
                </SecondaryButton>
              </div>
            </Card>

            <Card>
              <nav className="space-y-2">
                <SidebarButton
                  active={activeTab === 'profile'}
                  icon={User}
                  label="Profile Setup"
                  onClick={() => setActiveTab('profile')}
                />
                <SidebarButton
                  active={activeTab === 'pricing'}
                  icon={Tag}
                  label="Pricing Setup"
                  onClick={() => setActiveTab('pricing')}
                />
              </nav>
            </Card>

            <Card>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                  <Headphones size={18} className="text-violet-700" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Need Help?</div>
                  <div className="mt-1 text-xs text-slate-500">We&apos;re here to help you set up your shop.</div>
                </div>
              </div>

              <PrimaryButton
                type="button"
                className="mt-4 w-full"
                onClick={() => router.push('/shopkeeper/support')}
              >
                Get Support
              </PrimaryButton>
            </Card>
          </aside>

          <section className="space-y-6">
            {activeTab === 'profile' ? (
              <>
                <Card title="Business Information" subtitle="Basic details about your shop" icon={Building2}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Shop Name">
                      <ReadOnlyBox value={profile.shopName} />
                    </Field>
                    <Field label="Business Category">
                      <ReadOnlyBox value={profile.businessCategory} placeholder="Printing & Photocopy" />
                    </Field>
                    <Field label="Sub Category">
                      <ReadOnlyBox value={profile.subCategory} placeholder="Xerox & Digital Prints" />
                    </Field>
                    <Field label="Language Preference">
                      <ReadOnlyBox value={profile.languagePreference} placeholder="English" />
                    </Field>
                    <Field label="Shop Owner Name">
                      <ReadOnlyBox value={profile.shopOwnerName} placeholder="—" />
                    </Field>
                    <Field label="Business Established Year">
                      <ReadOnlyBox value={profile.businessEstablishedYear} placeholder="—" />
                    </Field>
                    <Field label="GST Number">
                      <ReadOnlyBox value={profile.gstNumber} placeholder="—" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Business Description">
                        <ReadOnlyTextarea value={profile.businessDescription} placeholder="—" />
                      </Field>
                    </div>
                  </div>
                </Card>

                <Card title="Contact Details" subtitle="How customers can reach you" icon={Phone}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone Number">
                      <ReadOnlyBox value={`${contact.countryCode} ${contact.phoneNumber}`.trim()} />
                    </Field>
                    <Field label="Alternate Phone">
                      <ReadOnlyBox value={contact.alternatePhone} placeholder="—" />
                    </Field>
                    <Field label="Email Address">
                      <ReadOnlyIconBox icon={Mail} value={contact.emailAddress} placeholder="—" />
                    </Field>
                    <Field label="Website">
                      <ReadOnlyIconBox icon={Globe} value={contact.website} placeholder="—" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Shop Address">
                        <ReadOnlyTextarea value={contact.shopAddress} placeholder="—" />
                      </Field>
                    </div>
                  </div>
                </Card>

                <Card title="Social Media Links" subtitle="Connect your business profiles" icon={Share2}>
                  <div className="grid gap-4 sm:grid-cols-2">
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
              </>
            ) : (
              <Card title="Pricing Setup" subtitle="Configuration saved during onboarding" icon={Store}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PricingRow label="B&W A4 (Single Side)" value={`₹${pricing.bwA4 || '0.00'}`} />
                  <PricingRow label="B&W A3 (Single Side)" value={`₹${pricing.bwA3 || '0.00'}`} />
                  <PricingRow label="Color A4 (Single Side)" value={`₹${pricing.colorA4 || '0.00'}`} />
                  <PricingRow label="Color A3 (Single Side)" value={`₹${pricing.colorA3 || '0.00'}`} />
                  <PricingRow label="B&W Double Side" value={`₹${pricing.bwDoubleSide || '0.00'}`} />
                  <PricingRow label="Color Double Side" value={`₹${pricing.colorDoubleSide || '0.00'}`} />
                  <PricingRow label="Express Print" value={`₹${pricing.expressPrint || '0.00'}`} />
                  <PricingRow label="Auto-delete After" value={`${pricing.autoDeleteAfterHours || '24 hrs'}`} />
                </div>
              </Card>
            )}
          </section>

          <aside className="hidden xl:block space-y-6">
            <Card title="Shop QR Code" subtitle="This will be visible on your shop profile" icon={Tag}>
              <div className="flex flex-col items-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <Image
                    src="/qr-placeholder.svg"
                    alt="Shop QR Code"
                    width={180}
                    height={180}
                    priority
                  />
                </div>

                <div className="mt-4 flex w-full gap-2">
                  <SecondaryButton type="button" className="flex-1 gap-2" onClick={handleDownloadQr}>
                    <Download size={16} />
                    Download
                  </SecondaryButton>
                  <SecondaryButton type="button" className="flex-1 gap-2" onClick={handleShare}>
                    <Share2 size={16} />
                    Share
                  </SecondaryButton>
                </div>
              </div>
            </Card>

            <Card title="Social Links" subtitle="Add links visible on your profile" icon={User}>
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
          </aside>
        </div>
      </main>

      <BottomDock items={bottomDockItems} />
    </div>
  )
}