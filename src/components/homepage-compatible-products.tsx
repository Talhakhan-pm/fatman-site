"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import { catalogRegistry } from "@/lib/catalog-registry";
import { humanizeCategorySlug } from "@/lib/category-display";
import { resolveTopLevelCategorySlug } from "@/lib/category-taxonomy";
import { formatCompactVehicleLabel, type FitmentState } from "@/lib/fitment-lite";
import { buildFitsHref } from "@/lib/fits-link";
import type { Product } from "@/lib/catalog";

type CompatibleProduct = Product & {
  fitment: Exclude<FitmentState, "no-fit">;
};

const SECTION_LIMIT = 6;

function resolveCategoryTitle(slug: string) {
  return catalogRegistry.find((entry) => entry.slug === slug)?.title ?? humanizeCategorySlug(slug);
}

export function HomepageCompatibleProducts() {
  const { vehicle } = useGarage();
  const [products, setProducts] = useState<CompatibleProduct[]>([]);
  const [loadedVehicleKey, setLoadedVehicleKey] = useState("");
  const vehicleKey = vehicle ? JSON.stringify(vehicle) : "";

  useEffect(() => {
    if (!vehicle) return;

    const controller = new AbortController();

    fetch("/api/discovery/compatible-products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vehicle, limit: SECTION_LIMIT }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { products?: CompatibleProduct[] } | null) => {
        if (controller.signal.aborted) return;
        setProducts((payload?.products ?? []).filter((product) => product.fitment === "fits"));
        setLoadedVehicleKey(vehicleKey);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string } | null)?.name === "AbortError") return;
        setProducts([]);
        setLoadedVehicleKey(vehicleKey);
      });

    return () => controller.abort();
  }, [vehicle, vehicleKey]);

  const categoryLinks = useMemo(() => {
    // Products carry granular CHARM slugs; the storefront only has pages for
    // the 17 top-level categories, so roll up before linking.
    const counts = new Map<string, number>();
    for (const product of products) {
      const topLevel = resolveTopLevelCategorySlug(product.category);
      counts.set(topLevel, (counts.get(topLevel) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug, count]) => ({ slug, count, title: resolveCategoryTitle(slug) }));
  }, [products]);

  if (!vehicle) return null;

  const vehicleLabel = formatCompactVehicleLabel(vehicle);
  const isLoading = loadedVehicleKey !== vehicleKey;

  return (
    <section className="relative bg-[#15181f] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="rounded-[28px] border border-white/[0.08] bg-[#1a1d24] p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2">
                <span className="h-[2px] w-8 bg-[#ff6a00]" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#ff6a00]">YOUR VEHICLE</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Compatible Products for <span className="text-[#ff6a00]">{vehicleLabel}</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
                Confirmed-fit products for your selected vehicle, pulled from the live catalog instead of generic homepage filler.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categoryLinks.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}?fitsOnly=1`}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-[#ff6a00]/35 hover:text-white"
                >
                  {category.title} · {category.count}
                </Link>
              ))}
              <Link
                href={buildFitsHref(vehicle)}
                className="rounded-full border border-[#ff6a00]/40 bg-[#ff6a00]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#ff6a00] transition hover:bg-[#ff6a00]/20"
              >
                See all parts that fit →
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
              ))}
            </div>
          ) : products.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} fitmentState="fits" />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
              No confirmed homepage matches yet for {vehicleLabel}. Try browsing categories or refine the vehicle details to surface more exact fits.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
