import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Filter,
  XCircle,
} from 'lucide-react'

const statCards = [
  {
    title: 'Pending Orders',
    count: '12',
    icon: Clock3,
    tone: 'amber',
  },
  {
    title: 'Completed Orders',
    count: '128',
    icon: CheckCircle2,
    tone: 'emerald',
  },
  {
    title: 'Downloaded Files',
    count: '36',
    icon: Download,
    tone: 'indigo',
  },
  {
    title: 'Cancelled Orders',
    count: '08',
    icon: XCircle,
    tone: 'rose',
  },
]

const trendLegend = [
  { label: 'Total Pages Printed', tone: 'violet' },
  { label: 'Total Order Value (₹)', tone: 'amber' },
]

const orderDistributionLegend = [
  { label: 'B&W Print (13)', tone: 'emerald' },
  { label: 'Color Print (2)', tone: 'amber' },
]

const formatRows = [
  { label: '.pdf', count: 250, tone: 'violet' },
  { label: '.docx', count: 100, tone: 'indigo' },
  { label: '.jpg', count: 98, tone: 'amber' },
  { label: '.png', count: 64, tone: 'emerald' },
  { label: '.ppt', count: 36, tone: 'sky' },
]

const printSizeRows = [
  { label: 'A4', value: 100, width: '88%' },
  { label: 'A3', value: 84, width: '72%' },
  { label: 'Legal', value: 68, width: '58%' },
  { label: 'Letter', value: 41, width: '35%' },
  { label: 'B5', value: 27, width: '24%' },
]

const customerBars = [
  { label: 'New', value: 92, color: 'bg-indigo-500' },
  { label: 'Returning', value: 47, color: 'bg-emerald-500' },
]

const channelTabs = ['Total', 'B&W', 'Color', 'Xerox', 'Digital']

const timeTabs = ['Last 30 days', '3 months', '1 year', 'All-time']

function toneClasses(tone) {
  switch (tone) {
    case 'amber':
      return 'bg-amber-50 text-amber-600 ring-amber-100'
    case 'emerald':
      return 'bg-emerald-50 text-emerald-600 ring-emerald-100'
    case 'indigo':
      return 'bg-indigo-50 text-indigo-600 ring-indigo-100'
    case 'rose':
      return 'bg-rose-50 text-rose-600 ring-rose-100'
    case 'violet':
      return 'bg-violet-50 text-violet-600 ring-violet-100'
    case 'sky':
      return 'bg-sky-50 text-sky-600 ring-sky-100'
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-100'
  }
}

function Dot({ tone }) {
  const classes = {
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    slate: 'bg-slate-400',
  }

  return <span className={`h-2.5 w-2.5 rounded-full ${classes[tone] || classes.slate}`} />
}

function ActiveChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 ring-1 ring-violet-200">
      {children}
    </span>
  )
}

function StatCard({ card }) {
  const Icon = card.icon
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneClasses(card.tone)}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-3 text-sm font-medium text-slate-700">{card.title}</div>
      <div className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-slate-900">{card.count}</div>

      <Link href="/shopkeeper/all-orders" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-violet-700">
        View details <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}

function CardShell({ title, children, headerRight, subtitle }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {headerRight}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function PlaceholderBox({ label, minHeight = 'min-h-[220px]' }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm font-medium text-slate-400 ${minHeight}`}
    >
      {label}
    </div>
  )
}

function Pill({ children, active = false }) {
  return (
    <button
      type="button"
      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
        active ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

function StatHeaderControls() {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <CalendarDays size={16} className="text-slate-500" />
        <span>20 Jan 2024</span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {channelTabs.map((tab, index) => (
          <Pill key={tab} active={index === 0}>
            {tab}
          </Pill>
        ))}
      </div>
    </div>
  )
}

function LegendRow({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <Dot tone={item.tone} />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  )
}

function FormatList() {
  return (
    <div className="space-y-3">
      {formatRows.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Dot tone={item.tone} />
            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

function CustomerBars() {
  const max = Math.max(...customerBars.map((item) => item.value))

  return (
    <div className="flex h-[220px] items-end gap-4 rounded-2xl bg-slate-50 px-4 py-4">
      {customerBars.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
          <div className="flex h-full w-full items-end justify-center">
            <div className="flex h-full w-full items-end justify-center">
              <div
                className={`w-[42px] rounded-t-2xl ${item.color}`}
                style={{ height: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-700">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function AllOrdersPage() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/shopkeeper/dashboard"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-slate-50 transition flex-shrink-0"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900 sm:text-[36px]">
                Shop Statistics &amp; Analysis
              </h1>
            </div>
          </div>

          <StatHeaderControls />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="grid gap-4 xl:self-start">
            {statCards.map((card) => (
              <StatCard key={card.title} card={card} />
            ))}
          </aside>

          <section className="grid gap-6 xl:grid-cols-6">
            <div className="xl:col-span-4">
              <CardShell
                title="Main Print Trends"
                headerRight={
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                      {timeTabs.map((tab, index) => (
                        <Pill key={tab} active={index === 0}>
                          {tab}
                        </Pill>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm"
                      aria-label="Filter print trends"
                    >
                      <Filter size={18} />
                    </button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <LegendRow items={trendLegend} />

                  {/* Line chart component placeholder will be rendered here next sprint. */}
                  <PlaceholderBox label="Line Chart Component Placeholder (Next Sprint)" minHeight="min-h-[320px]" />
                </div>
              </CardShell>
            </div>

            <div className="xl:col-span-2">
              <CardShell
                title="Order Distribution"
                subtitle="Orders by Type"
                headerRight={
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm"
                    aria-label="Filter distribution"
                  >
                    <Filter size={18} />
                  </button>
                }
              >
                <div className="space-y-4">
                  {/* Pie chart component placeholder. */}
                  <PlaceholderBox label="Pie Chart Component Placeholder" minHeight="min-h-[220px]" />

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
                    {orderDistributionLegend.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
                        <Dot tone={item.tone} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardShell>
            </div>

            <div className="xl:col-span-2">
              <CardShell
                title="Revenue Summary"
                headerRight={
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm"
                    aria-label="Filter revenue"
                  >
                    <Filter size={18} />
                  </button>
                }
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Total Revenue (Last 30 Days)</div>
                      <div className="mt-2 text-[30px] font-extrabold tracking-tight text-slate-900">₹32,450</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Average Order Value</div>
                      <div className="mt-2 text-[30px] font-extrabold tracking-tight text-slate-900">₹58</div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-semibold text-slate-900">Orders by hour-of-day of the week</div>
                    {/* Heatmap component placeholder. */}
                    <PlaceholderBox label="Heatmap Component Placeholder" minHeight="min-h-[170px]" />
                  </div>
                </div>
              </CardShell>
            </div>

            <div className="xl:col-span-2">
              <CardShell
                title="Top Products and Formats"
                headerRight={
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm"
                    aria-label="Filter formats"
                  >
                    <Filter size={18} />
                  </button>
                }
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <div className="mb-3 text-sm font-semibold text-slate-900">Top 5 Most Printed File Formats</div>
                    <FormatList />
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-semibold text-slate-900">Top 5 Print Sizes</div>
                    {/* Horizontal bar chart placeholder. */}
                    <PlaceholderBox label="Horizontal Bar Chart Placeholder" minHeight="min-h-[220px]" />
                  </div>
                </div>
              </CardShell>
            </div>

            <div className="xl:col-span-2">
              <CardShell
                title="New and Returning Customers"
                headerRight={
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm"
                    aria-label="Filter customers"
                  >
                    <Filter size={18} />
                  </button>
                }
              >
                <div className="space-y-4">
                  {/* Vertical bar chart placeholder. */}
                  <PlaceholderBox label="Vertical Bar Chart Placeholder" minHeight="min-h-[240px]" />

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-bold text-slate-900">Key Takeaway</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      B&amp;W A4 Xerox are your top volume, afternoon is your busiest time.
                    </p>
                  </div>
                </div>
              </CardShell>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}