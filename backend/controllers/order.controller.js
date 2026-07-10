const prisma = require("../config/db");
const orderService = require("../services/order.service");
const invoiceService = require("../services/invoice.service");
const socketService = require("../services/socket.service");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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

    // Determine Scratch Card Reward instantly on order creation
    let rewardType = null;
    let rewardMessage = null;
    let discountAmt = 0.0;

    // Check eligibility
    const isEligibleBW = items.length === 1 && 
      (items[0].config?.copies ? parseInt(items[0].config.copies) : 1) === 1 && 
      (items[0].config?.printType?.toUpperCase() === 'BW' || items[0].config?.printType?.toUpperCase() === 'B&W');
      
    const isEligibleColor = items.length === 1 && 
      (items[0].config?.copies ? parseInt(items[0].config.copies) : 1) === 1 && 
      (items[0].config?.printType?.toUpperCase() === 'COLOR');

    if (isEligibleBW) {
      // 1% probability for FREE_PRINT
      if (Math.random() < 0.01) {
        rewardType = 'FREE_PRINT';
        rewardMessage = 'Congratulations! Your current black & white print order is FREE.';
        discountAmt = totalAmt;
      }
    } else if (isEligibleColor) {
      // 0.50% probability for HALF_PRICE_COLOR
      if (Math.random() < 0.005) {
        rewardType = 'HALF_PRICE_COLOR';
        rewardMessage = 'Congratulations! 50% OFF has been applied to your current color print order.';
        discountAmt = totalAmt * 0.5;
      }
    }

    // If not winning or not eligible, select non-monetary (50/50 split)
    if (!rewardType) {
      const csvService = require("../services/csv.service");
      const rand = Math.random();
      if (rand < 0.5) {
        rewardType = 'DID_YOU_KNOW';
        const record = csvService.getRandomDidYouKnow();
        rewardMessage = record ? JSON.stringify(record) : "Did you know? Facts are interesting!";
      } else {
        rewardType = 'ASTROLOGY';
        const record = csvService.getRandomAstrology();
        rewardMessage = record ? JSON.stringify(record) : "Astrology: Cosmic advice for you!";
      }
      discountAmt = 0.0;
    }

    const orderTotal = totalAmt - discountAmt;
    let taxRate = 0.18; // 18% default
    try {
      const taxSetting = await prisma.systemSettings.findUnique({
        where: { key: 'platformTaxRate' }
      });
      if (taxSetting && taxSetting.value) {
        taxRate = parseFloat(taxSetting.value) / 100;
        if (isNaN(taxRate)) taxRate = 0.18;
      }
    } catch (e) {
      console.error("Failed to load platformTaxRate setting:", e);
    }
    const subtotalAmt = orderTotal / (1 + taxRate);
    const taxAmt = orderTotal - subtotalAmt;

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
        discount: discountAmt,
        totalAmount: orderTotal,
        status: "PENDING",
        estimatedTime,
      },
    });

    // Pre-create the reward log entry instantly during order placement
    try {
      const rewardController = require("./reward.controller");
      await rewardController.generateReward(order.id, targetShopkeeperId, rewardType, rewardMessage);
    } catch (rewardErr) {
      console.error("Failed to pre-create reward during order placement:", rewardErr);
    }

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

const storageService = require("../services/storage.service");

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

      let finalFileUrl = item.fileUrl || "";
      let finalKey = item.fileKey || "";

      // If key is not provided but fileUrl is S3 or local, we can resolve/extract it
      if (!finalKey && finalFileUrl) {
        try {
          const parsedUrl = new URL(finalFileUrl);
          if (parsedUrl.hostname.includes("s3") || parsedUrl.hostname.includes("amazonaws.com")) {
            finalKey = decodeURIComponent(parsedUrl.pathname.substring(1));
          } else if (parsedUrl.pathname.includes("/uploads/")) {
            finalKey = parsedUrl.pathname.split("/uploads/")[1];
          }
        } catch (e) {
          // If URL parsing fails, key is left blank
        }
      }

      // Automatically migrate file keys from uploads/temporary/ to structured customer-orders folder
      if (finalKey && (finalKey.startsWith("uploads/temporary/") || finalKey.startsWith("orders/temp/"))) {
        try {
          const safeOrderId = order.orderId.replace(/\//g, "_");
          const fileExtension = path.extname(item.fileName || finalKey).toLowerCase();
          const uniqueFilename = `${uuidv4()}_${item.fileName || "document"}`;
          const destKey = `uploads/customer-orders/${safeOrderId}/${uniqueFilename}`;
          
          const moveResult = await storageService.moveFile(finalKey, destKey);
          finalFileUrl = moveResult.fileUrl || moveResult.url;
          finalKey = moveResult.key;
        } catch (moveErr) {
          console.error(`Failed to move file ${finalKey} to customer-orders folder:`, moveErr);
        }
      }

      const orderFile = await prisma.orderFile.create({
        data: {
          orderId: order.id,
          originalFileName: item.fileName || "Untitled Document",
          customFileName: storedCustomName,
          fileUrl: finalFileUrl,
          s3Key: finalKey || null,
          fileSize: item.fileSize || 0,
          thumbnailUrl: finalFileUrl || null,
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
        price: totalAmt,
        subtotal: subtotalAmt,
        tax: taxAmt,
        discount: discountAmt,
        totalAmount: orderTotal,
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
          discount: discountAmt,
          totalAmount: orderTotal,
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
    });

    // Emit socket events for new order creation
    const formattedOrder = formatOrderResponse(completedOrder);
    socketService.emitToRoom(`shop:${targetShopkeeperId}`, "new-order", formattedOrder);
    if (userId) {
      socketService.emitToRoom(`customer:${userId}`, "new-order", formattedOrder);
    }
    socketService.emitToRoom("admin", "new-order", formattedOrder);

    // Emit notification event to shopkeeper
    socketService.emitToRoom(`shop:${targetShopkeeperId}`, "notification-created", {
      id: `notif-${Date.now()}`,
      type: "NEW_ORDER",
      title: "New Order Placed",
      message: `Order #${customOrderId} has been submitted by ${customerName || "Anonymous"}.`,
      orderId: order.id,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: "Order created successfully",
      orders: [formattedOrder],
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

    let statusEnum = status.toUpperCase();
    if (!["PENDING", "ACCEPTED", "PRINTING", "COMPLETED", "CANCELLED", "DOWNLOADED"].includes(statusEnum)) {
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
        rewardLog: true,
      },
    });

    if (statusEnum === "CANCELLED") {
      const safeOrderId = updatedOrder.orderId.replace(/\//g, "_");
      const folderPath = `uploads/customer-orders/${safeOrderId}/`;
      try {
        await storageService.deleteFolder(folderPath);
      } catch (s3Err) {
        console.error(`[S3 Cleanup] Failed to delete S3 folder for cancelled order ${updatedOrder.orderId}:`, s3Err.message);
      }
    }

    // Update Queue status if applicable
    if (order.queue) {
      let queueStatus = "WAITING";
      if (statusEnum === "PRINTING") queueStatus = "PRINTING";
      if (statusEnum === "COMPLETED" || statusEnum === "CANCELLED" || statusEnum === "DOWNLOADED") queueStatus = "DONE";

      await prisma.queue.update({
        where: { orderId: id },
        data: { status: queueStatus },
      });

      // Emit queue-updated event!
      socketService.emitToRoom(`shop:${order.shopkeeperId}`, "queue-updated", {
        orderId: id,
        position: order.queue.position,
        status: queueStatus
      });
    }

    // Generate reward card automatically on order completion or download
    if (statusEnum === "COMPLETED" || statusEnum === "DOWNLOADED") {
      try {
        const rewardController = require("./reward.controller");
        await rewardController.generateReward(id, order.shopkeeperId);
      } catch (err) {
        console.error("Failed to generate reward automatically on order completion:", err);
      }
    }

    // Decrement inventory and update printer statistics on order completion
    if (statusEnum === "COMPLETED" || statusEnum === "DOWNLOADED") {
      try {
        const pages = 1; // default fallback
        const copies = updatedOrder.printConfiguration?.copies || 1;
        const totalPages = pages * copies;

        // Decrement Paper A4 Pack (packs) - say 1 page = 1/500th of a pack
        const paperItem = await prisma.inventoryItem.findFirst({
          where: { shopkeeperId: order.shopkeeperId, itemName: "Paper A4 Pack" }
        });
        if (paperItem) {
          const packUsage = totalPages / 500;
          const nextQty = Math.max(0, paperItem.quantity - packUsage);
          const updatedItem = await prisma.inventoryItem.update({
            where: { id: paperItem.id },
            data: { quantity: nextQty }
          });
          // Emit inventory-updated event!
          socketService.emitToRoom(`shop:${order.shopkeeperId}`, "inventory-updated", updatedItem);

          // Emit alert if quantity drops below threshold
          if (nextQty <= paperItem.minThreshold) {
            socketService.emitToRoom(`shop:${order.shopkeeperId}`, "notification-created", {
              id: `notif-inv-${Date.now()}`,
              type: "LOW_INVENTORY",
              title: "Low Inventory Warning",
              message: `Inventory item "${paperItem.itemName}" is running low (${nextQty.toFixed(2)} packs remaining).`,
              createdAt: new Date().toISOString()
            });
          }
        }

        // Update Printer ink level and page count
        const isColor = updatedOrder.printConfiguration?.printType === "COLOR";
        const printerName = isColor ? "Epson L3250 EcoTank" : "HP LaserJet Pro 400";
        const printer = await prisma.printerStatistics.findFirst({
          where: { shopkeeperId: order.shopkeeperId, printerName }
        });
        if (printer) {
          // Say ink level drops by 0.05% per page
          const inkUsage = totalPages * 0.05;
          const nextInk = Math.max(0, printer.inkLevel - inkUsage);
          const updatedPrinter = await prisma.printerStatistics.update({
            where: { id: printer.id },
            data: {
              pagesPrinted: printer.pagesPrinted + totalPages,
              inkLevel: nextInk
            }
          });
          // Emit printer-status event!
          socketService.emitToRoom(`shop:${order.shopkeeperId}`, "printer-status", updatedPrinter);

          // Emit low ink notification if it falls below 15%
          if (nextInk <= 15.0) {
            socketService.emitToRoom(`shop:${order.shopkeeperId}`, "notification-created", {
              id: `notif-ink-${Date.now()}`,
              type: "LOW_INVENTORY",
              title: "Low Ink Warning",
              message: `Printer "${printer.printerName}" is low on ink/toner (${nextInk.toFixed(1)}% remaining).`,
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error("Failed to update inventory/printer stats on order completion:", err);
      }
    }

    // Emit socket events for order status modification
    const formattedOrder = formatOrderResponse(updatedOrder);
    socketService.emitToRoom(`shop:${order.shopkeeperId}`, "order-updated", formattedOrder);
    if (order.userId) {
      socketService.emitToRoom(`customer:${order.userId}`, "order-updated", formattedOrder);
    }
    socketService.emitToRoom("admin", "order-updated", formattedOrder);

    // Emit order status changes notifications to relevant parties
    if (statusEnum === "CANCELLED") {
      socketService.emitToRoom(`shop:${order.shopkeeperId}`, "notification-created", {
        id: `notif-${Date.now()}`,
        type: "ORDER_CANCELLED",
        title: "Order Cancelled",
        message: `Order #${updatedOrder.orderId} was cancelled by client/system.`,
        orderId: order.id,
        createdAt: new Date().toISOString()
      });
    }

    res.json({
      message: "Order status updated successfully",
      order: formattedOrder,
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

    const safeOrderId = order.orderId.replace(/\//g, "_");
    const folderPath = `uploads/customer-orders/${safeOrderId}/`;

    // Delete order (cascades to configurations, queues, invoices and order files)
    await prisma.order.delete({
      where: { id },
    });

    // Delete files in S3
    try {
      await storageService.deleteFolder(folderPath);
    } catch (s3Err) {
      console.error(`[S3 Cleanup] Failed to delete S3 folder for order ${order.orderId}:`, s3Err.message);
    }

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
        rewardLog: true,
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

exports.formatOrderResponse = formatOrderResponse;

