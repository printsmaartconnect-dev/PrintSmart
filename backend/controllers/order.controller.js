const prisma = require("../config/db");

// Create one or more orders (for single or multi-file orders)
exports.createOrder = async (req, res) => {
  try {
    const { orderId, customerName, phone, shopkeeperId, items } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Resolve shopkeeper ID. If none provided, default to the first shopkeeper in the DB
    let targetShopkeeperId = shopkeeperId;
    if (!targetShopkeeperId) {
      const defaultShop = await prisma.shopkeeper.findFirst();
      if (!defaultShop) {
        return res.status(400).json({ message: "No shopkeepers registered in the system yet" });
      }
      targetShopkeeperId = defaultShop.id;
    }

    const createdOrders = [];

    // Process each item/file
    for (const item of items) {
      const { fileName, fileUrl, price, variant, config } = item;

      // 1. Create PrintConfiguration
      const printConfig = await prisma.printConfiguration.create({
        data: {
          printType: config?.printType || "bw",
          copies: config?.copies || 1,
          paperSize: config?.paperSize || "A4",
          pages: config?.pages || "all",
          sides: config?.sides || "single",
          orientation: config?.orientation || "portrait",
        },
      });

      // Get current max queue position for this shopkeeper
      const maxQueue = await prisma.queue.findFirst({
        where: {
          order: {
            shopkeeperId: targetShopkeeperId,
          },
        },
        orderBy: {
          position: "desc",
        },
      });
      const nextPosition = maxQueue ? maxQueue.position + 1 : 1;

      // 2. Create Order linked to the configuration
      const order = await prisma.order.create({
        data: {
          orderId,
          customerName: customerName || "Anonymous",
          phone: phone || null,
          fileName,
          fileUrl,
          price: parseFloat(price) || 0.0,
          variant: variant || "standard",
          shopkeeperId: targetShopkeeperId,
          printConfigId: printConfig.id,
        },
        include: {
          printConfiguration: true,
        },
      });

      // 3. Create Queue entry
      await prisma.queue.create({
        data: {
          orderId: order.id,
          position: nextPosition,
          status: "Waiting",
        },
      });

      createdOrders.push(order);
    }

    res.status(201).json({
      message: "Order(s) placed successfully",
      orders: createdOrders,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error placing order" });
  }
};

// Get orders for a shopkeeper (optionally filtered by status)
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
        queue: true,
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

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // DB UUID
    const { status } = req.body; // Pending, Accepted, Printing, Completed, Cancelled

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
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
      data: { status },
      include: {
        printConfiguration: true,
        queue: true,
      },
    });

    // Update Queue status if applicable
    if (order.queue) {
      let queueStatus = "Waiting";
      if (status === "Printing") queueStatus = "Printing";
      if (status === "Completed" || status === "Cancelled") queueStatus = "Done";

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
        queue: true,
      },
    });

    if (!order) {
      // Try fetching by the human-readable orderId as fallback
      const orders = await prisma.order.findMany({
        where: { orderId: id },
        include: {
          printConfiguration: true,
          queue: true,
        },
      });

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.json(orders.length === 1 ? orders[0] : orders);
    }

    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Server error fetching order" });
  }
};
