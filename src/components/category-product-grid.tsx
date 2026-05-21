"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import { useFitmentBatch } from "@/components/use-fitment";
import type { Product } from "@/lib/catalog";
import { formatCompactVehicleLabel, type FitmentState } from "@/lib/fitment";

const FITMENT_SORT_RANK: Record<FitmentState, number> = {
  fits: 0,
  verify: 1,
  "no-fit": 2,
};

export function CategoryProductGrid({ products }: { products: Product[] }) {
  const { vehicle } = useGarage();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [verifiedFitOnly, setVerifiedFitOnly] = useState(false);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc">("relevance");

  const slugs = useMemo(() => products.map((p) => p.slug), [products]);
  const fitments = useFitmentBatch(slugs, vehicle);

  const filtered = useMemo(() => {
    let rows = [...products];

    if (inStockOnly) rows = rows.filter((p) => p.stock === "in-stock");
    if (verifiedFitOnly) rows = rows.filter((p) => fitments[p.slug] === "fits");

    if (sort === "relevance") {
      if (vehicle) {
        rows.sort((a, b) => {
          const fitmentDelta = FITMENT_SORT_RANK[fitments[a.slug]] - FITMENT_SORT_RANK[fitments[b.slug]];
          if (fitmentDelta !== 0) return fitmentDelta;
          return a.name.localeCompare(b.name);
        });
      }
    } else if (sort === "price-asc") {
      rows.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      rows.sort((a, b) => b.price - a.price);
    }

    return rows;
  }, [products, inStockOnly, verifiedFitOnly, sort, fitments, vehicle]);

  const fitCount = filtered.filter((product) => fitments[product.slug] === "fits").length;

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button onClick={() => setInStockOnly((v) => !v)} className={`rounded-full border px-4 py-1.5 font-semibold transition hover:-translate-y-px ${inStockOnly ? "border-fatman-accent bg-fatman-accent/10 text-fatman-accent" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}>
            In Stock
          </button>
          <button onClick={() => setVerifiedFitOnly((v) => !v)} className={`rounded-full border px-4 py-1.5 font-semibold transition hover:-translate-y-px ${verifiedFitOnly ? "border-fatman-accent bg-fatman-accent/10 text-fatman-accent" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}>
            Fits Only
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "relevance" | "price-asc" | "price-desc")}
            className="ml-auto rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-semibold text-white/80 transition hover:bg-white/10 focus:border-fatman-accent focus:outline-none focus:ring-1 focus:ring-fatman-accent"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="mb-3 space-y-1 text-sm text-white/65">
          <div>{filtered.length} products</div>
          {vehicle ? (
            <div className="text-xs text-white/60">
              Showing best matches for {formatCompactVehicleLabel(vehicle)}. {fitCount} confirmed fits in this view.
            </div>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              fitmentState={fitments[product.slug]}
            />
          ))}
        </div>
      </section>
    </>
  );
}
