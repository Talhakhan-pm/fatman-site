"use client";

import Image from "next/image";
import { useEffect } from "react";
import { FitmentBadge } from "@/components/fitment-badge";
import { useGarage } from "@/components/garage-provider";
import { StickyFitmentBar } from "@/components/sticky-fitment-bar";
import { getFitmentState } from "@/lib/fitment";
import { formatPrice, type Product } from "@/lib/mock-data";
import { track } from "@/lib/analytics";
import { getProductDisplayMedia } from "@/lib/catalog-media";

export function ProductPageClient({ product }: { product: Product }) {
  const { vehicle } = useGarage();
  const fitment = getFitmentState(product.slug, vehicle);
  const media = getProductDisplayMedia(product);

  useEffect(() => {
    track("view_item", { slug: product.slug, price: product.price });
  }, [product]);

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <StickyFitmentBar />
      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="relative h-80 overflow-hidden rounded-xl bg-fatman-700/60">
            {media.src ? (
              <>
                <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,106,0,0.22),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]" />
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative h-16 overflow-hidden rounded-md border border-white/10 bg-fatman-700/50">
                {media.src ? (
                  <Image src={media.src} alt={`${media.alt} detail ${i + 1}`} fill className="object-cover" sizes="120px" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,106,0,0.18),rgba(255,255,255,0.04))]" />
                )}
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-white/60">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-black">{product.name}</h1>
          <p className="mt-2 text-white/70">{product.shortDescription}</p>
          <div className="mt-4">
            <FitmentBadge state={fitment} />
          </div>

          <p className="mt-4 text-white/75">
            {fitment === "fits"
              ? "Confirmed fit for your selected vehicle."
              : fitment === "no-fit"
                ? "This part doesn't match your selected vehicle."
                : "Close match — verify with VIN before checkout. VIN check beats regret."}
          </p>
          <button
            onClick={() => track("vin_verify_clicked", { slug: product.slug })}
            className="mt-3 rounded-lg border border-white/20 px-3 py-2 text-sm text-white/85"
          >
            Verify with VIN
          </button>

          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm text-white/70">Estimated Dispatch</p>
            <p className="mt-1 text-lg font-bold">Ships in 24–48 hours</p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <p className="text-3xl font-black">{formatPrice(product.price)}</p>
            <button
              onClick={() => track("add_to_cart", { slug: product.slug, price: product.price, source: "pdp" })}
              className="rounded-lg bg-fatman-accent px-5 py-3 text-sm font-semibold transition hover:bg-fatman-accent-hover"
            >
              Add to Cart
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/70">
            <p>• Easy returns on eligible orders</p>
            <p>• Support that actually responds</p>
            <p>• Fast U.S. dispatch network</p>
          </div>

          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">Specifications</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p className="text-white/60">SKU</p>
              <p>{product.sku}</p>
              <p className="text-white/60">OEM Part #</p>
              <p>{product.oemPartNumber || "—"}</p>
              <p className="text-white/60">Shipping Class</p>
              <p className="capitalize">{product.shippingClass || "ground"}</p>
              <p className="text-white/60">Warranty</p>
              <p>{product.warrantyDays ? `${product.warrantyDays} days` : "—"}</p>
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-white/10 bg-fatman-900/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-lg font-black">{formatPrice(product.price)}</p>
          <button
            onClick={() => track("add_to_cart", { slug: product.slug, price: product.price, source: "pdp_sticky" })}
            className="rounded-lg bg-fatman-accent px-4 py-2 text-sm font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
