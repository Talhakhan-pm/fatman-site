"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import type { Product } from "@/lib/catalog";
import { getSuppressedImageSlugs } from "@/lib/catalog-media";
import type { FitmentState } from "@/lib/fitment";

type Status = "idle" | "loading" | "done";

type CompatibleProduct = Product & {
  fitment: Exclude<FitmentState, "no-fit">;
};

const SECTION_LIMIT = 8;

export function CompatibleProducts({
  currentSlug,
  categorySlug,
  excludeImageSrc,
}: {
  currentSlug: string;
  categorySlug: string;
  /** The viewed product's own image — never echoed back in this rail. */
  excludeImageSrc?: string | null;
}) {
  const { vehicle } = useGarage();
  const [products, setProducts] = useState<CompatibleProduct[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!vehicle) {
      setProducts([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    fetch("/api/discovery/compatible-products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        vehicle,
        categorySlug,
        excludeSlug: currentSlug,
        limit: SECTION_LIMIT,
      }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { products?: CompatibleProduct[] } | null) => {
        if (controller.signal.aborted) return;
        setProducts(payload?.products ?? []);
        setStatus("done");
      })
      .catch((error: unknown) => {
        if ((error as { name?: string } | null)?.name === "AbortError") return;
        setProducts([]);
        setStatus("done");
      });

    return () => controller.abort();
  }, [vehicle, currentSlug, categorySlug]);

  const fits = useMemo(() => products.filter((item) => item.fitment === "fits"), [products]);
  // Grid dedup plus the viewed product's own image, which must never repeat here.
  const suppressedImages = useMemo(
    () => getSuppressedImageSlugs(fits, { blockedSrc: excludeImageSrc ?? null }),
    [fits, excludeImageSrc],
  );

  if (!vehicle) return null;
  if (status !== "done") return null;
  if (!fits.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-14">
      <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
        <div className="mb-5 space-y-1.5">
          <h3 className="text-2xl font-bold text-white">Also fits your vehicle</h3>
          <p className="max-w-2xl text-sm text-white/60">
            Same category, confirmed fit for your selected vehicle.
          </p>
        </div>
        <div className={fits.length === 1 ? "max-w-sm" : "fm-grid"}>
          {fits.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              fitmentState="fits"
              suppressPhoto={suppressedImages.has(product.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
