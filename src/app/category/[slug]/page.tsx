import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryProductGrid } from "@/components/category-product-grid";
import { TrustStrip } from "@/components/trust-strip";
import { getCategory, getProductsByCategory } from "@/lib/catalog-db";

const SITE_URL = "https://fatmanparts.com";

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

  const sp = await searchParams;
  const pageParam = Number(Array.isArray(sp?.page) ? sp.page[0] : sp?.page);
  const sortParam = (Array.isArray(sp?.sort) ? sp.sort[0] : sp?.sort) as
    | "relevance"
    | "price-asc"
    | "price-desc"
    | undefined;
  // Set by links that arrive with fit context (e.g. the homepage "categories
  // that fit your vehicle" tiles). The vehicle itself lives in localStorage,
  // so the grid applies the filter client-side after hydration.
  const fitsOnlyParam = Array.isArray(sp?.fitsOnly) ? sp.fitsOnly[0] : sp?.fitsOnly;
  const initialFitsOnly = fitsOnlyParam === "1" || fitsOnlyParam === "true";

  // First paint is the unfiltered page: fast, cacheable and crawlable. The grid
  // re-queries client-side once a vehicle-dependent filter is applied.
  const initialPage = await getProductsByCategory(slug, {
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
    sort: sortParam ?? "name",
  });

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
    <div className="min-h-screen bg-fatman-900 text-white pt-24 lg:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="mx-auto max-w-6xl px-4 pb-2 pt-2 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{category.title}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-base leading-7 text-white/70">{category.description}</p>
        )}
      </section>

      <CategoryProductGrid
        categorySlug={slug}
        initialPage={initialPage}
        initialFitsOnly={initialFitsOnly}
      />

      <div className="mt-12">
        <TrustStrip />
      </div>
    </div>
  );
}
