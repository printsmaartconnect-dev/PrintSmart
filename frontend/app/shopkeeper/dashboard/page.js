"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import ShopQRCard from "./_components/ShopQRCard";
import RecentOrders from "./_components/RecentOrders";
import CustomBillModal from "./_components/CustomBillModal";
import BottomDock from "./_components/BottomDock";
import { bottomDockItems, dashboardStats, recentOrders } from "./_components/mockData";
import { useSocket } from "../../../hooks/useSocket";
import { useSocketContext } from "../../../contexts/SocketProvider";
import { MessageCircle, Youtube, Volume2 } from "lucide-react";
import { launchWhatsAppOrCall } from "../../../utils/contact";

function ShopkeeperDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [viewMode, setViewMode] = useState("card");
  const [qrDetails, setQrDetails] = useState({
    shopId: '',
    slug: '',
    qrCodeUrl: '',
    qrValue: ''
  });
  
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
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
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
    createdAt: o.createdAt,
    status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase()) : "Pending",
    customerName: o.customerName || "Anonymous Customer",
    phone: o.phone || "",
    customerComment: o.customerComment || "",
    fileName: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].customFileName : "Untitled Document",
    fileUrl: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].fileUrl : "",
    pages: 1,
    copies: o.printConfiguration?.copies || 1,
    type: (o.orderFiles && o.orderFiles.some(f => {
      let isFileColor = false;
      if (f.customFileName && f.customFileName.includes('|')) {
        try {
          const parsed = JSON.parse(f.customFileName.split('|')[1]);
          if (parsed && parsed.printType === 'COLOR') isFileColor = true;
        } catch(e){}
      }
      const fConfig = f.config || {};
      return isFileColor || fConfig.printType === "COLOR";
    })) || o.printConfiguration?.printType === "COLOR" ? "Color" : "B&W",
    size: o.printConfiguration?.paperSize || "A4",
    side: o.printConfiguration?.sides === "DOUBLE" ? "Double" : "Single",
    price: `₹${(o.price || 0.0).toFixed(2)}`,
    timestamp:
      new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      ", " +
      new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    variant: o.variant || (o.orderFiles && o.orderFiles.length > 0 && (o.orderFiles[0].customFileName === "Customer wants to talk" || o.orderFiles[0].originalFileName === "Customer wants to talk" || o.price === 0) ? "talk" : "standard"),
    paymentLog: o.paymentLog,
    billStatus: o.billStatus || "NOT_REQUESTED",
    files: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles.map(f => {
      const fConfig = f.config || {};
      return {
        id: f.id,
        fileName: f.customFileName || f.originalFileName || "Untitled Document",
        fileUrl: f.fileUrl,
        thumbnailUrl: f.thumbnailUrl || null,
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
      thumbnailUrl: o.orderFiles && o.orderFiles.length > 0 ? o.orderFiles[0].thumbnailUrl : null,
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

    let itemStatuses = {};
    if (typeof window !== "undefined") {
      try {
        itemStatuses = JSON.parse(localStorage.getItem("itemStatuses") || "{}");
      } catch (e) {}
    }
    
    for (const o of rawOrders) {
      const formatted = mapRawOrderToFrontend(o);
      
      if (!formatted.files || formatted.files.length <= 1) {
        const itemKey = formatted.files && formatted.files[0] && formatted.files[0].id ? formatted.files[0].id : formatted.dbId;
        const savedStatus = itemStatuses[itemKey] || itemStatuses[formatted.dbId];
        result.push({
          ...formatted,
          itemKey: itemKey,
          status: savedStatus || formatted.status,
        });
      } else {
        formatted.files.forEach((file, index) => {
          const filePrice = file.price || formatted.price;
          const itemKey = file.id || `${formatted.dbId}_${file.orderId || index}`;
          const savedStatus = itemStatuses[itemKey] || itemStatuses[file.orderId];

          result.push({
            ...formatted,
            id: file.orderId || `${formatted.id}-${index}`,
            dbId: formatted.dbId,
            itemKey: itemKey,
            status: savedStatus || formatted.status,
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
    
    // Sort final list by date ascending (older first)
    return result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateA - dateB;
    });
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
      const combined = [...prev, ...split];
      return combined.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB;
      });
    });
  });

  // Handle order updates in real-time
  useSocket("order-updated", (updatedOrder) => {
    console.log("[Socket] Dashboard received order update:", updatedOrder);
    setOrdersList((prev) => {
      const index = prev.findIndex((o) => o.dbId === updatedOrder.id);
      if (index === -1) {
        const split = splitAndMapRawOrders([updatedOrder]);
        const combined = [...prev, ...split];
        return combined.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateA - dateB;
        });
      }
      const filtered = prev.filter((o) => o.dbId !== updatedOrder.id);
      const split = splitAndMapRawOrders([updatedOrder]);
      const combined = [...filtered, ...split];
      return combined.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB;
      });
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

  const fetchQrDetails = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(`${apiUrl}/api/shopkeeper/me/qr`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setQrDetails(data);
      }
    } catch (err) {
      console.error("Failed to fetch QR details:", err);
    }
  };

  const handleStatusChange = async (target, nextStatus) => {
    let dbId = target;
    let itemKey = null;

    if (typeof target === 'object' && target !== null) {
      dbId = target.dbId || target.id;
      itemKey = target.itemKey || target.id;
    } else if (typeof target === 'string') {
      dbId = target;
      itemKey = target;
    }

    // Save individual item status in localStorage
    let itemStatuses = {};
    if (typeof window !== "undefined") {
      try {
        itemStatuses = JSON.parse(localStorage.getItem("itemStatuses") || "{}");
      } catch (e) {}
      if (itemKey) {
        itemStatuses[itemKey] = nextStatus;
        localStorage.setItem("itemStatuses", JSON.stringify(itemStatuses));
      }
    }

    // Update local orders list state
    setOrdersList((prev) => {
      const updated = prev.map((o) => {
        const matchesKey = itemKey && (o.itemKey === itemKey || o.id === itemKey);
        const matchesDb = !itemKey && (o.dbId === dbId || o.id === dbId);
        if (matchesKey || matchesDb) {
          return { ...o, status: nextStatus };
        }
        return o;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("cachedOrdersList", JSON.stringify(updated));
        window.dispatchEvent(new Event("orders-updated"));
      }
      return updated;
    });

    // Check if ALL items belonging to the parent order (dbId) are now completed or non-pending
    let currentList = [];
    if (typeof window !== "undefined") {
      try {
        currentList = JSON.parse(localStorage.getItem("cachedOrdersList") || "[]");
      } catch (e) {}
    }

    const parentItems = currentList.filter((o) => o.dbId === dbId || o.id === dbId);
    const allFinished = parentItems.length > 0 && parentItems.every((o) => 
      o.status === 'Completed' || o.status === 'Cancelled' || o.status === 'Downloaded'
    );

    const token = localStorage.getItem("authToken");
    if (token && dbId && (allFinished || parentItems.length <= 1)) {
      try {
        await fetch(`${apiUrl}/api/orders/${dbId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch (err) {
        console.warn("Failed to update status on backend:", err);
      }
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
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      if (filterParam === "pending") setActiveFilter(t("Pending"));
      else if (filterParam === "completed") setActiveFilter(t("Completed"));
      else if (filterParam === "downloaded") setActiveFilter(t("Downloaded"));
      else if (filterParam === "cancelled") setActiveFilter(t("Cancelled"));
      else if (filterParam === "all") setActiveFilter(t("All"));
    } else {
      // Default: Redirect to pending orders filter by default
      const newParams = new URLSearchParams(window.location.search);
      newParams.set("filter", "pending");
      router.replace(window.location.pathname + "?" + newParams.toString());
    }

    if (searchParams.get("openCustomBill") === "true") {
      setPrefillData(null);
      setIsBillModalOpen(true);
      
      // Clean query parameter to prevent reopening on reload
      const newParams = new URLSearchParams(window.location.search);
      newParams.delete("openCustomBill");
      const search = newParams.toString();
      router.replace(window.location.pathname + (search ? `?${search}` : ""));
    }
  }, [searchParams, router, t]);

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
          fetchQrDetails();
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

        setShopName(profile.shopName || "");
        setShopkeeperIdCode(profile.shopSlug || "");
        setShopAddress(contact.shopAddress || "");
        setSubscriptionPlan(account?.subscriptionPlan || "");
        if (account?.createdAt) {
          setMemberSince(account.createdAt);
        }
        fetchOrders();
        fetchQrDetails();
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const rawFilteredOrders =
    (activeFilter === "All" || activeFilter === t("All"))
      ? ordersList
      : ordersList.filter((order) => {
          if (activeFilter === "Completed" || activeFilter === t("Completed")) {
            return order.status === "Completed" || order.status === "Downloaded";
          }
          if (activeFilter === "Pending" || activeFilter === t("Pending")) {
            return order.status !== "Completed" && order.status !== "Downloaded" && order.status !== "Cancelled";
          }
          return t(order.status) === activeFilter;
        });

  const displayedOrders = (() => {
    if (activeFilter === "Completed" || activeFilter === t("Completed")) {
      return [...rawFilteredOrders].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // Newest first
      });
    }
    return rawFilteredOrders; // Default: older first (ascending)
  })();

  const pendingCount = ordersList.filter((o) => o.status !== "Completed" && o.status !== "Downloaded" && o.status !== "Cancelled").length;
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
      { key: 'customBill', label: t('Custom Bill'), badge: null },
      { key: 'addOrder', label: t('Add order'), badge: null, href: `/customer/language?shopkeeperAddOrder=true&shopId=${shopkeeperIdCode}` },
      { key: 'coupon', label: t('Business network'), badge: null, href: '/shopkeeper/business-network' },
      { key: 'printsmartAi', label: t('🤖 AI Copilot'), badge: null, href: '/shopkeeper/ai' },
    ];
  })();

  const handleEditBill = (cardOrder) => {
    const matchingCards = ordersList.filter(o => o.dbId === cardOrder.dbId);
    const products = matchingCards.map((c, index) => {
      const cleanPrice = parseFloat(c.price.replace(/[^\d.]/g, '')) || 0;
      return {
        id: String(index + 1),
        name: c.fileName || 'Print Document',
        quantity: parseInt(c.copies, 10) || 1,
        unitPrice: cleanPrice,
        discount: 0,
        taxPercent: 0
      };
    });

    const prefill = {
      customerName: cardOrder.customerName || '',
      customerPhone: cardOrder.phone || '',
      customerAddress: '',
      invoiceNumber: 'INV-' + cardOrder.id,
      products: products.length > 0 ? products : [{ id: '1', name: cardOrder.fileName || 'Print Document', quantity: cardOrder.copies || 1, unitPrice: parseFloat(cardOrder.price.replace(/[^\d.]/g, '')) || 0, discount: 0, taxPercent: 0 }],
      paymentMethod: cardOrder.paymentLog?.paymentGateway || 'Cash',
    };

    setPrefillData(prefill);
    setIsBillModalOpen(true);
  };

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

      if (fileUrl) {
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
          let iframe = document.getElementById('native-print-iframe');
          if (iframe) iframe.remove();
          
          iframe = document.createElement('iframe');
          iframe.id = 'native-print-iframe';
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow.document;
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${fileName || 'PrintSmart Document'}</title>
                <style>
                  @page { size: auto; margin: 0; }
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
          const printWin = window.open('', '_blank', 'width=900,height=950');
          if (printWin) {
            printWin.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>${fileName || 'PrintSmart Document'}</title>
                  <style>
                    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
                    iframe { width: 100%; height: 100%; border: none; }
                  </style>
                </head>
                <body>
                  <iframe id="pdf-frame" src="${fileUrl}#toolbar=0"></iframe>
                  <script>
                    const frame = document.getElementById('pdf-frame');
                    frame.onload = function() {
                      setTimeout(function() {
                        try {
                          frame.contentWindow.focus();
                          frame.contentWindow.print();
                        } catch (e) {
                          window.focus();
                          window.print();
                        }
                      }, 250);
                    };
                  </script>
                </body>
              </html>
            `);
            printWin.document.close();
            successCount++;
          } else {
            window.open(fileUrl, '_blank');
            successCount++;
          }
        }
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
          <WelcomeBar 
            shopName={shopName} 
            shopkeeperIdCode={shopkeeperIdCode} 
            memberSince={memberSince} 
            subscriptionPlan={subscriptionPlan} 
            pendingCount={pendingCount}
            completedCount={completedCount}
            downloadedCount={downloadedCount}
            cancelledCount={cancelledCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 xl:col-span-3">
              <ShopQRCard 
                shopName={shopName}
                shopkeeperIdCode={shopkeeperIdCode}
                qrDetails={qrDetails}
              />
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              <RecentOrders 
                orders={displayedOrders} 
                activeFilter={activeFilter} 
                onStatusChange={handleStatusChange} 
                onPaymentVerify={handlePaymentVerify}
                onPrint={async (order) => {
                  if (handleStatusChange && (order.itemKey || order.dbId || order.id)) {
                    handleStatusChange(order, 'Completed');
                  }
                  await handleDirectPrint(order);
                }}
                onDownload={handleDirectDownload}
                onEditBill={handleEditBill}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BottomDock is rendered globally in shopkeeper/layout.js */}
      {/* Floating Action Button Group */}
      <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        {/* YouTube Button */}
        <a
          href="https://youtube.com/@printsmaartofficialpage?si=XD-Lrvk6d02SXV3X"
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition hover:scale-105 active:scale-95"
          title="YouTube Video Guide"
        >
          <Youtube size={18} />
        </a>

        {/* WhatsApp Button */}
        <button
          onClick={() => launchWhatsAppOrCall()}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition hover:scale-105 active:scale-95"
          title="WhatsApp Support"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.46 3.473 1.336 4.985l-1.42 5.19 5.31-1.393c1.455.792 3.09 1.21 4.757 1.213h.005c5.502 0 9.985-4.482 9.985-9.988C22.002 6.482 17.519 2 12.012 2zm5.835 14.23c-.248.696-1.432 1.264-1.996 1.344-.542.077-1.253.14-3.645-.85-3.056-1.266-5.02-4.38-5.172-4.584-.15-.205-1.222-1.626-1.222-3.1 0-1.474.773-2.197 1.05-2.483.225-.23.6-.338.9-.338.1 0 .193.003.275.008.243.013.365.027.525.41.2.478.685 1.673.744 1.792.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.253.315-.36.423-.118.118-.242.247-.104.484.138.238.614 1.01 1.317 1.636.907.807 1.67 1.054 1.908 1.173.238.12.378.1.517-.06.14-.16.6-.7 1.015-1.378H15c.16 0 .313-.05.518.026.204.076 1.3.613 1.525.727.226.115.377.172.433.27.057.098.057.567-.19 1.265z" />
          </svg>
        </button>

        {/* Audio Button (Disabled) */}
        <button
          disabled
          className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md opacity-50 cursor-not-allowed"
          title="Audio Settings (Coming Soon)"
        >
          <Volume2 size={18} />
        </button>

        {/* Feedback & Support Button */}
        <a
          href="https://forms.gle/VBK48SwGSWm7prgUA"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full h-12 w-12 sm:h-auto sm:w-auto flex items-center justify-center sm:px-5 sm:py-3 shadow-[0_4px_20px_rgba(99,102,241,0.35)] border border-indigo-400/20 gap-2 transition-all hover:scale-105 active:scale-95 group font-bold text-sm"
          aria-label={t('Feedback & Support')}
        >
          <MessageCircle size={18} className="text-white group-hover:rotate-12 transition-transform duration-200" />
          <span className="hidden sm:inline">{t('Feedback & Support')}</span>
        </a>
      </div>

      <CustomBillModal 
        isOpen={isBillModalOpen} 
        onClose={() => setIsBillModalOpen(false)} 
        prefillData={prefillData}
      />
    </div>
  );
}

export default function ShopkeeperDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ShopkeeperDashboardContent />
    </Suspense>
  );
}
