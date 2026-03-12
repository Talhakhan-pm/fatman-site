import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryProductGrid } from "@/components/category-product-grid";
import { StickyFitmentBar } from "@/components/sticky-fitment-bar";
import { TrustStrip } from "@/components/trust-strip";
import { getCategory, getProductsByCategory } from "@/lib/mock-data";
import { getCategoryMedia } from "@/lib/catalog-media";

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
  const media = getCategoryMedia(category.slug);

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
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
            <div className="p-8 md:p-10">
              <p className="text-sm text-white/60">Category</p>
              <h1 className="mt-1 text-3xl font-black">{category.title}</h1>
              <p className="mt-2 max-w-2xl text-white/70">{category.description}</p>
            </div>
            {media ? (
              <div className="relative min-h-56 border-t border-white/10 md:min-h-full md:border-l md:border-t-0">
                <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" priority />
                <div className="absolute inset-0 bg-gradient-to-l from-black/15 via-transparent to-black/45 md:bg-gradient-to-r" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <TrustStrip />

      <CategoryProductGrid products={categoryProducts} />
    </div>
  );
}
