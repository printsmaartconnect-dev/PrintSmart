const express = require("express");
const router = express.Router();
const queueController = require("../controllers/queue.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Customer/Public route to see the queue
router.get("/", queueController.getActiveQueue);

// Shopkeeper protected route to modify queue item
router.put("/:id", authMiddleware, queueController.updateQueueItem);

module.exports = router;
