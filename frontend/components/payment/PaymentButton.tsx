import React from "react";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  onPayTrigger: (orderId: string, customerDetails: any) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  orderId,
  amount,
  customerName,
  customerPhone,
  customerEmail = "customer@printsmart.com",
  onPayTrigger,
  loading,
  disabled = false,
}) => {
  const handlePayClick = async () => {
    if (loading || disabled) return;
    const customerDetails = {
      name: customerName || "Anonymous Customer",
      phone: customerPhone || "",
      email: customerEmail,
    };
    await onPayTrigger(orderId, customerDetails);
  };

  return (
    <button
      type="button"
      disabled={loading || disabled}
      onClick={handlePayClick}
      className={`w-full inline-flex items-center justify-center gap-2 text-center py-3 px-5 rounded-2xl text-sm font-bold text-black transition-all duration-200 shadow-[0_4px_14px_rgba(79,70,229,0.25)] ${loading || disabled
          ? "bg-indigo-400 cursor-not-allowed opacity-80"
          : "bg-indigo-650 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.98]"
        }`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing Payment...
        </>
      ) : (
        <>
          ⚡ Pay Online ₹{amount.toFixed(2)}
        </>
      )}
    </button>
  );
};

export default PaymentButton;
