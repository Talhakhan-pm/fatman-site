import type { Metadata } from "next";
import Image from "next/image";
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
        <div className="grid gap-6 overflow-hidden border border-white/[0.06] bg-[#1a1d24] lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
          <div className="p-8 sm:p-10">
            <p className="text-sm text-white/60">Category</p>
            <h1 className="mt-1 text-3xl font-black">{category.title}</h1>
            <p className="mt-2 max-w-2xl text-white/70">{category.description}</p>
          </div>

          <div className="relative min-h-[220px] border-t border-white/[0.06] lg:min-h-full lg:border-t-0 lg:border-l lg:border-white/[0.06]">
            <Image
              src="/editorial/fatman-headlight-studio-detail.png"
              alt="OEM replacement headlight assembly close-up"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 32vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111318]/10 via-transparent to-[#111318]/70" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[10px] font-black tracking-[0.22em] uppercase text-[#ff6a00]">Verified Replacement Parts</p>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <CategoryProductGrid products={categoryProducts} />
    </div>
  );
}
