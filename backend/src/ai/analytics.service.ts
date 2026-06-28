import prisma from "../../config/db";

export class AnalyticsService {
  /**
   * Helper to get start and end dates for time periods
   */
  private static getPeriods() {
    const now = new Date();
    
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(startOfToday);
    endOfYesterday.setMilliseconds(-1);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(startOfMonth.getDate() - 30);

    return {
      now,
      startOfToday,
      endOfToday,
      startOfYesterday,
      endOfYesterday,
      startOfWeek,
      startOfLastWeek,
      startOfMonth
    };
  }

  /**
   * Calculate all metrics for a shopkeeper
   */
  static async getBusinessMetrics(shopkeeperId: string) {
    const periods = this.getPeriods();

    // 1. Revenue queries
    const todayOrders = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: { gte: periods.startOfToday, lte: periods.endOfToday },
        status: { in: ["COMPLETED", "DOWNLOADED"] }
      },
      select: { totalAmount: true }
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const yesterdayOrders = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: { gte: periods.startOfYesterday, lte: periods.endOfYesterday },
        status: { in: ["COMPLETED", "DOWNLOADED"] }
      },
      select: { totalAmount: true }
    });
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const weeklyOrders = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: { gte: periods.startOfWeek },
        status: { in: ["COMPLETED", "DOWNLOADED"] }
      },
      select: { totalAmount: true }
    });
    const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const monthlyOrders = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: { gte: periods.startOfMonth },
        status: { in: ["COMPLETED", "DOWNLOADED"] }
      },
      select: { totalAmount: true, price: true }
    });
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Pending and Cancelled Orders
    const pendingOrdersCount = await prisma.order.count({
      where: {
        shopkeeperId,
        status: "PENDING"
      }
    });

    const cancelledOrdersCount = await prisma.order.count({
      where: {
        shopkeeperId,
        status: "CANCELLED",
        createdAt: { gte: periods.startOfWeek }
      }
    });

    // 3. Average Order Value (AOV) for Completed Orders (last 30 days)
    const completedMonthlyOrders = monthlyOrders.filter(o => o.totalAmount > 0);
    const avgOrderValue = completedMonthlyOrders.length > 0
      ? monthlyRevenue / completedMonthlyOrders.length
      : 0;

    // 4. Order Growth (Weekly comparison)
    const lastWeekOrdersCount = await prisma.order.count({
      where: {
        shopkeeperId,
        createdAt: { gte: periods.startOfLastWeek, lt: periods.startOfWeek },
        status: { in: ["COMPLETED", "DOWNLOADED"] }
      }
    });
    const thisWeekOrdersCount = weeklyOrders.length;
    let orderGrowth = 0;
    if (lastWeekOrdersCount > 0) {
      orderGrowth = ((thisWeekOrdersCount - lastWeekOrdersCount) / lastWeekOrdersCount) * 100;
    } else if (thisWeekOrdersCount > 0) {
      orderGrowth = 100.0;
    }

    // 5. Top Customers (last 30 days)
    const allMonthlyOrdersWithUsers = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: { gte: periods.startOfMonth },
        status: { in: ["COMPLETED", "DOWNLOADED"] }
      },
      select: {
        customerName: true,
        totalAmount: true,
        phone: true
      }
    });

    const customerSpendMap: Record<string, { spend: number; count: number; phone: string }> = {};
    allMonthlyOrdersWithUsers.forEach(o => {
      const name = o.customerName || "Anonymous";
      if (!customerSpendMap[name]) {
        customerSpendMap[name] = { spend: 0, count: 0, phone: o.phone || "" };
      }
      customerSpendMap[name].spend += o.totalAmount;
      customerSpendMap[name].count += 1;
    });

    const topCustomers = Object.entries(customerSpendMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    // 6. Top Services & Paper configurations (last 30 days)
    const configs = await prisma.printConfiguration.findMany({
      where: {
        order: {
          shopkeeperId,
          createdAt: { gte: periods.startOfMonth },
          status: { in: ["COMPLETED", "DOWNLOADED"] }
        }
      },
      select: {
        printType: true,
        paperSize: true,
        copies: true
      }
    });

    let bwCount = 0;
    let colorCount = 0;
    const paperUsageMap: Record<string, number> = {};

    configs.forEach(c => {
      const copies = c.copies || 1;
      if (c.printType === "COLOR") {
        colorCount += copies;
      } else {
        bwCount += copies;
      }

      const pSize = String(c.paperSize || "A4");
      paperUsageMap[pSize] = (paperUsageMap[pSize] || 0) + copies;
    });

    const totalPrints = bwCount + colorCount;
    const colorPrintPercentage = totalPrints > 0 ? (colorCount / totalPrints) * 100 : 0;

    const topServices = [
      { name: "Black & White Prints", count: bwCount, revenue: bwCount * 2 }, // estimated
      { name: "Color Prints", count: colorCount, revenue: colorCount * 10 }  // estimated
    ].sort((a, b) => b.count - a.count);

    // 7. Peak Hours (last 30 days)
    const ordersForHours = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: { gte: periods.startOfMonth }
      },
      select: { createdAt: true }
    });

    const hoursMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hoursMap[i] = 0;

    ordersForHours.forEach(o => {
      const hour = new Date(o.createdAt).getHours();
      hoursMap[hour] = (hoursMap[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hoursMap)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 8. Printer Usage
    const printerStats = await prisma.printerStatistics.findMany({
      where: { shopkeeperId }
    });

    const totalPagesPrintedWeekly = await prisma.printConfiguration.aggregate({
      where: {
        order: {
          shopkeeperId,
          createdAt: { gte: periods.startOfWeek }
        }
      },
      _sum: { copies: true }
    });

    // 9. Inventory Status
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { shopkeeperId }
    });

    return {
      todayRevenue,
      yesterdayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      topCustomers,
      topServices,
      peakHours,
      avgOrderValue,
      orderGrowth,
      pendingOrdersCount,
      cancelledOrdersCount,
      printerStats: printerStats.map(p => ({
        id: p.id,
        printerName: p.printerName,
        pagesPrinted: p.pagesPrinted,
        inkLevel: p.inkLevel,
        status: p.status
      })),
      inventoryStatus: inventoryItems.map(item => ({
        id: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        minThreshold: item.minThreshold,
        status: item.quantity <= item.minThreshold ? "LOW" : "OK"
      })),
      paperUsage: Object.entries(paperUsageMap).map(([size, quantity]) => ({ size, quantity })),
      colorPrintPercentage,
      totalWeeklyPages: totalPagesPrintedWeekly._sum.copies || 0
    };
  }
}
