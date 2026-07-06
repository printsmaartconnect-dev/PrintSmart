"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const verifySignature_1 = require("../middleware/verifySignature");
const authMiddleware = require("../../middleware/auth.middleware");
const legacyPaymentController = require("../../controllers/payment.controller");
const router = (0, express_1.Router)();
// New Razorpay routes
router.post("/create-order", payment_controller_1.createOrder);
router.post("/verify", payment_controller_1.verifyPayment);
router.post("/webhook", verifySignature_1.verifyWebhookSignature, payment_controller_1.handleWebhook);
router.get("/history", authMiddleware, payment_controller_1.getHistory);
// Legacy manual UPI/Cash verification routes
router.post("/verify/:orderId", legacyPaymentController.createPaymentLog);
router.put("/shopkeeper/verify/:id", authMiddleware, legacyPaymentController.updatePaymentStatus);
router.get("/shopkeeper/pending", authMiddleware, legacyPaymentController.getPendingPayments);
exports.default = router;
