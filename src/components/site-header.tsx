"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGarage } from "./garage-provider";
import { useTheme } from "./theme-provider";
import { useCart } from "./use-cart";
import { catalogRegistry } from "@/lib/catalog-registry";
import { formatVehicleLabel } from "@/lib/fitment";

const navItems = [
  ...catalogRegistry.filter((item) => item.showInHeader).map((item) => ({ href: `/category/${item.slug}`, label: item.title })),
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/cart", label: "Cart" },
];

export function SiteHeader() {
  const { vehicle } = useGarage();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const isDark = theme === "dark";

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setOpen(false);
    }
  };

  const desktopLogoSrc = !mounted ? "/brand/fatman-compact-horizontal-dark.png" : isDark ? "/brand/fatman-compact-horizontal.png" : "/brand/fatman-compact-horizontal-dark.png";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-fatman-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="inline-flex items-center shrink-0" aria-label="Fatman Parts home">
          <Image src={desktopLogoSrc} alt="Fatman Parts" width={1265} height={383} priority className="hidden h-10 w-auto object-contain sm:block" />
          <Image src={desktopLogoSrc} alt="Fatman Parts" width={1265} height={383} priority className="block h-8 w-auto object-contain sm:hidden" />
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-sm md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search parts, SKUs, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white outline-none focus:border-fatman-accent/50 focus:ring-1 focus:ring-fatman-accent/50"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              🔍
            </button>
          </div>
        </form>

        <nav className="hidden gap-5 text-sm text-white/85 lg:flex">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-white">{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/cart" className="relative rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-fatman-accent text-[10px] font-bold text-white shadow-lg">
                {itemCount}
              </span>
            )}
          </Link>
          <button onClick={toggleTheme} className="rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10">Toggle theme</button>
          <div className="text-right text-xs text-white/70">{vehicle ? <span>Garage: {formatVehicleLabel(vehicle)}</span> : <span>Garage: not selected</span>}</div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white md:hidden">Menu</button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-fatman-900 md:hidden">
          <div className="mx-auto max-w-6xl space-y-4 px-6 py-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search parts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">🔍</button>
            </form>
            <div className="space-y-1">
              {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white">{item.label}</Link>)}
            </div>
            <button onClick={toggleTheme} className="w-full rounded-md border border-white/15 px-2 py-2 text-left text-xs text-white/80">Toggle theme</button>
            <div className="rounded-md bg-white/5 px-2 py-2 text-xs text-white/70">{vehicle ? `Garage: ${formatVehicleLabel(vehicle)}` : "Garage: not selected"}</div>
          </div>
        </div>
      )}
    </header>
  );
}
