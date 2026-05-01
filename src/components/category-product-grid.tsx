"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import { getFitmentState } from "@/lib/fitment";
import type { Product } from "@/lib/catalog";

export function CategoryProductGrid({ products }: { products: Product[] }) {
  const { vehicle } = useGarage();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [oemOnly, setOemOnly] = useState(false);
  const [verifiedFitOnly, setVerifiedFitOnly] = useState(false);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc">("relevance");

  const filtered = useMemo(() => {
    let rows = [...products];

    if (inStockOnly) rows = rows.filter((p) => p.stock === "in-stock");
    if (oemOnly) rows = rows.filter((p) => p.brand.toLowerCase().includes("oem"));
    if (verifiedFitOnly) rows = rows.filter((p) => getFitmentState(p.slug, vehicle) === "fits");

    if (sort === "price-asc") rows.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") rows.sort((a, b) => b.price - a.price);

    return rows;
  }, [products, inStockOnly, oemOnly, verifiedFitOnly, sort, vehicle]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button onClick={() => setInStockOnly((v) => !v)} className={`rounded-full border px-3 py-1.5 transition ${inStockOnly ? "border-fatman-accent bg-fatman-accent/20 text-white" : "border-white/15 bg-white/5 text-white/80"}`}>
            In Stock
          </button>
          <button onClick={() => setOemOnly((v) => !v)} className={`rounded-full border px-3 py-1.5 transition ${oemOnly ? "border-fatman-accent bg-fatman-accent/20 text-white" : "border-white/15 bg-white/5 text-white/80"}`}>
            OEM
          </button>
          <button onClick={() => setVerifiedFitOnly((v) => !v)} className={`rounded-full border px-3 py-1.5 transition ${verifiedFitOnly ? "border-fatman-accent bg-fatman-accent/20 text-white" : "border-white/15 bg-white/5 text-white/80"}`}>
            Verified Fit
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "relevance" | "price-asc" | "price-desc")}
            className="ml-auto rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="mb-3 text-sm text-white/65">{filtered.length} products</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
