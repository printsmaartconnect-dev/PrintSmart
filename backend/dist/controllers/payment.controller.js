"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.handleWebhook = exports.verifyPayment = exports.createOrder = void 0;
const payment_service_1 = require("../services/payment.service");
const paymentService = new payment_service_1.PaymentService();
/**
 * POST /api/payment/create-order
 */
const createOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }
        const orderData = await paymentService.createRazorpayOrder(orderId);
        return res.status(201).json(orderData);
    }
    catch (err) {
        console.error("Create payment order controller error:", err.message);
        return res.status(500).json({ message: err.message || "Failed to create payment order" });
    }
};
exports.createOrder = createOrder;
/**
 * POST /api/payment/verify
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"
            });
        }
        const result = await paymentService.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        return res.status(200).json({
            message: "Payment signature verified successfully",
            ...result
        });
    }
    catch (err) {
        console.error("Verify payment controller error:", err.message);
        return res.status(400).json({ message: err.message || "Signature verification failed" });
    }
};
exports.verifyPayment = verifyPayment;
/**
 * POST /api/payment/webhook
 */
const handleWebhook = async (req, res) => {
    try {
        await paymentService.handleWebhook(req.body);
        return res.status(200).json({ status: "OK" });
    }
    catch (err) {
        console.error("Razorpay Webhook handler error:", err.message);
        return res.status(500).json({ message: "Webhook handler failed" });
    }
};
exports.handleWebhook = handleWebhook;
/**
 * GET /api/payment/history
 */
const getHistory = async (req, res) => {
    try {
        if (!req.shopkeeper || !req.shopkeeper.id) {
            return res.status(401).json({ message: "Unauthorized shopkeeper context" });
        }
        const history = await paymentService.getPaymentHistory(req.shopkeeper.id);
        return res.status(200).json(history);
    }
    catch (err) {
        console.error("Fetch payment history error:", err.message);
        return res.status(500).json({ message: "Failed to load payment records" });
    }
};
exports.getHistory = getHistory;
