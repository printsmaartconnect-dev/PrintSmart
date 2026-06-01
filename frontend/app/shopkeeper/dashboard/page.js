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

export default function ShopkeeperDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopkeeperIdCode, setShopkeeperIdCode] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [ordersList, setOrdersList] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

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
      const response = await fetch("http://localhost:5000/api/orders/shopkeeper/all", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const mappedOrders = data.map((o) => ({
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
        }));
        setOrdersList(mappedOrders);
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
      const response = await fetch(`http://localhost:5000/api/orders/${dbId}/status`, {
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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const loggedIn = localStorage.getItem("loggedInShopkeeper");
    if (!token || !loggedIn) {
      router.replace("/shopkeeper/login");
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
        if (account?.createdAt) {
          setMemberSince(account.createdAt);
        }
        fetchOrders();
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const displayedOrders =
    activeFilter === "All"
      ? ordersList
      : ordersList.filter((order) => order.status === activeFilter);

  const pendingCount = ordersList.filter((o) => o.status === "Pending").length;
  const completedCount = ordersList.filter((o) => o.status === "Completed").length;
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
      { key: 'coupon', label: t('Business network'), badge: null, href: '/shopkeeper/business-network' },
      { key: 'printsmartAi', label: t('PrintSmart AI'), badge: null, href: '/shopkeeper/printsmart-ai' },
    ];
  })();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] relative overflow-hidden">
      {/* Dynamic Purple Wave Background Decorator */}
      <div className="absolute top-0 right-0 left-0 h-[340px] bg-gradient-to-b from-violet-100/30 via-fuchsia-50/15 to-transparent -z-10 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 w-full h-full text-violet-200/20" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,218.7C672,203,768,149,864,138.7C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      <DashboardHeader shopName={shopName} />

      <div className="px-4 sm:px-6 lg:px-8 pb-28">
        <div className="mx-auto max-w-7xl space-y-6">
          <WelcomeBar shopName={shopName} shopkeeperIdCode={shopkeeperIdCode} memberSince={memberSince} />
          <StatsRow stats={dynamicStats} />
          <RecentOrders orders={displayedOrders} activeFilter={activeFilter} onStatusChange={handleStatusChange} />
        </div>
      </div>

      <BottomDock
        items={dynamicDockItems}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
    </div>
  );
}
