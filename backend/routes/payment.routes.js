const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Customer route (Public) - registers transaction code reference against orderId
router.post("/verify/:orderId", paymentController.createPaymentLog);

// Shopkeeper routes (Protected) - validates/rejects transaction reference codes
router.put("/shopkeeper/verify/:id", authMiddleware, paymentController.updatePaymentStatus);
router.get("/shopkeeper/pending", authMiddleware, paymentController.getPendingPayments);

module.exports = router;
