"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/catalog";
import { track } from "@/lib/analytics";

const STANDARD_SHIPPING = 24.99;
const FREE_SHIPPING_THRESHOLD = 499;

function getShipping(subtotal: number) {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return STANDARD_SHIPPING;
}

export function CheckoutPageClient() {
  const { lines, mounted, itemCount, subtotal } = useCart();
  const shipping = getShipping(subtotal);
  const total = subtotal + shipping;

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
            <h1 className="mt-2 text-4xl font-black tracking-tight">Secure checkout handoff</h1>
            <p className="mt-2 max-w-2xl text-white/68">
              Cart is production-ready. This screen is the clean handoff point for Stripe or another payment provider once credentials are connected.
            </p>
          </div>
          <Link href="/cart" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10">
            Back to cart
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
          {["1. Cart", "2. Shipping", "3. Payment", "4. Review"].map((step, index) => (
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
                <h2 className="text-lg font-black">Shipping contact</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    "Email",
                    "Phone",
                    "First name",
                    "Last name",
                    "Address",
                    "City",
                    "State",
                    "ZIP code",
                  ].map((label) => (
                    <label key={label} className={label === "Address" ? "md:col-span-2" : ""}>
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/45">{label}</span>
                      <input
                        className="mt-1 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-fatman-accent"
                        placeholder={label}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-400/25 bg-amber-400/10 p-5">
                <h2 className="text-lg font-black text-amber-100">Payment provider not connected yet</h2>
                <p className="mt-2 text-sm leading-relaxed text-amber-50/80">
                  I’m not faking payment collection. The next real project is connecting Stripe Checkout, creating order records, and sending confirmation emails. This page is ready to hand the cart to that flow.
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
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-black">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => track("begin_checkout", { item_count: itemCount, total, blocked: "payment_provider_not_connected" })}
                className="mt-6 w-full cursor-not-allowed rounded-xl bg-white/15 px-5 py-3 text-center text-sm font-black text-white/45"
                disabled
              >
                Connect Stripe to continue
              </button>
              <p className="mt-3 text-xs leading-relaxed text-white/50">
                Cart UX is done; real payment needs provider credentials and order persistence.
              </p>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
