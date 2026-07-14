const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Customer routes (Public)
router.post("/create", orderController.createOrder);
router.get("/user/:userId", orderController.getCustomerOrders);
router.get("/:id", orderController.getOrderById);
router.delete("/:id", orderController.deleteOrder);
router.get("/:id/invoice", orderController.downloadInvoice);
router.put("/:id/customer-status", orderController.updateOrderStatusByCustomer);
router.put("/:id/request-bill", orderController.requestBill);

// Shopkeeper routes (Protected)
router.get("/shopkeeper/all", authMiddleware, orderController.getShopkeeperOrders);
router.put("/:id/status", authMiddleware, orderController.updateOrderStatus);
router.put("/:id/send-bill", authMiddleware, orderController.sendBill);

module.exports = router;
