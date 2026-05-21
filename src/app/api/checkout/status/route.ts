import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

type OrderStatusRow = {
  order_number: string;
  status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  stripe_payment_status: string | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("storefront_orders")
      .select("order_number, status, payment_status, total_cents, currency, stripe_payment_status, created_at")
      .eq("stripe_checkout_session_id", sessionId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Order not found", details: error?.message ?? "No matching checkout session" },
        { status: 404 },
      );
    }

    const order = data as OrderStatusRow;
    return NextResponse.json({
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      stripePaymentStatus: order.stripe_payment_status,
      totalCents: order.total_cents,
      currency: order.currency,
      createdAt: order.created_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not load order status", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
