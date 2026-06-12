"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { catalogRegistry } from "@/lib/catalog-registry";
import { socialIconMap } from "@/components/social-icons";
import { socialLinks } from "@/lib/social-links";

const footerCategoryLinks = catalogRegistry.filter((item) => item.showInFooter);

const supportLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/payment-methods", label: "Payment Methods" },
  { href: "/cancellation-policy", label: "Cancellation" },
  { href: "/returns", label: "Returns" },
  { href: "/warranty", label: "Warranty" },
  { href: "/fitment-help", label: "Fitment / VIN Help" },
] as const;

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-1 py-1 text-white/70 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const footerLogoSrc = !mounted ? "/brand/fatman-compact-horizontal-dark.png" : isDark ? "/brand/fatman-compact-horizontal.png" : "/brand/fatman-compact-horizontal-dark.png";

  return (
    <footer className="border-t border-white/10 bg-fatman-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center" aria-label="Fatman Parts home">
              <Image
                src={footerLogoSrc}
                alt="Fatman Parts"
                width={1265}
                height={383}
                className="h-8 w-auto object-contain"
                priority={false}
              />
            </Link>

            <p className="mt-3 max-w-sm text-sm text-white/70">
              OEM confidence. Fast dispatch. Zero guesswork.
            </p>
            <p className="mt-3 max-w-sm text-xs leading-5 text-white/45">
              Fatman Parts LLC · 6779 Beadnell Way, San Diego, CA 92117 · (844) 737-1463 · help@fatmanparts.com
            </p>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Follow Fatman</p>
              <div className="mt-2 flex items-center gap-2">
                {socialLinks.map((item) => {
                  const SocialIcon = socialIconMap[item.id];

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow Fatman Parts on ${item.label}`}
                      title={item.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-fatman-accent/60 hover:bg-fatman-accent/10 hover:text-white"
                    >
                      <SocialIcon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Need help choosing a part?</p>
                <p className="mt-1 text-sm text-white/70">
                  Use Fitment / VIN Help for quick guidance, call (844) 737-1463, or email help@fatmanparts.com.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/fitment-help"
                    className="inline-flex items-center justify-center rounded-full bg-fatman-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-fatman-accent-hover"
                  >
                    Fitment / VIN Help
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/0 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/5"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-white/50">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Secure checkout</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Visa / Mastercard / Amex / Discover</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Fast dispatch</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Clear fitment states</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-sm font-semibold text-white">Shop</p>
            <div className="mt-3 space-y-1 text-sm">
              {footerCategoryLinks.map((item) => (
                <FooterLink key={item.slug} href={`/category/${item.slug}`}>
                  {item.title}
                </FooterLink>
              ))}
              <FooterLink href="/category">All categories</FooterLink>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-white">Support</p>
            <div className="mt-3 space-y-1 text-sm">
              {supportLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
              <FooterLink href="/cart">Cart</FooterLink>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-white">Company</p>
            <div className="mt-3 space-y-1 text-sm">
              {companyLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Fatman Parts. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/returns" className="hover:text-white">Returns</Link>
            <Link href="/cancellation-policy" className="hover:text-white">Cancellation</Link>
            <Link href="/shipping" className="hover:text-white">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
