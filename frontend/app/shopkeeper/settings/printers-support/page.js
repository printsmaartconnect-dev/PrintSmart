'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  BookOpen,
  ChevronDown,
  AlertCircle,
  CircleDashed,
  Clock3,
  Headphones,
  Languages,
  Palette,
  Plus,
  Printer,
  RefreshCcw,
  Send,
  Settings2,
  Store,
  Triangle,
} from 'lucide-react'

const settingsNavItems = [
  {
    label: 'Print Configuration',
    href: '/shopkeeper/settings/print-configuration',
    icon: Printer,
  },
  {
    label: 'Language & Accessibility',
    href: '/shopkeeper/settings/language-accessibility',
    icon: Languages,
  },
  {
    label: 'Appearance',
    href: '/shopkeeper/settings/appearance',
    icon: Palette,
  },
  {
    label: 'Printers & Support',
    href: '/shopkeeper/settings/printers-support',
    icon: Headphones,
    active: true,
  },
]

const queueCards = [
  {
    label: 'In Queue',
    value: '12',
    icon: Clock3,
    tone: 'violet',
  },
  {
    label: 'Printing',
    value: '3',
    icon: Printer,
    tone: 'emerald',
  },
  {
    label: 'Paused',
    value: '2',
    icon: CircleDashed,
    tone: 'amber',
  },
  {
    label: 'Error',
    value: '0',
    icon: AlertCircle,
    tone: 'rose',
  },
]

const supportCards = [
  {
    title: 'Contact Support',
    description: 'Chat or call us',
    icon: Headphones,
    tone: 'violet',
  },
  {
    title: 'Report an issue',
    description: 'Fix common issues',
    icon: Triangle,
    tone: 'rose',
  },
  {
    title: 'Help Center',
    description: 'FAQs & guides',
    icon: BookOpen,
    tone: 'sky',
  },
  {
    title: 'Send Feedback',
    description: 'Share your thoughts',
    icon: Send,
    tone: 'emerald',
  },
]

function toneClasses(tone) {
  switch (tone) {
    case 'violet':
      return 'bg-violet-50 text-violet-700 border-violet-100'
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'amber':
      return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'rose':
      return 'bg-rose-50 text-rose-700 border-rose-100'
    case 'sky':
      return 'bg-sky-50 text-sky-700 border-sky-100'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function toneDot(tone) {
  switch (tone) {
    case 'violet':
      return 'bg-violet-500'
    case 'emerald':
      return 'bg-emerald-500'
    case 'amber':
      return 'bg-amber-500'
    case 'rose':
      return 'bg-rose-500'
    case 'sky':
      return 'bg-sky-500'
    default:
      return 'bg-slate-500'
  }
}

function TopHeader({ shopName }) {
  const initials =
    (shopName || 'Shop')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'S'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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

function SidebarNavItem({ href, icon: Icon, children, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
        active
          ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100'
          : 'border-transparent bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
          active
            ? 'border-violet-100 bg-white text-violet-700'
            : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <Icon size={17} />
      </span>
      <span className="text-sm font-semibold">{children}</span>
    </Link>
  )
}

function MiniStat({ title, value, tone = 'slate', children }) {
  const textTone =
    tone === 'violet'
      ? 'text-violet-700'
      : tone === 'emerald'
        ? 'text-emerald-700'
        : tone === 'amber'
          ? 'text-amber-700'
          : tone === 'rose'
            ? 'text-rose-700'
            : 'text-slate-900'

  const bgTone =
    tone === 'violet'
      ? 'bg-violet-50 border-violet-100'
      : tone === 'emerald'
        ? 'bg-emerald-50 border-emerald-100'
        : tone === 'amber'
          ? 'bg-amber-50 border-amber-100'
          : tone === 'rose'
            ? 'bg-rose-50 border-rose-100'
            : 'bg-slate-50 border-slate-200'

  return (
    <div className={`rounded-2xl border p-4 ${bgTone}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      <div className={`mt-2 text-sm font-semibold ${textTone}`}>{value}</div>
      {children}
    </div>
  )
}

function ActionButton({ icon: Icon, title, subtitle, onClick, iconTone = 'violet' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-violet-200 hover:bg-white"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClasses(iconTone)}`}>
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500">{subtitle}</span>
      </span>
    </button>
  )
}

function QueueCard({ item }) {
  const Icon = item.icon
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses(item.tone)}`}>
          <Icon size={18} />
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">{item.value}</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${toneDot(item.tone)}`} />
        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
      </div>
    </div>
  )
}

function QualityOption({ title, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-violet-300 bg-violet-50 ring-1 ring-violet-100'
          : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50'
      }`}
      aria-pressed={selected}
    >
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="mt-1 block text-xs text-slate-500">{description}</span>
      </span>
      <span
        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
          selected ? 'border-violet-600 bg-violet-600' : 'border-slate-300 bg-white'
        }`}
        aria-hidden="true"
      >
        <span className={`h-2.5 w-2.5 rounded-full ${selected ? 'bg-white' : 'bg-transparent'}`} />
      </span>
    </button>
  )
}

export default function PrintersSupportPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState('Shree Ganesh Xerox & Prints')
  const [selectedQuality, setSelectedQuality] = useState('standard')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('loggedInShopkeeper')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.shopName) setShopName(String(parsed.shopName))
      else if (parsed?.shop) setShopName(String(parsed.shop))
      else if (parsed?.name) setShopName(String(parsed.name))
    } catch {
      // ignore invalid localStorage
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopHeader shopName={shopName} />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-32 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Settings2 size={16} />
              </span>
              <h2 className="text-base font-bold text-slate-900">Settings</h2>
            </div>

            <nav className="space-y-2 p-3">
              {settingsNavItems.map((item) => (
                <SidebarNavItem
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  active={item.active}
                >
                  {item.label}
                </SidebarNavItem>
              ))}
            </nav>

            <div className="mt-auto p-4 pt-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700">
                    <Headphones size={18} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Need Help?</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      We&apos;re here to help you set up your shop/hardware.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/shopkeeper/support')}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
                >
                  Get Support
                </button>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Printers &amp; Support
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Manage your printers, print queue and get support when you need it.
              </p>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-base font-bold text-slate-900">Connected Printers</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus size={16} />
                  Add Printer
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="relative h-14 w-20 rounded-xl border border-slate-300 bg-white shadow-sm">
                        <div className="absolute left-1/2 top-[-7px] h-3 w-12 -translate-x-1/2 rounded-t-lg bg-slate-200" />
                        <div className="absolute inset-x-2 top-3 h-5 rounded-md border border-slate-200 bg-slate-100" />
                        <Printer
                          size={28}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                          HP LaserJet MFP 136w
                        </h3>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                          USB Connection
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-emerald-700">Ready to Print</span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <MiniStat title="Paper Size" value="A4" tone="violet" />
                        <MiniStat title="Ink/Toner" value="75%" tone="sky">
                          <div className="mt-3 h-2 rounded-full bg-sky-100">
                            <div className="h-2 w-3/4 rounded-full bg-sky-500" />
                          </div>
                        </MiniStat>
                        <MiniStat title="Status" value="Good" tone="emerald" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <ActionButton
                    icon={Printer}
                    title="Printer Test Page"
                    subtitle="Print test page"
                    onClick={() => {}}
                    iconTone="violet"
                  />
                  <ActionButton
                    icon={Settings2}
                    title="Printer Settings"
                    subtitle="Configure printer"
                    onClick={() => {}}
                    iconTone="sky"
                  />
                  <ActionButton
                    icon={RefreshCcw}
                    title="Refresh Status"
                    subtitle="Check printer status"
                    onClick={() => {}}
                    iconTone="emerald"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Print Queue Control</h2>
                  <p className="mt-1 text-sm text-slate-500">Manage current print queue and workflow</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  Open Print Queue
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:p-6">
                {queueCards.map((item) => (
                  <QueueCard key={item.label} item={item} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-base font-bold text-slate-900">Print Quality</h2>
                <p className="mt-1 text-sm text-slate-500">Choose your default print quality</p>
              </div>

              <div className="grid gap-3 p-5 sm:p-6 md:grid-cols-2">
                <QualityOption
                  title="Standard Quality"
                  description="Best for everyday printing"
                  selected={selectedQuality === 'standard'}
                  onSelect={() => setSelectedQuality('standard')}
                />
                <QualityOption
                  title="High Quality"
                  description="Best for photos and important documents"
                  selected={selectedQuality === 'high'}
                  onSelect={() => setSelectedQuality('high')}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-base font-bold text-slate-900">Support &amp; Help</h2>
                <p className="mt-1 text-sm text-slate-500">We&apos;re here to help you 24/7</p>
              </div>

              <div className="grid gap-3 p-5 sm:p-6 sm:grid-cols-2 xl:grid-cols-4">
                {supportCards.map((item) => {
                  const Icon = item.icon

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-violet-200 hover:bg-white"
                    >
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${toneClasses(item.tone)}`}>
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                        <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  )
}