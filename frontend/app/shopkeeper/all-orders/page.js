'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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

const trendLegend = [
  { label: 'Total Pages Printed', tone: 'violet' },
  { label: 'Total Order Value (₹)', tone: 'amber' },
]

const channelTabs = ['Total', 'B&W', 'Color']
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

      <Link href="/shopkeeper/dashboard" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-violet-700">
        Back to Dashboard <span aria-hidden="true">→</span>
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
        <span>Today</span>
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

function FormatList({ rows }) {
  return (
    <div className="space-y-3">
      {rows.map((item) => (
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

function CustomerBars({ bars }) {
  const max = Math.max(...bars.map((item) => item.value)) || 1

  return (
    <div className="flex h-[220px] items-end gap-4 rounded-2xl bg-slate-50 px-4 py-4">
      {bars.map((item) => (
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

const scratchCardHistory = [
  { customer: 'Aman Kumar', reward: 'Flat ₹5 Off', code: 'PS5OFF', status: 'Claimed', timestamp: 'Today, 10:30 AM' },
  { customer: 'Neha Sharma', reward: '10% Discount', code: 'SAVE10', status: 'Claimed', timestamp: 'Today, 10:28 AM' },
  { customer: 'Pooja Singh', reward: 'Free Express Print', code: 'EXPRESSFREE', status: 'Active', timestamp: 'Today, 10:15 AM' },
  { customer: 'Vivek Patil', reward: 'Flat ₹10 Off', code: 'PS10OFF', status: 'Expired', timestamp: 'Yesterday, 05:20 PM' },
]

export default function AllOrdersPage() {
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/orders/shopkeeper/all", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setOrdersList(data);
        }
      } catch (err) {
        console.warn("Failed to fetch backend orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const pendingCount = ordersList.filter((o) => o.status === "PENDING" || o.status === "Pending").length;
  const completedCount = ordersList.filter((o) => o.status === "COMPLETED" || o.status === "Completed").length;
  const downloadedCount = ordersList.filter((o) => o.status === "DOWNLOADED" || o.status === "Downloaded").length;
  const cancelledCount = ordersList.filter((o) => o.status === "CANCELLED" || o.status === "Cancelled").length;

  const statCards = [
    {
      title: 'Pending Orders',
      count: loading ? '...' : String(pendingCount),
      icon: Clock3,
      tone: 'amber',
    },
    {
      title: 'Completed Orders',
      count: loading ? '...' : String(completedCount),
      icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      title: 'Downloaded Files',
      count: loading ? '...' : String(downloadedCount),
      icon: Download,
      tone: 'indigo',
    },
    {
      title: 'Cancelled Orders',
      count: loading ? '...' : String(cancelledCount),
      icon: XCircle,
      tone: 'rose',
    },
  ]

  const bwCount = ordersList.filter((o) => o.printConfiguration?.printType === "BW").length;
  const colorCount = ordersList.filter((o) => o.printConfiguration?.printType === "COLOR").length;

  const orderDistributionLegend = [
    { label: `B&W Print (${loading ? '...' : bwCount})`, tone: 'emerald' },
    { label: `Color Print (${loading ? '...' : colorCount})`, tone: 'amber' },
  ]

  const getFormatCounts = () => {
    const counts = { '.pdf': 0, '.docx': 0, '.jpg': 0, '.png': 0, 'other': 0 };
    ordersList.forEach((o) => {
      const fileName = o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].customFileName || o.orderFiles[0].originalFileName : '';
      if (!fileName) return;
      const dotIndex = fileName.lastIndexOf('.');
      if (dotIndex === -1) {
        counts['other']++;
        return;
      }
      const ext = fileName.slice(dotIndex).toLowerCase();
      if (counts[ext] !== undefined) {
        counts[ext]++;
      } else {
        counts['other']++;
      }
    });
    return counts;
  };

  const formatCounts = getFormatCounts();

  const dynamicFormatRows = [
    { label: '.pdf', count: loading ? 0 : formatCounts['.pdf'], tone: 'violet' },
    { label: '.docx', count: loading ? 0 : formatCounts['.docx'], tone: 'indigo' },
    { label: '.jpg', count: loading ? 0 : formatCounts['.jpg'], tone: 'amber' },
    { label: '.png', count: loading ? 0 : formatCounts['.png'], tone: 'emerald' },
    { label: 'other', count: loading ? 0 : formatCounts['other'], tone: 'sky' },
  ];

  const getSizeCounts = () => {
    const counts = { 'A4': 0, 'A3': 0, 'LEGAL': 0, 'LETTER': 0, 'other': 0 };
    ordersList.forEach((o) => {
      const size = o.printConfiguration?.paperSize || 'A4';
      if (counts[size] !== undefined) {
        counts[size]++;
      } else {
        counts['other']++;
      }
    });
    return counts;
  };

  const sizeCounts = getSizeCounts();
  const totalSizes = ordersList.length || 1;

  const dynamicPrintSizeRows = [
    { label: 'A4', value: loading ? 0 : sizeCounts['A4'], width: `${loading ? 0 : (sizeCounts['A4'] / totalSizes) * 100}%` },
    { label: 'A3', value: loading ? 0 : sizeCounts['A3'], width: `${loading ? 0 : (sizeCounts['A3'] / totalSizes) * 100}%` },
    { label: 'Legal', value: loading ? 0 : sizeCounts['LEGAL'], width: `${loading ? 0 : (sizeCounts['LEGAL'] / totalSizes) * 100}%` },
    { label: 'Letter', value: loading ? 0 : sizeCounts['LETTER'], width: `${loading ? 0 : (sizeCounts['LETTER'] / totalSizes) * 100}%` },
    { label: 'Other', value: loading ? 0 : sizeCounts['other'], width: `${loading ? 0 : (sizeCounts['other'] / totalSizes) * 100}%` },
  ];

  const getCustomerStats = () => {
    const customerOrdersCount = {};
    ordersList.forEach((o) => {
      const name = o.customerName || 'Anonymous';
      customerOrdersCount[name] = (customerOrdersCount[name] || 0) + 1;
    });

    let newCustomers = 0;
    let returningCustomers = 0;

    Object.values(customerOrdersCount).forEach((count) => {
      if (count === 1) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    });

    return { newCustomers, returningCustomers };
  };

  const customerStats = getCustomerStats();

  const dynamicCustomerBars = [
    { label: 'New', value: loading ? 0 : customerStats.newCustomers, color: 'bg-indigo-500' },
    { label: 'Returning', value: loading ? 0 : customerStats.returningCustomers, color: 'bg-emerald-500' },
  ];

  const completedOrders = ordersList.filter((o) => o.status === "COMPLETED" || o.status === "Completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

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
                      <div className="text-sm text-slate-500">Total Revenue</div>
                      <div className="mt-2 text-[30px] font-extrabold tracking-tight text-slate-900">₹{loading ? '...' : totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Average Order Value</div>
                      <div className="mt-2 text-[30px] font-extrabold tracking-tight text-slate-900">₹{loading ? '...' : Math.round(avgOrderValue)}</div>
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
                    <FormatList rows={dynamicFormatRows} />
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-semibold text-slate-900">Top 5 Print Sizes</div>
                    {/* Size distribution list. */}
                    <div className="space-y-3">
                      {dynamicPrintSizeRows.map((row) => (
                        <div key={row.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>{row.label}</span>
                            <span>{row.value}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: row.width }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardShell>
            </div>

            <div className="xl:col-span-2">
              <CardShell
                title="Scratch Card History"
                headerRight={
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm"
                    aria-label="Filter scratch cards"
                  >
                    <Filter size={18} />
                  </button>
                }
              >
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {scratchCardHistory.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 rounded-xl bg-slate-50 p-3 border border-slate-100/80">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">{item.customer}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${
                            item.status === 'Claimed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Active'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">{item.reward} ({item.code})</span>
                          <span className="text-slate-400 font-medium">{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-bold text-slate-900">Rewards Summary</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Customers love discount incentives! Most coupons are claimed directly upon order completion.
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