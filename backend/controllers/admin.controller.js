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
