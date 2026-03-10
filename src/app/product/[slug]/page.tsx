import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "@/components/product/product-page-client";
import { getProduct } from "@/lib/mock-data";

const SITE_URL = "https://fatmanparts.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Fatman Parts",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} | Fatman Parts`,
    description: `${product.shortDescription} Shop with verified fitment and fast U.S. shipping.`,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | Fatman Parts`,
      description: product.shortDescription,
      url: `${SITE_URL}/product/${product.slug}`,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    description: product.shortDescription,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.stock === "in-stock"
          ? "https://schema.org/InStock"
          : product.stock === "low-stock"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/PreOrder",
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Category",
        item: `${SITE_URL}/category/${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProductPageClient product={product} />
    </>
  );
}
