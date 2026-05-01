"use client";

import Link from "next/link";
import { products, formatPrice } from "@/lib/catalog";
import { track } from "@/lib/analytics";

export default function CartPage() {
  const cartItems = products.slice(0, 2);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 24.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-black">Cart</h1>
        <p className="mt-2 text-white/70">Mock checkout preview.</p>

        <div className="mt-4 flex gap-2 text-xs text-white/70">
          {[
            "1. Cart",
            "2. Shipping",
            "3. Payment",
            "4. Review",
          ].map((step, idx) => (
            <span
              key={step}
              className={`rounded-full border px-3 py-1 ${
                idx === 0 ? "border-fatman-accent bg-fatman-accent/20 text-white" : "border-white/15"
              }`}
            >
              {step}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <article key={item.slug} className="rounded-xl border border-white/15 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/product/${item.slug}`} className="font-semibold">
                      {item.name}
                    </Link>
                    <p className="text-sm text-white/65">{item.brand}</p>
                    <p className="mt-2 font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <select className="rounded-md border border-white/15 bg-fatman-700 px-2 py-1 text-sm">
                    <option>Qty: 1</option>
                    <option>Qty: 2</option>
                    <option>Qty: 3</option>
                  </select>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm text-white/70">Order summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/15 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input placeholder="Promo code" className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm" />
              <button className="rounded-lg border border-white/20 px-3 text-sm">Apply</button>
            </div>

            <button
              onClick={() => track("begin_checkout", { item_count: cartItems.length, total })}
              className="mt-4 w-full rounded-lg bg-fatman-accent px-4 py-2 font-semibold"
            >
              Checkout
            </button>
            <p className="mt-2 text-xs text-white/60">Secure mock checkout • taxes calculated at next step</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
