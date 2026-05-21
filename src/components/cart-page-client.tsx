"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/cart-provider";
import { getProductDisplayMedia } from "@/lib/catalog-media";
import { formatPrice } from "@/lib/catalog";
import { track } from "@/lib/analytics";

const FREE_SHIPPING_THRESHOLD = 499;
const STANDARD_SHIPPING = 24.99;

function getShipping(subtotal: number) {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return STANDARD_SHIPPING;
}

function CheckoutStepper() {
  return (
    <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
      {["1. Cart", "2. Shipping", "3. Payment", "4. Review"].map((step, index) => (
        <span
          key={step}
          className={`rounded-full border px-3 py-1 ${
            index === 0 ? "border-fatman-accent bg-fatman-accent/20 text-white" : "border-white/15 bg-white/5"
          }`}
        >
          {step}
        </span>
      ))}
    </div>
  );
}

export function CartPageClient() {
  const { lines, mounted, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const shipping = getShipping(subtotal);
  const total = subtotal + shipping;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const recommended = useMemo(() => {
    const categories = new Set(lines.map((line) => line.product.category));
    return Array.from(categories).slice(0, 2);
  }, [lines]);

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
    <div className="min-h-screen bg-fatman-900 text-white pt-28 lg:pt-32">
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fatman-accent">Fatman checkout</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Your cart</h1>
            <p className="mt-2 max-w-2xl text-white/68">
              Review fitment-critical parts before checkout. Quantities, shipping estimate, and totals stay saved on this device.
            </p>
          </div>
          <Link href="/category" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10">
            Keep shopping
          </Link>
        </div>

        <CheckoutStepper />

        {lines.length === 0 ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">Nothing here yet</p>
                <h2 className="mt-3 text-3xl font-black">Build the order first.</h2>
                <p className="mt-3 max-w-xl text-white/65">
                  Add verified-fit parts from a category or product page. The cart will remember quantities and keep the checkout path ready.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/category" className="rounded-lg bg-fatman-accent px-5 py-3 text-sm font-bold text-fatman-900 hover:bg-fatman-accent-hover">
                    Shop categories
                  </Link>
                  <Link href="/fitment-help" className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10">
                    Need fitment help?
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 p-5">
                <p className="font-bold">Cart flow is ready for:</p>
                <ul className="mt-4 space-y-3 text-sm text-white/65">
                  <li>• Persistent local cart</li>
                  <li>• Quantity controls</li>
                  <li>• Secure checkout handoff</li>
                  <li>• Fitment support prompts before payment</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {freeShippingRemaining > 0 ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span>{formatPrice(freeShippingRemaining)} away from free shipping</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-fatman-accent" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="font-semibold text-emerald-200">Free shipping unlocked on this order.</p>
                )}
              </div>

              {lines.map((line) => {
                const media = getProductDisplayMedia(line.product);
                return (
                  <article key={line.product.slug} className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.045] p-4 shadow-xl shadow-black/10">
                    <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
                      <Link href={`/product/${line.product.slug}`} className="relative h-28 overflow-hidden rounded-xl bg-fatman-700/70">
                        {media.src ? (
                          <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="112px" />
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,106,0,0.24),_transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]" />
                        )}
                      </Link>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider text-white/45">{line.product.brand}</p>
                            <Link href={`/product/${line.product.slug}`} className="mt-1 block font-bold text-white hover:text-fatman-accent">
                              {line.product.name}
                            </Link>
                            <p className="mt-1 text-xs text-white/50">SKU {line.product.sku}</p>
                          </div>
                          <p className="text-lg font-black">{formatPrice(line.product.price * line.quantity)}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex overflow-hidden rounded-lg border border-white/15 bg-black/15">
                            <button
                              onClick={() => updateQuantity(line.product.slug, line.quantity - 1)}
                              className="px-3 py-2 text-white/75 hover:bg-white/10"
                              aria-label={`Decrease ${line.product.name} quantity`}
                            >
                              −
                            </button>
                            <span className="min-w-12 border-x border-white/10 px-4 py-2 text-center text-sm font-bold">{line.quantity}</span>
                            <button
                              onClick={() => updateQuantity(line.product.slug, line.quantity + 1)}
                              className="px-3 py-2 text-white/75 hover:bg-white/10"
                              aria-label={`Increase ${line.product.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-white/55">{formatPrice(line.product.price)} each</span>
                            <button onClick={() => removeItem(line.product.slug)} className="font-semibold text-red-200 hover:text-red-100">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              <button onClick={clearCart} className="text-sm font-semibold text-white/45 hover:text-white/75">
                Clear cart
              </button>
            </div>

            <aside className="h-fit rounded-3xl border border-white/12 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 lg:sticky lg:top-24">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Order summary</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/65">Items ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/65">Estimated shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/65">Estimated tax</span>
                  <span>Calculated next</span>
                </div>
                <div className="border-t border-white/15 pt-4">
                  <div className="flex items-center justify-between text-xl font-black">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">Before taxes and final carrier quote.</p>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => track("begin_checkout", { item_count: itemCount, total })}
                className="mt-6 block rounded-xl bg-fatman-accent px-5 py-3 text-center text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover"
              >
                Continue to checkout
              </Link>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4 text-xs leading-relaxed text-white/60">
                <p className="font-semibold text-white/80">Before you pay:</p>
                <p className="mt-1">If fitment is uncertain, use VIN help first. Wrong automotive parts can be hard to return once ordered.</p>
                <Link href="/fitment-help" className="mt-3 inline-block font-semibold text-fatman-accent hover:text-fatman-accent-hover">
                  Verify fitment →
                </Link>
              </div>

              {recommended.length > 0 && (
                <div className="mt-4 text-xs text-white/45">
                  Related categories: {recommended.map((category) => category.replace(/-/g, " ")).join(", ")}
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
