"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const razorpay_1 = __importDefault(require("../utils/razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const socketService = require("../../services/socket.service");
class PaymentService {
    /**
     * Create Razorpay Order
     */
    async createRazorpayOrder(orderId) {
        let order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { shopkeeper: true }
        });
        if (!order) {
            const orders = await prisma.order.findMany({
                where: { orderId: orderId },
                include: { shopkeeper: true }
            });
            if (orders.length > 0) {
                order = orders[0];
            }
        }
        if (!order) {
            throw new Error("Order not found");
        }
        if (order.status === "PAID") {
            throw new Error("Order has already been paid");
        }
        // Check if there is an existing PENDING payment for this order to reuse it
        let payment = await prisma.payment.findFirst({
            where: {
                orderId: order.id,
                paymentStatus: "PENDING"
            }
        });
        if (payment) {
            return {
                razorpayOrderId: payment.razorpayOrderId,
                amount: payment.amount,
                currency: payment.currency,
                keyId: process.env.RAZORPAY_KEY_ID || ""
            };
        }
        const amountInPaise = Math.round(order.totalAmount * 100);
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: order.id,
        };
        const razorpayOrder = await razorpay_1.default.orders.create(options);
        payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                razorpayOrderId: razorpayOrder.id,
                amount: order.totalAmount,
                currency: "INR",
                paymentStatus: "PENDING",
            }
        });
        if (order.status === "PENDING") {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "PENDING_PAYMENT" }
            });
        }
        return {
            razorpayOrderId: razorpayOrder.id,
            amount: order.totalAmount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID || ""
        };
    }
    /**
     * Verify Payment Signature
     */
    async verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const text = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(text)
            .digest("hex");
        const isSignatureValid = expectedSignature === razorpaySignature;
        let payment = await prisma.payment.findUnique({
            where: { razorpayOrderId }
        });
        if (!payment) {
            throw new Error("Payment record not found for the given razorpayOrderId");
        }
        if (!isSignatureValid) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    paymentStatus: "FAILED",
                    razorpayPaymentId,
                    razorpaySignature
                }
            });
            throw new Error("Signature verification failed");
        }
        payment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                paymentStatus: "SUCCESS",
                razorpayPaymentId,
                razorpaySignature
            }
        });
        const order = await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
            include: {
                printConfiguration: true,
                orderFiles: true,
                queue: true,
                invoice: true,
                payments: true
            }
        });
        await prisma.queue.updateMany({
            where: { orderId: order.id },
            data: { status: "WAITING" }
        });
        const updatedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                printConfiguration: true,
                orderFiles: true,
                queue: true,
                invoice: true,
                payments: true
            }
        });
        socketService.emitToRoom(`shop:${order.shopkeeperId}`, "order-updated", updatedOrder);
        if (order.userId) {
            socketService.emitToRoom(`customer:${order.userId}`, "order-updated", updatedOrder);
        }
        socketService.emitToRoom("admin", "order-updated", updatedOrder);
        socketService.emitToRoom(`shop:${order.shopkeeperId}`, "notification-created", {
            id: `notif-pay-${Date.now()}`,
            type: "PAYMENT_RECEIVED",
            title: "Online Payment Confirmed",
            message: `Order #${order.orderId} was paid online via Razorpay. Amount: ₹${order.totalAmount.toFixed(2)}.`,
            orderId: order.id,
            createdAt: new Date().toISOString()
        });
        return { success: true, order: updatedOrder };
    }
    /**
     * Webhook Event Handler
     */
    async handleWebhook(event) {
        const eventName = event.event;
        console.log(`[Razorpay Webhook] Processing event: ${eventName}`);
        if (eventName === "payment.captured" || eventName === "payment.authorized") {
            const paymentEntity = event.payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;
            let payment = await prisma.payment.findUnique({
                where: { razorpayOrderId }
            });
            if (!payment) {
                console.warn(`[Razorpay Webhook] Payment not found for Razorpay Order: ${razorpayOrderId}`);
                return;
            }
            if (payment.paymentStatus === "SUCCESS") {
                console.log(`[Razorpay Webhook] Payment ${razorpayOrderId} already successful (idempotent ignore)`);
                return;
            }
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    paymentStatus: "SUCCESS",
                    razorpayPaymentId,
                    paymentMethod: paymentEntity.method,
                }
            });
            const order = await prisma.order.update({
                where: { id: payment.orderId },
                data: { status: "PAID" }
            });
            await prisma.queue.updateMany({
                where: { orderId: order.id },
                data: { status: "WAITING" }
            });
            const updatedOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: {
                    printConfiguration: true,
                    orderFiles: true,
                    queue: true,
                    invoice: true,
                    payments: true
                }
            });
            socketService.emitToRoom(`shop:${order.shopkeeperId}`, "order-updated", updatedOrder);
            if (order.userId) {
                socketService.emitToRoom(`customer:${order.userId}`, "order-updated", updatedOrder);
            }
            socketService.emitToRoom("admin", "order-updated", updatedOrder);
            socketService.emitToRoom(`shop:${order.shopkeeperId}`, "notification-created", {
                id: `notif-pay-webhook-${Date.now()}`,
                type: "PAYMENT_RECEIVED",
                title: "Online Payment Confirmed (Webhook)",
                message: `Order #${order.orderId} was paid online via Razorpay. Amount: ₹${order.totalAmount.toFixed(2)}.`,
                orderId: order.id,
                createdAt: new Date().toISOString()
            });
        }
        else if (eventName === "payment.failed") {
            const paymentEntity = event.payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;
            let payment = await prisma.payment.findUnique({
                where: { razorpayOrderId }
            });
            if (payment) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        paymentStatus: "FAILED",
                        razorpayPaymentId,
                        paymentMethod: paymentEntity.method
                    }
                });
            }
        }
        else if (eventName === "refund.processed") {
            const refundEntity = event.payload.refund.entity;
            const razorpayPaymentId = refundEntity.payment_id;
            let payment = await prisma.payment.findFirst({
                where: { razorpayPaymentId }
            });
            if (payment) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        paymentStatus: "REFUNDED"
                    }
                });
                await prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: "CANCELLED" }
                });
            }
        }
    }
    /**
     * Refund Payment Helper
     */
    async refundPayment(paymentId, amount) {
        const refundOptions = {
            payment_id: paymentId,
        };
        if (amount) {
            refundOptions.amount = Math.round(amount * 100);
        }
        const refund = await razorpay_1.default.payments.refund(paymentId, refundOptions);
        const payment = await prisma.payment.findFirst({
            where: { razorpayPaymentId: paymentId }
        });
        if (payment) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { paymentStatus: "REFUNDED" }
            });
            await prisma.order.update({
                where: { id: payment.orderId },
                data: { status: "CANCELLED" }
            });
        }
        return refund;
    }
    /**
     * Fetch payment history for a shopkeeper
     */
    async getPaymentHistory(shopkeeperId) {
        return prisma.payment.findMany({
            where: {
                order: {
                    shopkeeperId
                }
            },
            include: {
                order: {
                    select: {
                        orderId: true,
                        customerName: true,
                        phone: true,
                        totalAmount: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }
}
exports.PaymentService = PaymentService;
