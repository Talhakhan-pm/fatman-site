"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { catalogRegistry } from "@/lib/catalog-registry";

const footerCategoryLinks = catalogRegistry.filter((item) => item.showInFooter);

export function SiteFooter() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => setMounted(true), []);

  const footerLogoSrc = !mounted ? "/brand/fatman-compact-horizontal-dark.png" : isDark ? "/brand/fatman-compact-horizontal.png" : "/brand/fatman-compact-horizontal-dark.png";

  return (
    <footer className="border-t border-white/10 bg-fatman-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 text-sm text-white/70 md:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="Fatman Parts home">
            <Image src={footerLogoSrc} alt="Fatman Parts" width={1265} height={383} className="h-8 w-auto object-contain" />
          </Link>
          <p className="mt-2">OEM confidence. Fast dispatch. Zero guesswork.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Shop</p>
          <div className="mt-2 space-y-1">
            {footerCategoryLinks.map((item) => <Link key={item.slug} href={`/category/${item.slug}`} className="block">{item.title}</Link>)}
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Learn</p>
          <div className="mt-2 space-y-1">
            <Link href="/blog" className="block">Blog</Link>
            <Link href="/about" className="block">About</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Support</p>
          <div className="mt-2 space-y-1">
            <Link href="/contact" className="block">Contact</Link>
            <Link href="/cart" className="block">Cart</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
