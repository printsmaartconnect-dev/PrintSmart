const prisma = require("../config/db");
const orderService = require("../services/order.service");
const invoiceService = require("../services/invoice.service");

// Format orders to clean serialized configs and present them as a dynamic 'config' field
const formatOrderResponse = (order) => {
  if (!order) return null;

  if (order.orderFiles && Array.isArray(order.orderFiles)) {
    order.orderFiles = order.orderFiles.map(file => {
      let cleanName = file.customFileName;
      let parsedConfig = null;
      let fileOrderId = order.orderId; // default to main orderId
      let filePrice = file.price || 0.0;
      
      if (file.customFileName && file.customFileName.includes('|')) {
        try {
          const parts = file.customFileName.split('|');
          cleanName = parts[0];
          parsedConfig = JSON.parse(parts[1]);
          if (parsedConfig) {
            fileOrderId = parsedConfig.orderId || fileOrderId;
            filePrice = parsedConfig.price !== undefined ? parseFloat(parsedConfig.price) : filePrice;
          }
        } catch (e) {
          console.error("Failed to parse custom file name config in response formatting", e);
        }
      }
      return {
        ...file,
        customFileName: cleanName || file.originalFileName,
        orderId: fileOrderId,
        price: filePrice,
        config: parsedConfig
      };
    });
  }

  return order;
};

// Create one or more orders (per configured item)
exports.createOrder = async (req, res) => {
  try {
    let { userId, shopkeeperId, customerName, phone, customerComment, items } = req.body;

    // Sanitize string-literal null/undefined/empty values
    if (userId === "undefined" || userId === "null" || userId === "") {
      userId = null;
    }
    if (shopkeeperId === "undefined" || shopkeeperId === "null" || shopkeeperId === "") {
      shopkeeperId = null;
    }

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

    // Determine the month ranges for sequence calculation
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const yearStr = String(now.getFullYear()).slice(-2);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Find the latest order file this month to get the last sequence number
    const lastOrderFile = await prisma.orderFile.findFirst({
      where: {
        order: {
          createdAt: { gte: startOfMonth, lt: endOfMonth }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    let lastSequence = 0;
    if (lastOrderFile && lastOrderFile.customFileName) {
      if (lastOrderFile.customFileName.includes('|')) {
        try {
          const parts = lastOrderFile.customFileName.split('|');
          const parsedConfig = JSON.parse(parts[1]);
          if (parsedConfig && parsedConfig.orderId) {
            const match = parsedConfig.orderId.match(/P(BW|C)(\d+)$/);
            if (match) {
              lastSequence = parseInt(match[2], 10);
            }
          }
        } catch (e) {
          console.error("Failed to parse last order file sequence from db:", e);
        }
      }
    }

    let thisMonthOrderCount = lastSequence;

    // 1. Generate sequential unique Order IDs for all items in the batch
    const fileOrderIds = [];
    for (const item of items) {
      const itemPrintType = item.config?.printType?.toUpperCase() === "COLOR" ? "COLOR" : "BW";
      const typeCode = itemPrintType === 'COLOR' ? 'C' : 'BW';
      
      thisMonthOrderCount++;
      const sequence = String(thisMonthOrderCount).padStart(2, '0');
      const itemOrderId = `${monthStr}${yearStr}P${typeCode}${sequence}`;
      fileOrderIds.push(itemOrderId);
    }

    // The primary order ID of the customer is set to the last file's sequential ID
    const customOrderId = fileOrderIds[fileOrderIds.length - 1];
    const lastItem = items[items.length - 1];
    const configPrintType = lastItem.config?.printType?.toUpperCase() === "COLOR" ? "COLOR" : "BW";

    // 3. Calculate accurate total estimated wait time across all files combined
    // Base queue size wait time
    const queueSize = await prisma.queue.count({
      where: {
        order: { shopkeeperId: targetShopkeeperId },
        status: 'WAITING'
      }
    });
    const queueWaitTime = Math.min(queueSize * 2.5, 30);

    let totalPrintTimeMinutes = 0;
    for (const item of items) {
      let baseTimePerCopy = 5; // seconds
      if (item.config?.quality === 'HIGH') {
        baseTimePerCopy = 8;
      } else if (item.config?.quality === 'DRAFT') {
        baseTimePerCopy = 3;
      }
      if (item.config?.sides === 'DOUBLE') {
        baseTimePerCopy *= 1.5;
      }
      const copies = item.config?.copies ? parseInt(item.config.copies) : 1;
      totalPrintTimeMinutes += (baseTimePerCopy * copies) / 60;
    }

    const estimatedTime = Math.max(Math.ceil(totalPrintTimeMinutes + queueWaitTime), 2);

    // 4. Calculate pricing breakdown (tax, discount, subtotal) across all files combined
    let totalAmt = 0.0;
    for (const item of items) {
      totalAmt += parseFloat(item.price) || 0.0;
    }
    const taxRate = 0.18; // 18% GST
    const subtotalAmt = totalAmt / (1 + taxRate);
    const taxAmt = totalAmt - subtotalAmt;

    // 5. Create the single unified Order
    const order = await prisma.order.create({
      data: {
        orderId: customOrderId,
        userId: userId || null,
        shopkeeperId: targetShopkeeperId,
        customerName: customerName || "Anonymous",
        phone: phone || null,
        customerComment: customerComment || null,
        price: totalAmt,
        subtotal: subtotalAmt,
        tax: taxAmt,
        discount: 0,
        totalAmount: totalAmt,
        status: "PENDING",
        estimatedTime,
      },
    });

    // 6. Create PrintConfiguration linked to Order using the last item's configuration
    const printConfig = await prisma.printConfiguration.create({
      data: {
        orderId: order.id,
        printType: configPrintType,
        copies: lastItem.config?.copies ? parseInt(lastItem.config.copies) : 1,
        paperSize: (lastItem.config?.paperSize || "A4").toUpperCase(),
        sides: lastItem.config?.sides?.toUpperCase() === "DOUBLE" ? "DOUBLE" : "SINGLE",
        orientation: lastItem.config?.orientation?.toUpperCase() === "LANDSCAPE" ? "LANDSCAPE" : "PORTRAIT",
        quality: lastItem.config?.quality?.toUpperCase() || "NORMAL",
        pageRange: lastItem.config?.pageRange || "all",
      },
    });

    // 7. Create OrderFiles for each item, serializing their print configurations, sequential IDs, and individual prices inside `customFileName`
    const orderFiles = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemOrderId = fileOrderIds[i];
      const serializedConfig = JSON.stringify({
        ...(item.config || {}),
        orderId: itemOrderId,
        price: parseFloat(item.price) || 0.0
      });
      const storedCustomName = `${item.fileName || "Untitled Document"}|${serializedConfig}`;

      const orderFile = await prisma.orderFile.create({
        data: {
          orderId: order.id,
          originalFileName: item.fileName || "Untitled Document",
          customFileName: storedCustomName,
          fileUrl: item.fileUrl || "",
          fileSize: item.fileSize || 0,
          thumbnailUrl: item.fileUrl || null,
        },
      });
      orderFiles.push(orderFile);
    }

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
        files: orderFiles,
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
    let totalCopies = 0;
    for (const item of items) {
      totalCopies += parseInt(item.config?.copies || 1);
    }
    await orderService.updateShopkeeperStats(targetShopkeeperId, {
      totalAmount: totalAmt,
      printConfig,
      quantity: totalCopies,
    });

    // Fetch complete populated order
    const completedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
        paymentLog: true,
      },
    });

    res.status(201).json({
      message: "Order created successfully",
      orders: [formatOrderResponse(completedOrder)],
    });
  } catch (err) {
    console.error("Create order controller error:", err);
    try {
      const fs = require("fs");
      const path = require("path");
      fs.writeFileSync(path.join(__dirname, "..", "order-error.log"), `${new Date().toISOString()}\n${err.stack}\n\n`, { flag: "a" });
    } catch (logErr) {
      console.error("Failed to write order error log:", logErr);
    }
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
        rewardLog: true,
        paymentLog: true,
        shopkeeper: {
          select: {
            shopName: true,
            address: true,
            phone: true,
            upiId: true,
            paymentQrUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders.map(formatOrderResponse));
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
        paymentLog: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders.map(formatOrderResponse));
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
        paymentLog: true,
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

    // Generate reward card automatically on order completion
    if (statusEnum === "COMPLETED") {
      try {
        const rewardController = require("./reward.controller");
        await rewardController.generateReward(id, order.shopkeeperId);
      } catch (err) {
        console.error("Failed to generate reward automatically on order completion:", err);
      }
    }

    res.json({
      message: "Order status updated successfully",
      order: formatOrderResponse(updatedOrder),
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
        paymentLog: true,
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
          paymentLog: true,
        },
      });

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.json(formatOrderResponse(orders[0]));
    }

    res.json(formatOrderResponse(order));
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

exports.updateOrderStatusByCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || status !== "ACCEPTED") {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { queue: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: "ACCEPTED" },
      include: {
        printConfiguration: true,
        orderFiles: true,
        queue: true,
        invoice: true,
        paymentLog: true,
      },
    });

    if (order.queue) {
      await prisma.queue.update({
        where: { orderId: id },
        data: { status: "WAITING" },
      });
    }

    res.json({
      message: "Order status updated by customer to ACCEPTED",
      order: formatOrderResponse(updatedOrder),
    });
  } catch (err) {
    console.error("Update customer order status error:", err);
    res.status(500).json({ message: "Server error updating status" });
  }
};

