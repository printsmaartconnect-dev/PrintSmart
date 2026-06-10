'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Download,
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



function StatCard({ card }) {
  const { t } = useTranslation()
  const Icon = card.icon
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneClasses(card.tone)}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-3 text-sm font-medium text-slate-700">{t(card.title)}</div>
      <div className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-slate-900">{card.count}</div>

      <Link href="/shopkeeper/dashboard" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-violet-700">
        {t('Back to Dashboard')} <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}

function CardShell({ title, children, headerRight, subtitle }) {
  const { t } = useTranslation()
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{t(title)}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{t(subtitle)}</p> : null}
        </div>
        {headerRight}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

const generateMockOrders = () => {
  const list = [];
  
  // Seed pseudo-random generator for deterministic data
  let seed = 12345;
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const statuses = ["COMPLETED", "DOWNLOADED", "PENDING", "CANCELLED"];
  const formats = [".pdf", ".docx", ".jpg", ".png"];
  const sizes = ["A4", "A3", "LEGAL", "LETTER"];
  const names = [
    "Aman Kumar", "Neha Sharma", "Vivek Patil", "Pooja Singh", "Rohit Verma",
    "Rahul Sharma", "Anjali Gupta", "Vikram Malhotra", "Karan Johar", "Deepika Padukone",
    "Siddharth Malhotra", "Shraddha Kapoor", "Varun Dhawan", "Alia Bhatt", "Ranbir Kapoor"
  ];
  const fileNames = [
    "Project_Report", "Assignment_1", "Notes_Maths", "ID_Proof_Copy", "Fee_Receipt",
    "Resume_2026", "Thesis_Final", "Passport_Scan", "Application_Form", "Syllabus_Physics"
  ];

  const targets = {
    COMPLETED: 128,
    DOWNLOADED: 36,
    PENDING: 12,
    CANCELLED: 8
  };

  Object.entries(targets).forEach(([status, count]) => {
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(random() * 30);
      const hour = 9 + Math.floor(random() * 12); // mostly shop hours: 9 AM to 9 PM
      const minute = Math.floor(random() * 60);
      
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(hour, minute, 0, 0);

      const copies = 1 + Math.floor(random() * 3);
      const pages = 1 + Math.floor(random() * 25);
      const isBW = random() > 0.3; // 70% B&W, 30% Color
      const pricePerPage = isBW ? 2.5 : 8.0;
      const price = pages * copies * pricePerPage;

      const size = random() > 0.8 ? sizes[1 + Math.floor(random() * 3)] : "A4";
      const format = formats[Math.floor(random() * formats.length)];
      const docName = fileNames[Math.floor(random() * fileNames.length)] + format;

      list.push({
        id: `ORD-${10000 + Math.floor(random() * 90000)}`,
        status: status,
        customerName: names[Math.floor(random() * names.length)],
        phone: `+91 ${70000 + Math.floor(random() * 29999)} ${10000 + Math.floor(random() * 89999)}`,
        orderFiles: [{ customFileName: docName, originalFileName: docName, fileUrl: "" }],
        printConfiguration: {
          copies: copies,
          printType: isBW ? "BW" : "COLOR",
          paperSize: size,
          sides: random() > 0.5 ? "DOUBLE" : "SINGLE"
        },
        price: price,
        pages: pages,
        createdAt: orderDate.toISOString()
      });
    }
  });

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

function MainPrintTrendsChart({ orders, timeRange }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const svgSize = { width: 700, height: 320 };

  // Dynamically aggregate order data for 7 intervals based on time range
  const points = (() => {
    const numPoints = 7;
    const now = new Date();
    let daysLimit = 30;

    if (timeRange === "3 months") daysLimit = 90;
    else if (timeRange === "1 year") daysLimit = 365;
    else if (timeRange === "All-time") {
      if (orders.length > 0) {
        const oldestDate = new Date(orders[orders.length - 1].createdAt);
        daysLimit = Math.max(1, Math.ceil((now - oldestDate) / (24 * 60 * 60 * 1000)));
      } else {
        daysLimit = 30;
      }
    }

    const pts = Array.from({ length: numPoints }, (_, i) => {
      const daysAgo = daysLimit - (i * (daysLimit / (numPoints - 1)));
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      return {
        date,
        label: date.toLocaleDateString([], { month: "short", day: "numeric" }),
        pages: 0,
        revenue: 0,
      };
    });

    orders.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      let closestIndex = 0;
      let minDiff = Infinity;

      pts.forEach((pt, idx) => {
        const diff = Math.abs(orderDate - pt.date);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });

      const copies = o.printConfiguration?.copies || 1;
      const pages = o.pages || 5; 
      pts[closestIndex].pages += pages * copies;
      pts[closestIndex].revenue += o.price || 0;
    });

    return pts;
  })();

  const maxPages = Math.max(...points.map((p) => p.pages), 10);
  const maxRevenue = Math.max(...points.map((p) => p.revenue), 10);

  // SVG grid calculations
  const paddingX = 55;
  const paddingY = 30;
  const chartW = svgSize.width - paddingX * 2;
  const chartH = svgSize.height - paddingY * 2;

  const getCoords = (idx, type) => {
    const pt = points[idx];
    const x = paddingX + (idx / (points.length - 1)) * chartW;
    const maxVal = type === "pages" ? maxPages : maxRevenue;
    const val = pt[type];
    const y = svgSize.height - paddingY - (val / maxVal) * chartH;
    return { x, y };
  };

  // Generate continuous smooth Bezier curves
  const getBezierPath = (type) => {
    if (points.length === 0) return "";
    let d = "";
    const start = getCoords(0, type);
    d += `M ${start.x} ${start.y} `;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = getCoords(i, type);
      const next = getCoords(i + 1, type);
      const cp1x = curr.x + (next.x - curr.x) / 3;
      const cp1y = curr.y;
      const cp2x = next.x - (next.x - curr.x) / 3;
      const cp2y = next.y;
      d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y} `;
    }
    return d;
  };

  const getBezierAreaPath = (type) => {
    const linePath = getBezierPath(type);
    if (!linePath) return "";
    const firstX = paddingX;
    const lastX = paddingX + chartW;
    const baseY = svgSize.height - paddingY;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const pagesPath = getBezierPath("pages");
  const pagesAreaPath = getBezierAreaPath("pages");
  const revenuePath = getBezierPath("revenue");
  const revenueAreaPath = getBezierAreaPath("revenue");

  // Grid lines
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const ratio = i / 4;
    const y = svgSize.height - paddingY - ratio * chartH;
    const pagesLabel = Math.round(ratio * maxPages);
    const revenueLabel = Math.round(ratio * maxRevenue);
    return { y, pagesLabel, revenueLabel };
  });

  return (
    <div className="relative w-full overflow-hidden bg-white p-2 rounded-2xl">
      <svg
        viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
        className="w-full h-auto select-none"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="pagesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines and left/right labels */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line
              x1={paddingX}
              y1={line.y}
              x2={svgSize.width - paddingX}
              y2={line.y}
              stroke="#f1f5f9"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Left labels (Pages - Violet) */}
            <text
              x={paddingX - 10}
              y={line.y + 4}
              textAnchor="end"
              className="text-[10px] font-extrabold fill-violet-500"
            >
              {line.pagesLabel}
            </text>
            {/* Right labels (Revenue - Amber) */}
            <text
              x={svgSize.width - paddingX + 10}
              y={line.y + 4}
              textAnchor="start"
              className="text-[10px] font-extrabold fill-amber-600"
            >
              ₹{line.revenueLabel}
            </text>
          </g>
        ))}

        {/* Gradient fills */}
        {pagesAreaPath && (
          <path d={pagesAreaPath} fill="url(#pagesGrad)" />
        )}
        {revenueAreaPath && (
          <path d={revenueAreaPath} fill="url(#revenueGrad)" />
        )}

        {/* Lines */}
        {pagesPath && (
          <path
            d={pagesPath}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}
        {revenuePath && (
          <path
            d={revenuePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}

        {/* Dynamic Interactive Nodes */}
        {points.map((pt, idx) => {
          const pgCoord = getCoords(idx, "pages");
          const revCoord = getCoords(idx, "revenue");
          const isHovered = hoveredIdx === idx;

          return (
            <g key={idx}>
              {/* Pages Circle */}
              <circle
                cx={pgCoord.x}
                cy={pgCoord.y}
                r={isHovered ? 7 : 4}
                fill="#ffffff"
                stroke="#8b5cf6"
                strokeWidth={isHovered ? 4 : 2}
                className="transition-all duration-200 cursor-pointer"
              />
              {/* Revenue Circle */}
              <circle
                cx={revCoord.x}
                cy={revCoord.y}
                r={isHovered ? 7 : 4}
                fill="#ffffff"
                stroke="#f59e0b"
                strokeWidth={isHovered ? 4 : 2}
                className="transition-all duration-200 cursor-pointer"
              />
              {/* X Axis Labels */}
              <text
                x={pgCoord.x}
                y={svgSize.height - 10}
                textAnchor="middle"
                className="text-[10px] font-extrabold fill-slate-400"
              >
                {pt.label}
              </text>
            </g>
          );
        })}

        {/* Hover vertical bar guides */}
        {hoveredIdx !== null && (
          <line
            x1={getCoords(hoveredIdx, "pages").x}
            y1={paddingY}
            x2={getCoords(hoveredIdx, "pages").x}
            y2={svgSize.height - paddingY}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            pointerEvents="none"
          />
        )}

        {/* Invisible mouse capture columns */}
        {points.map((_, idx) => {
          const x = paddingX + (idx / (points.length - 1)) * chartW;
          const colW = chartW / (points.length - 1);
          return (
            <rect
              key={idx}
              x={x - colW / 2}
              y={paddingY}
              width={colW}
              height={chartH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
            />
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-20 top-4 pointer-events-none rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-all duration-150"
          style={{
            left: `${Math.min(
              82,
              Math.max(
                18,
                ((getCoords(hoveredIdx, "pages").x) / svgSize.width) * 100
              )
            )}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-xs font-extrabold text-slate-800">
            {points[hoveredIdx].label}
          </div>
          <div className="mt-1.5 flex flex-col gap-1 text-[11px] font-bold">
            <span className="flex items-center gap-2 text-violet-600">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Pages: {points[hoveredIdx].pages}
            </span>
            <span className="flex items-center gap-2 text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Revenue: ₹{points[hoveredIdx].revenue.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDistributionChart({ orders }) {
  const { t } = useTranslation()
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const stats = (() => {
    const total = orders.length || 1;
    const xeroxCount = orders.filter(o => (o.printConfiguration?.copies || 1) > 1).length;
    const bwCount = orders.filter(o => (o.printConfiguration?.printType === "BW" || o.printConfiguration?.printType === "B&W") && (o.printConfiguration?.copies || 1) === 1).length;
    const colorCount = orders.filter(o => (o.printConfiguration?.printType === "COLOR" || o.printConfiguration?.printType === "Color") && (o.printConfiguration?.copies || 1) === 1).length;
    const digitalCount = Math.max(0, total - xeroxCount - bwCount - colorCount);

    return [
      { label: t("Xerox"), count: xeroxCount, color: "#10b981", tone: "emerald" },
      { label: t("Digital Print"), count: digitalCount, color: "#3b82f6", tone: "sky" },
      { label: t("B&W Print"), count: bwCount, color: "#8b5cf6", tone: "violet" },
      { label: t("Color Print"), count: colorCount, color: "#f59e0b", tone: "amber" },
    ];
  })();

  const totalOrders = stats.reduce((sum, item) => sum + item.count, 0) || 1;

  // Donut geometry constants
  const r = 52;
  const strokeW = 15;
  const center = 80;
  const circ = 2 * Math.PI * r;

  let currentOffset = 0;
  const segments = stats.map((item, idx) => {
    const percent = item.count / totalOrders;
    const strokeLength = percent * circ;
    const offset = currentOffset;
    currentOffset -= strokeLength;

    return {
      ...item,
      percent,
      strokeLength,
      offset,
    };
  });

  return (
    <div className="flex flex-col items-center justify-center p-1">
      <div className="relative h-[200px] w-[200px]">
        <svg
          viewBox="0 0 160 160"
          className="h-full w-full select-none"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeW}
          />

          {segments.map((slice, idx) => {
            if (slice.count === 0) return null;
            const isHovered = hoveredIdx === idx;
            
            // Recalculate geometry dynamically on hover to scale the slice outward!
            const activeR = isHovered ? r + 4 : r;
            const activeCirc = 2 * Math.PI * activeR;
            const activeStrokeLength = slice.percent * activeCirc;
            const activeOffset = (slice.offset / circ) * activeCirc;
            
            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={activeR}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeW + 7 : strokeW}
                strokeDasharray={`${activeStrokeLength} ${activeCirc}`}
                strokeDashoffset={activeOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
                className="transition-all duration-300 ease-out cursor-pointer origin-center"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {hoveredIdx !== null ? (
            <>
              <div
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: segments[hoveredIdx].color }}
              >
                {t(segments[hoveredIdx].label)}
              </div>
              <div className="text-2xl font-black text-slate-900 leading-none mt-0.5">
                {segments[hoveredIdx].count}
              </div>
              <div className="text-[10px] font-extrabold text-slate-400 mt-0.5">
                {Math.round(segments[hoveredIdx].percent * 100)}% of total
              </div>
            </>
          ) : (
            <>
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                {t('Total Orders')}
              </div>
              <div className="text-[28px] font-black text-slate-800 leading-none">
                {totalOrders}
              </div>
              <div className="mt-1 text-[9px] font-extrabold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                {t('Live Data')}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Synchronized Legend Grid */}
      <div className="mt-4 w-full grid grid-cols-2 gap-2 text-[11px] font-extrabold">
        {stats.map((item, idx) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-700 transition duration-200 cursor-pointer ${
              hoveredIdx === idx ? "bg-slate-100 border-slate-200 shadow-sm text-slate-900" : ""
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">
              {t(item.label)} ({item.count}) • {totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueBarChart({ orders }) {
  const { t } = useTranslation()
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Aggregate revenue by weekday
  const revenueByDayOfWeek = (() => {
    const revenue = Array(7).fill(0)
    orders.forEach((o) => {
      const date = new Date(o.createdAt)
      const day = date.getDay() // 0-6
      revenue[day] += o.price || 0
    })
    return revenue
  })()

  const chartData = weekdays.map((dayName, idx) => ({
    label: t(dayName),
    revenue: revenueByDayOfWeek[idx],
  }))

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100)
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="w-full bg-white p-4 rounded-2xl">
      <div className="space-y-4">
        {/* Y-Axis scale label */}
        <div className="text-right text-[10px] font-bold text-slate-400">
          {t('Max')}: ₹{maxRevenue.toFixed(0)}
        </div>

        {/* Vertical Bar Chart area */}
        <div className="relative border-b border-slate-200 pb-2">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-2">
            <div className="border-t border-slate-100 w-full" />
            <div className="border-t border-slate-100 w-full" />
            <div className="border-t border-slate-100 w-full" />
          </div>

          {/* Bars */}
          <div className="relative flex items-end justify-between gap-2 h-48 pt-4 z-10">
            {chartData.map((item, idx) => {
              const percentage = (item.revenue / maxRevenue) * 100
              const isHovered = hoveredIdx === idx

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                >
                  {/* Tooltip on hover directly above bar */}
                  {isHovered && (
                    <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-25">
                      ₹{item.revenue.toFixed(2)} ({((item.revenue / (totalRevenue || 1)) * 100).toFixed(1)}%)
                    </div>
                  )}

                  <div className="w-full flex justify-center items-end h-[85%]">
                    <div
                      className={`w-8 sm:w-10 rounded-t-lg transition-all duration-300 relative ${
                        isHovered
                          ? 'bg-gradient-to-t from-violet-500 to-violet-600 shadow-md scale-x-105'
                          : 'bg-gradient-to-t from-violet-400 to-violet-500'
                      }`}
                      style={{ height: `${Math.max(percentage, 4)}%` }}
                    >
                      {/* Short text value inside bar if space permits */}
                      {!isHovered && percentage > 20 && (
                        <div className="absolute top-2 left-0 right-0 text-[9px] font-bold text-white text-center">
                          ₹{Math.round(item.revenue)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <span className={`text-[11px] font-extrabold mt-2 transition-colors duration-200 ${
                    isHovered ? 'text-violet-600' : 'text-slate-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="border-t border-slate-100 pt-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-xs text-slate-500 font-medium">{t('Total Revenue')}</div>
              <div className="mt-1 text-lg font-bold text-slate-900">₹{totalRevenue.toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-xs text-slate-500 font-medium">{t('Peak Period')}</div>
              <div className="mt-1 text-sm font-bold text-violet-600">
                {chartData[chartData.indexOf(chartData.reduce((max, d) => d.revenue > max.revenue ? d : max))]?.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatHeaderControls({ activeChannel, setActiveChannel }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <CalendarDays size={16} className="text-slate-500" />
        <span>{t('Today')}</span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {channelTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveChannel(tab)}
            className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
              activeChannel === tab ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>
    </div>
  );
}

function LegendRow({ items }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <Dot tone={item.tone} />
          <span>{t(item.label)}</span>
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



const scratchCardHistory = [
  { customer: 'Aman Kumar', reward: 'Flat ₹5 Off', code: 'PS5OFF', status: 'Claimed', timestamp: 'Today, 10:30 AM' },
  { customer: 'Neha Sharma', reward: '10% Discount', code: 'SAVE10', status: 'Claimed', timestamp: 'Today, 10:28 AM' },
  { customer: 'Pooja Singh', reward: 'Free Express Print', code: 'EXPRESSFREE', status: 'Active', timestamp: 'Today, 10:15 AM' },
  { customer: 'Vivek Patil', reward: 'Flat ₹10 Off', code: 'PS10OFF', status: 'Expired', timestamp: 'Yesterday, 05:20 PM' },
]

export default function AllOrdersPage() {
  const { t } = useTranslation()
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeChannel, setActiveChannel] = useState("Total")
  const [activeTimeRange, setActiveTimeRange] = useState("Last 30 days")
  const [revenueFilter, setRevenueFilter] = useState("Month")
  const [rewardStats, setRewardStats] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setOrdersList(generateMockOrders());
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
          if (data && data.length > 0) {
            setOrdersList(data);
          } else {
            setOrdersList(generateMockOrders());
          }
        } else {
          setOrdersList(generateMockOrders());
        }
      } catch (err) {
        console.warn("Failed to fetch backend orders, using mock fallback:", err);
        setOrdersList(generateMockOrders());
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchRewardStats = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/rewards/shopkeeper/stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setRewardStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch shopkeeper reward stats:", err);
      }
    };

    fetchRewardStats();
  }, []);

  // Compute filtered orders list based on both channel filter and time range selection
  const filteredOrders = ordersList.filter((o) => {
    // 1. Channel / Print Type filter
    if (activeChannel === "B&W") {
      const isBW = o.printConfiguration?.printType === "BW" || o.printConfiguration?.printType === "B&W";
      if (!isBW) return false;
    } else if (activeChannel === "Color") {
      const isColor = o.printConfiguration?.printType === "COLOR" || o.printConfiguration?.printType === "Color";
      if (!isColor) return false;
    }

    // 2. Time Range filter
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    if (activeTimeRange === "Last 30 days") {
      return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
    } else if (activeTimeRange === "3 months") {
      return (now - orderDate) <= 90 * 24 * 60 * 60 * 1000;
    } else if (activeTimeRange === "1 year") {
      return (now - orderDate) <= 365 * 24 * 60 * 60 * 1000;
    }
    return true; // All-time
  });

  const pendingCount = filteredOrders.filter((o) => o.status === "PENDING" || o.status === "Pending").length;
  const completedCount = filteredOrders.filter((o) => o.status === "COMPLETED" || o.status === "Completed").length;
  const downloadedCount = filteredOrders.filter((o) => o.status === "DOWNLOADED" || o.status === "Downloaded").length;
  const cancelledCount = filteredOrders.filter((o) => o.status === "CANCELLED" || o.status === "Cancelled").length;

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



  const getFormatCounts = () => {
    const counts = { '.pdf': 0, '.docx': 0, '.jpg': 0, '.png': 0, 'other': 0 };
    filteredOrders.forEach((o) => {
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
    filteredOrders.forEach((o) => {
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
  const totalSizes = filteredOrders.length || 1;

  const dynamicPrintSizeRows = [
    { label: 'A4', value: loading ? 0 : sizeCounts['A4'], width: `${loading ? 0 : (sizeCounts['A4'] / totalSizes) * 100}%` },
    { label: 'A3', value: loading ? 0 : sizeCounts['A3'], width: `${loading ? 0 : (sizeCounts['A3'] / totalSizes) * 100}%` },
    { label: 'Legal', value: loading ? 0 : sizeCounts['LEGAL'], width: `${loading ? 0 : (sizeCounts['LEGAL'] / totalSizes) * 100}%` },
    { label: 'Letter', value: loading ? 0 : sizeCounts['LETTER'], width: `${loading ? 0 : (sizeCounts['LETTER'] / totalSizes) * 100}%` },
    { label: 'Other', value: loading ? 0 : sizeCounts['other'], width: `${loading ? 0 : (sizeCounts['other'] / totalSizes) * 100}%` },
  ];

  const completedOrders = filteredOrders.filter((o) => o.status === "COMPLETED" || o.status === "Completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Filter heatmap orders by Month, Week, or Day
  const heatmapOrders = filteredOrders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    if (revenueFilter === "Day") {
      return (now - orderDate) <= 24 * 60 * 60 * 1000;
    } else if (revenueFilter === "Week") {
      return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000;
    }
    return true; // Month matches the active filter range
  });

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
                {t('Shop Statistics & Analysis')}
              </h1>
            </div>
          </div>

          <StatHeaderControls activeChannel={activeChannel} setActiveChannel={setActiveChannel} />
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
                      {timeTabs.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTimeRange(tab)}
                          className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                            activeTimeRange === tab ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t(tab)}
                        </button>
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

                  <MainPrintTrendsChart orders={filteredOrders} timeRange={activeTimeRange} />
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
                  <OrderDistributionChart orders={filteredOrders} />
                </div>
              </CardShell>
            </div>

            <div className="xl:col-span-2">
              <CardShell
                title="Revenue Summary"
                headerRight={
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                      {["Month", "Week", "Day"].map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setRevenueFilter(filter)}
                          className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                            revenueFilter === filter ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm"
                      aria-label="Filter revenue"
                    >
                      <Filter size={18} />
                    </button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">{t('Total Revenue')}</div>
                      <div className="mt-2 text-[30px] font-extrabold tracking-tight text-slate-900">₹{loading ? '...' : totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">{t('Average Order Value')}</div>
                      <div className="mt-2 text-[30px] font-extrabold tracking-tight text-slate-900">₹{loading ? '...' : Math.round(avgOrderValue)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-semibold text-slate-900">{t('Revenue by Hour of Day')}</div>
                    <RevenueBarChart orders={heatmapOrders} />
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
                    <div className="mb-3 text-sm font-semibold text-slate-900">{t('Top 5 Most Printed File Formats')}</div>
                    <FormatList rows={dynamicFormatRows} />
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-semibold text-slate-900">{t('Top 5 Print Sizes')}</div>
                    <div className="space-y-3">
                      {dynamicPrintSizeRows.map((row) => (
                        <div key={row.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>{t(row.label)}</span>
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
                title="Scratch Card Engagement"
                subtitle="Coupons & Astro/Fact Cards Activity"
              >
                <div className="space-y-4">
                  {/* Grid layout for numerical statistics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 shadow-sm">
                      <div className="text-xs font-bold text-slate-500">{t('Generated Today')}</div>
                      <div className="mt-1 text-2xl font-black text-slate-800">
                        {rewardStats ? rewardStats.rewardsGeneratedToday : '0'}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 shadow-sm">
                      <div className="text-xs font-bold text-slate-500">{t('Engagement Level')}</div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide border ${
                          rewardStats?.customerEngagementLevel === 'High'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rewardStats?.customerEngagementLevel === 'Medium'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {rewardStats ? t(rewardStats.customerEngagementLevel) : '...'}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 shadow-sm">
                      <div className="text-xs font-bold text-slate-500">{t('Free Prints Claimed')}</div>
                      <div className="mt-1 text-2xl font-black text-emerald-600">
                        {rewardStats ? rewardStats.freePrintRewardsUsed : '0'}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 shadow-sm">
                      <div className="text-xs font-bold text-slate-500">{t('50% Off Claimed')}</div>
                      <div className="mt-1 text-2xl font-black text-blue-600">
                        {rewardStats ? rewardStats.discountRewardsUsed : '0'}
                      </div>
                    </div>
                  </div>

                  {/* Scratched Ratio Progress Bar */}
                  {rewardStats && (
                    <div className="space-y-1.5 rounded-2xl border border-violet-100 bg-violet-50/20 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-black text-slate-700">
                        <span>{t('Overall Scratch Rate')}</span>
                        <span>
                          {rewardStats.totalGenerated > 0 
                            ? Math.round((rewardStats.totalScratched / rewardStats.totalGenerated) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200/60 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-500" 
                          style={{ 
                            width: `${rewardStats.totalGenerated > 0 
                              ? Math.round((rewardStats.totalScratched / rewardStats.totalGenerated) * 100) 
                              : 0}%` 
                          }} 
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{rewardStats.totalScratched} {t('Scratched')}</span>
                        <span>{rewardStats.totalGenerated} {t('Total Cards')}</span>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-bold text-slate-900">{t('Coupons & Engagement')}</div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {t('Monetary rewards (Free print, 50% discount) apply instantly to orders on completion. Non-monetary rewards (Astro & Fun Facts) boost engagement and platform repeat usage.')}
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