import { useState, useCallback } from "react";
import { paymentService } from "../services/payment";

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string;
    amount: number;
    orderId: string;
  } | null>(null);

  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = useCallback(
    async (orderId: string, customerDetails: CustomerDetails, onSuccessCallback?: () => void) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const isLoaded = await loadScript();
        if (!isLoaded) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }

        const orderData = await paymentService.createRazorpayOrder(orderId);

        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.amount * 100), 
          currency: orderData.currency,
          name: "PrintSmart",
          description: `PrintSmart Order #${orderId}`,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: customerDetails.name || "Customer",
            email: customerDetails.email || "customer@printsmart.com",
            contact: customerDetails.phone || "",
          },
          theme: {
            color: "#4f46e5", 
          },
          handler: async function (response: any) {
            setLoading(true);
            try {
              await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              setSuccess(true);
              setPaymentDetails({
                paymentId: response.razorpay_payment_id,
                amount: orderData.amount,
                orderId: orderId,
              });

              if (onSuccessCallback) {
                onSuccessCallback();
              }
            } catch (err: any) {
              console.error("Signature verification error:", err);
              setError(err.message || "Payment verification failed.");
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setError("Payment cancelled by customer.");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error("Initiate payment hook error:", err);
        setError(err.message || "Failed to start payment process.");
        setLoading(false);
      }
    },
    []
  );

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setPaymentDetails(null);
  }, []);

  return {
    loading,
    error,
    success,
    paymentDetails,
    initiatePayment,
    resetState,
  };
};
