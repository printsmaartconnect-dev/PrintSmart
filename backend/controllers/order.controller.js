const prisma = require("../config/db");
const orderService = require("../services/order.service");
const invoiceService = require("../services/invoice.service");

// Create one or more orders (per configured item)
exports.createOrder = async (req, res) => {
  try {
    const { userId, shopkeeperId, customerName, phone, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order items data" });
    }

    // Resolve shopkeeper
    let targetShopkeeperId = shopkeeperId;
    if (!targetShopkeeperId) {
      const defaultShop = await prisma.shopkeeper.findFirst();
      if (!defaultShop) {
        return res.status(400).json({ message: "No shopkeepers registered in the system yet" });
      }
      targetShopkeeperId = defaultShop.id;
    }

    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: targetShopkeeperId },
    });

    if (!shopkeeper) {
      return res.status(404).json({ message: "Shopkeeper not found" });
    }

    const createdOrders = [];

    // Process each configured file as its own Order
    for (const item of items) {
      const { fileName, fileUrl, price, variant, config, fileSize } = item;

      // 1. Determine print type for custom Order ID (default to BW)
      const configPrintType = config?.printType?.toUpperCase() === "COLOR" ? "COLOR" : "BW";
      
      // 2. Generate Custom Sequential Order ID on the backend
      const customOrderId = await orderService.generateCustomOrderId(configPrintType);

      // 3. Calculate wait time
      const estimatedTime = await orderService.calculateEstimatedTime(targetShopkeeperId, config);

      // 4. Calculate pricing breakdown (tax, discount, subtotal)
      const totalAmt = parseFloat(price) || 0.0;
      const taxRate = 0.18; // 18% GST
      const subtotalAmt = totalAmt / (1 + taxRate);
      const taxAmt = totalAmt - subtotalAmt;

      // 5. Create Order
      const order = await prisma.order.create({
        data: {
          orderId: customOrderId,
          userId: userId || null,
          shopkeeperId: targetShopkeeperId,
          customerName: customerName || "Anonymous",
          phone: phone || null,
          price: totalAmt,
          subtotal: subtotalAmt,
          tax: taxAmt,
          discount: 0,
          totalAmount: totalAmt,
          status: "PENDING",
          estimatedTime,
        },
      });

      // 6. Create PrintConfiguration linked to Order
      const printConfig = await prisma.printConfiguration.create({
        data: {
          orderId: order.id,
          printType: configPrintType,
          copies: config?.copies ? parseInt(config.copies) : 1,
          paperSize: (config?.paperSize || "A4").toUpperCase(),
          sides: config?.sides?.toUpperCase() === "DOUBLE" ? "DOUBLE" : "SINGLE",
          orientation: config?.orientation?.toUpperCase() === "LANDSCAPE" ? "LANDSCAPE" : "PORTRAIT",
          quality: config?.quality?.toUpperCase() || "NORMAL",
          pageRange: config?.pageRange || "all",
        },
      });

      // 7. Create OrderFile linked to Order
      const orderFile = await prisma.orderFile.create({
        data: {
          orderId: order.id,
          originalFileName: fileName || "Untitled Document",
          customFileName: fileName || "Untitled Document",
          fileUrl: fileUrl || "",
          fileSize: fileSize || 0,
          thumbnailUrl: fileUrl || null,
        },
      });

      // 8. Queue handling: find next position
      const maxQueue = await prisma.queue.findFirst({
        where: {
          order: { shopkeeperId: targetShopkeeperId },
          status: { not: "DONE" },
        },
        orderBy: { position: "desc" },
      });
      const nextPosition = maxQueue ? maxQueue.position + 1 : 1;

      await prisma.queue.create({
        data: {
          orderId: order.id,
          position: nextPosition,
          status: "WAITING",
          estimatedWaitTime: estimatedTime,
        },
      });

      // 9. Invoice PDF Generation
      try {
        const invoiceData = {
          orderId: customOrderId,
          customerName: customerName || "Anonymous",
          phone: phone || "N/A",
          shopName: shopkeeper.shopName,
          shopAddress: shopkeeper.address,
          shopPhone: shopkeeper.phone,
          files: [orderFile],
          printConfig,
          subtotal: subtotalAmt,
          tax: taxAmt,
          discount: 0,
          totalAmount: totalAmt,
          createdAt: order.createdAt,
        };

        const invoiceResult = await invoiceService.generateInvoicePDF(invoiceData);

        // Save invoice in DB
        await prisma.invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber: invoiceResult.invoiceNumber,
            pdfUrl: invoiceResult.pdfUrl,
            subtotal: subtotalAmt,
            tax: taxAmt,
            discount: 0,
            totalAmount: totalAmt,
          },
        });
      } catch (invErr) {
        console.error("Failed to generate invoice during order placement:", invErr);
      }

      // 10. Update stats (Daily, earnings, overall)
      await orderService.updateShopkeeperStats(targetShopkeeperId, {
        totalAmount: totalAmt,
        printConfig,
        quantity: printConfig.copies,
      });

      // Fetch complete populated order
      const completedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          printConfiguration: true,
          orderFiles: true,
          queue: true,
          invoice: true,
        },
      });

      createdOrders.push(completedOrder);
    }

    res.status(201).json({
      message: "Order(s) created successfully",
      orders: createdOrders,
    });
  } catch (err) {
    console.error("Create order controller error:", err);
    res.status(500).json({ message: "Server error placing order", error: err.message });
  }
};

// Fetch order history for a customer
exports.getCustomerOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
        shopkeeper: {
          select: {
            shopName: true,
            address: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get customer orders error:", err);
    res.status(500).json({ message: "Server error fetching customer orders", error: err.message });
  }
};

// Fetch orders for a shopkeeper (optionally filtered by status)
exports.getShopkeeperOrders = async (req, res) => {
  try {
    const shopkeeperId = req.shopkeeper.id;
    const { status } = req.query;

    const whereCondition = {
      shopkeeperId,
    };

    if (status && status !== "All") {
      whereCondition.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (err) {
    console.error("Fetch shopkeeper orders error:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// Update order status (Printing, Completed, etc.)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // DB UUID
    const { status } = req.body; // PENDING, ACCEPTED, PRINTING, COMPLETED, CANCELLED

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Map string status to Enum OrderStatus
    let statusEnum = status.toUpperCase();
    if (statusEnum === "DOWNLOADED") {
      statusEnum = "COMPLETED";
    }
    if (!["PENDING", "ACCEPTED", "PRINTING", "COMPLETED", "CANCELLED"].includes(statusEnum)) {
      return res.status(400).json({ message: "Invalid order status value" });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { queue: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update Order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: statusEnum },
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
      },
    });

    // Update Queue status if applicable
    if (order.queue) {
      let queueStatus = "WAITING";
      if (statusEnum === "PRINTING") queueStatus = "PRINTING";
      if (statusEnum === "COMPLETED" || statusEnum === "CANCELLED") queueStatus = "DONE";

      await prisma.queue.update({
        where: { orderId: id },
        data: { status: queueStatus },
      });
    }

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error updating status" });
  }
};

// Get single order details
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
        shopkeeper: true,
      },
    });

    if (!order) {
      // Try human-readable orderId as fallback
      const orders = await prisma.order.findMany({
        where: { orderId: id },
        include: {
          printConfiguration: true,
          orderFiles: true,
          queue: true,
          invoice: true,
          shopkeeper: true,
        },
      });

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.json(orders[0]);
    }

    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Server error fetching order" });
  }
};

// Delete order (pending only)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ message: "Only pending orders can be deleted" });
    }

    // Delete order (cascades to configurations, queues, invoices and order files)
    await prisma.order.delete({
      where: { id },
    });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: "Server error deleting order", error: err.message });
  }
};

// Download Invoice PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Try finding by UUID or human-readable orderId
    let order = await prisma.order.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!order) {
      const orders = await prisma.order.findMany({
        where: { orderId: id },
        include: { invoice: true },
      });
      if (orders.length > 0) {
        order = orders[0];
      }
    }

    if (!order || !order.invoice || !order.invoice.pdfUrl) {
      return res.status(404).json({ message: "Invoice not found for this order" });
    }

    const path = require("path");
    const fs = require("fs");
    // Resolve path relative to backend folder
    const pdfPath = path.join(__dirname, "..", order.invoice.pdfUrl);

    if (fs.existsSync(pdfPath)) {
      res.download(pdfPath, `invoice-${order.orderId}.pdf`);
    } else {
      res.status(404).json({ message: "Invoice file not found on disk" });
    }
  } catch (err) {
    console.error("Download invoice error:", err);
    res.status(500).json({ message: "Server error downloading invoice" });
  }
};

