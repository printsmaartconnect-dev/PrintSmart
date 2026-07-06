import { Router } from "express";
import { createOrder, verifyPayment, handleWebhook, getHistory } from "../controllers/payment.controller";
import { verifyWebhookSignature } from "../middleware/verifySignature";

const authMiddleware = require("../../middleware/auth.middleware");
const legacyPaymentController = require("../../controllers/payment.controller");

const router = Router();

// New Razorpay routes
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", verifyWebhookSignature, handleWebhook);
router.get("/history", authMiddleware, getHistory);

// Legacy manual UPI/Cash verification routes
router.post("/verify/:orderId", legacyPaymentController.createPaymentLog);
router.put("/shopkeeper/verify/:id", authMiddleware, legacyPaymentController.updatePaymentStatus);
router.get("/shopkeeper/pending", authMiddleware, legacyPaymentController.getPendingPayments);

export default router;
