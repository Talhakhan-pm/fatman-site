import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

type OrderStatusRow = {
  order_number: string;
  status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  stripe_payment_status: string | null;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
};

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

function toResponse(order: OrderStatusRow) {
  return {
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    stripePaymentStatus: order.stripe_payment_status,
    totalCents: order.total_cents,
    currency: order.currency,
    createdAt: order.created_at,
  };
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("storefront_orders")
      .select("order_number, status, payment_status, total_cents, currency, stripe_payment_status, stripe_payment_intent_id, stripe_customer_id, created_at")
      .eq("stripe_checkout_session_id", sessionId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Order not found", details: error?.message ?? "No matching checkout session" },
        { status: 404 },
      );
    }

    const order = data as OrderStatusRow;
    if (order.payment_status === "paid") {
      return NextResponse.json(toResponse(order));
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(toResponse(order));
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const expired = session.status === "expired";
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

    if (!paid && !expired && session.payment_status === order.stripe_payment_status) {
      return NextResponse.json(toResponse(order));
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from("storefront_orders")
      .update({
        status: paid ? "paid" : expired ? "canceled" : order.status,
        payment_status: paid ? "paid" : order.payment_status,
        stripe_payment_status: session.payment_status,
        stripe_payment_intent_id: paymentIntentId,
        stripe_customer_id: customerId,
        customer_email: session.customer_details?.email ?? session.customer_email ?? null,
        customer_phone: session.customer_details?.phone ?? null,
        customer_name: session.customer_details?.name ?? null,
        paid_at: paid ? new Date().toISOString() : null,
        canceled_at: expired ? new Date().toISOString() : null,
        metadata: {
          stripeSessionStatus: session.status,
          shipping: session.customer_details?.address ?? null,
          statusSource: "checkout_status_fallback",
        },
      })
      .eq("stripe_checkout_session_id", sessionId)
      .select("order_number, status, payment_status, total_cents, currency, stripe_payment_status, stripe_payment_intent_id, stripe_customer_id, created_at")
      .single();

    if (updateError || !updatedRows) {
      return NextResponse.json(toResponse(order));
    }

    return NextResponse.json(toResponse(updatedRows as OrderStatusRow));
  } catch (error) {
    return NextResponse.json(
      { error: "Could not load order status", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
