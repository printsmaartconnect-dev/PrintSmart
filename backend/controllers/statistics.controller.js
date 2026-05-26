const prisma = require('../config/db');

/**
 * Get shopkeeper statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const { shopkeeperId } = req.params;

    // Validate shopkeeper exists
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: shopkeeperId }
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    // Get or create statistics
    let stats = await prisma.shopkeeperStatistics.findUnique({
      where: { shopkeeperId }
    });

    if (!stats) {
      stats = await prisma.shopkeeperStatistics.create({
        data: { shopkeeperId }
      });
    }

    // Get recent orders for additional context
    const recentOrders = await prisma.order.findMany({
      where: { shopkeeperId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        printConfiguration: true,
        queue: true
      }
    });

    res.json({
      statistics: {
        daily: {
          orders: stats.todayOrders,
          earnings: stats.todayEarnings,
          bwPrints: stats.todayBWPrints,
          colorPrints: stats.todayColorPrints
        },
        weekly: {
          growth: stats.weeklyGrowth
        },
        monthly: {
          revenue: stats.monthlyRevenue,
          topPaperSize: stats.topPaperSize,
          printTypeDistribution: stats.printTypeDistribution
        },
        overall: {
          totalOrders: stats.totalOrders,
          totalCopies: stats.totalCopies,
          totalEarnings: stats.totalEarnings,
          avgOrderValue: stats.avgOrderValue
        }
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderId: order.orderId,
        customerName: order.customerName,
        amount: order.totalAmount,
        status: order.status,
        printType: order.printConfiguration?.printType,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Get daily statistics
 */
exports.getDailyStats = async (req, res) => {
  try {
    const { shopkeeperId, date } = req.params;

    // Validate shopkeeper exists
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: shopkeeperId }
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    // Parse date or use today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get orders for the day
    const orders = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        printConfiguration: true
      }
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalEarnings = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalCopies = orders.reduce((sum, order) => sum + (order.printConfiguration?.copies || 0), 0);
    
    const bwOrders = orders.filter(o => o.printConfiguration?.printType === 'BW').length;
    const colorOrders = orders.filter(o => o.printConfiguration?.printType === 'COLOR').length;

    // Group by paper size
    const paperSizeDistribution = {};
    orders.forEach(order => {
      const size = order.printConfiguration?.paperSize || 'A4';
      paperSizeDistribution[size] = (paperSizeDistribution[size] || 0) + 1;
    });

    // Group by status
    const statusDistribution = {};
    orders.forEach(order => {
      statusDistribution[order.status] = (statusDistribution[order.status] || 0) + 1;
    });

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      totalOrders,
      totalEarnings,
      totalCopies,
      bwOrders,
      colorOrders,
      colorToBlackAndWhiteRatio: bwOrders > 0 ? (colorOrders / bwOrders).toFixed(2) : 0,
      paperSizeDistribution,
      statusDistribution,
      orders: orders.map(order => ({
        id: order.id,
        orderId: order.orderId,
        customerName: order.customerName,
        amount: order.totalAmount,
        status: order.status,
        copies: order.printConfiguration?.copies,
        printType: order.printConfiguration?.printType,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching daily statistics:', error);
    res.status(500).json({
      message: 'Failed to fetch daily statistics',
      error: error.message
    });
  }
};

/**
 * Get weekly statistics
 */
exports.getWeeklyStats = async (req, res) => {
  try {
    const { shopkeeperId } = req.params;

    // Validate shopkeeper exists
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: shopkeeperId }
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    // Get orders for past 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: {
          gte: sevenDaysAgo,
          lte: now
        }
      },
      include: {
        printConfiguration: true
      }
    });

    // Group by day
    const dailyData = {};
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[day]) {
        dailyData[day] = {
          orders: 0,
          earnings: 0,
          copies: 0
        };
      }
      dailyData[day].orders += 1;
      dailyData[day].earnings += order.totalAmount || 0;
      dailyData[day].copies += order.printConfiguration?.copies || 0;
    });

    const weeklyChart = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));

    const totalWeeklyEarnings = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const prevWeekOrders = await prisma.order.count({
      where: {
        shopkeeperId,
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo
        }
      }
    });

    const growthPercentage = prevWeekOrders > 0 
      ? (((orders.length - prevWeekOrders) / prevWeekOrders) * 100).toFixed(2)
      : (orders.length > 0 ? 100 : 0);

    res.json({
      weekStart: sevenDaysAgo.toISOString().split('T')[0],
      weekEnd: now.toISOString().split('T')[0],
      totalOrders: orders.length,
      totalEarnings: totalWeeklyEarnings,
      growthPercentage,
      dailyBreakdown: weeklyChart
    });
  } catch (error) {
    console.error('Error fetching weekly statistics:', error);
    res.status(500).json({
      message: 'Failed to fetch weekly statistics',
      error: error.message
    });
  }
};

/**
 * Get monthly statistics
 */
exports.getMonthlyStats = async (req, res) => {
  try {
    const { shopkeeperId, month, year } = req.params;

    // Validate shopkeeper exists
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: shopkeeperId }
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 1);

    const orders = await prisma.order.findMany({
      where: {
        shopkeeperId,
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      },
      include: {
        printConfiguration: true
      }
    });

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCopies = orders.reduce((sum, order) => sum + (order.printConfiguration?.copies || 0), 0);

    // Paper size distribution
    const paperSizeDistribution = {};
    orders.forEach(order => {
      const size = order.printConfiguration?.paperSize || 'A4';
      paperSizeDistribution[size] = (paperSizeDistribution[size] || 0) + 1;
    });

    // Print type distribution
    const bwCount = orders.filter(o => o.printConfiguration?.printType === 'BW').length;
    const colorCount = orders.filter(o => o.printConfiguration?.printType === 'COLOR').length;

    res.json({
      month: targetMonth,
      year: targetYear,
      totalRevenue,
      totalOrders,
      totalCopies,
      avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
      topPaperSize: Object.keys(paperSizeDistribution).reduce((a, b) => 
        paperSizeDistribution[a] > paperSizeDistribution[b] ? a : b
      ) || 'A4',
      paperSizeDistribution,
      printTypeDistribution: {
        BW: bwCount,
        COLOR: colorCount
      }
    });
  } catch (error) {
    console.error('Error fetching monthly statistics:', error);
    res.status(500).json({
      message: 'Failed to fetch monthly statistics',
      error: error.message
    });
  }
};
