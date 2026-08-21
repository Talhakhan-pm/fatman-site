import type { CategorySlug } from "@/lib/catalog-registry";
import type { ProductCondition, ProductPartSource } from "@/lib/product-badges";

/**
 * Catalog types and pure helpers, split from catalog.ts so client components
 * can import them without pulling the bundled generated-data catalog
 * (~1.2 MB of products/fitment rules) into the browser bundle.
 */

export type Product = {
  sku: string;
  slug: string;
  category: CategorySlug;
  brand: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAt?: number;
  stock: "in-stock" | "low-stock" | "preorder";
  imageUrl?: string;
  shippingClass?: string;
  warrantyDays?: number;
  oemPartNumber?: string;
  metadata?: Record<string, unknown>;
  condition?: ProductCondition;
  partSource?: ProductPartSource;
};

export type Category = {
  slug: CategorySlug;
  title: string;
  description: string;
  productCount: number;
  realImageCount: number;
};

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
