"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGarage } from "./garage-provider";
import { useTheme } from "./theme-provider";
import { enableDemoMode } from "@/lib/demo";

const navItems = [
  { href: "/category/engines", label: "Engines" },
  { href: "/category/brakes", label: "Brakes" },
  { href: "/category/oem-parts", label: "OEM Parts" },
  { href: "/category/suspension", label: "Suspension" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/cart", label: "Cart" },
];

export function SiteHeader() {
  const { vehicle } = useGarage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const desktopLogoSrc = !mounted
    ? "/brand/fatman-compact-horizontal-dark.png"
    : isDark
      ? "/brand/fatman-compact-horizontal.png"
      : "/brand/fatman-compact-horizontal-dark.png";

  const mobileLogoSrc = desktopLogoSrc;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-fatman-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="inline-flex items-center" aria-label="Fatman Parts home">
          <Image
            src={desktopLogoSrc}
            alt="Fatman Parts"
            width={1265}
            height={383}
            priority
            className="hidden h-10 w-auto object-contain sm:block"
          />
          <Image
            src={mobileLogoSrc}
            alt="Fatman Parts"
            width={1265}
            height={383}
            priority
            className="block h-8 w-auto object-contain sm:hidden"
          />
        </Link>

        <nav className="hidden gap-5 text-sm text-white/85 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => {
              enableDemoMode();
              window.location.reload();
            }}
            className="rounded-md border border-fatman-accent/50 bg-fatman-accent/15 px-2.5 py-1.5 text-xs text-orange-100 transition hover:bg-fatman-accent/25"
          >
            Enable demo data
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
          >
            Toggle theme
          </button>
          <div className="text-right text-xs text-white/70">
            {vehicle ? (
              <span>
                Garage: {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
            ) : (
              <span>Garage: not selected</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white md:hidden"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-fatman-900 md:hidden">
          <div className="mx-auto max-w-6xl space-y-2 px-6 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                enableDemoMode();
                window.location.reload();
              }}
              className="w-full rounded-md border border-fatman-accent/50 bg-fatman-accent/15 px-2 py-2 text-left text-xs text-orange-100"
            >
              Enable demo data
            </button>
            <button
              onClick={toggleTheme}
              className="w-full rounded-md border border-white/15 px-2 py-2 text-left text-xs text-white/80"
            >
              Toggle theme
            </button>
            <div className="rounded-md bg-white/5 px-2 py-2 text-xs text-white/70">
              {vehicle
                ? `Garage: ${vehicle.year} ${vehicle.make} ${vehicle.model}`
                : "Garage: not selected"}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
