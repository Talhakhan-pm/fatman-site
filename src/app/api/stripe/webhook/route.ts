import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing env: STRIPE_SECRET_KEY");
  return new Stripe(secretKey);
}

async function updateOrderFromSession(session: Stripe.Checkout.Session) {
  const storefrontOrderId = session.metadata?.storefrontOrderId;
  if (!storefrontOrderId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  const paid = session.payment_status === "paid";
  const expired = session.status === "expired";

  const update = {
    status: paid ? "paid" : expired ? "canceled" : "pending_payment",
    payment_status: paid ? "paid" : "unpaid",
    stripe_payment_status: session.payment_status,
    stripe_payment_intent_id: paymentIntentId ?? null,
    stripe_customer_id: customerId ?? null,
    customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    customer_phone: session.customer_details?.phone ?? null,
    customer_name: session.customer_details?.name ?? null,
    paid_at: paid ? new Date().toISOString() : null,
    canceled_at: expired ? new Date().toISOString() : null,
    metadata: {
      stripeSessionStatus: session.status,
      shipping: session.customer_details?.address ?? null,
    },
  };

  const supabase = createSupabaseAdminClient();
  await supabase.from("storefront_orders").update(update).eq("id", storefrontOrderId);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing env: STRIPE_WEBHOOK_SECRET" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature", details: error instanceof Error ? error.message : "Unknown signature error" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.expired":
        await updateOrderFromSession(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const storefrontOrderId = session.metadata?.storefrontOrderId;
        if (storefrontOrderId) {
          const supabase = createSupabaseAdminClient();
          await supabase
            .from("storefront_orders")
            .update({
              status: "payment_failed",
              payment_status: "failed",
              stripe_payment_status: session.payment_status,
            })
            .eq("id", storefrontOrderId);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook handler failed", details: error instanceof Error ? error.message : "Unknown webhook error" },
      { status: 500 },
    );
  }
}
