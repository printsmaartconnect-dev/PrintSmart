const prisma = require("../config/db");

/**
 * Returns S3 customer order folders eligible for deletion based on status.
 * Conditions:
 * - Order status is COMPLETED and last updated (completed) > 6 hours ago.
 * - OR Order status is CANCELLED and last updated (cancelled) > 6 hours ago.
 */
exports.getCleanupFolders = async (req, res) => {
  try {
    const cutoffTime = new Date(Date.now() - 6 * 60 * 60 * 1000); // 6 hours ago

    const eligibleOrders = await prisma.order.findMany({
      where: {
        OR: [
          {
            status: "COMPLETED",
            updatedAt: { lt: cutoffTime },
          },
          {
            status: "CANCELLED",
            updatedAt: { lt: cutoffTime },
          },
        ],
      },
      select: {
        id: true,
        orderId: true,
      },
    });

    const folders = eligibleOrders.map((order) => {
      // Replaces "/" with "_" to match the folder format saved in S3
      const safeOrderId = order.orderId.replace(/\//g, "_");
      return {
        orderId: order.id,
        orderIdCode: order.orderId,
        folder: `uploads/customer-orders/${safeOrderId}/`,
      };
    });

    return res.status(200).json(folders);
  } catch (error) {
    console.error("[Cleanup API] Error fetching cleanup folders:", error);
    return res.status(500).json({ error: "Failed to fetch cleanup folders" });
  }
};
