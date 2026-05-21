"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGarage } from "./garage-provider";
import { useTheme } from "./theme-provider";
import { useCart } from "./cart-provider";
import { catalogRegistry } from "@/lib/catalog-registry";
import { formatCompactVehicleLabel, formatVehicleLabel } from "@/lib/fitment";
import { formatPrice, type Product } from "@/lib/catalog";

type SearchState = "idle" | "loading" | "ready" | "error";

type ProductsResponse = {
  products?: Product[];
  count?: number;
};

const quickLinks = [
  { href: "/category", label: "All parts" },
  { href: "/fitment-help", label: "VIN check" },
  { href: "/contact", label: "Support" },
];

const featuredCategories = catalogRegistry
  .filter((item) => item.showOnHomepage)
  .slice(0, 5)
  .map((item) => ({ href: `/category/${item.slug}`, label: item.title }));

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

function SparkLine() {
  return (
    <span className="pointer-events-none absolute inset-x-3 bottom-0 h-px overflow-hidden rounded-full bg-white/10">
      <span className="absolute inset-y-0 left-[-45%] w-1/2 bg-gradient-to-r from-transparent via-fatman-accent to-transparent opacity-80 transition-transform duration-700 group-hover:translate-x-[280%]" />
    </span>
  );
}

export function SiteHeader() {
  const { vehicle } = useGarage();
  const { theme, toggleTheme } = useTheme();
  const { itemCount, mounted: cartMounted } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
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
        setMenuOpen(false);
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
    if (!searchOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearchState("idle");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchState("loading");
      try {
        const response = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=8`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const payload = (await response.json()) as ProductsResponse;
        setResults(payload.products ?? []);
        setSearchState("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setSearchState("error");
      }
    }, 170);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, searchOpen]);

  const desktopLogoSrc = !mounted
    ? "/brand/fatman-compact-horizontal-dark.png"
    : isDark
      ? "/brand/fatman-compact-horizontal.png"
      : "/brand/fatman-compact-horizontal-dark.png";

  const headerClass = useMemo(
    () =>
      `fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled || searchOpen || menuOpen
          ? "border-b border-white/10 bg-[#0b0f16]/78 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent"
      }`,
    [menuOpen, scrolled, searchOpen],
  );

  const topPicks = results.slice(0, 4);

  return (
    <header className={headerClass}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.13),transparent_36%)] opacity-80" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center" aria-label="Fatman Parts home">
          <Image src={desktopLogoSrc} alt="Fatman Parts" width={1265} height={383} priority className="hidden h-10 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.02] sm:block" />
          <Image src={desktopLogoSrc} alt="Fatman Parts" width={1265} height={383} priority className="block h-8 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:hidden" />
        </Link>

        <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group relative flex w-full max-w-xl items-center gap-3 overflow-hidden rounded-full border border-white/12 bg-white/[0.055] px-4 py-3 text-left text-sm text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition-all duration-300 hover:w-[105%] hover:border-fatman-accent/50 hover:bg-white/[0.085] hover:text-white"
          >
            <SearchIcon className="h-5 w-5 text-white/70 transition-colors group-hover:text-fatman-accent" />
            <span className="flex-1">Search parts, SKU, OEM number, vehicle system...</span>
            <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-white/35">⌘K</span>
            <SparkLine />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden max-w-[190px] rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-right text-xs text-white/62 backdrop-blur-xl md:block" title={vehicle ? formatVehicleLabel(vehicle) : undefined}>
            {vehicle ? (
              <span className="block truncate">Garage: {formatCompactVehicleLabel(vehicle)}</span>
            ) : (
              <span>Garage: select ride</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] text-white/75 backdrop-blur-xl transition-all duration-300 hover:border-fatman-accent/50 hover:bg-fatman-accent/15 hover:text-white lg:hidden"
            aria-label="Search products"
          >
            <SearchIcon className="h-5 w-5" />
          </button>

          <Link
            href="/cart"
            className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] text-white/75 backdrop-blur-xl transition-all duration-300 hover:border-fatman-accent/50 hover:bg-fatman-accent/15 hover:text-white"
            aria-label="Cart"
          >
            <CartIcon className="h-5 w-5" />
            {cartMounted && itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fatman-accent px-1 text-[10px] font-black text-fatman-900 shadow-[0_0_18px_rgba(234,88,12,0.55)]">
                {itemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="group relative inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 text-xs font-black uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
            aria-expanded={menuOpen}
          >
            <span className="hidden sm:inline">Menu</span>
            <span className="flex h-4 w-5 flex-col justify-center gap-1">
              <span className={`h-0.5 rounded-full bg-current transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 rounded-full bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 rounded-full bg-current transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div className={`relative overflow-hidden transition-all duration-500 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[#111318]/88 p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
            <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_auto] md:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fatman-accent">Navigation</p>
                <p className="mt-1 text-sm text-white/50">No clutter. Search first, support always close.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...quickLinks, ...featuredCategories].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-fatman-accent/40 hover:bg-fatman-accent/10 hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
              <button onClick={toggleTheme} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/55 transition hover:bg-white/10 hover:text-white">
                {isDark ? "Light" : "Dark"} mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 px-4 pt-4 backdrop-blur-sm sm:pt-6" role="dialog" aria-modal="true" aria-label="Product search">
          <div ref={panelRef} className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/12 bg-[#0d1118]/92 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="relative border-b border-white/10 p-3 sm:p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(234,88,12,0.2),transparent_42%)]" />
              <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
                <SearchIcon className="h-5 w-5 text-fatman-accent" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by part, SKU, OEM number, brand..."
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/35 sm:text-lg"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white">
                    Clear
                  </button>
                ) : null}
                <button type="button" onClick={() => setSearchOpen(false)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white">
                  Esc
                </button>
              </div>
            </div>

            <div className="max-h-[72vh] overflow-auto p-4 sm:p-5">
              {!query.trim() && (
                <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fatman-accent">Smart search</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Find the part before the page loads.</h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">Search live catalog data across name, brand, SKU, OEM number, and category. Built for employees and customers who know exactly what they need.</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {["radiator", "engine", "brake", "FTM", "OEM"].map((term) => (
                        <button key={term} type="button" onClick={() => setQuery(term)} className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-fatman-accent/50 hover:text-white">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-fatman-accent/20 bg-fatman-accent/10 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-200">Fast actions</p>
                    <div className="mt-4 space-y-2">
                      {quickLinks.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setSearchOpen(false)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white">
                          {item.label}<span>→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {query.trim() && searchState === "loading" && (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
                  ))}
                </div>
              )}

              {query.trim() && searchState === "error" && (
                <div className="rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-sm text-red-100">Search is unavailable right now. Try browsing categories.</div>
              )}

              {query.trim() && searchState === "ready" && results.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
                  <p className="text-2xl font-black text-white">No exact match.</p>
                  <p className="mt-2 text-sm text-white/55">Send us the VIN or OEM number and we’ll verify it.</p>
                  <Link href={`/fitment-help?query=${encodeURIComponent(query)}`} onClick={() => setSearchOpen(false)} className="mt-5 inline-flex rounded-full bg-fatman-accent px-5 py-3 text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover">
                    Request fitment help
                  </Link>
                </div>
              )}

              {query.trim() && searchState === "ready" && results.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 text-xs text-white/45">
                    <span>{results.length} top result{results.length === 1 ? "" : "s"}</span>
                    <Link href={`/category?q=${encodeURIComponent(query)}`} onClick={() => setSearchOpen(false)} className="font-semibold text-fatman-accent hover:text-white">Browse all →</Link>
                  </div>
                  {topPicks.map((product) => (
                    <Link key={product.slug} href={`/product/${product.slug}`} onClick={() => setSearchOpen(false)} className="group grid gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-fatman-accent/45 hover:bg-white/[0.075] sm:grid-cols-[88px_1fr_auto] sm:items-center">
                      <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20 sm:h-20">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt="" width={120} height={120} className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105" />
                        ) : (
                          <span className="text-xs font-black uppercase tracking-wide text-white/25">No image</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-fatman-accent/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-fatman-accent">{product.brand}</span>
                          <span className="font-mono text-[11px] text-white/35">{product.sku}</span>
                        </div>
                        <p className="mt-2 line-clamp-1 text-lg font-black text-white group-hover:text-fatman-accent">{product.name}</p>
                        <p className="mt-1 line-clamp-1 text-sm text-white/45">{product.shortDescription}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                        <p className="text-lg font-black text-white">{formatPrice(product.price)}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/35">View part →</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
