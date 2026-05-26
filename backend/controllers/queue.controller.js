const prisma = require("../config/db");

// Get active queue for a shopkeeper
exports.getActiveQueue = async (req, res) => {
  try {
    const { shopkeeperId } = req.query;

    if (!shopkeeperId) {
      return res.status(400).json({ message: "shopkeeperId is required" });
    }

    const queueItems = await prisma.queue.findMany({
      where: {
        order: {
          shopkeeperId,
        },
        status: {
          not: "Done",
        },
      },
      include: {
        order: {
          select: {
            orderId: true,
            customerName: true,
            fileName: true,
            status: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    res.json(queueItems);
  } catch (err) {
    console.error("Fetch active queue error:", err);
    res.status(500).json({ message: "Server error fetching queue" });
  }
};

// Update a queue item (protected)
exports.updateQueueItem = async (req, res) => {
  try {
    const { id } = req.params; // Queue entry UUID
    const { position, status } = req.body;

    const updated = await prisma.queue.update({
      where: { id },
      data: {
        position: position !== undefined ? parseInt(position) : undefined,
        status: status || undefined,
      },
    });

    res.json({
      message: "Queue item updated",
      queueItem: updated,
    });
  } catch (err) {
    console.error("Update queue item error:", err);
    res.status(500).json({ message: "Server error updating queue item" });
  }
};
