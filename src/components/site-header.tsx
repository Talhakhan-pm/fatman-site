"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGarage } from "./garage-provider";
import { useCart } from "./cart-provider";
import { formatCompactVehicleLabel, formatVehicleLabel } from "@/lib/fitment-lite";
import { formatPrice, type Product } from "@/lib/catalog-types";

type SearchState = "idle" | "loading" | "ready" | "error";

type ProductsResponse = {
  products?: Product[];
};

const logoSrc = "/brand/fatman-compact-horizontal.png";

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m20 20-4.2-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 7.5h13l-1.4 7.4a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.7L6 4.8H3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20h.01M17 20h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GarageIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.8 16.8h10.4M7.8 18.7h.02M16.2 18.7h.02" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.7 16.8l1-4.2a2.2 2.2 0 0 1 2.1-1.7h6.4a2.2 2.2 0 0 1 2.1 1.7l1 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.2 10.9l1-2.1a1.8 1.8 0 0 1 1.6-1h2.4a1.8 1.8 0 0 1 1.6 1l1 2.1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4.8 14.4h1.5M17.7 14.4h1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  const { vehicle } = useGarage();
  const { itemCount, mounted: cartMounted } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [garageOpen, setGarageOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const garageRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setGarageOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !garageOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (garageRef.current && !garageRef.current.contains(target)) {
        setGarageOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [garageOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const term = query.trim();

    if (!term) {
      setResults([]);
      setSearchState("idle");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchState("loading");
      try {
        const response = await fetch(`/api/products?q=${encodeURIComponent(term)}&limit=6`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const payload = (await response.json()) as ProductsResponse;
        setResults(payload.products ?? []);
        setSearchState("ready");
      } catch {
        if (!controller.signal.aborted) setSearchState("error");
      }
    }, 160);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, searchOpen]);

  return (
    <header
      className={`fm-siteheader fixed left-0 right-0 top-0 z-50 px-4 pt-2.5 sm:px-6 sm:pt-4 ${
        // The collapsed search panel below the pill keeps its layout size
        // (opacity-0, not display:none), so the header's box is ~400px tall.
        // Pass clicks through that dead zone unless a surface is open —
        // otherwise the header shadows page content near the top.
        searchOpen || garageOpen ? "" : "pointer-events-none"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center gap-2.5 rounded-full px-2.5 py-1.5 transition-all duration-500 sm:gap-4 sm:px-3 sm:py-2 ${
          scrolled || searchOpen || garageOpen
            ? "border border-white/10 bg-[#10141b]/72 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
            : "border border-transparent bg-transparent"
        } pointer-events-auto`}
      >
        <Link href="/" className="flex shrink-0 items-center" aria-label="Fatman Parts home">
          <Image
            src={logoSrc}
            alt="Fatman Parts"
            width={1265}
            height={383}
            priority
            className="h-7 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition duration-300 hover:scale-[1.02] sm:h-10"
          />
        </Link>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="group relative flex h-9 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-white/12 bg-white/[0.055] px-3.5 text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-fatman-accent/55 hover:bg-fatman-accent/12 hover:text-white sm:h-12 sm:px-5"
          aria-label="Search products"
        >
          <SearchIcon className="h-4 w-4 shrink-0 transition duration-300 group-hover:scale-110 group-hover:text-fatman-accent sm:h-5 sm:w-5" />
          <span className="ml-2.5 min-w-0 flex-1 truncate text-left text-[13px] font-semibold text-white/52 transition group-hover:text-white/85 sm:ml-3 sm:text-sm">
            <span className="sm:hidden">Search parts...</span>
            <span className="hidden sm:inline">Search parts, SKU, OEM number, brand...</span>
          </span>
          {vehicle ? (
            <span className="ml-3 hidden max-w-[180px] truncate rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/42 xl:inline" title={formatVehicleLabel(vehicle)}>
              {formatCompactVehicleLabel(vehicle)}
            </span>
          ) : null}
          <span className="ml-3 hidden rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-mono text-[10px] text-white/30 sm:inline">⌘K</span>
          <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px translate-x-[-120%] bg-gradient-to-r from-transparent via-fatman-accent to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
        </button>

        <div ref={garageRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setGarageOpen((current) => !current)}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-fatman-accent/55 hover:bg-fatman-accent/12 hover:text-white sm:h-11 sm:w-11 ${
              garageOpen || vehicle ? "border-fatman-accent/45 bg-fatman-accent/12" : "border-white/12 bg-white/[0.045]"
            }`}
            aria-label="Garage fitment"
            aria-expanded={garageOpen}
          >
            <GarageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            {vehicle ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-fatman-accent shadow-[0_0_12px_rgba(234,88,12,0.8)]" /> : null}
          </button>

          <div
            className={`absolute right-0 top-[calc(100%+0.75rem)] w-80 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-3xl border border-white/12 bg-[#10141b]/94 shadow-[0_28px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 sm:w-96 ${
              garageOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-[0.96] opacity-0"
            }`}
          >
            <div className="relative p-4 sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(234,88,12,0.22),transparent_42%)]" />
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fatman-accent">Garage</p>
                {vehicle ? (
                  <>
                    <p className="mt-2 text-lg font-black leading-tight text-white sm:text-2xl">{formatCompactVehicleLabel(vehicle)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/35 sm:text-xs">{formatVehicleLabel(vehicle)}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-lg font-black leading-tight text-white sm:text-2xl">No vehicle selected</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/55 sm:mt-3 sm:text-sm">Add your ride before you shop for smarter fitment warnings.</p>
                  </>
                )}
                <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-2">
                  <Link href="/" onClick={() => setGarageOpen(false)} className="rounded-2xl bg-fatman-accent px-4 py-2.5 text-center text-sm font-black text-fatman-900 transition hover:bg-fatman-accent-hover sm:py-3">
                    {vehicle ? "Update vehicle" : "Select vehicle"}
                  </Link>
                  <Link href="/category" onClick={() => setGarageOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white sm:py-3">
                    Browse parts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/cart"
          className="relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.045] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-fatman-accent/55 hover:bg-fatman-accent/12 hover:text-white md:inline-flex"
          aria-label="Cart"
        >
          <CartIcon className="h-5 w-5" />
          {cartMounted && itemCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fatman-accent px-1 text-[10px] font-black text-fatman-900 shadow-[0_0_18px_rgba(234,88,12,0.6)]">
              {itemCount}
            </span>
          ) : null}
        </Link>
      </div>

      <div
        ref={searchRef}
        className={`mx-auto mt-3 max-w-3xl origin-top transition-all duration-300 ${
          searchOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#10141b]/92 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.045] px-4 py-2.5 sm:py-3">
            <SearchIcon className="h-5 w-5 text-fatman-accent" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by part, SKU, OEM number, brand..."
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/34"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="rounded-full px-3 py-1 text-xs font-semibold text-white/45 transition hover:bg-white/10 hover:text-white">
                Clear
              </button>
            )}
          </div>

          <div className="max-h-[66vh] overflow-auto p-3">
            {!query.trim() && (
              <div className="grid gap-2 sm:grid-cols-3">
                {["radiator", "engine", "brake", "suspension", "OEM", "cooling"].map((term) => (
                  <button key={term} type="button" onClick={() => setQuery(term)} className="rounded-2xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-left text-sm font-bold text-white/64 transition hover:border-fatman-accent/45 hover:bg-fatman-accent/10 hover:text-white sm:px-4 sm:py-3">
                    {term}
                  </button>
                ))}
              </div>
            )}

            {query.trim() && searchState === "loading" && (
              <div className="space-y-2">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/[0.045]" />
                ))}
              </div>
            )}

            {query.trim() && searchState === "error" && (
              <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-5 text-sm text-red-100">Search is unavailable right now.</div>
            )}

            {query.trim() && searchState === "ready" && results.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-center">
                <p className="text-xl font-black text-white">No match found.</p>
                <p className="mt-2 text-sm text-white/50">Send us the VIN or OEM number and we’ll verify it.</p>
                <Link href={`/fitment-help?query=${encodeURIComponent(query)}`} onClick={() => setSearchOpen(false)} className="mt-5 inline-flex rounded-full bg-fatman-accent px-5 py-3 text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover">
                  Request fitment help
                </Link>
              </div>
            )}

            {query.trim() && searchState === "ready" && results.length > 0 && (
              <div className="space-y-2">
                {results.map((product) => (
                  <Link key={product.slug} href={`/product/${product.slug}`} onClick={() => setSearchOpen(false)} className="group grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-fatman-accent/45 hover:bg-white/[0.07] sm:grid-cols-[72px_1fr_auto] sm:items-center">
                    <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/20 sm:h-16">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt="" width={96} height={96} className="h-full w-full object-contain p-1.5 transition group-hover:scale-105" />
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wide text-white/25">No image</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-fatman-accent/14 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-fatman-accent">{product.brand}</span>
                        <span className="font-mono text-[11px] text-white/35">{product.sku}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 font-black text-white group-hover:text-fatman-accent">{product.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-white/42">{product.shortDescription}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <p className="font-black text-white">{formatPrice(product.price)}</p>
                      <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-white/30">View →</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
