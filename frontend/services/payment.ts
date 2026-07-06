const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://printsmart-3nxm.onrender.com";

export interface CreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentHistoryItem {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  order: {
    orderId: string;
    customerName: string;
    phone: string | null;
    totalAmount: number;
  };
}

export const paymentService = {
  /**
   * Create Razorpay Order
   */
  async createRazorpayOrder(orderId: string): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_URL}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create payment order");
    }

    return response.json();
  },

  /**
   * Verify signature on backend
   */
  async verifyPayment(verificationData: VerifyPaymentRequest): Promise<any> {
    const response = await fetch(`${API_URL}/api/payment/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Payment verification failed");
    }

    return response.json();
  },

  /**
   * Fetch payment history for shopkeeper
   */
  async getPaymentHistory(token: string): Promise<PaymentHistoryItem[]> {
    const response = await fetch(`${API_URL}/api/payment/history`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch payment history");
    }

    return response.json();
  },
};
