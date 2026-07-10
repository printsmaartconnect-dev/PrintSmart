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

/**
 * Marks specified orders as cleaned in S3, setting storageStatus = "CLEANED"
 * and filesDeleted = true. Broadcasts changes via Socket.IO.
 */
exports.markCleaned = async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ error: "orderIds array is required" });
    }

    const updatedOrders = [];
    for (const id of orderIds) {
      try {
        const orderExists = await prisma.order.findUnique({ where: { id } });
        if (!orderExists) continue;

        const updatedOrder = await prisma.order.update({
          where: { id },
          data: {
            storageStatus: "CLEANED",
            filesDeleted: true,
            cleanedAt: new Date(),
          },
          include: {
            printConfiguration: true,
            orderFiles: true,
            queue: true,
            invoice: true,
            paymentLog: true,
            rewardLog: true,
          },
        });

        updatedOrders.push(updatedOrder);

        // Broadcast to clients via Socket.IO
        const orderController = require("./order.controller");
        const formattedOrder = orderController.formatOrderResponse(updatedOrder);

        const socketService = require("../services/socket.service");
        // Shopkeeper room notification
        socketService.emitToRoom(`shop:${updatedOrder.shopkeeperId}`, "storage_cleaned", {
          orderId: updatedOrder.id,
          orderIdCode: updatedOrder.orderId,
          order: formattedOrder,
        });

        // Customer room notification
        if (updatedOrder.userId) {
          socketService.emitToRoom(`customer:${updatedOrder.userId}`, "storage_cleaned", {
            orderId: updatedOrder.id,
            orderIdCode: updatedOrder.orderId,
            order: formattedOrder,
          });
        }

        // Admin room notification
        socketService.emitToRoom("admin", "storage_cleaned", {
          orderId: updatedOrder.id,
          orderIdCode: updatedOrder.orderId,
          order: formattedOrder,
        });
      } catch (err) {
        console.error(`[Cleanup API] Failed to mark order ${id} as cleaned:`, err.message);
      }
    }

    return res.status(200).json({
      message: "Successfully marked orders as cleaned",
      count: updatedOrders.length,
    });
  } catch (error) {
    console.error("[Cleanup API] Error updating cleanup status:", error);
    return res.status(500).json({ error: "Failed to update cleanup status" });
  }
};
