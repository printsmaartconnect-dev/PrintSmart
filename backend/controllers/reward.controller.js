const prisma = require("../config/db");

/**
 * Generate a random reward for a given order and shop
 */
const generateReward = async (orderId, shopId, forceRewardType = null, forceRewardMessage = null) => {
  // Check if reward already exists
  const existingReward = await prisma.rewardLog.findUnique({
    where: { orderId }
  });
  if (existingReward) return existingReward;

  let rewardType = forceRewardType;
  let rewardMessage = forceRewardMessage;
  let rewardCategory = 'NON_MONETARY';

  // If not pre-determined, roll for a non-monetary card (50/50 split)
  if (!rewardType) {
    const rand = Math.random();
    if (rand < 0.5) {
      rewardType = 'DID_YOU_KNOW';
    } else {
      rewardType = 'ASTROLOGY';
    }
  }

  if (rewardType === 'FREE_PRINT' || rewardType === 'HALF_PRICE_COLOR') {
    rewardCategory = 'MONETARY';
  } else {
    rewardCategory = 'NON_MONETARY';
  }

  // Load from CSV cache if not already populated
  if (!rewardMessage) {
    const csvService = require("../services/csv.service");
    if (rewardType === 'DID_YOU_KNOW') {
      const record = csvService.getRandomDidYouKnow();
      rewardMessage = record ? JSON.stringify(record) : "Did you know? Facts are interesting!";
    } else if (rewardType === 'ASTROLOGY') {
      const record = csvService.getRandomAstrology();
      rewardMessage = record ? JSON.stringify(record) : "Astrology: Cosmic alignments look positive!";
    } else if (rewardType === 'FREE_PRINT') {
      rewardMessage = "Congratulations! Your current black & white print order is FREE.";
    } else if (rewardType === 'HALF_PRICE_COLOR') {
      rewardMessage = "Congratulations! 50% OFF has been applied to your current color print order.";
    }
  }

  return await prisma.rewardLog.create({
    data: {
      orderId,
      shopId,
      rewardType,
      rewardCategory,
      scratched: false,
      applied: rewardCategory === 'MONETARY' ? true : false,
      rewardMessage,
      customerSession: Math.random().toString(36).substring(2, 11)
    }
  });
};

/**
 * Fetch or generate reward log for an order
 */
exports.getRewardByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      // Try human-readable orderId
      const orders = await prisma.order.findMany({
        where: { orderId }
      });
      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      const reward = await exports.resolveOrCreateReward(orders[0]);
      return res.status(200).json(reward);
    }

    const reward = await exports.resolveOrCreateReward(order);
    return res.status(200).json(reward);
  } catch (error) {
    console.error("Error fetching reward by order:", error);
    return res.status(500).json({ message: "Server error retrieving reward", error: error.message });
  }
};

exports.resolveOrCreateReward = async (order) => {
  let reward = await prisma.rewardLog.findUnique({
    where: { orderId: order.id }
  });

  if (!reward && (order.status === "COMPLETED" || order.status === "DOWNLOADED")) {
    reward = await generateReward(order.id, order.shopkeeperId);
  }

  return reward;
};

/**
 * Scratch / claim reward
 */
exports.scratchReward = async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await prisma.rewardLog.findUnique({
      where: { id }
    });

    if (!reward) {
      return res.status(404).json({ message: "Reward card not found" });
    }

    if (reward.scratched) {
      return res.status(200).json(reward); // already scratched
    }

    const isMonetary = reward.rewardCategory === "MONETARY";

    const updatedReward = await prisma.rewardLog.update({
      where: { id },
      data: {
        scratched: true,
        applied: isMonetary ? true : false
      }
    });

    return res.status(200).json(updatedReward);
  } catch (error) {
    console.error("Error scratching reward:", error);
    return res.status(500).json({ message: "Server error scratching reward", error: error.message });
  }
};

/**
 * Admin Stats
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalScratched = await prisma.rewardLog.count({
      where: { scratched: true }
    });

    const monetaryUsed = await prisma.rewardLog.count({
      where: { scratched: true, rewardCategory: "MONETARY" }
    });

    const nonMonetaryViewed = await prisma.rewardLog.count({
      where: { scratched: true, rewardCategory: "NON_MONETARY" }
    });

    const totalGenerated = await prisma.rewardLog.count();

    const scratchRate = totalGenerated > 0 ? Math.round((totalScratched / totalGenerated) * 100) : 0;

    return res.status(200).json({
      totalScratches: totalScratched,
      monetaryRewardsUsed: monetaryUsed,
      nonMonetaryRewardsViewed: nonMonetaryViewed,
      scratchRate: `${scratchRate}%`,
      totalCardsGenerated: totalGenerated
    });
  } catch (error) {
    console.error("Error fetching admin reward stats:", error);
    return res.status(500).json({ message: "Server error fetching reward analytics" });
  }
};

/**
 * Shopkeeper Stats
 */
exports.getShopkeeperStats = async (req, res) => {
  try {
    const shopkeeperId = req.shopkeeper.id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const generatedToday = await prisma.rewardLog.count({
      where: {
        shopId: shopkeeperId,
        createdAt: { gte: startOfToday }
      }
    });

    const freePrintsUsed = await prisma.rewardLog.count({
      where: {
        shopId: shopkeeperId,
        rewardType: "FREE_PRINT",
        scratched: true
      }
    });

    const discountRewardsUsed = await prisma.rewardLog.count({
      where: {
        shopId: shopkeeperId,
        rewardType: "HALF_PRICE_COLOR",
        scratched: true
      }
    });

    const totalScratched = await prisma.rewardLog.count({
      where: { shopId: shopkeeperId, scratched: true }
    });

    const totalGenerated = await prisma.rewardLog.count({
      where: { shopId: shopkeeperId }
    });

    const engagementLevel = totalGenerated > 0 
      ? (totalScratched / totalGenerated > 0.7 ? "High" : (totalScratched / totalGenerated > 0.4 ? "Medium" : "Low"))
      : "No Activity";

    return res.status(200).json({
      rewardsGeneratedToday: generatedToday,
      freePrintRewardsUsed: freePrintsUsed,
      discountRewardsUsed: discountRewardsUsed,
      customerEngagementLevel: engagementLevel,
      totalScratched,
      totalGenerated
    });
  } catch (error) {
    console.error("Error fetching shopkeeper reward stats:", error);
    return res.status(500).json({ message: "Server error fetching reward statistics" });
  }
};

exports.generateReward = generateReward;
