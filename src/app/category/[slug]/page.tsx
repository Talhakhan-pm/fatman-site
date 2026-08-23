import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryProductGrid } from "@/components/category-product-grid";
import { getCategory, getProductsByCategory, getTopSubcategories } from "@/lib/catalog-db";
import { catalogRegistry } from "@/lib/catalog-registry";
import { getIconForCategorySlug } from "@/lib/category-display";
import { categoryIconMap } from "@/components/category-icons";

const SITE_URL = "https://fatmanparts.com";

const TICKER_ITEMS = [
  "Ford",
  "Chevrolet",
  "GMC",
  "Dodge",
  "Confirmed Fitment",
  "Fast U.S. Shipping",
  "OEM-First",
  "Real Support",
  "Easy Returns",
];

const TRUST_CELLS = [
  {
    title: "Guaranteed Fitment",
    body: "Every part verified against your exact truck before it ships.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 2.8v5.4c0 4.6-3 8-7 9.8-4-1.8-7-5.2-7-9.8V5.8z" />
        <path d="m9 11.6 2.2 2.2 4.2-4.8" />
      </svg>
    ),
  },
  {
    title: "Fast U.S. Shipping",
    body: "Orders dispatch within 24 hours from our U.S. warehouse.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 6h12v10H2zM14 9h4.4L21 12.2V16h-7" />
        <circle cx="6.4" cy="17.6" r="1.7" />
        <circle cx="17" cy="17.6" r="1.7" />
      </svg>
    ),
  },
  {
    title: "60-Day Returns",
    body: "Wrong part? Send it back. No restocking fee, no drama.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    title: "Support That Responds",
    body: "Real humans who know old trucks. VIN checks, free.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12z" />
        <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
      </svg>
    ),
  },
];

/** "Brakes and Traction Control" → display: [words], last word hollow. */
function titleParts(title: string) {
  const compact = title.replace(/\band\b/gi, "&");
  const words = compact.split(/\s+/).filter(Boolean);
  const head = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1] ?? "";
  return { head, tail };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found | Fatman Parts",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.title} | Fatman Parts`,
    description: `${category.description} Shop ${category.title.toLowerCase()} with verified fitment and fast U.S. shipping.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: `${category.title} | Fatman Parts`,
      description: category.description,
      url: `${SITE_URL}/category/${category.slug}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const sp = (await searchParams) ?? {};
  const pageParam = Number(Array.isArray(sp?.page) ? sp.page[0] : sp.page);
  const sortParam = (Array.isArray(sp?.sort) ? sp.sort[0] : sp.sort) as
    | "relevance"
    | "price-asc"
    | "price-desc"
    | undefined;
  // Set by links that arrive with fit context (e.g. the homepage "categories
  // that fit your vehicle" tiles). The vehicle itself lives in localStorage,
  // so the grid applies the filter client-side after hydration.
  const fitsOnlyParam = Array.isArray(sp?.fitsOnly) ? sp.fitsOnly[0] : sp.fitsOnly;
  const initialFitsOnly = fitsOnlyParam === "1" || fitsOnlyParam === "true";

  // First paint is the unfiltered page: fast, cacheable and crawlable. The grid
  // re-queries client-side once a vehicle-dependent filter is applied.
  const initialPage = await getProductsByCategory(slug, {
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
    sort: sortParam ?? "name",
  });
  const subcategories = await getTopSubcategories(slug);
  const registryIndex = catalogRegistry.findIndex((entry) => entry.slug === slug);
  const categoryCode = `CAT-${String(registryIndex >= 0 ? registryIndex + 1 : 0).padStart(2, "0")}`;
  const iconKey = getIconForCategorySlug(slug);
  // Registry keys are singular ("brake"), the icon map is plural ("brakes").
  const Icon = categoryIconMap[iconKey] ?? categoryIconMap[`${iconKey}s`] ?? categoryIconMap.engine;
  const { head, tail } = titleParts(category.title);
  const ticker = (
    <>
      {TICKER_ITEMS.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </>
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: category.title,
        item: `${SITE_URL}/category/${category.slug}`,
      },
    ],
  };

  return (
    <div className="catv2 min-h-screen pt-[76px] lg:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="fm-hero">
        <div className="fm-ambient" aria-hidden="true">
          <div className="fm-blob fm-blob-a" />
          <div className="fm-blob fm-blob-b" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="fm-riser"
              style={{
                left: `${6 + i * 14}%`,
                width: `${14 + (i % 3) * 7}px`,
                height: `${14 + (i % 3) * 7}px`,
                animationDuration: `${26 + i * 7}s`,
                animationDelay: `${-i * 9}s`,
              }}
            >
              <Icon className="w-full h-full" />
            </span>
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="fm-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/#categories">Categories</Link>
            <span className="sep">/</span>
            <span>{category.title}</span>
          </nav>

          <div className="mt-3 grid grid-cols-1 items-start gap-7 sm:mt-5 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="fm-eyebrow">{categoryCode} · OEM Parts Lane</span>
              <h1 className="fm-h1">
                {head} <span className="hollow">{tail}</span>
                <span className="dot">.</span>
              </h1>
              {category.description && (
                <p className="fm-desc">{category.description}</p>
              )}
              <div className="fm-stats" role="list">
                <div className="fm-stat" role="listitem">
                  <b>{initialPage.total.toLocaleString()}</b>
                  <span>Parts in this lane</span>
                </div>
                <div className="fm-stat" role="listitem">
                  <b>{subcategories.length}</b>
                  <span>Sub-lanes mapped</span>
                </div>
                <div className="fm-stat" role="listitem">
                  <b>
                    24<em>H</em>
                  </b>
                  <span>Dispatch promise</span>
                </div>
              </div>
            </div>

            <div className="fm-stamp" aria-hidden="true">
              <svg className="ring" viewBox="0 0 132 132">
                <defs>
                  <path id="fm-ring" d="M66,66 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
                </defs>
                <circle cx="66" cy="66" r="62" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 7" />
                <text fontSize="11.5" fontWeight="600" letterSpacing="3.4" fill="currentColor" style={{ fontFamily: "var(--fm-font-mono)" }}>
                  <textPath href="#fm-ring">OEM VERIFIED · FATMAN PARTS · STOP ON A DIME ·</textPath>
                </text>
              </svg>
              <span className="core">
                <Icon className="w-9 h-9" />
              </span>
            </div>
          </div>

          {subcategories.length > 0 && (
            <div className="fm-subcats" aria-label="Subcategories">
              {subcategories.map((facet) => (
                <Link key={facet.slug} href={`/category/${facet.slug}`} className="fm-subcat">
                  {facet.label}
                  <span className="n">{facet.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="fm-caution" aria-hidden="true" />
        <div className="fm-ticker" aria-hidden="true">
          <div className="fm-ticker-track">
            {ticker}
            {ticker}
            {ticker}
            {ticker}
          </div>
        </div>
      </section>

      <CategoryProductGrid
        categorySlug={slug}
        initialPage={initialPage}
        initialFitsOnly={initialFitsOnly}
      />

      <section className="fm-trust">
        <div className="fm-trust-grid">
          {TRUST_CELLS.map((cell) => (
            <div key={cell.title} className="fm-trust-cell">
              <span className="fm-trust-ico">{cell.icon}</span>
              <div>
                <b>{cell.title}</b>
                <p>{cell.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
