
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const payload = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = (intent.metadata?.order_id as string) ?? null;
        const userId = (intent.metadata?.user_id as string) ?? null; // <-- ensure your checkout sets this
        const chargeId = (intent.latest_charge as string) ?? null;

        if (orderId) {
          const { data: order, error } = await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "succeeded",
              status: "paid",
              stripe_charge_id: chargeId,
            })
            .eq("id", orderId)
            .select("*")
            .single();

          if (error) {
            console.error("orders update error:", error);
          } else {
            // 🔹 Upsert profile only if we know the user (skip for guests)
            if (userId && userId.trim() !== "") {
              const fullName = `${order?.receiver_first_name ?? ""} ${order?.receiver_last_name ?? ""}`.trim();

              const { error: upsertErr } = await supabaseAdmin
                .from("profiles")
                .upsert(
                  {
                    user_id: userId,
                    email: order?.buyer_email ?? null,
                    full_name: fullName || null,
                    address_line1: order?.address_line1 ?? null,
                    address_line2: order?.address_line2 ?? null,
                    city: order?.city ?? null,
                    postal_code: order?.postal_code ?? null,
                    country: order?.country ?? null,
                    // phone: order?.receiver_phone ?? null, // add if you store it on orders
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id" } // idempotent insert/update
                );

              if (upsertErr) console.error("profiles upsert error:", upsertErr);
            }

            // Optional email (you already had this)
            if (order?.buyer_email && resend) {
              try {
                await resend.emails.send({
                  from: "Store <orders@yourdomain.com>",
                  to: order.buyer_email,
                  subject: `Order ${order.id} confirmed`,
                  html: `
                    <h2>Obrigado pela compra!</h2>
                    <p>Seu pedido <strong>${order.id}</strong> foi confirmado.</p>
                    <p>Total: €${(order.subtotal_cents / 100).toFixed(2)}</p>
                  `,
                });
              } catch (e) {
                console.error("Email send error:", e);
              }
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = (intent.metadata?.order_id as string) ?? null;
        if (orderId) {
          await supabaseAdmin
            .from("orders")
            .update({ payment_status: "failed", status: "pending" })
            .eq("id", orderId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
