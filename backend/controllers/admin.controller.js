const prisma = require("../config/db");

// Get dashboard aggregate statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalShopkeepers = await prisma.shopkeeper.count();
    const totalCustomers = await prisma.user.count({
      where: { orders: { some: {} } }
    });
    const totalOrders = await prisma.order.count();
    
    const revenueAggr = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: 'COMPLETED'
      }
    });
    const revenue = revenueAggr._sum.totalAmount || 0;

    const couponsGenerated = await prisma.rewardLog.count({
      where: { rewardCategory: 'MONETARY' }
    });
    const couponsRedeemed = await prisma.rewardLog.count({
      where: { rewardCategory: 'MONETARY', scratched: true }
    });
    const scratchCardsGenerated = await prisma.rewardLog.count();

    res.json({
      totalUsers,
      totalCustomers,
      totalShopkeepers,
      totalOrders,
      revenue,
      couponsGenerated,
      couponsRedeemed,
      scratchCardsGenerated,
      // Backward compatibility
      activeShops: totalShopkeepers,
      activeCustomers: totalUsers
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

const bcrypt = require("bcryptjs");

// Create Shopkeeper
exports.createShop = async (req, res) => {
  try {
    const { email, phone, password, shopName, ownerName, upiId, address } = req.body;
    if (!email || !phone || !password || !shopName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await prisma.shopkeeper.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const x1 = Math.floor(Math.random() * 10);
    const a = alphabet[Math.floor(Math.random() * alphabet.length)];
    const x2 = Math.floor(Math.random() * 10);
    const x3 = Math.floor(Math.random() * 10);
    const x4 = Math.floor(Math.random() * 10);
    const x5 = Math.floor(Math.random() * 10);
    const shopSlug = `${x1}${a}-${x2}${x3}${x4}${x5}`;

    const newShop = await prisma.shopkeeper.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        shopName,
        ownerName: ownerName || null,
        shopSlug,
        shopkeeperIdCode: shopSlug,
        upiId: upiId || null,
        address: address || null,
        isOnboarded: true
      }
    });
    res.status(201).json(newShop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error creating shop", error: err.message });
  }
};

// Update Shopkeeper
exports.updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, shopName, ownerName, upiId, address, isOnboarded } = req.body;
    const updated = await prisma.shopkeeper.update({
      where: { id },
      data: {
        email,
        phone,
        shopName,
        ownerName: ownerName || null,
        upiId: upiId || null,
        address: address || null,
        isOnboarded: isOnboarded !== undefined ? isOnboarded : undefined
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error updating shop", error: err.message });
  }
};

// Delete Shopkeeper
exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shopkeeper.delete({ where: { id } });
    res.json({ message: "Shop deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error deleting shop" });
  }
};

// Create User (Customer)
exports.createUser = async (req, res) => {
  try {
    const { email, name, phone, language } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        language: language || "ENGLISH"
      }
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error creating user", error: err.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, phone, language } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        email,
        name: name || null,
        phone: phone || null,
        language: language || "ENGLISH"
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error updating user", error: err.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error deleting user" });
  }
};

// Get all coupons / rewards
exports.getCoupons = async (req, res) => {
  try {
    const rewards = await prisma.rewardLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: { orderId: true, customerName: true, totalAmount: true }
        }
      }
    });
    res.json(rewards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error fetching rewards" });
  }
};

// Create a Coupon / Reward
exports.createCoupon = async (req, res) => {
  try {
    const { orderId, shopId, rewardType, rewardCategory, scratched, applied, rewardMessage } = req.body;
    if (!orderId || !shopId || !rewardType) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newReward = await prisma.rewardLog.create({
      data: {
        orderId,
        shopId,
        rewardType,
        rewardCategory: rewardCategory || "NON_MONETARY",
        scratched: scratched || false,
        applied: applied || false,
        rewardMessage: rewardMessage || "",
        customerSession: Math.random().toString(36).substring(2, 11)
      }
    });
    res.status(201).json(newReward);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error creating reward card", error: err.message });
  }
};

// Update Coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { rewardType, rewardCategory, scratched, applied, rewardMessage } = req.body;
    const updated = await prisma.rewardLog.update({
      where: { id },
      data: {
        rewardType,
        rewardCategory,
        scratched: scratched !== undefined ? scratched : undefined,
        applied: applied !== undefined ? applied : undefined,
        rewardMessage
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error updating reward card", error: err.message });
  }
};

// Delete Coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.rewardLog.delete({ where: { id } });
    res.json({ message: "Reward card deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error deleting reward card" });
  }
};

// Get Platform Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    const formatted = {};
    settings.forEach(s => {
      let val = s.value;
      if (val === 'true') val = true;
      if (val === 'false') val = false;
      formatted[s.key] = val;
    });
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error loading settings" });
  }
};

// Save Platform Settings
exports.saveSettings = async (req, res) => {
  try {
    const data = req.body;
    const promises = Object.keys(data).map(key => {
      const val = typeof data[key] === 'boolean' ? String(data[key]) : String(data[key]);
      return prisma.systemSettings.upsert({
        where: { key },
        update: { value: val },
        create: { key, value: val }
      });
    });
    await Promise.all(promises);
    res.json({ message: "Settings saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error saving settings", error: err.message });
  }
};
