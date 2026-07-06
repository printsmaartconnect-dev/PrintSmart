const prisma = require("../config/db");

// Get dashboard aggregate statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const activeShops = await prisma.shopkeeper.count({
      where: { isOnboarded: true },
    });
    const activeCustomers = await prisma.user.count();
    
    const revenueAggr = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: { in: ['COMPLETED', 'ACCEPTED', 'PRINTING'] }
      }
    });
    const revenue = revenueAggr._sum.totalAmount || 0;

    res.json({
      totalOrders,
      activeShops,
      revenue,
      activeCustomers,
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get recent platform orders
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        shopkeeper: {
          select: { shopName: true }
        }
      }
    });
    res.json(orders);
  } catch (err) {
    console.error("Admin orders error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error("Admin getUsers error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all shops (shopkeepers)
exports.getShops = async (req, res) => {
  try {
    const shops = await prisma.shopkeeper.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        shopName: true,
        ownerName: true,
        phone: true,
        isOnboarded: true,
        totalOrders: true,
        totalEarnings: true,
        createdAt: true,
      }
    });
    res.json(shops);
  } catch (err) {
    console.error("Admin getShops error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle Shopkeeper onboarding status
exports.toggleShopOnboard = async (req, res) => {
  const { id } = req.params;
  try {
    const shop = await prisma.shopkeeper.findUnique({
      where: { id },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const updatedShop = await prisma.shopkeeper.update({
      where: { id },
      data: {
        isOnboarded: !shop.isOnboarded,
      },
    });

    res.json({ message: "Shop onboarding status updated successfully", shop: updatedShop });
  } catch (err) {
    console.error("Admin toggleShopOnboard error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get platform analytics
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Order Status distribution
    const statusDistribution = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // 2. Service/Print Type distribution (BW vs COLOR)
    const printTypeDistribution = await prisma.printConfiguration.groupBy({
      by: ['printType'],
      _count: {
        id: true
      }
    });

    // 3. Daily trends (orders and revenue for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true,
        totalAmount: true,
        status: true,
      }
    });

    // Process daily trends in JS (Prisma doesn't support easy SQLite/PostgreSQL date grouping natively without raw queries)
    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyData[dateStr] = { date: dateStr, count: 0, revenue: 0 };
    }

    orders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyData[dateStr]) {
        dailyData[dateStr].count += 1;
        if (['COMPLETED', 'ACCEPTED', 'PRINTING'].includes(o.status)) {
          dailyData[dateStr].revenue += o.totalAmount;
        }
      }
    });

    const dailyTrends = Object.values(dailyData);

    res.json({
      statusDistribution,
      printTypeDistribution,
      dailyTrends
    });
  } catch (err) {
    console.error("Admin getAnalytics error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get platform settings
exports.getSettings = async (req, res) => {
  try {
    const settingsList = await prisma.systemSettings.findMany();
    const settingsMap = {};
    settingsList.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    res.json({
      maintenanceMode: settingsMap.maintenanceMode === 'true',
      autoApproveShops: settingsMap.autoApproveShops !== 'false',
      platformTaxRate: settingsMap.platformTaxRate || '5',
      allowedFileFormats: settingsMap.allowedFileFormats || '.pdf,.png,.jpg'
    });
  } catch (err) {
    console.error("Admin getSettings error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update platform settings
exports.updateSettings = async (req, res) => {
  try {
    const { maintenanceMode, autoApproveShops, platformTaxRate, allowedFileFormats } = req.body;
    const data = {
      maintenanceMode: String(maintenanceMode),
      autoApproveShops: String(autoApproveShops),
      platformTaxRate: String(platformTaxRate),
      allowedFileFormats: String(allowedFileFormats)
    };

    for (const [key, value] of Object.entries(data)) {
      await prisma.systemSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }

    res.json({ message: "Settings saved successfully" });
  } catch (err) {
    console.error("Admin updateSettings error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get coupons & scratch cards telemetry
exports.getCoupons = async (req, res) => {
  try {
    const scratchCardsCount = await prisma.rewardLog.count();

    const discountAggr = await prisma.order.aggregate({
      _sum: {
        discount: true
      },
      where: {
        discount: { gt: 0 }
      }
    });
    const rewardsDistributed = discountAggr._sum.discount || 0;

    // Group by date for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const rewardLogs = await prisma.rewardLog.findMany({
      where: {
        applied: true,
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true }
    });

    const couponUsageTrendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      couponUsageTrendMap[dateStr] = 0;
    }
    rewardLogs.forEach(r => {
      const dateStr = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (couponUsageTrendMap[dateStr] !== undefined) {
        couponUsageTrendMap[dateStr] += 1;
      }
    });
    const couponUsageTrend = Object.entries(couponUsageTrendMap).map(([date, usage]) => ({ date, usage }));

    // Shopwise coupons used
    const appliedRewardsWithShops = await prisma.rewardLog.findMany({
      where: { applied: true },
      include: {
        order: {
          include: {
            shopkeeper: {
              select: { shopName: true }
            }
          }
        }
      }
    });

    const shopMap = {};
    appliedRewardsWithShops.forEach(r => {
      const shopName = r.order?.shopkeeper?.shopName || 'Unknown Shop';
      const discount = r.order?.discount || 0;
      if (!shopMap[shopName]) {
        shopMap[shopName] = { shopName, couponsUsed: 0, discountAmount: 0 };
      }
      shopMap[shopName].couponsUsed += 1;
      shopMap[shopName].discountAmount += discount;
    });
    const shopWiseCoupons = Object.values(shopMap)
      .sort((a, b) => b.discountAmount - a.discountAmount)
      .slice(0, 5);

    res.json({
      scratchCardsCount,
      rewardsDistributed,
      couponUsageTrend,
      shopWiseCoupons
    });
  } catch (err) {
    console.error("Admin getCoupons error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get feedback / support tickets
exports.getTickets = async (req, res) => {
  try {
    const ticketsList = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    const openTickets = await prisma.feedback.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
    });
    const closedTickets = await prisma.feedback.count({
      where: { status: 'RESOLVED' }
    });

    const tickets = ticketsList.map(t => {
      const diffMs = Date.now() - new Date(t.createdAt).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      let timeStr = `${diffHrs} hours ago`;
      if (diffHrs === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        timeStr = `${diffMins} mins ago`;
      } else if (diffHrs >= 24) {
        const diffDays = Math.floor(diffHrs / 24);
        timeStr = `${diffDays} days ago`;
      }

      return {
        id: `TKT-${t.id.slice(0, 4).toUpperCase()}`,
        realId: t.id,
        customer: t.user?.name || 'Anonymous User',
        subject: t.subject || 'Platform Feedback',
        message: t.message,
        shop: 'Platform General',
        priority: t.rating && t.rating <= 2 ? 'High' : (t.rating === 3 ? 'Medium' : 'Low'),
        status: t.status === 'RESOLVED' ? 'Closed' : 'Open',
        time: timeStr
      };
    });

    res.json({
      openTickets,
      closedTickets,
      tickets
    });
  } catch (err) {
    console.error("Admin getTickets error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle ticket status
exports.updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const dbStatus = status === 'Closed' ? 'RESOLVED' : 'OPEN';
    const ticket = await prisma.feedback.update({
      where: { id },
      data: { status: dbStatus }
    });
    res.json({ message: "Ticket status updated successfully", ticket });
  } catch (err) {
    console.error("Admin updateTicketStatus error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get AI usage logs telemetry
exports.getAIUsage = async (req, res) => {
  try {
    const postersAggr = await prisma.aIUsage.aggregate({
      _sum: { generationCount: true },
      where: { featureType: { in: ['POSTER', 'GENERATE'] } }
    });
    const suggestAggr = await prisma.aIUsage.aggregate({
      _sum: { generationCount: true },
      where: { featureType: 'SUGGEST_PROMPT' }
    });
    const regenAggr = await prisma.aIUsage.aggregate({
      _sum: { generationCount: true },
      where: { featureType: 'REGENERATE' }
    });

    const posterMaker = postersAggr._sum.generationCount || 0;
    const bgRemover = suggestAggr._sum.generationCount || 0;
    const bannerMaker = regenAggr._sum.generationCount || 0;
    const failedJobs = 0;

    const recentAssets = await prisma.aIAsset.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        shopkeeper: {
          select: { shopName: true }
        }
      }
    });

    const recentGenerations = recentAssets.map(asset => {
      const diffMs = Date.now() - new Date(asset.createdAt).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      let timeStr = `${diffHrs} hours ago`;
      if (diffHrs === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        timeStr = `${diffMins} mins ago`;
      } else if (diffHrs >= 24) {
        const diffDays = Math.floor(diffHrs / 24);
        timeStr = `${diffDays} days ago`;
      }

      return {
        id: `GEN-${asset.id.slice(0, 3).toUpperCase()}`,
        tool: asset.type || 'AI Poster Maker',
        shop: asset.shopkeeper?.shopName || 'Unknown Shop',
        time: timeStr,
        status: 'Success'
      };
    });

    res.json({
      posterMaker,
      bgRemover,
      bannerMaker,
      failedJobs,
      recentGenerations
    });
  } catch (err) {
    console.error("Admin getAIUsage error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};
