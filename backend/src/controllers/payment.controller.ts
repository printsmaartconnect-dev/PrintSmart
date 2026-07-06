import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";

const paymentService = new PaymentService();

// Extended Request interface to support optional shopkeeper auth context
interface AuthenticatedRequest extends Request {
  shopkeeper?: {
    id: string;
    email: string;
  };
}

/**
 * POST /api/payment/create-order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const orderData = await paymentService.createRazorpayOrder(orderId);
    return res.status(201).json(orderData);
  } catch (err: any) {
    console.error("Create payment order controller error:", err.message);
    return res.status(500).json({ message: err.message || "Failed to create payment order" });
  }
};

/**
 * POST /api/payment/verify
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"
      });
    }

    const result = await paymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    return res.status(200).json({
      message: "Payment signature verified successfully",
      ...result
    });
  } catch (err: any) {
    console.error("Verify payment controller error:", err.message);
    return res.status(400).json({ message: err.message || "Signature verification failed" });
  }
};

/**
 * POST /api/payment/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    await paymentService.handleWebhook(req.body);
    return res.status(200).json({ status: "OK" });
  } catch (err: any) {
    console.error("Razorpay Webhook handler error:", err.message);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};

/**
 * GET /api/payment/history
 */
export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shopkeeper || !req.shopkeeper.id) {
      return res.status(401).json({ message: "Unauthorized shopkeeper context" });
    }

    const history = await paymentService.getPaymentHistory(req.shopkeeper.id);
    return res.status(200).json(history);
  } catch (err: any) {
    console.error("Fetch payment history error:", err.message);
    return res.status(500).json({ message: "Failed to load payment records" });
  }
};
