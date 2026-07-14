'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Download,
  XCircle,
  FileText,
  ShoppingCart,
  Gift,
  Printer,
  Palette,
  Users,
} from 'lucide-react'

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

const mapRawOrderToFrontend = (o) => ({
  id: o.orderId,
  dbId: o.id,
  status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase()) : "Pending",
  customerName: o.customerName || "Anonymous Customer",
  phone: o.phone || "",
  customerComment: o.customerComment || "",
  fileName: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].customFileName : "Untitled Document",
  fileUrl: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].fileUrl : "",
  pages: 1,
  copies: o.printConfiguration?.copies || 1,
  type: o.printConfiguration?.printType === "COLOR" ? "Color" : "B&W",
  size: o.printConfiguration?.paperSize || "A4",
  side: o.printConfiguration?.sides === "DOUBLE" ? "Double" : "Single",
  price: o.price || 0.0,
  createdAt: o.createdAt,
  variant: o.orderFiles && o.orderFiles.length > 0 && (o.orderFiles[0].customFileName === "Customer wants to talk" || o.orderFiles[0].originalFileName === "Customer wants to talk" || o.price === 0) ? "talk" : "standard",
  paymentLog: o.paymentLog,
  rewardLog: o.rewardLog,
  printConfiguration: o.printConfiguration,
  orderFiles: o.orderFiles || []
});

const splitAndMapRawOrders = (rawOrders) => {
  const result = [];
  if (!rawOrders) return result;
  
  for (const o of rawOrders) {
    const formatted = mapRawOrderToFrontend(o);
    
    if (!o.orderFiles || o.orderFiles.length <= 1) {
      result.push(formatted);
    } else {
      o.orderFiles.forEach((file, index) => {
        let filePrice = file.price || o.price || 0.0;
        if (file.customFileName && file.customFileName.includes('|')) {
          try {
            const parts = file.customFileName.split('|');
            const parsed = JSON.parse(parts[1]);
            if (parsed && parsed.price !== undefined) {
              filePrice = parseFloat(parsed.price);
            }
          } catch (e) {}
        }
        const fConfig = file.config || o.printConfiguration || {};
        result.push({
          ...formatted,
          id: file.orderId || `${formatted.id}-${index}`,
          dbId: formatted.dbId,
          fileName: file.customFileName || file.originalFileName,
          fileUrl: file.fileUrl,
          copies: fConfig.copies || formatted.copies,
          type: fConfig.printType === "COLOR" ? "Color" : "B&W",
          size: fConfig.paperSize || formatted.size,
          side: fConfig.sides === "DOUBLE" ? "Double" : "Single",
          price: filePrice,
          orderFiles: [file],
          printConfiguration: {
            ...o.printConfiguration,
            copies: fConfig.copies || o.printConfiguration?.copies || 1,
            printType: fConfig.printType || o.printConfiguration?.printType || "BW",
            paperSize: fConfig.paperSize || o.printConfiguration?.paperSize || "A4",
            sides: fConfig.sides || o.printConfiguration?.sides || "SINGLE"
          }
        });
      });
    }
  }
  return result;
};

const generateMockOrders = () => {
  const list = [];
  
  let seed = 12345;
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

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
      const hour = 9 + Math.floor(random() * 12);
      const minute = Math.floor(random() * 60);
      
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(hour, minute, 0, 0);

      const copies = 1 + Math.floor(random() * 3);
      const pages = 1 + Math.floor(random() * 25);
      const isBW = random() > 0.3;
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

export default function AllOrdersPage() {
  const { t } = useTranslation()
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [rewardStats, setRewardStats] = useState(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setOrdersList(splitAndMapRawOrders(generateMockOrders()));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/orders/shopkeeper/all`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setOrdersList(splitAndMapRawOrders(data));
          } else {
            setOrdersList(splitAndMapRawOrders(generateMockOrders()));
          }
        } else {
          setOrdersList(splitAndMapRawOrders(generateMockOrders()));
        }
      } catch (err) {
        console.warn("Failed to fetch backend orders, using mock fallback:", err);
        setOrdersList(splitAndMapRawOrders(generateMockOrders()));
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
        const response = await fetch(`${apiUrl}/api/rewards/shopkeeper/stats`, {
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

  const pendingCount = ordersList.filter((o) => o.status === "PENDING" || o.status === "Pending").length;
  const completedCount = ordersList.filter((o) => o.status === "COMPLETED" || o.status === "Completed" || o.status === "DOWNLOADED" || o.status === "Downloaded").length;
  const downloadedCount = ordersList.filter((o) => o.status === "DOWNLOADED" || o.status === "Downloaded").length;
  const cancelledCount = ordersList.filter((o) => o.status === "CANCELLED" || o.status === "Cancelled").length;

  // Total Revenue (30 Days)
  const totalRevenue30Days = ordersList
    .filter((o) => {
      const isPaid = o.status === "COMPLETED" || o.status === "Completed" || o.status === "DOWNLOADED" || o.status === "Downloaded";
      if (!isPaid) return false;
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, o) => sum + (o.price || 0), 0);

  // Average Order Value
  const completedOrDownloaded = ordersList.filter((o) => o.status === "COMPLETED" || o.status === "Completed" || o.status === "DOWNLOADED" || o.status === "Downloaded");
  const totalRevAll = completedOrDownloaded.reduce((sum, o) => sum + (o.price || 0), 0);
  const avgOrderValue = completedOrDownloaded.length > 0 ? totalRevAll / completedOrDownloaded.length : 0;

  // 1. New Metric: Total Pages/Prints count
  const totalPagesCount = completedOrDownloaded.reduce((sum, o) => sum + (o.copies || 1), 0);

  // 2. New Metric: Color Prints count
  const colorPrintsCount = completedOrDownloaded.filter((o) => o.type === "Color").length;

  // 3. New Metric: Unique Customers count
  const uniqueCustomersCount = new Set(ordersList.map(o => o.customerName)).size;

  const getFormatCounts = () => {
    const counts = { '.pdf': 0, '.docx': 0, '.jpg': 0, '.png': 0, 'other': 0 };
    ordersList.forEach((o) => {
      const fileName = o.fileName || '';
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
      const size = o.size || 'A4';
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

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex items-center gap-3">
          <Link
            href="/shopkeeper/dashboard"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-slate-250 bg-white text-slate-700 hover:bg-slate-50 transition mr-1 font-black text-xs shadow-sm hover:text-slate-900 hover:border-slate-350 active:scale-95 flex-shrink-0"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
          <div>
            <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900 sm:text-[36px]">
              {t('Shop Statistics & Analysis')}
            </h1>
          </div>
        </div>

        {/* 9 Stats Cards Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {/* Card 1: Pending Orders */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-amber-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Pending Orders')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-amber-500">
                {loading ? '...' : String(pendingCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Card 2: Completed Orders */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-emerald-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Completed Orders')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-emerald-500">
                {loading ? '...' : String(completedCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Card 3: Downloaded Files */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-blue-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Download size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Downloaded Files')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-blue-600">
                {loading ? '...' : String(downloadedCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Card 4: Cancelled Orders */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-rose-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <XCircle size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Cancelled Orders')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-rose-500">
                {loading ? '...' : String(cancelledCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Card 5: Total Revenue (30 Days) */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-violet-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-violet-50 text-violet-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Total Revenue (30 Days)')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-violet-750">
                ₹{loading ? '...' : totalRevenue30Days.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Card 6: Average Order Value */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-teal-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-teal-50 text-teal-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <ShoppingCart size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Average Order Value')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-teal-600">
                ₹{loading ? '...' : Math.round(avgOrderValue)}
              </p>
            </div>
          </div>

          {/* Card 7: Total Pages Printed */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-violet-300 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-violet-100 text-violet-600 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Printer size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Total Pages Printed')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-violet-600">
                {loading ? '...' : String(totalPagesCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Card 8: Color Prints */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-indigo-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Palette size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Color Prints')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-indigo-600">
                {loading ? '...' : String(colorPrintsCount).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Card 9: Unique Customers */}
          <div className="group flex items-center gap-4 bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:border-sky-200 active:scale-95 cursor-pointer">
            <div className="p-4 rounded-2xl bg-sky-50 text-sky-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Users size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">{t('Unique Customers')}</p>
              <p className="text-4xl font-extrabold mt-1 leading-none tracking-tight text-sky-600">
                {loading ? '...' : String(uniqueCustomersCount).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Lower Grid for distribution and engagement */}
        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Card Shell for Top Products and Formats */}
          <CardShell title="Top Products and Formats">
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

          {/* Card Shell for Scratch Card Engagement */}
          <CardShell
            title="Scratch Card Engagement"
            subtitle="Coupons & Astro/Fact Cards Activity"
          >
            <div className="space-y-4">
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
      </main>
    </div>
  )
}