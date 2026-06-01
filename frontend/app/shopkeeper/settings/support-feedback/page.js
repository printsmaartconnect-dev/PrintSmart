'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ClipboardList,
  Eye,
  FileText,
  Gift,
  Headphones,
  LayoutDashboard,
  Languages,
  Lightbulb,
  PackageCheck,
  PartyPopper,
  Phone,
  PlayCircle,
  Printer,
  QrCode,
  RefreshCw,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Upload,
  UserRound,
  Youtube,
  Palette,
} from 'lucide-react'

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
    active: true,
  },
]

const contactCards = [
  {
    title: 'Submit Feedback',
    icon: FileText,
    text: 'Google Form Link',
    href: 'https://forms.gle/VBK48SwGSWm7prgUA',
    helper: 'Share bugs, ideas, and feature requests.',
  },
  {
    title: 'Video Tutorials',
    icon: Youtube,
    text: 'Official YouTube Channel',
    href: 'https://youtube.com/@printsmaartofficialpage?si=XD-Lrvk6d02SXV3X',
    helper: 'Watch quick setup and usage videos.',
  },
]

const customerFlowSteps = [
  {
    number: 1,
    title: 'Scan QR Code',
    description: 'Scan the QR code at the print shop using your phone camera.',
    icon: QrCode,
  },
  {
    number: 2,
    title: 'Select Language',
    description: 'Choose your preferred language for a better experience.',
    icon: Languages,
  },
  {
    number: 3,
    title: 'Upload Document',
    description: 'Upload your file from your phone. Supports PDF, Word, Image, PPT and more.',
    icon: Upload,
  },
  {
    number: 4,
    title: 'Print Configuration',
    description: 'Choose print settings like color, copies, paper size, side, pages etc.',
    icon: SlidersHorizontal,
    action: 'Talk Directly with Shopkeeper',
  },
  {
    number: 5,
    title: 'Review Order',
    description: 'Review your order details, price and estimated print time.',
    icon: Eye,
  },
  {
    number: 6,
    title: 'Place Print Order',
    description: 'Confirm and place your order. Your file is sent instantly to the shop.',
    icon: ShoppingBag,
  },
  {
    number: 7,
    title: 'Shopkeeper Receives Order',
    description: 'The shopkeeper receives your order in their dashboard.',
    icon: LayoutDashboard,
  },
  {
    number: 8,
    title: 'Shop Prints Your File',
    description: 'Shopkeeper previews and prints your document with care.',
    icon: Printer,
  },
  {
    number: 9,
    title: 'Scratch & Win Rewards',
    description: 'Scratch the coupon and win exciting rewards, discounts & cashback.',
    icon: Gift,
    action: 'Scratch Now',
  },
  {
    number: 10,
    title: 'Collect Your Print',
    description: 'Your print is ready! Collect your documents from the shop.',
    icon: PackageCheck,
  },
]

const shopkeeperFlowSteps = [
  {
    number: 1,
    title: 'Open PrintSmart',
    description: 'Open PrintSmart.in on your computer or laptop browser.',
    icon: FileText,
  },
  {
    number: 2,
    title: 'Login / Register',
    description: 'Login or register your shop using email and phone number.',
    icon: UserRound,
  },
  {
    number: 3,
    title: 'First Time Setup',
    description: 'Set your print prices, paper sizes and basic preferences.',
    icon: Settings2,
  },
  {
    number: 4,
    title: 'Dashboard Opens',
    description: 'Your dashboard is ready with all tools and overview.',
    icon: LayoutDashboard,
  },
  {
    number: 5,
    title: 'Customer Places Order',
    description: 'When a customer places an order, it appears instantly.',
    icon: ShoppingBag,
  },
  {
    number: 6,
    title: 'Order Card System',
    description: 'Each order appears as a smart card with all details.',
    icon: ClipboardList,
  },
  {
    number: 7,
    title: 'Shopkeeper Actions',
    description: 'Preview, print, download or cancel the order from the card.',
    icon: Eye,
  },
  {
    number: 8,
    title: 'Auto Status Update',
    description: 'Order moves automatically to the correct section as you work.',
    icon: RefreshCw,
  },
  {
    number: 9,
    title: 'Dock Navigation',
    description: 'Use the bottom dock to navigate all sections quickly.',
    icon: LayoutDashboard,
  },
  {
    number: 10,
    title: 'Profile & QR',
    description: 'View, share and download your shop QR code anytime.',
    icon: QrCode,
  },
  {
    number: 11,
    title: 'Analytics & History',
    description: 'Track your orders, performance and shop activity.',
    icon: BarChart3,
  },
  {
    number: 12,
    title: 'Smart Shop Benefits',
    description: 'Save time, reduce confusion and grow your business.',
    icon: ShieldCheck,
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

function NeedHelpWidget() {
  const { t } = useTranslation()
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700">
          <Headphones size={18} />
        </span>
        <div>
          <div className="text-sm font-semibold text-slate-800">{t('Need Help?')}</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">{t('We\'re here to help you connect and solve issues quickly.')}</div>
        </div>
      </div>

      <a
        href="https://forms.gle/VBK48SwGSWm7prgUA"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
      >
        {t('Get Support')}
      </a>
    </div>
  )
}

function ContactCard({ card }) {
  const Icon = card.icon

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-slate-900">{card.title}</div>
          <div className="mt-1 text-sm text-slate-500">{card.helper}</div>
          <div className="mt-4 inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition group-hover:bg-violet-100">
            {card.text}
          </div>
        </div>
      </div>
    </a>
  )
}

function UrgentContactCard() {
  const { t } = useTranslation()
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
          <Phone size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-slate-900">{t('Urgent Contact')}</div>
          <div className="mt-1 text-sm text-slate-500">{t('Call Support')}</div>

          <div className="mt-4 space-y-2">
            <a
              href="tel:8767877602"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <span>87678 77602</span>
              <span className="text-xs font-bold text-violet-600">{t('Call')}</span>
            </a>
            <a
              href="tel:7249825244"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <span>7249825244</span>
              <span className="text-xs font-bold text-violet-600">{t('Call')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowToggle({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 shadow-sm">
      <span className="px-2.5 text-sm font-semibold text-slate-500">{t('You are viewing')}</span>
      <button
        type="button"
        onClick={() => onChange('customer')}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          value === 'customer'
            ? 'bg-violet-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-white hover:text-slate-900'
        }`}
      >
        {t('Customer Flow')}
      </button>
      <button
        type="button"
        onClick={() => onChange('shopkeeper')}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          value === 'shopkeeper'
            ? 'bg-violet-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-white hover:text-slate-900'
        }`}
      >
        {t('Shopkeeper Flow')}
      </button>
    </div>
  )
}

function StepCard({ step, variant, showArrow }) {
  const Icon = step.icon
  const isCustomer = variant === 'customer'

  return (
    <div className="relative">
      <div
        className={`relative flex h-full flex-col rounded-[22px] border bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] ${
          isCustomer ? 'border-slate-200' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-[11px] font-bold text-violet-700">
            {step.number}
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] ${
              isCustomer ? 'bg-slate-50 text-violet-700 ring-1 ring-slate-200' : 'bg-white text-violet-700 ring-1 ring-slate-200'
            }`}
          >
            <Icon size={isCustomer ? 28 : 30} />
          </div>

          <div className="mt-5 text-[15px] font-extrabold leading-5 text-slate-900">{step.title}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>

          {step.action ? (
            <button
              type="button"
              onClick={() => console.log('open modal')}
              className={`mt-4 inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                step.number === 9
                  ? 'border-violet-300 bg-white text-violet-700 hover:bg-violet-50'
                  : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
              }`}
            >
              {step.action}
            </button>
          ) : null}
        </div>
      </div>

      {showArrow ? (
        <div className="pointer-events-none absolute right-[-1.25rem] top-1/2 z-10 hidden -translate-y-1/2 text-2xl font-bold text-indigo-600 xl:block">
          →
        </div>
      ) : null}
    </div>
  )
}

function FlowBanner({ variant }) {
  if (variant === 'customer') {
    return (
      <div className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
          <PartyPopper size={18} />
        </div>
        <p className="text-sm leading-6 text-slate-600">
          <span className="font-bold text-slate-900">That&apos;s it! Printing made simple, smart and instant with PrintSmaart.in</span>
          {' '}— No WhatsApp. No cables. No confusion. Just scan, upload & print!
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
        <Lightbulb size={18} />
      </div>
      <p className="text-sm leading-6 text-slate-600">
        <span className="font-bold text-slate-900">Pro Tip</span>
        {' '}Keep your shop QR visible and your prices updated to get more orders and happy customers.
      </p>
    </div>
  )
}

function FlowSection({ value, onChange }) {
  const { t } = useTranslation()
  const isCustomer = value === 'customer'
  const steps = isCustomer ? customerFlowSteps : shopkeeperFlowSteps
  const gridClass = isCustomer
    ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-5'
    : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-6'

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
            {isCustomer ? t('How PrintSmaart.in Works') : t('Shopkeeper Flow')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isCustomer
              ? t('Simple, fast and smart printing for everyone.')
              : t('Understand how PrintSmart works for your shop.')}
          </p>
        </div>

        <FlowToggle value={value} onChange={onChange} />
      </div>

      <div className="mt-6">
        <div className={gridClass}>
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={{
                ...step,
                title: t(step.title),
                description: t(step.description),
                action: step.action ? t(step.action) : undefined,
              }}
              variant={value}
              showArrow={index !== steps.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <FlowBanner variant={value} />
      </div>
    </section>
  )
}

export default function SupportFeedbackPage() {
  const { t } = useTranslation()
  const [flowView, setFlowView] = useState('customer')

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-900">
      <main className="mx-auto max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <aside className="flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] lg:sticky lg:top-6 lg:self-start">
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

            <div className="mt-auto p-4 pt-1">
              <NeedHelpWidget />
            </div>
          </aside>

          <section className="min-w-0 space-y-6">
            <div className="flex items-center gap-3">
              <Link
                href="/shopkeeper/dashboard"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition flex-shrink-0"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
                  {t('Support & Feedback')}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  {t('Reach us through feedback, tutorials, or direct support whenever you need help.')}
                </p>
              </div>
            </div>

            <section className="grid gap-4 xl:grid-cols-3">
              {contactCards.map((card) => (
                <ContactCard key={card.title} card={{
                  ...card,
                  title: t(card.title),
                  helper: t(card.helper),
                  text: t(card.text),
                }} />
              ))}

              <UrgentContactCard />
            </section>

            <FlowSection value={flowView} onChange={setFlowView} />
          </section>
        </div>
      </main>
    </div>
  )
}