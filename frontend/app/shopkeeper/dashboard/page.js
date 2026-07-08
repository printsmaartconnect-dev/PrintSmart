"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  isOnboardingComplete,
  syncLocalStorageFromDb,
  getProfile,
  getContact,
  getPricing,
  isProfileSetupComplete,
  isPricingSetupComplete,
} from "../onboarding/_components/onboardingStorage";
import DashboardHeader from "./_components/DashboardHeader";
import WelcomeBar from "./_components/WelcomeBar";
import StatsRow from "./_components/StatsRow";
import RecentOrders from "./_components/RecentOrders";
import BottomDock from "./_components/BottomDock";
import { bottomDockItems, dashboardStats, recentOrders } from "./_components/mockData";
import { useSocket } from "../../../hooks/useSocket";
import { useSocketContext } from "../../../contexts/SocketProvider";
import { MessageCircle } from "lucide-react";

export default function ShopkeeperDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [shopName, setShopName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = JSON.parse(localStorage.getItem("loggedInShopkeeper") || localStorage.getItem("shopkeeper") || "{}");
        return cached.shopName || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const [shopkeeperIdCode, setShopkeeperIdCode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = JSON.parse(localStorage.getItem("loggedInShopkeeper") || localStorage.getItem("shopkeeper") || "{}");
        return cached.shopSlug || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const [memberSince, setMemberSince] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = JSON.parse(localStorage.getItem("loggedInShopkeeper") || localStorage.getItem("shopkeeper") || "{}");
        return cached.createdAt || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const [subscriptionPlan, setSubscriptionPlan] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = JSON.parse(localStorage.getItem("loggedInShopkeeper") || localStorage.getItem("shopkeeper") || "{}");
        return cached.subscriptionPlan || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const [activeFilter, setActiveFilter] = useState("All");
  
  const [ordersList, setOrdersList] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cachedOrdersList");
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [dataLoaded, setDataLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("cachedOrdersList");
    }
    return false;
  });

  const [activePrintOrder, setActivePrintOrder] = useState(null);
  const [shopAddress, setShopAddress] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = JSON.parse(localStorage.getItem("loggedInShopkeeper") || localStorage.getItem("shopkeeper") || "{}");
        return cached.address || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const { joinRoom, leaveRoom } = useSocketContext();

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
    price: `₹${(o.price || 0.0).toFixed(2)}`,
    timestamp:
      new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      ", " +
      new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    variant: o.variant || (o.orderFiles && o.orderFiles.length > 0 && (o.orderFiles[0].customFileName === "Customer wants to talk" || o.orderFiles[0].originalFileName === "Customer wants to talk" || o.price === 0) ? "talk" : "standard"),
    paymentLog: o.paymentLog,
    files: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles.map(f => {
      const fConfig = f.config || {};
      return {
        id: f.id,
        fileName: f.customFileName || f.originalFileName || "Untitled Document",
        fileUrl: f.fileUrl,
        copies: fConfig.copies || o.printConfiguration?.copies || 1,
        type: fConfig.printType === "COLOR" ? "Color" : (fConfig.printType === "BW" ? "B&W" : (o.printConfiguration?.printType === "COLOR" ? "Color" : "B&W")),
        size: fConfig.paperSize || o.printConfiguration?.paperSize || "A4",
        side: fConfig.sides === "DOUBLE" ? "Double" : (fConfig.sides === "SINGLE" ? "Single" : (o.printConfiguration?.sides === "DOUBLE" ? "Double" : "Single")),
        price: f.price !== undefined ? `₹${parseFloat(f.price).toFixed(2)}` : `₹${(o.price || 0.0).toFixed(2)}`,
        orderId: f.orderId || o.orderId,
      };
    }) : [{
      id: o.orderId,
      fileName: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].customFileName : "Untitled Document",
      fileUrl: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].fileUrl : "",
      copies: o.printConfiguration?.copies || 1,
      type: o.printConfiguration?.printType === "COLOR" ? "Color" : "B&W",
      size: o.printConfiguration?.paperSize || "A4",
      side: o.printConfiguration?.sides === "DOUBLE" ? "Double" : "Single",
      price: `₹${(o.price || 0.0).toFixed(2)}`,
      orderId: o.orderId,
    }],
    filesDeleted: o.filesDeleted,
    storageStatus: o.storageStatus,
  });

  const splitAndMapRawOrders = (rawOrders) => {
    const result = [];
    if (!rawOrders) return result;
    
    for (const o of rawOrders) {
      const formatted = mapRawOrderToFrontend(o);
      
      if (!formatted.files || formatted.files.length <= 1) {
        result.push(formatted);
      } else {
        formatted.files.forEach((file, index) => {
          const filePrice = file.price || formatted.price;
          result.push({
            ...formatted,
            id: file.orderId || `${formatted.id}-${index}`,
            dbId: formatted.dbId,
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            copies: file.copies || formatted.copies,
            type: file.type || formatted.type,
            size: file.size || formatted.size,
            side: file.side || formatted.side,
            price: filePrice,
            files: [file],
            variant: (file.fileName === "Customer wants to talk" || filePrice === "₹0.00") ? "talk" : "standard",
          });
        });
      }
    }
    
    return result;
  };

  // Join shop room on mount/auth load
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedInShopkeeper");
    if (loggedIn) {
      try {
        const shop = JSON.parse(loggedIn);
        if (shop && shop.id) {
          joinRoom(`shop:${shop.id}`);
          return () => {
            leaveRoom(`shop:${shop.id}`);
          };
        }
      } catch (e) {
        console.error("Failed to parse shopkeeper for socket join:", e);
      }
    }
  }, [joinRoom, leaveRoom, shopName]);

  // Handle incoming new orders in real-time
  useSocket("new-order", (newOrder) => {
    console.log("[Socket] Dashboard received new order:", newOrder);
    setOrdersList((prev) => {
      if (prev.some((o) => o.dbId === newOrder.id)) return prev;
      const split = splitAndMapRawOrders([newOrder]);
      return [...split, ...prev];
    });
  });

  // Handle order updates in real-time
  useSocket("order-updated", (updatedOrder) => {
    console.log("[Socket] Dashboard received order update:", updatedOrder);
    setOrdersList((prev) => {
      const index = prev.findIndex((o) => o.dbId === updatedOrder.id);
      if (index === -1) {
        const split = splitAndMapRawOrders([updatedOrder]);
        return [...split, ...prev];
      }
      const filtered = prev.filter((o) => o.dbId !== updatedOrder.id);
      const split = splitAndMapRawOrders([updatedOrder]);
      const copy = [...filtered];
      copy.splice(index, 0, ...split);
      return copy;
    });
  });

  // Handle automatic storage cleanup in real-time
  useSocket("storage_cleaned", (data) => {
    console.log("[Socket] Dashboard received storage cleanup:", data);
    setOrdersList((prev) => {
      return prev.map((o) => {
        if (o.dbId === data.orderId) {
          return {
            ...o,
            filesDeleted: true,
            storageStatus: "CLEANED",
          };
        }
        return o;
      });
    });
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';
  console.log('Active API URL (Dashboard):', apiUrl);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setOrdersList(recentOrders);
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
        const mappedOrders = splitAndMapRawOrders(data);
        setOrdersList(mappedOrders);
        localStorage.setItem("cachedOrdersList", JSON.stringify(mappedOrders));
        setDataLoaded(true);
      } else {
        setOrdersList(recentOrders);
        setDataLoaded(true);
      }
    } catch (err) {
      console.warn("Failed to fetch backend orders, using mock fallback:", err);
      setOrdersList(recentOrders);
      setDataLoaded(true);
    }
  };

  const handleStatusChange = async (dbId, nextStatus) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setOrdersList((prev) =>
        prev.map((o) => (o.dbId === dbId || o.id === dbId ? { ...o, status: nextStatus } : o))
      );
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/orders/${dbId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        alert("Failed to update order status");
      }
    } catch (err) {
      console.warn("Failed to update status on backend, updating locally:", err);
      setOrdersList((prev) =>
        prev.map((o) => (o.dbId === dbId || o.id === dbId ? { ...o, status: nextStatus } : o))
      );
    }
  };

  const handlePaymentVerify = async (orderDbId, status) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/payments/shopkeeper/verify/${orderDbId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        alert("Failed to update payment status");
      }
    } catch (err) {
      console.error("Payment status update error:", err);
      alert("Error updating payment validation");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const loggedIn = localStorage.getItem("loggedInShopkeeper");
    if (!token || !loggedIn) {
      router.replace("/shopkeeper/login");
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const shopkeeper = await response.json();
          // Sync database state to local storage
          localStorage.setItem("loggedInShopkeeper", JSON.stringify(shopkeeper));
          localStorage.setItem("shopkeeper", JSON.stringify(shopkeeper));
          syncLocalStorageFromDb(shopkeeper);


          // Onboarded - proceed
          setShopName(shopkeeper.shopName || "");
          setShopkeeperIdCode(shopkeeper.shopSlug || "");
          setShopAddress(shopkeeper.address || "");
          setSubscriptionPlan(shopkeeper.subscriptionPlan || "");
          if (shopkeeper.createdAt) {
            setMemberSince(shopkeeper.createdAt);
          }
          fetchOrders();
        } else {
          // If profile fetch fails (e.g. invalid token), redirect to login
          router.replace("/shopkeeper/login");
        }
      } catch (err) {
        console.warn("Database onboarding check failed, using fallback:", err);
        // Fallback to local storage checks
        let account = null;
        try {
          account = JSON.parse(localStorage.getItem("shopkeeper") || "null");
        } catch {
          account = null;
        }

        const profile = getProfile();
        const contact = getContact();
        const pricing = getPricing();



        setShopName(profile.shopName || "");
        setShopkeeperIdCode(profile.shopSlug || "");
        setShopAddress(contact.shopAddress || "");
        setSubscriptionPlan(account?.subscriptionPlan || "");
        if (account?.createdAt) {
          setMemberSince(account.createdAt);
        }
        fetchOrders();
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const displayedOrders =
    (activeFilter === "All" || activeFilter === t("All"))
      ? ordersList
      : ordersList.filter((order) => {
          if (activeFilter === "Completed" || activeFilter === t("Completed")) {
            return order.status === "Completed" || order.status === "Downloaded";
          }
          return t(order.status) === activeFilter;
        });

  const pendingCount = ordersList.filter((o) => o.status === "Pending").length;
  const completedCount = ordersList.filter((o) => o.status === "Completed" || o.status === "Downloaded").length;
  const downloadedCount = ordersList.filter((o) => o.status === "Downloaded").length;
  const cancelledCount = ordersList.filter((o) => o.status === "Cancelled").length;

  // Compute dynamic stats based on ordersList
  const dynamicStats = (() => {
    if (!dataLoaded) return dashboardStats.map(s => ({ ...s, label: t(s.label) }));
    return [
      { key: "pending", label: t("Pending Orders"), count: String(pendingCount), tone: "orange" },
      { key: "completed", label: t("Completed Orders"), count: String(completedCount), tone: "green" },
      { key: "downloaded", label: t("Downloaded Files"), count: String(downloadedCount), tone: "blue" },
      { key: "cancelled", label: t("Cancelled Orders"), count: String(cancelledCount), tone: "red" },
    ];
  })();

  const dynamicDockItems = (() => {
    if (!dataLoaded) return bottomDockItems.map(d => ({ ...d, label: t(d.label) }));
    return [
      { key: 'profile', label: t('Profile'), badge: null, href: '/shopkeeper/profile' },
      { key: 'settings', label: t('Settings'), badge: null, href: '/shopkeeper/settings' },
      { key: 'subscription', label: t('Subscription'), badge: null, href: '/shopkeeper/subscription' },
      { key: 'allOrders', label: t('Statistics & Analysis'), badge: null, href: '/shopkeeper/statistics-and-analysis' },
      { key: 'pending', label: t('Pending'), badge: String(pendingCount) },
      { key: 'completed', label: t('Completed'), badge: String(completedCount) },
      { key: 'downloaded', label: t('Downloaded'), badge: String(downloadedCount) },
      { key: 'cancelled', label: t('Cancelled'), badge: String(cancelledCount) },
      { key: 'addOrder', label: t('Add order'), badge: null, href: `/customer/language?shopkeeperAddOrder=true&shopId=${shopkeeperIdCode}` },
      { key: 'coupon', label: t('Business network'), badge: null, href: '/shopkeeper/business-network' },
      { key: 'printsmartAi', label: t('🤖 AI Copilot'), badge: null, href: '/shopkeeper/ai' },
    ];
  })();

  const handleDirectPrint = async (order) => {
    const filesList = order.files && order.files.length > 0 ? order.files : [{
      fileUrl: order.fileUrl,
      fileName: order.fileName
    }];

    let successCount = 0;
    for (const file of filesList) {
      if (!file.fileUrl) continue;

      const fileName = file.fileName || '';
      const extension = fileName.split('.').pop().toLowerCase();
      const token = localStorage.getItem("authToken");
      let fileUrl = file.fileUrl;

      try {
        // Fetch presigned URL if AWS
        if (fileUrl.includes('amazonaws.com')) {
          const response = await fetch(`${apiUrl}/api/files/presigned?fileUrl=${encodeURIComponent(fileUrl)}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            fileUrl = data.presignedUrl;
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve presigned URL for printing:", err);
      }

      try {
        if (['pdf'].includes(extension)) {
          // Fetch as Blob to bypass iframe CORS
          const fileRes = await fetch(fileUrl);
          if (!fileRes.ok) {
            throw new Error("Failed to download PDF for printing.");
          }
          const blob = await fileRes.blob();
          const bUrl = URL.createObjectURL(blob);

          let iframe = document.getElementById('print-iframe');
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'print-iframe';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
          }

          iframe.src = bUrl;
          iframe.onload = () => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
              setTimeout(() => {
                URL.revokeObjectURL(bUrl);
              }, 60000);
            } catch (err) {
              console.error("Iframe print fail:", err);
              window.open(bUrl, '_blank');
            }
          };
          successCount++;
        } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
          let iframe = document.getElementById('print-iframe');
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'print-iframe';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
          }

          const doc = iframe.contentWindow.document;
          doc.open();
          doc.write(`
            <html>
              <head>
                <style>
                  @page { size: auto; margin: 0mm; }
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                  img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                </style>
              </head>
              <body>
                <img src="${fileUrl}" onload="window.focus(); window.print();" />
              </body>
            </html>
          `);
          doc.close();
          successCount++;
        } else {
          // Office format download
          window.open(fileUrl, '_blank');
          alert(t("Office documents cannot be printed directly from the browser. The file has been downloaded. Please print it locally."));
          successCount++;
        }
      } catch (err) {
        console.error("Direct print failed:", err);
        alert(t("Direct printing failed for file: ") + fileName + t(". Opening file in a new tab."));
        window.open(fileUrl, '_blank');
        successCount++;
      }
    }

    if (successCount === 0) {
      alert(t('No file URL associated with this order.'));
    }
  };

  const handleDirectDownload = async (order) => {
    const filesList = order.files && order.files.length > 0 ? order.files : [{
      fileUrl: order.fileUrl,
      fileName: order.fileName
    }];

    let successCount = 0;
    for (const file of filesList) {
      if (!file.fileUrl) continue;

      const fileName = file.fileName || 'download';
      const token = localStorage.getItem("authToken");
      let fileUrl = file.fileUrl;

      try {
        // 1. Fetch presigned URL if AWS, specifying the download filename to force Content-Disposition
        if (fileUrl.includes('amazonaws.com')) {
          const response = await fetch(`${apiUrl}/api/files/presigned?fileUrl=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(fileName)}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            fileUrl = data.presignedUrl;
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve presigned URL for downloading:", err);
      }

      try {
        // 2. Fetch file content as blob to force a local download in JavaScript
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error("Failed to download file content.");
        }
        const blob = await response.blob();
        const bUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = bUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the object URL after download finishes
        setTimeout(() => {
          URL.revokeObjectURL(bUrl);
        }, 60000);
        successCount++;
      } catch (err) {
        console.error("Direct download via Blob failed, falling back to direct link download:", err);
        // 3. Fallback: navigate directly to the signed URL in the current tab.
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        successCount++;
      }
    }

    if (successCount > 0) {
      if (handleStatusChange && (order.dbId || order.id)) {
        await handleStatusChange(order.dbId || order.id, 'Downloaded');
      }
    } else {
      alert(t('No file URL associated with this order.'));
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8FF] relative overflow-hidden" style={{
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(243, 232, 255, 0.85) 0px, transparent 50%),
        radial-gradient(at 50% 0%, rgba(250, 232, 255, 0.65) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(224, 242, 254, 0.75) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(243, 232, 255, 0.8) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(253, 244, 255, 0.65) 0px, transparent 50%)
      `
    }}>
      {/* Premium Glassmorphism Pastel Blob Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Soft floating blurred shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[100px] animate-pulse duration-[8s]" />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-pink-100/30 blur-[120px] animate-pulse duration-[10s]" />
        <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-blue-100/20 blur-[90px] animate-pulse duration-[12s]" />
        
        {/* Smooth horizontal gradient wave curves mimicking the reference image */}
        <svg className="absolute top-0 w-full h-[600px] opacity-[0.25] blur-[1px]" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 120C150 180 300 80 450 140C600 200 750 250 900 180C1050 110 1200 70 1440 130V0H0V120Z" fill="url(#wave-grad-1)" />
          <path d="M0 190C200 120 400 260 600 180C800 100 1000 220 1200 150C1320 108 1380 125 1440 140V0H0V190Z" fill="url(#wave-grad-2)" fillOpacity="0.7" />
          <defs>
            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="100%" stopColor="#FCE7F3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Soft bottom ripples */}
        <svg className="absolute bottom-0 w-full h-[300px] opacity-[0.15] rotate-180" viewBox="0 0 1440 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 100C200 50 400 150 600 90C800 30 1000 120 1200 80C1320 56 1380 65 1440 70V0H0V100Z" fill="url(#wave-grad-1)" />
        </svg>
      </div>
      <DashboardHeader shopName={shopName} />

      <div className="px-4 sm:px-6 lg:px-8 pb-28">
        <div className="mx-auto max-w-7xl space-y-6">
          <WelcomeBar shopName={shopName} shopkeeperIdCode={shopkeeperIdCode} memberSince={memberSince} subscriptionPlan={subscriptionPlan} />
          <StatsRow stats={dynamicStats} />
          <RecentOrders 
            orders={displayedOrders} 
            activeFilter={activeFilter} 
            onStatusChange={handleStatusChange} 
            onPaymentVerify={handlePaymentVerify}
            onPrint={async (order) => {
              await handleDirectPrint(order);
              if (handleStatusChange && (order.dbId || order.id)) {
                await handleStatusChange(order.dbId || order.id, 'Completed');
              }
            }}
            onDownload={handleDirectDownload}
          />
        </div>
      </div>

      <BottomDock
        items={dynamicDockItems}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {/* Floating Feedback & Support Button */}
      <a
        href="https://forms.gle/VBK48SwGSWm7prgUA"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full px-5 py-3 shadow-[0_4px_20px_rgba(99,102,241,0.35)] border border-indigo-400/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group font-bold text-sm"
        aria-label={t('Feedback & Support')}
      >
        <MessageCircle size={18} className="text-white group-hover:rotate-12 transition-transform duration-200" />
        <span>{t('Feedback & Support')}</span>
      </a>
    </div>
  );
}
