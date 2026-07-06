"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const verifyWebhookSignature = (req, res, next) => {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!signature || !secret) {
        return res.status(400).json({ message: "Webhook signature or secret missing" });
    }
    const payload = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto_1.default
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    if (expectedSignature !== signature) {
        console.error("Webhook signature mismatch:", { expected: expectedSignature, received: signature });
        return res.status(400).json({ message: "Invalid webhook signature" });
    }
    next();
};
exports.verifyWebhookSignature = verifyWebhookSignature;
