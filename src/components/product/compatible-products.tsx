"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import type { Product } from "@/lib/catalog";
import type { FitmentState } from "@/lib/fitment";

type Status = "idle" | "loading" | "done";

type CompatibleProduct = Product & {
  fitment: Exclude<FitmentState, "no-fit">;
};

const SECTION_LIMIT = 8;

export function CompatibleProducts({
  currentSlug,
  categorySlug,
}: {
  currentSlug: string;
  categorySlug: string;
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

  if (!vehicle) return null;
  if (status !== "done") return null;

  const fits = products.filter((item) => item.fitment === "fits");
  if (!fits.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-14">
      <div className="mb-5 flex items-end justify-between">
        <h3 className="text-2xl font-bold">Also fits your vehicle</h3>
        <p className="text-sm text-white/60">
          Same category. Verified fitment for your selected vehicle.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fits.map((product) => (
          <ProductCard key={product.slug} product={product} fitmentState="fits" />
        ))}
      </div>
    </section>
  );
}
