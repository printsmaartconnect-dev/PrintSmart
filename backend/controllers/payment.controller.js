const prisma = require("../config/db");
const socketService = require("../services/socket.service");

/**
 * Register/Submit a payment transaction reference for an order.
 * Transitions order status to ACCEPTED.
 */
exports.createPaymentLog = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionRef, paymentGateway, amount } = req.body;

    if (!transactionRef) {
      return res.status(400).json({ message: "Transaction reference is required" });
    }

    // Resolve order by database UUID (id) or custom sequential orderId
    let order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      const orders = await prisma.order.findMany({
        where: { orderId }
      });
      if (orders.length > 0) {
        order = orders[0];
      }
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if this transactionRef has been used by another order to prevent duplicate/fraud submissions
    const duplicateRef = await prisma.paymentLog.findUnique({
      where: { transactionRef }
    });

    if (duplicateRef && duplicateRef.orderId !== order.id) {
      return res.status(400).json({ message: "This transaction reference number has already been registered in the system." });
    }

    // Check if a payment log already exists for this order
    const existingLog = await prisma.paymentLog.findUnique({
      where: { orderId: order.id }
    });

    let paymentLog;
    if (existingLog) {
      // Update existing reference code and reset validation status to VERIFIED
      paymentLog = await prisma.paymentLog.update({
        where: { orderId: order.id },
        data: {
          transactionRef,
          paymentGateway: paymentGateway || "UPI",
          amount: amount !== undefined ? parseFloat(amount) : order.totalAmount,
          paymentStatus: "VERIFIED"
        }
      });
    } else {
      // Create new payment log
      paymentLog = await prisma.paymentLog.create({
        data: {
          orderId: order.id,
          transactionRef,
          paymentGateway: paymentGateway || "UPI",
          amount: amount !== undefined ? parseFloat(amount) : order.totalAmount,
          paymentStatus: "VERIFIED"
        }
      });
    }

    // Transition the order status to ACCEPTED so it enters the shopkeeper's processing list
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "ACCEPTED" }
    });

    // Update Queue status to WAITING
    await prisma.queue.updateMany({
      where: { orderId: order.id },
      data: { status: "WAITING" }
    });

    // Fetch full order for socket dispatch
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
        paymentLog: true,
        rewardLog: true
      }
    });

    socketService.emitToRoom(`shop:${order.shopkeeperId}`, "order-updated", updatedOrder);
    if (order.userId) {
      socketService.emitToRoom(`customer:${order.userId}`, "order-updated", updatedOrder);
    }
    socketService.emitToRoom("admin", "order-updated", updatedOrder);

    // Emit payment notification
    socketService.emitToRoom(`shop:${order.shopkeeperId}`, "notification-created", {
      id: `notif-pay-${Date.now()}`,
      type: "PAYMENT_RECEIVED",
      title: "Payment Verification Required",
      message: `UPI Payment reference submitted for Order #${order.orderId}. Verification pending.`,
      orderId: order.id,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({
      message: "Payment transaction reference submitted successfully",
      paymentLog
    });
  } catch (err) {
    console.error("Create payment log error:", err);
    res.status(500).json({ message: "Server error registering payment reference", error: err.message });
  }
};

/**
 * Shopkeeper approves or rejects a payment log.
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // ID of the payment log or Order database ID
    const { status } = req.body; // VERIFIED, FAILED

    if (!status || !["VERIFIED", "FAILED"].includes(status.toUpperCase())) {
      return res.status(400).json({ message: "Invalid payment status. Must be VERIFIED or FAILED" });
    }

    // Find payment log by its ID or by orderId
    let paymentLog = await prisma.paymentLog.findUnique({
      where: { id }
    });

    if (!paymentLog) {
      paymentLog = await prisma.paymentLog.findUnique({
        where: { orderId: id }
      });
    }

    if (!paymentLog) {
      return res.status(404).json({ message: "Payment log not found for the provided identifier" });
    }

    const updatedLog = await prisma.paymentLog.update({
      where: { id: paymentLog.id },
      data: { paymentStatus: status.toUpperCase() }
    });

    // Fetch full order for socket dispatch
    const order = await prisma.order.findUnique({
      where: { id: updatedLog.orderId },
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
        paymentLog: true,
        rewardLog: true
      }
    });

    if (order) {
      socketService.emitToRoom(`shop:${order.shopkeeperId}`, "order-updated", order);
      if (order.userId) {
        socketService.emitToRoom(`customer:${order.userId}`, "order-updated", order);
      }
      socketService.emitToRoom("admin", "order-updated", order);
    }

    res.status(200).json({
      message: `Payment status updated to ${status}`,
      paymentLog: updatedLog
    });
  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({ message: "Server error updating payment validation" });
  }
};

/**
 * Fetch all pending payment validations for a shopkeeper.
 */
exports.getPendingPayments = async (req, res) => {
  try {
    const shopkeeperId = req.shopkeeper.id;

    const pendingLogs = await prisma.paymentLog.findMany({
      where: {
        paymentStatus: "PENDING",
        order: {
          shopkeeperId
        }
      },
      include: {
        order: {
          select: {
            orderId: true,
            customerName: true,
            totalAmount: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(pendingLogs);
  } catch (err) {
    console.error("Fetch pending payments error:", err);
    res.status(500).json({ message: "Server error fetching pending payments" });
  }
};
