import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryProductGrid } from "@/components/category-product-grid";
import { StickyFitmentBar } from "@/components/sticky-fitment-bar";
import { TrustStrip } from "@/components/trust-strip";
import { getCategory, getProductsByCategory } from "@/lib/mock-data";

const SITE_URL = "https://fatmanparts.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  const categoryProducts = getProductsByCategory(slug);

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
    <div className="min-h-screen bg-fatman-900 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <StickyFitmentBar />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm text-white/60">Category</p>
        <h1 className="mt-1 text-3xl font-black">{category.title}</h1>
        <p className="mt-2 text-white/70">{category.description}</p>
      </section>

      <TrustStrip />

      <CategoryProductGrid products={categoryProducts} />
    </div>
  );
}
