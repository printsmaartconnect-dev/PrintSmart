'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
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
  X,
} from 'lucide-react'

import DashboardHeader from '../dashboard/_components/DashboardHeader'
import BottomDock from '../dashboard/_components/BottomDock'
import { bottomDockItems } from '../dashboard/_components/mockData'

import { usePoster } from '../../../hooks/usePoster'
import PosterTemplate from '../../../components/poster/PosterTemplate'

import {
  getContact,
  getLoggedInShopkeeper,
  getProfile,
  getSocials,
  syncLocalStorageFromDb,
} from '../onboarding/_components/onboardingStorage'

import { Card, Field, PrimaryButton, SecondaryButton, TextInput } from '../onboarding/_components/ui'
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
  upiId: '',
  paymentQrUrl: '',
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
  const { t } = useTranslation()
  const base =
    active
      ? 'flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-2.5 text-violet-700 font-semibold'
      : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold'

  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon size={18} className={active ? 'text-violet-700' : 'text-slate-500'} />
      </span>
      <span className="text-sm">{t(children)}</span>
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
  const { t } = useTranslation()
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

  const [editingUpi, setEditingUpi] = useState(false)
  const [upiValue, setUpiValue] = useState('')
  const [savingUpi, setSavingUpi] = useState(false)

  const {
    loading: posterLoading,
    error: posterError,
    posterData,
    isPreviewOpen,
    loadPosterData,
    downloadPDF,
    print,
    openPreview,
    closePreview,
  } = usePoster()

  useEffect(() => {
    const loggedIn = getLoggedInShopkeeper()
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    const fetchFreshProfile = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) return
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const dbShopkeeper = await response.json()
          localStorage.setItem('loggedInShopkeeper', JSON.stringify(dbShopkeeper))
          localStorage.setItem('shopkeeper', JSON.stringify(dbShopkeeper))
          syncLocalStorageFromDb(dbShopkeeper)
          
          const p = getProfile()
          const c = getContact()
          const s = getSocials()

          setProfileState(p)
          setUpiValue(p.upiId || '')
          setContactState({
            ...c,
            phoneNumber: c.phoneNumber || dbShopkeeper.phone || '',
            emailAddress: c.emailAddress || dbShopkeeper.email || '',
          })
          setSocialsState(s)
          setQrCodeUrl(dbShopkeeper.qrCodeUrl || '')
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile from DB:", err)
      }
    }

    // Initialize with local storage values first
    syncLocalStorageFromDb(loggedIn)

    const p = getProfile()
    const c = getContact()
    const s = getSocials()

    setProfileState(p)
    setUpiValue(p.upiId || '')
    setContactState({
      ...c,
      phoneNumber: c.phoneNumber || loggedIn.phone || '',
      emailAddress: c.emailAddress || loggedIn.email || '',
    })
    setSocialsState(s)
    setQrCodeUrl(loggedIn.qrCodeUrl || '')

    // Fetch fresh profile details from DB
    fetchFreshProfile()

    // Fetch QR Details from backend
    const fetchQrDetails = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) return
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
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
    const linkToCopy = qrDetails.qrValue || (qrCodeUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrCodeUrl}` : '')
    if (linkToCopy) {
      navigator.clipboard.writeText(linkToCopy)
      alert("Shop link copied to clipboard!")
    }
  }

  const handleDownloadQR = async () => {
    const shopId = qrDetails.slug || profile.shopkeeperIdCode || profile.shopSlug || 'code';
    const qrVal = qrDetails.qrValue || `https://print-smart-18.vercel.app/shop/${shopId}`;
    const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrVal)}`;
    
    const targetUrl = qrDetails.qrCodeUrl || qrCodeUrl;
    const fullUrl = targetUrl 
      ? (targetUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${targetUrl}` : targetUrl)
      : fallbackQrUrl;

    try {
      const res = await fetch(fullUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `shop-qr-${shopId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(fullUrl, '_blank');
    }
  }

  const handlePrintQR = () => {
    const shopId = qrDetails.slug || profile.shopkeeperIdCode || profile.shopSlug || 'N/A';
    const qrVal = qrDetails.qrValue || `https://print-smart-18.vercel.app/shop/${shopId}`;
    const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrVal)}`;
    
    const targetUrl = qrDetails.qrCodeUrl || qrCodeUrl;
    const fullUrl = targetUrl 
      ? (targetUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${targetUrl}` : targetUrl)
      : fallbackQrUrl;
      
    const printWindow = window.open('', '_blank')
    if (printWindow) {
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
            <img src="${fullUrl}" />
            <p>Shop ID: ${shopId}</p>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }, 500);
              };
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleShareQR = async () => {
    const linkToShare = qrDetails.qrValue || (qrCodeUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrCodeUrl}` : '')
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

  const handleViewPoster = async () => {
    const id = qrDetails.slug || profile.shopkeeperIdCode || profile.shopSlug || '7U-6257';
    const name = profile.shopName || 'ABC SHOP';
    await openPreview({ shopName: name, shopId: id });
  }

  const handleDownloadPoster = async () => {
    const id = qrDetails.slug || profile.shopkeeperIdCode || profile.shopSlug || '7U-6257';
    const name = profile.shopName || 'ABC SHOP';
    const data = await loadPosterData({ shopName: name, shopId: id });
    if (data) {
      setTimeout(() => {
        downloadPDF('printsmart-qr-poster', id);
      }, 300);
    }
  }

  const handlePrintPoster = async () => {
    const id = qrDetails.slug || profile.shopkeeperIdCode || profile.shopSlug || '7U-6257';
    const name = profile.shopName || 'ABC SHOP';
    const data = await loadPosterData({ shopName: name, shopId: id });
    if (data) {
      setTimeout(() => {
        print('printsmart-qr-poster');
      }, 300);
    }
  }



  const handleUpdateUpi = async () => {
    if (!upiValue.trim()) {
      alert(t("UPI ID cannot be empty."))
      return
    }
    setSavingUpi(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: profile.shopName,
          ownerName: profile.shopOwnerName,
          address: contact.shopAddress,
          category: profile.businessCategory,
          subCategory: profile.subCategory,
          languagePref: profile.languagePreference,
          gstNumber: profile.gstNumber,
          businessDescription: profile.businessDescription,
          businessEstablishedYear: profile.businessEstablishedYear,
          website: contact.website,
          alternatePhone: contact.alternatePhone,
          socials,
          logoUrl: profile.logoDataUrl || null,
          phone: contact.phoneNumber,
          upiId: upiValue,
          paymentQrUrl: profile.paymentQrUrl || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
        localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
        syncLocalStorageFromDb(data.shopkeeper)
        setProfileState(prev => ({ ...prev, upiId: upiValue }))
        setEditingUpi(false)
        alert(t("UPI ID updated successfully!"))
      } else {
        const errData = await response.json().catch(() => ({}))
        alert(`${t("Failed to update UPI ID")}: ${errData.message || 'Server error'}`)
      }
    } catch (err) {
      console.error("Error updating UPI ID:", err)
      alert(t("Error updating UPI ID. Please try again."))
    } finally {
      setSavingUpi(false)
    }
  }

  const onPickPaymentQr = async (file) => {
    if (!file) return
    const token = localStorage.getItem('authToken')
    if (!token) return

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
        const newQrUrl = uploadData.fileUrl || ''
        
        const response = await fetch(`${uploadUrl}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shopName: profile.shopName,
            ownerName: profile.shopOwnerName,
            address: contact.shopAddress,
            category: profile.businessCategory,
            subCategory: profile.subCategory,
            languagePref: profile.languagePreference,
            gstNumber: profile.gstNumber,
            businessDescription: profile.businessDescription,
            businessEstablishedYear: profile.businessEstablishedYear,
            website: contact.website,
            alternatePhone: contact.alternatePhone,
            socials,
            logoUrl: profile.logoDataUrl || null,
            phone: contact.phoneNumber,
            upiId: profile.upiId,
            paymentQrUrl: newQrUrl,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
          localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
          syncLocalStorageFromDb(data.shopkeeper)
          setProfileState(prev => ({ ...prev, paymentQrUrl: newQrUrl }))
          alert(t("Payment QR Code updated successfully!"))
        } else {
          alert(t("Failed to update profile with new QR URL."))
        }
      }
    } catch (err) {
      console.error("Error uploading payment QR:", err)
      alert(t("Error uploading payment QR code."))
    }
  }

  const handleRemovePaymentQr = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: profile.shopName,
          ownerName: profile.shopOwnerName,
          address: contact.shopAddress,
          category: profile.businessCategory,
          subCategory: profile.subCategory,
          languagePref: profile.languagePreference,
          gstNumber: profile.gstNumber,
          businessDescription: profile.businessDescription,
          businessEstablishedYear: profile.businessEstablishedYear,
          website: contact.website,
          alternatePhone: contact.alternatePhone,
          socials,
          logoUrl: profile.logoDataUrl || null,
          phone: contact.phoneNumber,
          upiId: profile.upiId,
          paymentQrUrl: null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('loggedInShopkeeper', JSON.stringify(data.shopkeeper))
        localStorage.setItem('shopkeeper', JSON.stringify(data.shopkeeper))
        syncLocalStorageFromDb(data.shopkeeper)
        setProfileState(prev => ({ ...prev, paymentQrUrl: '' }))
        alert(t("Payment QR Code removed successfully!"))
      } else {
        alert(t("Failed to remove payment QR code."))
      }
    } catch (err) {
      console.error("Error removing payment QR:", err)
      alert(t("Error removing payment QR code."))
    }
  }

  const shopName = useMemo(() => profile.shopName || 'Shree Ganesh Xerox & Prints', [profile.shopName])

  const isProfileActive = pathname?.includes('/shopkeeper/profile')
  const currentShopId = qrDetails.slug || profile.shopkeeperIdCode || profile.shopSlug || '7U-6257';
  const currentShopName = profile.shopName || 'ABC SHOP';
  const currentQrValue = posterData?.qrValue || qrDetails.qrValue || `https://print-smart-18.vercel.app/shop/${currentShopId}`;

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
                Profile
              </SidebarNavItem>
              <SidebarNavItem
                href="/shopkeeper/profile/pricing"
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
                    <div className="text-sm font-semibold text-slate-800">{t('Need Help?')}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {t("We're here to help you set up your shop.")}
                    </div>
                  </div>
                </div>

                <a
                  href="https://forms.gle/VBK48SwGSWm7prgUA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
                >
                  {t('Get Support')}
                </a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">{t('Profile')}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {t('Tell customers about your business. This information will be visible on your shop profile.')}
              </p>

              <div className="mt-4 rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3 text-sm text-violet-800">
                {t('To request changes to your profile details, please use the Help & Support option.')}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Business Info */}
              <div className="xl:col-span-5">
                <Card
                  title={t('Business Information')}
                  subtitle={t('Basic details about your shop')}
                  icon={Building2}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {profile.logoDataUrl ? (
                        <img src={profile.logoDataUrl} alt="Shop logo" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={22} className="text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 pt-1">
                      {t('Shop logo is managed via support.')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Field label={t('Shop Name')} required>
                        <ReadOnlyBox value={profile.shopName} />
                      </Field>
                    </div>

                    <Field label={t('Business Category')} required>
                      <ReadOnlyBox value={profile.businessCategory} placeholder={t('Printing & Photocopy')} />
                    </Field>

                    <Field label={t('Sub Category')}>
                      <ReadOnlyBox value={profile.subCategory} placeholder={t('Xerox & Digital Prints')} />
                    </Field>

                    <Field label={t('Language Preference')} required>
                      <ReadOnlyBox value={profile.languagePreference} placeholder={t('Select language...')} />
                    </Field>

                    <Field label={t('Shop Owner Name')}>
                      <ReadOnlyBox value={profile.shopOwnerName} placeholder="—" />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label={t('Business Description')} required>
                        <ReadOnlyTextarea value={profile.businessDescription} className="min-h-[110px]" />
                      </Field>
                    </div>

                    <Field label={t('Business Established Year')}>
                      <ReadOnlyBox value={profile.businessEstablishedYear} placeholder="—" />
                    </Field>

                    <Field label={t('GST Number (Optional)')}>
                      <ReadOnlyBox value={profile.gstNumber} placeholder="—" />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label={t('Shopkeeper ID')}>
                        <ReadOnlyBox value={profile.shopSlug || '—'} />
                      </Field>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Middle Column: Contact Info */}
              <div className="xl:col-span-4">
                <Card title={t('Contact Information')} subtitle={t('How customers can reach you')} icon={Phone}>
                  <div className="space-y-4">
                    <Field label={t('Phone Number')} required>
                      <div className="flex gap-2">
                        <ReadOnlyBox value={contact.countryCode} className="w-28 text-center" />
                        <ReadOnlyBox value={contact.phoneNumber} placeholder="—" />
                      </div>
                    </Field>

                    <Field label={t('Alternate Phone')}>
                      <ReadOnlyBox value={contact.alternatePhone} placeholder="—" />
                    </Field>

                    <Field label={t('Email Address')} required>
                      <ReadOnlyIconBox icon={Mail} value={contact.emailAddress} placeholder="—" />
                    </Field>





                    <Field label={t('Website (Optional)')}>
                      <ReadOnlyIconBox icon={Globe} value={contact.website} placeholder="—" />
                    </Field>

                    <Field label={t('Shop Address')} required>
                      <ReadOnlyTextarea value={contact.shopAddress} className="min-h-[160px]" />
                    </Field>
                  </div>
                </Card>
              </div>

              {/* Right Panel: QR + Social */}
              <div className="xl:col-span-3">
                <div className="space-y-6">
                  <Card title={t('Your Shop QR')} subtitle={t('Scan to upload print files')} icon={Tag}>
                    <div className="flex flex-col items-center">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm relative w-[180px] h-[180px] flex items-center justify-center mb-3">
                        {qrDetails.qrCodeUrl ? (
                          <img
                            src={qrDetails.qrCodeUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrDetails.qrCodeUrl}` : qrDetails.qrCodeUrl}
                            alt="Shop QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : qrCodeUrl ? (
                          <img
                            src={qrCodeUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${qrCodeUrl}` : qrCodeUrl}
                            alt="Shop QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img src="/qr-placeholder.svg" alt="QR placeholder" className="w-full h-full object-contain" />
                        )}
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{t('Shop ID')}</div>
                        <div className="text-sm font-bold text-slate-800 break-all select-all mt-0.5">
                          {qrDetails.slug || profile.shopkeeperIdCode || '—'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full">
                        <SecondaryButton
                          type="button"
                          className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                          onClick={handleCopyLink}
                        >
                          {t('Copy Link')}
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                          onClick={handleDownloadPoster}
                        >
                          <Download size={12} />
                          {t('Download')}
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                          onClick={handlePrintPoster}
                        >
                          {t('Print QR')}
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          className="gap-1 py-1.5 px-2 text-[11px] justify-center"
                          onClick={handleShareQR}
                        >
                          <Share2 size={12} />
                          {t('Share QR')}
                        </SecondaryButton>
                      </div>

                      <div className="w-full mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                        <PrimaryButton
                          type="button"
                          className="w-full justify-center py-2 text-xs"
                          onClick={handleViewPoster}
                          disabled={posterLoading}
                        >
                          {t('View QR Poster')}
                        </PrimaryButton>
                      </div>


                    </div>
                  </Card>

                  <Card title={t('Social Links')} subtitle={t('Visible on your profile')} icon={User}>
                    <div className="space-y-4">
                      <Field label={t('WhatsApp')}>
                        <ReadOnlyIconBox icon={MessageCircle} value={socials.whatsapp} placeholder="—" />
                      </Field>
                      <Field label={t('Facebook')}>
                        <ReadOnlyIconBox icon={Facebook} value={socials.facebook} placeholder="—" />
                      </Field>
                      <Field label={t('Instagram')}>
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
                {t('Need Help?')}
              </div>
              <div className="mt-1 text-xs text-slate-500">{t("We're here to help you set up your shop.")}</div>
              <a
                href="https://forms.gle/VBK48SwGSWm7prgUA"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
              >
                {t('Get Support')}
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Hidden off-screen Poster container for direct PDF download capture */}
      <div style={{ 
        position: 'fixed', 
        left: '-9999px', 
        top: '0px', 
        width: '2480px', 
        height: '3508px', 
        overflow: 'hidden',
        zIndex: -1000 
      }}>
        <PosterTemplate
          id="printsmart-qr-poster"
          shopName={posterData?.shopName || currentShopName}
          shopId={posterData?.shopId || currentShopId}
          qrValue={posterData?.qrValue || currentQrValue}
        />
      </div>

      {/* Poster Preview Modal */}
      {isPreviewOpen && posterData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[500px] w-full flex flex-col max-h-[95vh] overflow-hidden transform transition-all scale-in">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('QR Poster Preview')}</h3>
                <p className="text-[11px] text-slate-500">{t('Print-ready A4 format (300 DPI)')}</p>
              </div>
              <button
                onClick={closePreview}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 flex justify-center items-center min-h-[350px]">
              {/* Scaled Preview Box */}
              <div 
                className="shadow-lg border border-slate-200 bg-white rounded-lg overflow-hidden flex justify-center items-center"
                style={{
                  width: '277.9px', // Exactly 35% of 794px A4 width (fits nicer inside a max-w-[500px] modal)
                  height: '393px', // Exactly 35% of 1123px A4 height
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    transform: 'scale(0.112)',
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '2480px',
                    height: '3508px'
                  }}
                >
                  <PosterTemplate
                    id="printsmart-qr-poster-preview"
                    shopName={posterData.shopName}
                    shopId={posterData.shopId}
                    qrValue={posterData.qrValue}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex gap-2.5 justify-end bg-white">
              <SecondaryButton
                onClick={closePreview}
                disabled={posterLoading}
                className="py-2 text-xs"
              >
                {t('Close')}
              </SecondaryButton>
              <SecondaryButton
                onClick={() => print('printsmart-qr-poster')}
                disabled={posterLoading}
                className="py-2 text-xs gap-1"
              >
                {t('Print')}
              </SecondaryButton>
              <PrimaryButton
                onClick={() => downloadPDF('printsmart-qr-poster', posterData.shopId)}
                disabled={posterLoading}
                className="py-2 text-xs gap-1"
              >
                {posterLoading ? t('Generating...') : t('Download PDF')}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* BottomDock is rendered globally in shopkeeper/layout.js */}
    </div>
  )
}
