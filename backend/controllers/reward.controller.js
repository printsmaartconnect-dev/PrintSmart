const prisma = require("../config/db");

/**
 * Generate a random reward for a given order and shop
 */
const generateReward = async (orderId, shopId) => {
  // Check if reward already exists
  const existingReward = await prisma.rewardLog.findUnique({
    where: { orderId }
  });
  if (existingReward) return existingReward;

  const rand = Math.random() * 100;
  let rewardType = 'DID_YOU_KNOW';
  let rewardCategory = 'NON_MONETARY';
  let rewardMessage = '';

  if (rand < 1.0) {
    rewardType = 'FREE_PRINT';
    rewardCategory = 'MONETARY';
    rewardMessage = '🎉 Congratulations! You won 1 Free Black & White print page!';
  } else if (rand < 6.0) {
    rewardType = 'DISCOUNT_50';
    rewardCategory = 'MONETARY';
    rewardMessage = '🎉 Superb! You got a 50% discount on 1 Black & White print page!';
  } else if (rand < 46.0) {
    rewardType = 'ASTROLOGY';
    rewardCategory = 'NON_MONETARY';
    const astrologyMessages = [
      "🌟 Your lucky stars indicate a productive day ahead!",
      "🌙 Tonight holds creative energy for you. Write down your ideas!",
      "🪐 Saturn stands for discipline. Today is a great day to complete your pending work.",
      "☀️ Focus your energy like a solar beam, success is near!",
      "🌌 Keep printing your dreams, the cosmos aligns in your favor!"
    ];
    rewardMessage = astrologyMessages[Math.floor(Math.random() * astrologyMessages.length)];
  } else {
    rewardType = 'DID_YOU_KNOW';
    rewardCategory = 'NON_MONETARY';
    const facts = [
      "💡 Did you know? The first printed book, the Diamond Sutra, dates back to 868 AD!",
      "💡 Did you know? Gutenberg invented the movable type printing press around 1440.",
      "💡 Did you know? Printing in CMYK uses Cyan, Magenta, Yellow, and Key (Black) inks.",
      "💡 Did you know? The largest printed book in the world is 5 meters wide!",
      "💡 Did you know? 3D printing was invented in 1983 by Chuck Hull."
    ];
    rewardMessage = facts[Math.floor(Math.random() * facts.length)];
  }

  return await prisma.rewardLog.create({
    data: {
      orderId,
      shopId,
      rewardType,
      rewardCategory,
      scratched: false,
      applied: false,
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

  if (!reward && order.status === "COMPLETED") {
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
        rewardType: "DISCOUNT_50",
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
