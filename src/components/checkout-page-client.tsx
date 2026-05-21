"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { FREE_SHIPPING_THRESHOLD_CENTS, getShippingCents, fromCents, toCents } from "@/lib/checkout";
import { formatPrice } from "@/lib/catalog";
import { track } from "@/lib/analytics";

type CheckoutResponse = {
  ok?: boolean;
  url?: string;
  orderNumber?: string;
  error?: string;
  details?: string;
  missingSlugs?: string[];
};

type CheckoutForm = {
  email: string;
  name: string;
  phone: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-fatman-accent";

export function CheckoutPageClient() {
  const { lines, mounted, itemCount, subtotal } = useCart();
  const [form, setForm] = useState<CheckoutForm>({ email: "", name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotalCents = toCents(subtotal);
  const shippingCents = getShippingCents(subtotalCents);
  const total = fromCents(subtotalCents + shippingCents);
  const freeShippingRemaining = Math.max(0, fromCents(FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents));

  const checkoutLines = useMemo(
    () => lines.map((line) => ({ slug: line.product.slug, quantity: line.quantity })),
    [lines],
  );

  async function startCheckout() {
    setError(null);
    setIsSubmitting(true);
    track("begin_checkout", { item_count: itemCount, total });

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: checkoutLines,
          customer: {
            email: form.email,
            name: form.name,
            phone: form.phone,
          },
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok || !payload.url) {
        const missing = payload.missingSlugs?.length
          ? ` Missing products: ${payload.missingSlugs.join(", ")}.`
          : "";
        throw new Error(`${payload.error ?? "Checkout could not start"}${missing}`);
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not start");
      setIsSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-fatman-900 text-white">
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fatman-accent">Checkout</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Secure checkout</h1>
            <p className="mt-2 max-w-2xl text-white/68">
              Pay safely through Stripe. We verify live product pricing before sending you to payment.
            </p>
          </div>
          <Link href="/cart" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10">
            Back to cart
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
          {["1. Cart", "2. Details", "3. Stripe payment", "4. Confirmation"].map((step, index) => (
            <span
              key={step}
              className={`rounded-full border px-3 py-1 ${
                index === 1 ? "border-fatman-accent bg-fatman-accent/20 text-white" : "border-white/15 bg-white/5"
              }`}
            >
              {step}
            </span>
          ))}
        </div>

        {lines.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-black">Your cart is empty.</h2>
            <p className="mt-2 text-white/65">Add parts before starting checkout.</p>
            <Link href="/category" className="mt-6 inline-block rounded-lg bg-fatman-accent px-5 py-3 text-sm font-bold text-fatman-900 hover:bg-fatman-accent-hover">
              Shop categories
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/12 bg-white/[0.055] p-5">
                <h2 className="text-lg font-black">Contact details</h2>
                <p className="mt-1 text-sm text-white/60">
                  Stripe will collect the final shipping address. These details help us attach the order to support and CRM.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/45">Email</span>
                    <input
                      className={inputClass}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    />
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/45">Phone</span>
                    <input
                      className={inputClass}
                      type="tel"
                      autoComplete="tel"
                      placeholder="(555) 000-0000"
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/45">Name</span>
                    <input
                      className={inputClass}
                      autoComplete="name"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-5">
                <h2 className="text-lg font-black text-emerald-100">Production checkout path</h2>
                <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">
                  This creates a pending order, sends the customer to Stripe Checkout, and marks payment through a signed Stripe webhook.
                  CRM sync is intentionally staged next so Rails stays the operations back office.
                </p>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-white/12 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 lg:sticky lg:top-24">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Order summary</p>
              <div className="mt-5 space-y-4">
                {lines.map((line) => (
                  <div key={line.product.slug} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold line-clamp-2">{line.product.name}</p>
                      <p className="mt-1 text-xs text-white/45">Qty {line.quantity}</p>
                    </div>
                    <span>{formatPrice(line.product.price * line.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-white/15 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/65">Items ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/65">Estimated shipping</span>
                  <span>{shippingCents === 0 ? "Free" : formatPrice(fromCents(shippingCents))}</span>
                </div>
                {freeShippingRemaining > 0 && (
                  <p className="rounded-lg border border-white/10 bg-black/10 p-3 text-xs text-white/55">
                    Add {formatPrice(freeShippingRemaining)} more for free shipping.
                  </p>
                )}
                <div className="flex items-center justify-between text-xl font-black">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {error && <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}

              <button
                onClick={startCheckout}
                className="mt-6 w-full rounded-xl bg-fatman-accent px-5 py-3 text-center text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting || lines.length === 0}
              >
                {isSubmitting ? "Starting secure checkout…" : "Pay with Stripe"}
              </button>
              <p className="mt-3 text-xs leading-relaxed text-white/50">
                Final tax, address validation, and payment collection happen inside Stripe Checkout.
              </p>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
