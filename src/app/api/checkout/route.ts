
// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ---------- Environment Guards ----------
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
if (!SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (server secret)");
if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");

// ---------- Clients ----------
const stripe = new Stripe(STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ---------- Types ----------
type IncomingCartItem = {
  productId: number | string; // will be coerced to number (bigint)
  variantId?: string | null;  // uuid or null
  name: string;
  priceCents: number;
  qty: number;
  imageUrl?: string | null;
  attributes?: Record<string, any> | null;
};

type ShippingInfo = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string; // must be 2-letter ISO (e.g., "PT", "US")
};

// ---------- Validators ----------
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(val: unknown): val is string {
  return typeof val === "string" && UUID_RE.test(val);
}

function isIsoCountry(val: unknown): val is string {
  return typeof val === "string" && /^[A-Z]{2}$/i.test(val);
}

function validateShipping(s: any): s is ShippingInfo {
  return (
    s &&
    typeof s.firstName === "string" &&
    typeof s.lastName === "string" &&
    typeof s.address1 === "string" &&
    typeof s.city === "string" &&
    typeof s.postalCode === "string" &&
    typeof s.country === "string"
  );
}

// ---------- Helpers ----------
function normalizeItems(items: IncomingCartItem[]) {
  const normalized = items.map((it) => {
    // product_id is BIGINT → coerce to number
    const productIdNum = Number(it.productId);
    return {
      productId: Number.isFinite(productIdNum) ? productIdNum : NaN, // will be validated
      // variant_id is UUID or null → do not coerce to String blindly
      variantId: it.variantId != null ? it.variantId : null,
      name: it.name,
      priceCents: Number(it.priceCents) || 0,
      qty: Number(it.qty) || 0,
      imageUrl: it.imageUrl ?? null,
      attributes: it.attributes ?? null,
    };
  });

  const subtotalCents = normalized.reduce((sum, it) => sum + it.priceCents * it.qty, 0);

  return { normalized, subtotalCents };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      buyerEmail,
      shipping,
      items,
      currency = "eur",
    }: {
      userId?: string;          // uuid if present
      buyerEmail: string;
      shipping: ShippingInfo;
      items: IncomingCartItem[];
      currency?: string;
    } = body;

    // Basic validations (friendly messages)
    if (!buyerEmail || typeof buyerEmail !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address for your receipt." },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty. Please add at least one item before checking out." },
        { status: 400 }
      );
    }
    if (!validateShipping(shipping)) {
      return NextResponse.json(
        { error: "Incomplete shipping details. Please fill in your name, address, city, postal code, and country." },
        { status: 400 }
      );
    }
    if (!isIsoCountry(shipping.country)) {
      return NextResponse.json(
        { error: "Invalid country. Please use a 2-letter ISO code (e.g. PT, US, GB)." },
        { status: 400 }
      );
    }

    // Normalize items & compute subtotal
    const { normalized, subtotalCents } = normalizeItems(items);

    // Schema-aware validations
    // product_id → bigint
    for (const it of normalized) {
      if (!Number.isFinite(it.productId) || it.productId <= 0) {
        return NextResponse.json(
          { error: "Invalid product in cart. Please remove it and try again." },
          { status: 400 }
        );
      }
      if (it.qty <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for "${it.name}".` },
          { status: 400 }
        );
      }
      if (it.priceCents <= 0) {
        return NextResponse.json(
          { error: `Invalid price for "${it.name}".` },
          { status: 400 }
        );
      }
      // variant_id → uuid or null
      if (it.variantId != null && !isUuid(it.variantId)) {
        return NextResponse.json(
          { error: `Invalid variant for "${it.name}". Please select another option.` },
          { status: 400 }
        );
      }
    }

    // user_id → uuid if provided (optional)
    if (userId != null && userId !== "" && !isUuid(userId)) {
      return NextResponse.json(
        { error: "Invalid session. Please sign in again and retry." },
        { status: 401 }
      );
    }

    if (subtotalCents <= 0) {
      return NextResponse.json(
        { error: "Cart total must be greater than zero." },
        { status: 400 }
      );
    }

    const currencyLower = String(currency).toLowerCase(); // e.g., "eur", "usd"

    // 1) Create order (pending)
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId ?? null, // uuid or null
        buyer_email: buyerEmail,
        receiver_first_name: shipping.firstName,
        receiver_last_name: shipping.lastName,
        address_line1: shipping.address1,
        address_line2: shipping.address2 ?? null,
        city: shipping.city,
        postal_code: shipping.postalCode,
        country: shipping.country.toUpperCase(), // Stripe expects ISO2 uppercase
        subtotal_cents: subtotalCents,
        currency: currencyLower,
        payment_status: "requires_payment",
        status: "pending",
      })
      .select("*")
      .single();

    if (orderErr || !order) {
      console.error("order insert error:", JSON.stringify(orderErr, null, 2));
      // Friendly message for customer, but keep server log detailed
      return NextResponse.json(
        { error: "Unable to create your order. Please try again in a moment." },
        { status: 500 }
      );
    }

    // 2) Insert order items
    const orderItems = normalized.map((it) => ({
      order_id: order.id,                   // uuid (FK)
      product_id: it.productId,             // bigint
      variant_id: it.variantId ?? null,     // uuid or null
      name: it.name,
      unit_price_cents: it.priceCents,
      qty: it.qty,
      image_url: it.imageUrl,
      attributes: it.attributes,
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) {
      console.error("order_items insert error:", JSON.stringify(itemsErr, null, 2));
      await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);
      return NextResponse.json(
        { error: "Unable to add items to your order. Please try again." },
        { status: 500 }
      );
    }

    // 3) Create Stripe PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount: subtotalCents,
      currency: currencyLower,
      receipt_email: buyerEmail,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: String(order.id),
        user_id: userId ?? "",
      },
      shipping: {
        name: `${shipping.firstName} ${shipping.lastName}`,
        address: {
          line1: shipping.address1,
          line2: shipping.address2 || undefined,
          city: shipping.city,
          postal_code: shipping.postalCode,
          country: shipping.country.toUpperCase(),
        },
      },
    });

    // 4) Save intent id on order
    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update({ stripe_payment_intent_id: intent.id })
      .eq("id", order.id);

    if (updErr) {
      console.error("order update intent id error:", JSON.stringify(updErr, null, 2));
      // Not fatal; continue
    }

    return NextResponse.json({
      orderId: order.id,
      clientSecret: intent.client_secret,
    });
  } catch (e: any) {
    console.error("checkout error:", e);
    const message =
      typeof e?.message === "string" ? e.message : "Unexpected server error";
    // Customer-friendly fallback
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your payment. Please try again." },
      { status: 500 }
    );
  }
}
