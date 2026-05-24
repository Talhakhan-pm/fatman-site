import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getLiveFitmentModelCandidates,
  liveFitmentVariantMatches,
  normalizeVehicle,
  type FitmentState,
  type Vehicle,
} from "@/lib/fitment";
import type { Product } from "@/lib/catalog";
import { getProductBadgeMetadata } from "@/lib/product-badges";

export type CompatibleProduct = Product & {
  fitment: Exclude<FitmentState, "no-fit">;
};

export type CompatibleProductsOptions = {
  categorySlug?: string;
  excludeSlug?: string;
  limit?: number;
  includeVerify?: boolean;
};

export type CompatibleCategorySummary = {
  slug: Product["category"];
  fitsCount: number;
  verifyCount: number;
};

type FitmentRuleRow = {
  product_id: string;
  variant: string | null;
  match_type: FitmentState;
};

type ProductRow = {
  id: string;
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
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;
const PRODUCT_ID_CHUNK_SIZE = 100;

function chunkValues<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function toCompatibleProduct(
  row: ProductRow,
  fitment: CompatibleProduct["fitment"],
): CompatibleProduct {
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
    fitment,
  };
}

export async function getCompatibleProductsForVehicle(
  vehicle: Vehicle | null | undefined,
  options: CompatibleProductsOptions = {},
): Promise<CompatibleProduct[]> {
  const normalized = normalizeVehicle(vehicle);
  if (!normalized) return [];

  const requestedLimit = options.limit ?? DEFAULT_LIMIT;
  const limit = Math.max(1, Math.min(MAX_LIMIT, requestedLimit));
  const allowedStates: FitmentState[] = options.includeVerify
    ? ["fits", "verify"]
    : ["fits"];

  try {
    const supabase = createSupabaseServerClient();

    const modelCandidates = getLiveFitmentModelCandidates(normalized);
    const { data: fitmentRows, error: fitmentError } = await supabase
      .from("fitment_rules")
      .select("product_id, variant, match_type")
      .eq("year", normalized.year)
      .eq("make", normalized.make)
      .in("model", modelCandidates)
      .eq("engine", normalized.engine)
      .in("match_type", allowedStates);

    if (fitmentError || !fitmentRows?.length) return [];

    const bestState = new Map<string, FitmentState>();
    for (const row of fitmentRows as FitmentRuleRow[]) {
      const variantOk = liveFitmentVariantMatches(row.variant, normalized);
      if (!variantOk) continue;

      const current = bestState.get(row.product_id);
      if (!current || (current === "verify" && row.match_type === "fits")) {
        bestState.set(row.product_id, row.match_type);
      }
    }

    if (!bestState.size) return [];

    const productRows: ProductRow[] = [];
    for (const productIds of chunkValues([...bestState.keys()], PRODUCT_ID_CHUNK_SIZE)) {
      let productQuery = supabase
        .from("products")
        .select(
          "id, sku, slug, category_slug, brand, name, short_description, price, compare_at, stock_status, image_url, shipping_class, warranty_days, oem_part_number, metadata",
        )
        .in("id", productIds)
        .eq("published", true);

      if (options.categorySlug) {
        productQuery = productQuery.eq("category_slug", options.categorySlug);
      }
      if (options.excludeSlug) {
        productQuery = productQuery.neq("slug", options.excludeSlug);
      }

      const { data: chunkRows, error: productError } = await productQuery;
      if (productError) return [];
      productRows.push(...((chunkRows ?? []) as ProductRow[]));
    }

    if (!productRows.length) return [];

    const compatible = productRows
      .map((row) => {
        const state = bestState.get(row.id);
        if (state !== "fits" && state !== "verify") return null;
        return toCompatibleProduct(row, state);
      })
      .filter((row): row is CompatibleProduct => row !== null);

    compatible.sort((a, b) => {
      if (a.fitment !== b.fitment) return a.fitment === "fits" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return compatible.slice(0, limit);
  } catch (error) {
    console.warn("Compatible products lookup failed.", error);
    return [];
  }
}

export async function getCompatibleCategoriesForVehicle(
  vehicle: Vehicle | null | undefined,
): Promise<CompatibleCategorySummary[]> {
  const normalized = normalizeVehicle(vehicle);
  if (!normalized) return [];

  try {
    const supabase = createSupabaseServerClient();

    const modelCandidates = getLiveFitmentModelCandidates(normalized);
    const { data: fitmentRows, error: fitmentError } = await supabase
      .from("fitment_rules")
      .select("product_id, variant, match_type")
      .eq("year", normalized.year)
      .eq("make", normalized.make)
      .in("model", modelCandidates)
      .eq("engine", normalized.engine)
      .in("match_type", ["fits", "verify"]);

    if (fitmentError || !fitmentRows?.length) return [];

    const bestState = new Map<string, FitmentState>();
    for (const row of fitmentRows as FitmentRuleRow[]) {
      const variantOk = liveFitmentVariantMatches(row.variant, normalized);
      if (!variantOk) continue;

      const current = bestState.get(row.product_id);
      if (!current || (current === "verify" && row.match_type === "fits")) {
        bestState.set(row.product_id, row.match_type);
      }
    }

    if (!bestState.size) return [];

    const productRows: Array<{ id: string; category_slug: Product["category"] }> = [];
    for (const productIds of chunkValues([...bestState.keys()], PRODUCT_ID_CHUNK_SIZE)) {
      const { data: chunkRows, error: productError } = await supabase
        .from("products")
        .select("id, category_slug")
        .in("id", productIds)
        .eq("published", true);

      if (productError) return [];
      productRows.push(...((chunkRows ?? []) as Array<{ id: string; category_slug: Product["category"] }>));
    }

    if (!productRows.length) return [];

    const counts = new Map<Product["category"], { fits: number; verify: number }>();
    for (const row of productRows) {
      const state = bestState.get(row.id);
      if (state !== "fits" && state !== "verify") continue;

      const bucket = counts.get(row.category_slug) ?? { fits: 0, verify: 0 };
      if (state === "fits") bucket.fits += 1;
      else bucket.verify += 1;
      counts.set(row.category_slug, bucket);
    }

    return [...counts.entries()]
      .map(([slug, { fits, verify }]) => ({
        slug,
        fitsCount: fits,
        verifyCount: verify,
      }))
      .filter((entry) => entry.fitsCount > 0 || entry.verifyCount > 0)
      .sort((a, b) => {
        if (a.fitsCount !== b.fitsCount) return b.fitsCount - a.fitsCount;
        if (a.verifyCount !== b.verifyCount) return b.verifyCount - a.verifyCount;
        return a.slug.localeCompare(b.slug);
      });
  } catch (error) {
    console.warn("Compatible categories lookup failed.", error);
    return [];
  }
}
