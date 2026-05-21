"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/catalog";
import { fromCents } from "@/lib/checkout";

type CheckoutStatus = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  stripePaymentStatus: string | null;
  totalCents: number;
  currency: string;
  createdAt: string;
};

export function CheckoutSuccessClient({ sessionId }: { sessionId?: string }) {
  const { clearCart, mounted } = useCart();
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const activeSessionId = sessionId;

    let canceled = false;

    async function loadStatus() {
      try {
        const response = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(activeSessionId)}`);
        const payload = (await response.json().catch(() => ({}))) as CheckoutStatus & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Could not load order status");
        if (!canceled) {
          setStatus(payload);
          clearCart();
        }
      } catch (checkoutError) {
        if (!canceled) setError(checkoutError instanceof Error ? checkoutError.message : "Could not load order status");
      }
    }

    loadStatus();
    return () => {
      canceled = true;
    };
  }, [clearCart, sessionId]);

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-8 shadow-2xl shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Payment received</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Your order is in.</h1>
          <p className="mt-3 text-white/72">
            Thanks for ordering from Fatman Parts. We’ll send confirmation and status updates once the back office picks this up.
          </p>

          {!sessionId && (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
              Stripe did not return a session id in the URL, so this page can’t show the order number yet.
            </div>
          )}

          {sessionId && !status && !error && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-white/70">
              Loading confirmation…
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
              {error}. If your card was charged, keep your Stripe receipt and contact help@fatmanparts.com.
            </div>
          )}

          {status && (
            <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">Order number</p>
                <p className="mt-1 text-lg font-black">{status.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">Total</p>
                <p className="mt-1 text-lg font-black">{formatPrice(fromCents(status.totalCents))}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">Payment</p>
                <p className="mt-1 font-semibold capitalize">{status.paymentStatus.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">Order status</p>
                <p className="mt-1 font-semibold capitalize">{status.status.replace(/_/g, " ")}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/category" className="rounded-xl bg-fatman-accent px-5 py-3 text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover">
              Keep shopping
            </Link>
            <Link href="/contact" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white/85 hover:bg-white/10">
              Contact support
            </Link>
          </div>
        </div>

        {mounted && <p className="mt-5 text-xs text-white/45">Your local cart has been cleared on successful confirmation.</p>}
      </section>
    </div>
  );
}
