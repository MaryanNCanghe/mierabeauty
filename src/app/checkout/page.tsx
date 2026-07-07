"use client";

import { useMemo, useState } from "react";
import PaymentSection from "@/components/PaymentSection";
import { useCart } from "@/contexts/cart";
import Link from "next/link";
import { currencyForCountry, symbolForCurrency } from "@/lib/countryCurrency";

// Validador simples de UUID
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function CheckoutPage() {
  const { items, subtotalCents } = useCart();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const contactValid = useMemo(
    () => /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 7,
    [email, phone]
  );

  const shippingValid = useMemo(() => {
    const s = shipping;
    return !!(
      s.firstName &&
      s.lastName &&
      s.address1 &&
      s.city &&
      s.postalCode &&
      s.country
    );
  }, [shipping]);

  const currency = useMemo(
    () => /^[A-Z]{2}$/i.test(shipping.country)
      ? currencyForCountry(shipping.country)
      : "eur",
    [shipping.country]
  );
  const currencySymbol = symbolForCurrency(currency);

  const canContinue = items.length > 0 && contactValid && shippingValid;

  const handleContinue = async () => {
    try {
      setLoading(true);
      setErr(null);

      const normalizedItems = items.map((it) => {
        const productIdNum =
          typeof it.productId === "number"
            ? it.productId
            : Number(it.productId);

        let variantId: string | null = null;
        const hasVariants =
          Array.isArray((it as any).variants) &&
          ((it as any).variants?.length ?? 0) > 0;

        if (hasVariants && it.variantId != null) {
          variantId =
            typeof it.variantId === "string" && UUID_RE.test(it.variantId)
              ? it.variantId
              : null;
        }

        return {
          productId: productIdNum,
          variantId,
          name: it.name,
          priceCents: Number(it.priceCents) || 0,
          qty: Number(it.qty) || 0,
          imageUrl: it.imageUrl ?? null,
          attributes: it.attributes ?? null,
        };
      });

      if (!/\S+@\S+\.\S+/.test(email)) {
        setErr("Por favor, indica um e-mail válido.");
        return;
      }

      if (!/^[A-Z]{2}$/i.test(shipping.country)) {
        setErr("País inválido. Usa o código ISO de 2 letras (ex.: PT, ES).");
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerEmail: email,
          shipping: {
            ...shipping,
            country: shipping.country.toUpperCase(),
          },
          items: normalizedItems,
          currency,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(
          json.error ??
            "Não foi possível preparar o pagamento. Tenta novamente."
        );
      }

      setClientSecret(json.clientSecret);
      setOrderId(json.orderId);

      document
        .getElementById("payment-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (e: any) {
      setErr(e.message ?? "Falha ao preparar pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="z-title-md pt-20 mb-6">Checkout</h1>

      {items.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-8 text-center bg-white">
          <p className="z-label mb-4">Your cart is empty.</p>
          <Link href="/cart" className="z-link">
            Return to cart
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <section className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="z-title-md mb-4">Contact</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-email" className="z-label block mb-1">E-mail</label>
                  <input
                    id="checkout-email"
                    type="email"
                    className="w-full rounded-md border px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="z-label block mb-1">Mobile</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    className="w-full rounded-md border px-3 py-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="z-title-md mb-4">Shipping Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["Name", "firstName"],
                  ["Surname", "lastName"],
                  ["Address", "address1"],
                  ["Address 2 (optional)", "address2"],
                  ["City", "city"],
                  ["Postal Code", "postalCode"],
                  ["Country", "country"],
                ].map(([label, key]) => (
                  <div
                    key={key}
                    className={
                      key === "address1" || key === "address2"
                        ? "md:col-span-2"
                        : ""
                    }
                  >
                    <label htmlFor={`shipping-${key}`} className="z-label block mb-1">
                      {label}
                      {key === "country" && shipping.country.length === 2 && (
                        <span className="ml-2 text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {currency.toUpperCase()} {currencySymbol}
                        </span>
                      )}
                    </label>
                    <input
                      id={`shipping-${key}`}
                      className="w-full rounded-md border px-3 py-2"
                      value={(shipping as any)[key]}
                      maxLength={key === "country" ? 2 : undefined}
                      placeholder={key === "country" ? "PT" : undefined}
                      onChange={(e) => {
                        const val = key === "country"
                          ? e.target.value.toUpperCase().slice(0, 2)
                          : e.target.value;
                        setShipping((s) => ({ ...s, [key]: val }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div
              id="payment-section"
              className="rounded-md border border-gray-200 bg-white p-6"
            >
              <h2 className="z-title-md mb-4">Payment</h2>

              {!clientSecret || !orderId ? (
                <>
                  {err && (
                    <p className="z-label text-red-600 mb-3">{err}</p>
                  )}

                  <button
                    className={`z-btn z-btn--primary ${
                      !canContinue || loading
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                    onClick={handleContinue}
                  >
                    {loading ? "Preparing…" : "Continue to payment"}
                  </button>
                </>
              ) : (
                <PaymentSection
                  clientSecret={clientSecret}
                  orderId={orderId}
                />
              )}
            </div>
          </section>

          {/* RIGHT */}
          <aside className="lg:col-span-1">
            <div className="rounded-md border border-gray-200 bg-white p-4 sticky top-6">
              <h2 className="z-title-md mb-4 z-label-1 border-b border-black px-4 py-2 inline-block">
                Summary
              </h2>

              <div className="flex justify-between z-label-1 mb-2">
                <span>Subtotal</span>
                <span>{currencySymbol}{(subtotalCents / 100).toFixed(2)}</span>
              </div>

              <p className="z-label text-gray-500 mb-4">tax 25%</p>

              <Link href="/cart" className="z-link">
                Return to cart
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
