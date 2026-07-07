
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function InnerPayment({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
    });

    if (error) setMsg(error.message ?? "Payment failed.");
    setLoading(false);
  };

  return (
    <div>
      <PaymentElement />
      <button
        className={`z-btn z-btn--primary mt-4 ${loading ? "opacity-50" : ""}`}
        onClick={handlePay}
        disabled={loading || !stripe || !elements}
      >
        Pay Now
      </button>
      {msg && <p className="z-label text-red-600 mt-2">{msg}</p>}
    </div>
  );
}

export default function PaymentSection({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  if (!clientSecret) return <p className="z-label">Processing your payment…</p>;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerPayment clientSecret={clientSecret} orderId={orderId} />
    </Elements>
  );
}
