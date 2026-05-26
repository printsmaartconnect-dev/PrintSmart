"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isOnboardingComplete, syncLocalStorageFromDb } from "../onboarding/_components/onboardingStorage";
import DashboardHeader from "./_components/DashboardHeader";
import WelcomeBar from "./_components/WelcomeBar";
import StatsRow from "./_components/StatsRow";
import RecentOrders from "./_components/RecentOrders";
import BottomDock from "./_components/BottomDock";
import { bottomDockItems, dashboardStats, recentOrders } from "./_components/mockData";

export default function ShopkeeperDashboard() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [shopkeeperIdCode, setShopkeeperIdCode] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [ordersList, setOrdersList] = useState([]);

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
          variant: o.variant || "standard",
        }));
        setOrdersList(mappedOrders);
      } else {
        setOrdersList(recentOrders);
      }
    } catch (err) {
      console.warn("Failed to fetch backend orders, using mock fallback:", err);
      setOrdersList(recentOrders);
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
    const loggedIn = localStorage.getItem("loggedInShopkeeper");
    if (!loggedIn) {
      router.replace("/shopkeeper/login");
      return;
    }

    let account = null;
    try {
      account = JSON.parse(localStorage.getItem("shopkeeper") || "null");
    } catch {
      account = null;
    }

    if (account) {
      syncLocalStorageFromDb(account);
    }

    if (!isOnboardingComplete(account || undefined)) {
      router.replace("/shopkeeper/onboarding/profile-setup");
      return;
    }

    try {
      const profile = JSON.parse(localStorage.getItem("shopkeeperProfile") || "{}");
      const derivedName =
        profile.shopName ||
        (() => {
          try {
            const logged = JSON.parse(loggedIn || "{}");
            return logged.shopName || logged.name || "";
          } catch {
            return "";
          }
        })();
      setShopName(derivedName);
      setShopkeeperIdCode(profile.shopSlug || "");
    } catch {
      setShopName("");
      setShopkeeperIdCode("");
    }

    fetchOrders();
  }, [router]);

  const displayedOrders =
    activeFilter === "All"
      ? ordersList
      : ordersList.filter((order) => order.status === activeFilter);

  // Compute dynamic stats based on ordersList
  const dynamicStats = (() => {
    if (ordersList.length === 0) return dashboardStats;
    const pendingCount = ordersList.filter((o) => o.status === "Pending").length;
    const completedCount = ordersList.filter((o) => o.status === "Completed").length;
    const downloadedCount = ordersList.filter((o) => o.status === "Downloaded").length;
    const cancelledCount = ordersList.filter((o) => o.status === "Cancelled").length;

    return [
      { key: "pending", label: "Pending Orders", count: String(pendingCount), tone: "orange" },
      { key: "completed", label: "Completed Orders", count: String(completedCount), tone: "green" },
      { key: "downloaded", label: "Downloaded Files", count: String(downloadedCount), tone: "blue" },
      { key: "cancelled", label: "Cancelled Orders", count: String(cancelledCount), tone: "red" },
    ];
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader shopName={shopName} />

      <div className="px-4 sm:px-6 lg:px-8 pb-28">
        <div className="mx-auto max-w-7xl space-y-6">
          <WelcomeBar shopName={shopName} shopkeeperIdCode={shopkeeperIdCode} />
          <StatsRow stats={dynamicStats} />
          <RecentOrders orders={displayedOrders} activeFilter={activeFilter} onStatusChange={handleStatusChange} />
        </div>
      </div>

      <BottomDock
        items={bottomDockItems}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
    </div>
  );
}
