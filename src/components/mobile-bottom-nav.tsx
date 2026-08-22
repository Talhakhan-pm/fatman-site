"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-provider";
import { useGarage } from "./garage-provider";

/**
 * Mobile bottom navigation — app-like tab bar, visible only below 768px
 * (see the fm-bnav block in globals.css). Four fixed destinations; no
 * account tab because the site has no auth surface.
 */

type NavItem = {
  key: string;
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  icon: React.ReactNode;
};

const ICON_PROPS = {
  width: 23,
  height: 23,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const NAV_ITEMS: NavItem[] = [
  {
    key: "shop",
    label: "Shop",
    href: "/",
    isActive: (p) => p === "/",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4.5 9.8V19a1.3 1.3 0 0 0 1.3 1.3h12.4A1.3 1.3 0 0 0 19.5 19V9.8" />
        <path d="M3.5 6.6 5.1 3.7h13.8l1.6 2.9v1a2.35 2.35 0 0 1-4.7 0 2.35 2.35 0 0 1-4.7 0 2.35 2.35 0 0 1-4.7 0z" />
        <path d="M9.6 20.3v-4.6h4.8v4.6" />
      </svg>
    ),
  },
  {
    key: "categories",
    label: "Categories",
    href: "/category",
    isActive: (p) => p === "/category" || p.startsWith("/category/"),
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="4" width="7" height="7" rx="1.6" />
        <rect x="13" y="4" width="7" height="7" rx="1.6" />
        <rect x="4" y="13" width="7" height="7" rx="1.6" />
        <rect x="13" y="13" width="7" height="7" rx="1.6" />
      </svg>
    ),
  },
  {
    key: "garage",
    label: "Garage",
    href: "/fits",
    isActive: (p) => p === "/fits",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 19.5V9.3L12 4l9 5.3v10.2" />
        <path d="M6.6 19.5v-7.7h10.8v7.7" />
        <path d="M6.6 14.4h10.8" />
        <path d="M6.6 17h10.8" />
      </svg>
    ),
  },
  {
    key: "cart",
    label: "Cart",
    href: "/cart",
    isActive: (p) => p === "/cart",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="9.2" cy="19.6" r="1.4" />
        <circle cx="17.2" cy="19.6" r="1.4" />
        <path d="M3 4.2h2.3l2.2 10.9a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L21 8.3H6" />
      </svg>
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const { itemCount, mounted: cartMounted } = useCart();
  const { vehicle } = useGarage();

  return (
    <nav className="fm-bnav" aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => {
        const active = item.isActive(pathname);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`fm-bnav-item ${active ? "on" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="fm-bnav-ico">
              {item.icon}
              {item.key === "cart" && cartMounted && itemCount > 0 && (
                <span className="fm-bnav-badge" aria-label={`${itemCount} items in cart`}>
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
              {item.key === "garage" && vehicle && (
                <span className="fm-bnav-dot" aria-hidden="true" />
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
