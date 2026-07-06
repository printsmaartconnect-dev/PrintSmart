import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return res.status(400).json({ message: "Webhook signature or secret missing" });
  }

  const payload = (req as any).rawBody || JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Webhook signature mismatch:", { expected: expectedSignature, received: signature });
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  next();
};
