
"use client";

import Link from "next/link";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function InnerPayment({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements || !agreed) return;
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

      <label className="flex items-start gap-2 mt-4 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5"
          required
        />
        <span>
          I have read and agree to the{" "}
          <Link href="/policy#cookies" className="z-link" target="_blank">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/policy" className="z-link" target="_blank">
            Terms &amp; Conditions
          </Link>
          .
        </span>
      </label>

      <button
        type="button"
        className={`z-btn z-btn--primary mt-4 ${loading || !agreed ? "opacity-50" : ""}`}
        onClick={handlePay}
        disabled={loading || !stripe || !elements || !agreed}
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
