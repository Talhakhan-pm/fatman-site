import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase";
import { type Category, type Product } from "@/lib/catalog";
import { getProductBadgeMetadata } from "@/lib/product-badges";
import { catalogRegistry } from "@/lib/catalog-registry";

/**
 * Catalog access.
 *
 * Every function here issues a targeted query. This file previously loaded the
 * entire published catalog into memory (paging Supabase 1,000 rows at a time)
 * and filtered in JavaScript, which cost ~19 sequential round-trips per render
 * at 18k products — and would have been ~300 at the 300k the pipeline is
 * heading for.
 *
 * Category filtering relies on `products.top_level_category_slug`, a generated
 * column that mirrors resolveTopLevelCategorySlug() from category-taxonomy.ts.
 * Backed by idx_products_toplevel_name, a category page is an index scan
 * (26 buffers / ~27 ms) instead of a sequential scan (4,884 buffers / 3,355 ms).
 */

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

const PRODUCT_COLUMNS =
  "sku, slug, category_slug, brand, name, short_description, price, compare_at, " +
  "stock_status, image_url, shipping_class, warranty_days, oem_part_number, metadata, published";

export const DEFAULT_PER_PAGE = 60;
const MAX_PER_PAGE = 120;

export type ProductSort = "relevance" | "price-asc" | "price-desc" | "name";

export type ProductQueryOptions = {
  page?: number;
  perPage?: number;
  sort?: ProductSort;
  inStockOnly?: boolean;
  /** Restrict to these product slugs (used by the fits-my-vehicle filter). */
  slugs?: string[];
};

export type ProductPage = {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export const toProduct = (row: SupabaseProductRow): Product => {
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

const emptyPage = (page: number, perPage: number): ProductPage => ({
  products: [],
  total: 0,
  page,
  perPage,
  totalPages: 0,
});

/** Categories with their product counts. 17 rows; one query plus one grouped count. */
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const supabase = createSupabaseServerClient();
    // Query the storefront slugs explicitly: the table also holds ~2,400
    // granular CHARM source categories (still growing with imports), and an
    // unfiltered read stops at PostgREST's 1,000-row cap — which silently
    // dropped most storefront categories once the granular rows outnumbered it.
    const registrySlugList = catalogRegistry.map((entry) => entry.slug);
    const [{ data: rows, error }, { data: counts, error: countError }] = await Promise.all([
      supabase
        .from("categories")
        .select("slug, title, description, short_description, published")
        .eq("published", true)
        .in("slug", registrySlugList)
        .order("sort_order", { ascending: true }),
      supabase.rpc("category_product_counts"),
    ]);

    if (error) throw error;
    if (countError) throw countError;

    const byslug = new Map<string, { product_count: number; real_image_count: number }>(
      ((counts ?? []) as Array<{
        category_slug: string;
        product_count: number;
        real_image_count: number;
      }>).map((row) => [
        row.category_slug,
        { product_count: Number(row.product_count), real_image_count: Number(row.real_image_count) },
      ]),
    );

    // Only the approved storefront categories are surfaced; the catalog also
    // holds ~1,700 granular source categories that products roll up from.
    const registrySlugs = new Set<string>(catalogRegistry.map((entry) => entry.slug));

    return ((rows ?? []) as unknown as SupabaseCategoryRow[])
      .filter((row) => registrySlugs.has(row.slug))
      .map((row) => {
        const tally = byslug.get(row.slug);
        return {
          slug: row.slug as Category["slug"],
          title: row.title,
          description: row.description ?? row.short_description ?? "",
          productCount: tally?.product_count ?? 0,
          realImageCount: tally?.real_image_count ?? 0,
        };
      });
  } catch (error) {
    console.error("Supabase categories unavailable.", error);
    return [];
  }
});

export const getCategory = cache(async (slug: string): Promise<Category | undefined> => {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("slug, title, description, short_description, published")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return undefined;

    const row = data as unknown as SupabaseCategoryRow;
    const { count } = await supabase
      .from("products")
      .select("sku", { count: "exact", head: true })
      .eq("published", true)
      .eq("top_level_category_slug", slug);

    return {
      slug: row.slug as Category["slug"],
      title: row.title,
      description: row.description ?? row.short_description ?? "",
      productCount: count ?? 0,
      realImageCount: 0,
    };
  } catch (error) {
    console.error(`Supabase category lookup failed for "${slug}".`, error);
    return undefined;
  }
});

/**
 * One page of products in a storefront category.
 *
 * `slugs` narrows to a specific set (the fits-your-vehicle filter resolves
 * matching product slugs from fitment_rules first, then passes them here).
 */
export async function getProductsByCategory(
  slug: string,
  options: ProductQueryOptions = {},
): Promise<ProductPage> {
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, options.perPage ?? DEFAULT_PER_PAGE));
  const from = (page - 1) * perPage;

  if (options.slugs && options.slugs.length === 0) return emptyPage(page, perPage);

  try {
    const supabase = createSupabaseServerClient();
    let builder = supabase
      .from("products")
      .select(PRODUCT_COLUMNS, { count: "exact" })
      .eq("published", true)
      .eq("top_level_category_slug", slug);

    if (options.inStockOnly) builder = builder.eq("stock_status", "in-stock");
    if (options.slugs) builder = builder.in("slug", options.slugs);

    switch (options.sort) {
      case "price-asc":
        builder = builder.order("price", { ascending: true });
        break;
      case "price-desc":
        builder = builder.order("price", { ascending: false });
        break;
      default:
        // Matches idx_products_toplevel_name, so no sort step is needed.
        builder = builder.order("name", { ascending: true });
    }

    const { data, error, count } = await builder.range(from, from + perPage - 1);
    if (error) throw error;

    const total = count ?? 0;
    return {
      products: ((data ?? []) as unknown as SupabaseProductRow[]).map(toProduct),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  } catch (error) {
    console.error(`Supabase product page failed for category "${slug}".`, error);
    return emptyPage(page, perPage);
  }
}

export type VehicleFilter = {
  year: string;
  make: string;
  /**
   * Model candidates, not one model: CHARM splits "F 150 2WD Pickup" into
   * model "F 150 2WD" + variant "Pickup", while fitment_rules stores the full
   * string. Callers build this with getLiveFitmentModelCandidates() so the
   * SQL matches the same rows the fit badges do.
   */
  models: string[];
  engine: string;
  variant?: string | null;
};

/**
 * One page of products that fit a specific vehicle, optionally narrowed to a
 * storefront category (slug null = across the whole catalog).
 *
 * The join runs in Postgres (category_products_for_vehicle) rather than the
 * browser, so "Fits Only" stays correct across every page instead of only
 * filtering what happened to be loaded.
 */
export async function getCategoryProductsForVehicle(
  slug: string | null,
  vehicle: VehicleFilter,
  options: ProductQueryOptions = {},
): Promise<ProductPage & { fitsTotal: number; fitments: Record<string, "fits" | "verify"> }> {
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, options.perPage ?? DEFAULT_PER_PAGE));

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.rpc("category_products_for_vehicle", {
      p_category: slug,
      p_year: vehicle.year,
      p_make: vehicle.make,
      p_models: vehicle.models,
      p_engine: vehicle.engine,
      p_variant: vehicle.variant ?? null,
      p_in_stock: Boolean(options.inStockOnly),
      p_sort: options.sort ?? "relevance",
      p_limit: perPage,
      p_offset: (page - 1) * perPage,
    });

    if (error) throw error;

    const rows = (data ?? []) as unknown as Array<SupabaseProductRow & {
      match_type: "fits" | "verify";
      total_count: number;
      fits_count: number;
    }>;
    const total = rows.length ? Number(rows[0].total_count) : 0;
    const fitsTotal = rows.length ? Number(rows[0].fits_count) : 0;
    const fitments: Record<string, "fits" | "verify"> = {};
    for (const row of rows) fitments[row.slug] = row.match_type;

    return {
      products: rows.map(toProduct),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      fitsTotal,
      fitments,
    };
  } catch (error) {
    console.error(`Vehicle-filtered category query failed for "${slug}".`, error);
    return { ...emptyPage(page, perPage), fitsTotal: 0, fitments: {} };
  }
}

export const getProduct = cache(async (slug: string): Promise<Product | undefined> => {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    return data ? toProduct(data as unknown as SupabaseProductRow) : undefined;
  } catch (error) {
    console.error(`Supabase product lookup failed for "${slug}".`, error);
    return undefined;
  }
});

/**
 * Every published product slug, for the sitemap. Paged deliberately: this is
 * the one place that legitimately needs the whole catalog, and it needs only
 * one column.
 */
export async function getProductSlugs(): Promise<Array<{ slug: string; updatedAt?: string }>> {
  const pageSize = 1000;
  const slugs: Array<{ slug: string; updatedAt?: string }> = [];

  try {
    const supabase = createSupabaseServerClient();
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("published", true)
        .order("slug", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      const rows = (data ?? []) as Array<{ slug: string; updated_at: string | null }>;
      slugs.push(...rows.map((row) => ({ slug: row.slug, updatedAt: row.updated_at ?? undefined })));
      if (rows.length < pageSize) break;
    }
  } catch (error) {
    console.error("Supabase product slug listing failed.", error);
  }

  return slugs;
}

/** A small sample of products, for surfaces that just need "some products". */
export async function getProductSample(limit = 12): Promise<Product[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("published", true)
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return ((data ?? []) as unknown as SupabaseProductRow[]).map(toProduct);
  } catch (error) {
    console.error("Supabase product sample failed.", error);
    return [];
  }
}

const SEARCHABLE_PRODUCT_COLUMNS = [
  "name",
  "brand",
  "sku",
  "slug",
  "short_description",
  "oem_part_number",
  "category_slug",
] as const;

// PostgREST or() filters parse commas/parens/wildcards specially, so tokens are
// reduced to characters that cannot break out of the ilike pattern.
const sanitizeSearchToken = (token: string) => token.replace(/[^a-zA-Z0-9-]/g, "");

export async function searchProducts(
  query: string,
  limit: number,
): Promise<{ products: Product[]; count: number }> {
  const tokens = query
    .split(/\s+/)
    .map(sanitizeSearchToken)
    .filter(Boolean)
    .slice(0, 8);

  if (!tokens.length) {
    return { products: [], count: 0 };
  }

  try {
    const supabase = createSupabaseServerClient();
    // "planned" uses the planner's estimate: an exact count would evaluate every
    // ILIKE match across the table just to render a number nobody displays.
    let builder = supabase
      .from("products")
      .select(PRODUCT_COLUMNS, { count: "planned" })
      .eq("published", true);

    // Each or() group is ANDed with the previous ones: every token must match
    // at least one searchable column, in any order.
    for (const token of tokens) {
      builder = builder.or(
        SEARCHABLE_PRODUCT_COLUMNS.map((column) => `${column}.ilike.%${token}%`).join(","),
      );
    }

    const { data, error, count } = await builder
      .order("name", { ascending: true })
      .limit(limit);
    if (error) throw error;

    return {
      products: ((data ?? []) as unknown as SupabaseProductRow[]).map(toProduct),
      count: count ?? (data?.length ?? 0),
    };
  } catch (error) {
    console.error("Supabase product search unavailable.", error);
    return { products: [], count: 0 };
  }
}
