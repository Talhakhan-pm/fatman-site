"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/use-cart";
import { getProductDisplayMedia } from "@/lib/catalog-media";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, itemCount } = useCart();

  const shipping = items.length > 0 ? 24.99 : 0;
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tight">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-xl text-white/50">Your cart is empty.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-lg bg-fatman-accent px-8 py-3 font-bold transition hover:bg-fatman-accent-hover">
              Browse Parts
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
              {[
                "1. Cart",
                "2. Shipping",
                "3. Payment",
                "4. Review",
              ].map((step, idx) => (
                <span
                  key={step}
                  className={`rounded-full border px-3 py-1 ${
                    idx === 0 ? "border-fatman-accent bg-fatman-accent/20 text-white" : "border-white/10"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_350px]">
              <div className="space-y-4">
                {items.map((item) => {
                  const media = getProductDisplayMedia(item);
                  return (
                    <article key={item.slug} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-fatman-800">
                        {media.src && (
                          <Image src={media.src} alt={media.alt} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link href={`/product/${item.slug}`} className="font-bold hover:text-fatman-accent">
                              {item.name}
                            </Link>
                            <p className="text-xs uppercase tracking-wider text-white/40">{item.brand}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.slug)}
                            className="text-white/20 hover:text-red-400 transition"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <select
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.slug, parseInt(e.target.value))}
                              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm outline-none focus:border-fatman-accent/50"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>Qty: {n}</option>
                              ))}
                            </select>
                          </div>
                          <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="space-y-6">
                <div className="rounded-xl border border-white/15 bg-white/5 p-6">
                  <h2 className="text-lg font-bold uppercase tracking-tight">Order summary</h2>
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Subtotal</span>
                      <span className="font-mono">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Shipping</span>
                      <span className="font-mono">{formatPrice(shipping)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 text-lg font-black">
                      <span>Total</span>
                      <span className="font-mono text-fatman-accent">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      track("begin_checkout", { item_count: itemCount, total });
                      alert("Checkout is currently a demo. Thanks for looking!");
                    }}
                    className="mt-8 w-full rounded-lg bg-fatman-accent py-4 font-black uppercase tracking-wider text-white shadow-lg shadow-fatman-accent/20 transition hover:bg-fatman-accent-hover active:scale-[0.98]"
                  >
                    Checkout Now
                  </button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50 space-y-3">
                  <p className="flex items-center gap-3 italic">
                    <span className="text-emerald-400">✓</span> Fast U.S. Shipping
                  </p>
                  <p className="flex items-center gap-3 italic">
                    <span className="text-emerald-400">✓</span> Secure Checkout
                  </p>
                  <p className="flex items-center gap-3 italic">
                    <span className="text-emerald-400">✓</span> Fitment Guaranteed
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
