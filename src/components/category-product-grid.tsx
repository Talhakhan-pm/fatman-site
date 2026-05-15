"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import { useFitmentBatch } from "@/components/use-fitment";
import type { Product } from "@/lib/catalog";

export function CategoryProductGrid({ products }: { products: Product[] }) {
  const { vehicle } = useGarage();
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [oemOnly, setOemOnly] = useState(false);
  const [verifiedFitOnly, setVerifiedFitOnly] = useState(false);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc">("relevance");

  const slugs = useMemo(() => products.map((p) => p.slug), [products]);
  const fitments = useFitmentBatch(slugs, vehicle);

  const filtered = useMemo(() => {
    let rows = [...products];

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (inStockOnly) rows = rows.filter((p) => p.stock === "in-stock");
    if (oemOnly) rows = rows.filter((p) => p.brand.toLowerCase().includes("oem"));
    if (verifiedFitOnly) rows = rows.filter((p) => fitments[p.slug] === "fits");

    if (sort === "price-asc") rows.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") rows.sort((a, b) => b.price - a.price);

    return rows;
  }, [products, search, inStockOnly, oemOnly, verifiedFitOnly, sort, fitments]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search within these results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-fatman-accent/50 focus:ring-1 focus:ring-fatman-accent/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
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
      </div>
    </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="mb-3 text-sm text-white/65">{filtered.length} products</div>
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
