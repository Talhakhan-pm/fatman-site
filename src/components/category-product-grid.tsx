"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 60;

  // Reset page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [inStockOnly, verifiedFitOnly, sort, vehicle]);

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

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (i === 2 || i === totalPages - 1) {
        pages.push("...");
      }
    }

    return pages.filter((item, index) => {
      if (item === "...") {
        return pages[index - 1] !== "...";
      }
      return true;
    });
  };

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
          <div className="flex items-center justify-between">
            <div>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
            </div>
            {totalPages > 1 && (
              <div className="text-xs text-white/40">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
          {vehicle ? (
            <div className="text-xs text-white/60">
              Showing best matches for {formatCompactVehicleLabel(vehicle)}. {fitCount} confirmed fits in this view.
            </div>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              fitmentState={fitments[product.slug]}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.05] pt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-10 items-center justify-center border border-white/10 bg-white/5 px-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-20 disabled:pointer-events-none active:scale-95"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-10 w-10 items-center justify-center font-mono text-sm text-white/30"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(Number(pageNum))}
                    className={`flex h-10 w-10 items-center justify-center border font-mono text-sm transition-all active:scale-90 ${currentPage === pageNum
                        ? "border-[#ff6a00] bg-[#ff6a00] text-white font-black shadow-[0_0_20px_rgba(255,106,0,0.25)]"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-10 items-center justify-center border border-white/10 bg-white/5 px-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-20 disabled:pointer-events-none active:scale-95"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </>
  );
}
