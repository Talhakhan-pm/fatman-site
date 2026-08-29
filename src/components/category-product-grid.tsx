"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useGarage } from "@/components/garage-provider";
import { useFitmentBatch } from "@/components/use-fitment";
import type { Product } from "@/lib/catalog";
import { getSuppressedImageSlugs } from "@/lib/catalog-media";
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
  const { vehicle, setVehicle } = useGarage();
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

  // Any single image fronts at most two cards per page; repeats fall back to
  // the spec-plate card.
  const suppressedImages = useMemo(() => getSuppressedImageSlugs(products), [products]);

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
      <section className="fm-toolbar">
        <div className="mx-auto max-w-6xl px-4 fm-toolbar-in sm:px-6">
          {vehicle && (
            <span className="fm-vehicle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 13l1.7-4.6A2 2 0 0 1 6.6 7h10.8a2 2 0 0 1 1.9 1.4L21 13" />
                <path d="M3 13h18v5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
              </svg>
              {formatCompactVehicleLabel(vehicle)}
              <Link href="/fits" className="chg">CHANGE</Link>
              <button
                className="vh-x"
                onClick={() => setVehicle(null)}
                aria-label="Clear garage vehicle"
                title="Clear vehicle"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          <button
            onClick={() => setInStockOnly((v) => !v)}
            aria-pressed={inStockOnly}
            className="fm-toggle"
          >
            <span className="fm-dot pulse" aria-hidden="true" />
            In Stock
          </button>

          <button
            onClick={() => setVerifiedFitOnly((v) => !v)}
            aria-pressed={fitsActive}
            disabled={!vehicle}
            title={vehicle ? undefined : "Select your vehicle to filter by fit"}
            className="fm-toggle"
          >
            Fits Only
            {data.fitsTotal != null && fitsActive ? (
              <span className="cnt">({data.fitsTotal.toLocaleString()})</span>
            ) : null}
          </button>

          <label className="fm-sort">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort products"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price · Low → High</option>
              <option value="price-desc">Price · High → Low</option>
            </select>
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <p className="fm-result" aria-live="polite">
          <span>
            Showing {firstShown}–{lastShown} of {total.toLocaleString()} products
          </span>
          {loading && <span className="updating">updating…</span>}
          {vehicle ? (
            <span className="vh-note">
              {fitsActive
                ? `Only parts confirmed to fit your ${formatCompactVehicleLabel(vehicle)}${
                    data.fitsTotal != null && total > data.fitsTotal
                      ? ` · ${total - data.fitsTotal} need VIN verification`
                      : ""
                  }`
                : `Best matches for ${formatCompactVehicleLabel(vehicle)} · ${fitCountOnPage} confirmed fits on this page`}
            </span>
          ) : (
            <span>
              Select a vehicle to unlock confirmed-fit filtering ·{" "}
              <Link href="/fits" className="underline decoration-dotted underline-offset-4 hover:text-[var(--fm-accent)]">
                open garage
              </Link>
            </span>
          )}
        </p>

        <div className={`fm-grid ${loading ? "opacity-60 transition-opacity" : ""}`}>
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              fitmentState={fitments[product.slug]}
              suppressPhoto={suppressedImages.has(product.slug)}
            />
          ))}
        </div>

        {products.length === 0 && !loading && (
          <p className="fm-empty">
            <b>No products match these filters.</b>
            Try clearing a filter — or send us your VIN and we&apos;ll find the part.
          </p>
        )}

        {totalPages > 1 && (
          <nav className="fm-pager" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="fm-pg"
            >
              ← Prev
            </button>

            <div className="contents">
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <span key={`ellipsis-${index}`} className="fm-pg gap" aria-hidden="true">
                      ···
                    </span>
                  );
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(Number(pageNum))}
                    disabled={loading}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                    className={`fm-pg ${currentPage === pageNum ? "on" : ""}`}
                  >
                    {String(pageNum).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="fm-pg"
            >
              Next →
            </button>

            <span className="fm-pager-meta">
              Page {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </span>
          </nav>
        )}
      </section>
    </>
  );
}
