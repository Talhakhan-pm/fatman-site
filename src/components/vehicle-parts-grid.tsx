"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { CategoryPage } from "@/components/category-product-grid";
import type { Product } from "@/lib/catalog";
import { getSuppressedImageSlugs } from "@/lib/catalog-media";
import type { FitmentState, Vehicle } from "@/lib/fitment-types";

/**
 * Cross-category listing of everything that fits one vehicle.
 *
 * Same data path as the category grid ("Fits Only" via
 * /api/discovery/category-products), but the vehicle comes from the URL, not
 * the garage, and a category chip row narrows within the vehicle's parts.
 */

type Sort = "relevance" | "price-asc" | "price-desc";

export type VehicleCategoryFacet = {
  slug: string;
  title: string;
  count: number;
};

export function VehiclePartsGrid({
  vehicle,
  vehicleLabel,
  initialPage,
  categories,
}: {
  vehicle: Vehicle;
  vehicleLabel: string;
  initialPage: CategoryPage;
  categories: VehicleCategoryFacet[];
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("relevance");
  const [currentPage, setCurrentPage] = useState(initialPage.page || 1);
  // chip rail: 6 facets by default, "+N" reveals the rest
  const [showAllCategories, setShowAllCategories] = useState(false);
  const COLLAPSED_FACETS = 6;

  const [data, setData] = useState<CategoryPage>(initialPage);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  // Any filter change restarts at page 1.
  const resetKey = `${category ?? ""}|${inStockOnly}|${sort}`;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [resetKey]);

  const isPristine =
    !category && !inStockOnly && sort === "relevance" && currentPage === (initialPage.page || 1);

  const fetchPage = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/category-products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: category ?? undefined,
          vehicle,
          page: currentPage,
          perPage: initialPage.perPage,
          sort,
          inStockOnly,
          fitsOnly: true,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const payload = (await res.json()) as CategoryPage;
      if (id === requestId.current) setData(payload);
    } catch (error) {
      console.warn("Vehicle parts fetch failed.", error);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [vehicle, category, currentPage, initialPage.perPage, sort, inStockOnly]);

  useEffect(() => {
    if (isPristine) {
      setData(initialPage);
      return;
    }
    void fetchPage();
  }, [isPristine, fetchPage, initialPage]);

  const products = data.products;
  const total = data.total;
  const totalPages = data.totalPages || 1;
  const fitments: Record<string, FitmentState> = useMemo(
    () => data.fitments ?? {},
    [data.fitments],
  );

  // Any single image fronts at most two cards per page; repeats fall back to
  // the spec-plate card.
  const suppressedImages = useMemo(() => getSuppressedImageSlugs(products), [products]);

  const firstShown = total === 0 ? 0 : (currentPage - 1) * data.perPage + 1;
  const lastShown = Math.min(currentPage * data.perPage, total);
  const verifyTotal = data.fitsTotal != null ? total - data.fitsTotal : 0;

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

  const chipClass = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-xs font-semibold transition hover:-translate-y-px whitespace-nowrap ${
      active
        ? "border-fatman-accent bg-fatman-accent/10 text-fatman-accent"
        : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
    }`;

  // The selected facet always stays on the rail even when it lives beyond
  // the collapsed cutoff — otherwise picking "Wheels" would hide your
  // own selection behind the +N button.
  const activeFacetIndex = category
    ? categories.findIndex((facet) => facet.slug === category)
    : -1;
  const collapsedCutoff =
    activeFacetIndex >= COLLAPSED_FACETS ? activeFacetIndex + 1 : COLLAPSED_FACETS;
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, collapsedCutoff);
  const hiddenCategoryCount = categories.length - visibleCategories.length;

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setCategory(null)} className={chipClass(category === null)}>
            All categories
          </button>
          {visibleCategories.map((facet) => (
            <button
              key={facet.slug}
              onClick={() => setCategory((prev) => (prev === facet.slug ? null : facet.slug))}
              className={chipClass(category === facet.slug)}
            >
              {facet.title}
              <span className="ml-1.5 font-mono text-[10px] opacity-70">{facet.count}</span>
            </button>
          ))}
          {hiddenCategoryCount > 0 && (
            <button
              onClick={() => setShowAllCategories(true)}
              className={chipClass(false)}
              aria-expanded={false}
            >
              +{hiddenCategoryCount} more
            </button>
          )}
          {showAllCategories && categories.length > COLLAPSED_FACETS && (
            <button
              onClick={() => setShowAllCategories(false)}
              className={chipClass(false)}
              aria-expanded={true}
            >
              Less
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setInStockOnly((v) => !v)}
            className={chipClass(inStockOnly)}
          >
            In Stock
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
              Showing {firstShown}–{lastShown} of {total} parts
              {loading && <span className="ml-2 text-white/40">updating…</span>}
            </div>
            {totalPages > 1 && (
              <div className="text-xs text-white/40">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
          <div className="text-xs text-white/60">
            {data.fitsTotal ?? total} confirmed fits for {vehicleLabel}
            {verifyTotal > 0 ? `, ${verifyTotal} need VIN verification` : ""}.
          </div>
        </div>

        <div className={`fm-grid ${loading ? "opacity-60 transition-opacity" : ""}`}>
          {products.map((product: Product) => (
            <ProductCard
              key={product.slug}
              product={product}
              fitmentState={fitments[product.slug]}
              suppressPhoto={suppressedImages.has(product.slug)}
            />
          ))}
        </div>

        {products.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-white/50">
            No parts match these filters.
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
                    className={`flex h-10 w-10 items-center justify-center border font-mono text-sm transition-all active:scale-90 ${
                      currentPage === pageNum
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
