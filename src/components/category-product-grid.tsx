"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import { useFitmentBatch } from "@/components/use-fitment";
import type { Product } from "@/lib/catalog";
import { formatCompactVehicleLabel, type FitmentState } from "@/lib/fitment-lite";

/**
 * Category grid.
 *
 * Products are paged by the database, not the browser. This component used to
 * receive every product in the category and filter/sort/paginate in JS, which
 * meant a 5,000-product category serialised 5,000 products to render 60 — and
 * stopped working entirely as the catalog grew.
 *
 * The server renders page 1 for fast first paint; changing a filter, sort or
 * page re-queries. "Fits Only" is resolved in SQL against the selected vehicle
 * so it stays accurate across every page, not just the visible one.
 */

type Sort = "relevance" | "price-asc" | "price-desc";

export type CategoryPage = {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  fitsTotal?: number;
  fitments?: Record<string, FitmentState>;
};

export function CategoryProductGrid({
  categorySlug,
  initialPage,
  initialFitsOnly = false,
}: {
  categorySlug: string;
  initialPage: CategoryPage;
  initialFitsOnly?: boolean;
}) {
  const { vehicle } = useGarage();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [verifiedFitOnly, setVerifiedFitOnly] = useState(initialFitsOnly);
  const [sort, setSort] = useState<Sort>("relevance");
  const [currentPage, setCurrentPage] = useState(initialPage.page || 1);

  // The garage hydrates from localStorage a tick after first render, so the
  // vehicle is briefly null even when one is saved. Deriving the effective
  // filter (instead of unsetting verifiedFitOnly) lets ?fitsOnly=1 links wait
  // for the vehicle and apply automatically once it arrives.
  const fitsActive = verifiedFitOnly && Boolean(vehicle);

  const [data, setData] = useState<CategoryPage>(initialPage);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  // Any filter change restarts at page 1.
  const resetKey = `${inStockOnly}|${fitsActive}|${sort}|${vehicle ? JSON.stringify(vehicle) : ""}`;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [resetKey]);

  const isPristine =
    !inStockOnly && !fitsActive && sort === "relevance" && currentPage === (initialPage.page || 1);

  const fetchPage = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/category-products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: categorySlug,
          vehicle,
          page: currentPage,
          perPage: initialPage.perPage,
          sort,
          inStockOnly,
          fitsOnly: fitsActive,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const payload = (await res.json()) as CategoryPage;
      if (id === requestId.current) setData(payload);
    } catch (error) {
      console.warn("Category page fetch failed.", error);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [categorySlug, vehicle, currentPage, initialPage.perPage, sort, inStockOnly, fitsActive]);

  useEffect(() => {
    // The server already rendered this exact view; don't re-fetch it.
    if (isPristine) {
      setData(initialPage);
      return;
    }
    void fetchPage();
  }, [isPristine, fetchPage, initialPage]);

  const products = data.products;
  const total = data.total;
  const totalPages = data.totalPages || 1;

  // Fit badges for the rendered page only — 60 slugs, not the whole category.
  const slugs = useMemo(() => products.map((p) => p.slug), [products]);
  const batchFitments = useFitmentBatch(slugs, vehicle);
  const fitments: Record<string, FitmentState> = useMemo(
    () => ({ ...batchFitments, ...(data.fitments ?? {}) }),
    [batchFitments, data.fitments],
  );

  const fitCountOnPage = products.filter((p) => fitments[p.slug] === "fits").length;
  const firstShown = total === 0 ? 0 : (currentPage - 1) * data.perPage + 1;
  const lastShown = Math.min(currentPage * data.perPage, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (i === 2 || i === totalPages - 1) {
        pages.push("...");
      }
    }
    return pages.filter((item, index) => (item === "..." ? pages[index - 1] !== "..." : true));
  };

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button onClick={() => setInStockOnly((v) => !v)} className={`rounded-full border px-4 py-1.5 font-semibold transition hover:-translate-y-px ${inStockOnly ? "border-fatman-accent bg-fatman-accent/10 text-fatman-accent" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}>
            In Stock
          </button>
          <button
            onClick={() => setVerifiedFitOnly((v) => !v)}
            disabled={!vehicle}
            title={vehicle ? undefined : "Select your vehicle to filter by fit"}
            className={`rounded-full border px-4 py-1.5 font-semibold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 ${fitsActive ? "border-fatman-accent bg-fatman-accent/10 text-fatman-accent" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            Fits Only
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
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
              Showing {firstShown}–{lastShown} of {total} products
              {loading && <span className="ml-2 text-white/40">updating…</span>}
            </div>
            {totalPages > 1 && (
              <div className="text-xs text-white/40">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
          {vehicle ? (
            <div className="text-xs text-white/60">
              {fitsActive
                ? `Showing only parts that fit ${formatCompactVehicleLabel(vehicle)}. ${data.fitsTotal ?? total} confirmed${
                    data.fitsTotal != null && total > data.fitsTotal
                      ? `, ${total - data.fitsTotal} need VIN verification`
                      : ""
                  }.`
                : `Showing best matches for ${formatCompactVehicleLabel(vehicle)}. ${fitCountOnPage} confirmed fits on this page.`}
            </div>
          ) : null}
        </div>

        <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60 transition-opacity" : ""}`}>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} fitmentState={fitments[product.slug]} />
          ))}
        </div>

        {products.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-white/50">
            No products match these filters.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.05] pt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
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
                    disabled={loading}
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
              disabled={currentPage === totalPages || loading}
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
