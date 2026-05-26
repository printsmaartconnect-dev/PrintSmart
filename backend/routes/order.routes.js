const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Customer routes (Public)
router.post("/create", orderController.createOrder);
router.get("/:id", orderController.getOrderById);

// Shopkeeper routes (Protected)
router.get("/shopkeeper/all", authMiddleware, orderController.getShopkeeperOrders);
router.put("/:id/status", authMiddleware, orderController.updateOrderStatus);

module.exports = router;
