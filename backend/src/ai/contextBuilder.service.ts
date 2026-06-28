import { AnalyticsService } from "./analytics.service";
import fs from "fs";
import path from "path";

export interface BusinessContext {
  shopkeeperId: string;
  revenue: {
    today: number;
    yesterday: number;
    weekly: number;
    monthly: number;
    growth: number;
    averageOrderValue: number;
  };
  orders: {
    pending: number;
    cancelledWeekly: number;
  };
  inventoryStatus: Array<{
    itemName: string;
    quantity: number;
    unit: string;
    status: string;
  }>;
  printerStatus: Array<{
    printerName: string;
    pagesPrinted: number;
    inkLevel: number;
    status: string;
  }>;
  topServices: Array<{
    name: string;
    count: number;
  }>;
  paperUsage: Array<{
    size: string;
    quantity: number;
  }>;
  topCustomers: Array<{
    name: string;
    spend: number;
    count: number;
    phone: string;
  }>;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  colorPrintPercentage: number;
  businessHealthScore: number;
}

export class ContextBuilderService {
  private static loadBusinessRules() {
    try {
      const filePath = path.resolve(__dirname, "../../knowledge/business_rules.json");
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")).rules || [];
      }
    } catch (err) {
      console.error("Failed to load business rules:", err);
    }
    return [];
  }

  static async buildContext(shopkeeperId: string): Promise<BusinessContext> {
    // 1. Gather raw calculated analytics
    const rawMetrics = await AnalyticsService.getBusinessMetrics(shopkeeperId);

    // 2. Compute Health Score
    let healthScore = 100;
    const rules = this.loadBusinessRules();

    // Check backlog
    const backlogRule = rules.find((r: any) => r.id === "BR-01");
    if (backlogRule && rawMetrics.pendingOrdersCount > backlogRule.value) {
      healthScore -= backlogRule.penalty || 10;
    }

    // Check cancellation rate
    // Calculate cancellation rate as: weekly cancellations / weekly total orders (min 1 order)
    const weeklyTotalOrders = rawMetrics.totalWeeklyPages > 0 ? rawMetrics.totalWeeklyPages / 5 : 5; // fallback
    const cancellationRate = rawMetrics.cancelledOrdersCount / Math.max(weeklyTotalOrders, 1);
    const cancelRule = rules.find((r: any) => r.id === "BR-02");
    if (cancelRule && cancellationRate > cancelRule.value) {
      healthScore -= cancelRule.penalty || 15;
    }

    // Check AOV
    const aovRule = rules.find((r: any) => r.id === "BR-03");
    if (aovRule && rawMetrics.avgOrderValue < aovRule.value && rawMetrics.avgOrderValue > 0) {
      healthScore -= 5; // AOV margin deduction
    }

    // Check low stock count
    const lowStockCount = rawMetrics.inventoryStatus.filter(i => i.status === "LOW").length;
    if (lowStockCount > 0) {
      healthScore -= Math.min(lowStockCount * 4, 20); // deduct 4 points per low stock item, cap at 20
    }

    // Floor at 10, ceil at 100
    healthScore = Math.max(10, Math.min(100, healthScore));

    return {
      shopkeeperId,
      revenue: {
        today: rawMetrics.todayRevenue,
        yesterday: rawMetrics.yesterdayRevenue,
        weekly: rawMetrics.weeklyRevenue,
        monthly: rawMetrics.monthlyRevenue,
        growth: rawMetrics.orderGrowth,
        averageOrderValue: rawMetrics.avgOrderValue
      },
      orders: {
        pending: rawMetrics.pendingOrdersCount,
        cancelledWeekly: rawMetrics.cancelledOrdersCount
      },
      inventoryStatus: rawMetrics.inventoryStatus.map(i => ({
        itemName: i.itemName,
        quantity: i.quantity,
        unit: i.unit,
        status: i.status
      })),
      printerStatus: rawMetrics.printerStats.map(p => ({
        printerName: p.printerName,
        pagesPrinted: p.pagesPrinted,
        inkLevel: p.inkLevel,
        status: p.status
      })),
      topServices: rawMetrics.topServices.map(s => ({
        name: s.name,
        count: s.count
      })),
      topCustomers: rawMetrics.topCustomers.map(c => ({
        name: c.name,
        spend: c.spend,
        count: c.count,
        phone: c.phone
      })),
      peakHours: rawMetrics.peakHours,
      paperUsage: rawMetrics.paperUsage,
      colorPrintPercentage: rawMetrics.colorPrintPercentage,
      businessHealthScore: healthScore
    };
  }
}
