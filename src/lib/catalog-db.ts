import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  categories as fallbackCategories,
  getCategory as getFallbackCategory,
  getProduct as getFallbackProduct,
  getProductsByCategory as getFallbackProductsByCategory,
  products as fallbackProducts,
  type Category,
  type Product,
} from "@/lib/catalog";
import { getProductBadgeMetadata } from "@/lib/product-badges";

type SupabaseCategoryRow = {
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  published: boolean;
};

type SupabaseProductRow = {
  sku: string;
  slug: string;
  category_slug: Product["category"];
  brand: string;
  name: string;
  short_description: string | null;
  price: number | string;
  compare_at: number | string | null;
  stock_status: Product["stock"];
  image_url: string | null;
  shipping_class: string | null;
  warranty_days: number | null;
  oem_part_number: string | null;
  metadata: Record<string, unknown> | null;
  published: boolean;
};

type CatalogData = {
  products: Product[];
  categories: Category[];
};

const ALLOW_SOURCE_FALLBACK = process.env.NODE_ENV !== "production";

const toProduct = (row: SupabaseProductRow): Product => {
  const metadata = row.metadata ?? {};
  const badges = getProductBadgeMetadata({ metadata });

  return {
    sku: row.sku,
    slug: row.slug,
    category: row.category_slug,
    brand: row.brand,
    name: row.name,
    shortDescription: row.short_description ?? "",
    price: Number(row.price),
    compareAt: row.compare_at == null ? undefined : Number(row.compare_at),
    stock: row.stock_status,
    imageUrl: row.image_url ?? undefined,
    shippingClass: row.shipping_class ?? undefined,
    warrantyDays: row.warranty_days ?? undefined,
    oemPartNumber: row.oem_part_number ?? undefined,
    metadata,
    ...badges,
  };
};

const CATEGORY_DESCENDANT_PREFIXES: Record<string, string[]> = {
  "transmission-drivetrain": ["transmission-and-drivetrain"],
  "engine-cooling-exhaust": ["engine-cooling-and-exhaust"],
  "steering-suspension": ["steering-and-suspension"],
  "brakes-traction-control": ["brakes-and-traction-control"],
  "starting-charging": ["starting-and-charging"],
  "sensors-switches": ["sensors-and-switches"],
  "body-frame": ["body-and-frame"],
  "heating-air-conditioning": ["heating-and-air-conditioning"],
  "instrument-panel-gauges": ["instrument-panel-gauges-and-warning-indicators"],
  "wiper-washer": ["wiper-and-washer-systems"],
};

const categoryTreePrefixes = (slug: string) => [
  slug,
  ...(CATEGORY_DESCENDANT_PREFIXES[slug] ?? []),
];

const isCategoryOrDescendant = (categorySlug: string, parentSlug: string) =>
  categoryTreePrefixes(parentSlug).some(
    (prefix) => categorySlug === prefix || categorySlug.startsWith(`${prefix}-`),
  );

const productsForCategoryTree = (products: Product[], slug: string) =>
  products.filter((product) => isCategoryOrDescendant(product.category, slug));

const toCategories = (
  rows: SupabaseCategoryRow[],
  products: Product[],
): Category[] =>
  rows.map((row) => {
    const categoryProducts = productsForCategoryTree(products, row.slug);
    const realImageCount = categoryProducts.filter((product) => Boolean(product.imageUrl)).length;
    return {
      slug: row.slug as Category["slug"],
      title: row.title,
      description: row.description ?? row.short_description ?? "",
      productCount: categoryProducts.length,
      realImageCount,
    };
  });

const getFallbackCatalogData = (): CatalogData => ({
  products: fallbackProducts,
  categories: fallbackCategories,
});

async function fetchAllSupabaseRows<T>(
  queryFn: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  let allRows: T[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const to = from + batchSize - 1;
    const { data, error } = await queryFn(from, to);
    if (error) {
      throw error;
    }
    if (!data || data.length === 0) {
      break;
    }
    allRows.push(...data);
    if (data.length < batchSize) {
      break;
    }
    from += batchSize;
  }
  return allRows;
}

const readPublishedCatalogFromSupabase = cache(async (): Promise<CatalogData | null> => {
  try {
    const supabase = createSupabaseServerClient();
    const [products, categories] = await Promise.all([
      fetchAllSupabaseRows<SupabaseProductRow>((from, to) =>
        supabase
          .from("products")
          .select(
            "sku, slug, category_slug, brand, name, short_description, price, compare_at, stock_status, image_url, shipping_class, warranty_days, oem_part_number, metadata, published",
          )
          .eq("published", true)
          .order("name", { ascending: true })
          .range(from, to)
      ).then(rows => rows.map(toProduct)),
      fetchAllSupabaseRows<SupabaseCategoryRow>((from, to) =>
        supabase
          .from("categories")
          .select("slug, title, description, short_description, published")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .range(from, to)
      ),
    ]);

    const mappedCategories = toCategories(categories, products);

    return { products, categories: mappedCategories };
  } catch (error) {
    console.warn("Supabase catalog unavailable.", error);
    return null;
  }
});

export const getCatalogData = cache(async (): Promise<CatalogData> => {
  const liveCatalog = await readPublishedCatalogFromSupabase();
  if (liveCatalog) return liveCatalog;

  if (ALLOW_SOURCE_FALLBACK) {
    console.warn("Using source-file catalog fallback because Supabase live catalog was unavailable.");
    return getFallbackCatalogData();
  }

  console.error(
    "Supabase live catalog was unavailable in production. Returning empty live catalog instead of source-file fallback.",
  );
  return { products: [], categories: [] };
});

export async function getCategories() {
  return (await getCatalogData()).categories;
}

export async function getProducts() {
  return (await getCatalogData()).products;
}

export async function getCategory(slug: string) {
  const catalog = await getCatalogData();
  const liveCategory = catalog.categories.find((item) => item.slug === slug);

  if (liveCategory) return liveCategory;
  if (ALLOW_SOURCE_FALLBACK) return getFallbackCategory(slug);
  return undefined;
}

export async function getProductsByCategory(slug: string) {
  const catalog = await getCatalogData();
  const liveProducts = productsForCategoryTree(catalog.products, slug);

  if (liveProducts.length || catalog.categories.some((item) => item.slug === slug)) {
    return liveProducts;
  }

  if (ALLOW_SOURCE_FALLBACK) return getFallbackProductsByCategory(slug);
  return [];
}

export async function getProduct(slug: string) {
  const catalog = await getCatalogData();
  const liveProduct = catalog.products.find((item) => item.slug === slug);

  if (liveProduct) return liveProduct;
  if (ALLOW_SOURCE_FALLBACK) return getFallbackProduct(slug);
  return undefined;
}
