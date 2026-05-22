import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "@/components/product/product-page-client";
import { getProduct } from "@/lib/catalog-db";
import { cookies } from "next/headers";
import { getAdminSessionScopeFromCookieValue, ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

const SITE_URL = "https://fatmanparts.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Fatman Parts",
      description: "The requested product could not be found.",
    };
  }

  const productImgUrl = product.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${SITE_URL}${product.imageUrl}`)
    : undefined;

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
      images: productImgUrl ? [{
        url: productImgUrl,
        width: 800,
        height: 800,
        alt: product.name,
      }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAdmin = process.env.NODE_ENV === "development" || Boolean(getAdminSessionScopeFromCookieValue(adminCookie));

  if (!product) notFound();

  const productImgUrl = product.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${SITE_URL}${product.imageUrl}`)
    : undefined;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "sku": product.sku,
    "mpn": product.oemPartNumber ?? product.sku,
    "brand": { "@type": "Brand", "name": product.brand },
    "description": product.shortDescription,
    "image": productImgUrl,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability":
        product.stock === "in-stock"
          ? "https://schema.org/InStock"
          : product.stock === "low-stock"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/PreOrder",
      "url": `${SITE_URL}/product/${product.slug}`,
      "seller": {
        "@type": "Organization",
        "name": "Fatman Parts"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "US",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnFeesCustomerPays",
        "url": `${SITE_URL}/returns`
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "US"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        },
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": product.price >= 99 ? 0 : 9.99,
          "currency": "USD"
        }
      }
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Category",
        "item": `${SITE_URL}/category/${product.category}`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `${SITE_URL}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProductPageClient product={product} isAdmin={isAdmin} />
    </>
  );
}
