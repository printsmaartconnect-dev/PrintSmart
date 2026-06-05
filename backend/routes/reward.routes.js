const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Customer routes
router.get("/order/:orderId", rewardController.getRewardByOrderId);
router.post("/:id/scratch", rewardController.scratchReward);

// Shopkeeper routes (Protected)
router.get("/shopkeeper/stats", authMiddleware, rewardController.getShopkeeperStats);

// Admin routes (Protected, or public for MVP/local stats)
router.get("/admin/stats", rewardController.getAdminStats);

module.exports = router;
