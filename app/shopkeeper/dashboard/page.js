"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isOnboardingComplete } from "../onboarding/_components/onboardingStorage";
import DashboardHeader from "./_components/DashboardHeader";
import WelcomeBar from "./_components/WelcomeBar";
import StatsRow from "./_components/StatsRow";
import RecentOrders from "./_components/RecentOrders";
import BottomDock from "./_components/BottomDock";
import { bottomDockItems, dashboardStats, recentOrders } from "./_components/mockData";

export default function ShopkeeperDashboard() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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
    } catch {
      setShopName("");
    }
  }, [router]);

  const displayedOrders =
    activeFilter === "All"
      ? recentOrders
      : recentOrders.filter((order) => order.status === activeFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader shopName={shopName} />

      <div className="px-4 sm:px-6 lg:px-8 pb-28">
        <div className="mx-auto max-w-7xl space-y-6">
          <WelcomeBar shopName={shopName} />
          <StatsRow stats={dashboardStats} />
          <RecentOrders orders={displayedOrders} activeFilter={activeFilter} />
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
