import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
import {
  getLocalCatalogRecord,
  listLocalCatalogRecords,
  type LocalCatalogFitment,
  type LocalCatalogProduct,
} from "@/lib/admin-catalog-local-store";
import {
  getProduct as getFallbackProduct,
  products as fallbackProducts,
  type Product as FallbackProduct,
} from "@/lib/catalog";
import { fitmentRules } from "@/lib/fitment";
import { createSupabaseAdminClient } from "@/lib/supabase";

type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  category_slug: string;
  brand: string;
  name: string;
  short_description: string | null;
  price: number | string;
  compare_at: number | string | null;
  stock_status: "in-stock" | "low-stock" | "preorder";
  image_url: string | null;
  shipping_class: string | null;
  warranty_days: number | null;
  oem_part_number: string | null;
  published: boolean;
  metadata: Record<string, unknown> | null;
};

type FitmentRow = {
  year: string;
  make: string;
  model: string;
  variant: string | null;
  engine: string;
  match_type: "fits" | "verify" | "no-fit";
  source: string | null;
  confidence: number | string | null;
  notes: string | null;
};

type ProductSummary = {
  slug: string;
  sku: string;
  category_slug: string;
  brand: string;
  name: string;
  price: number | string;
  stock_status: "in-stock" | "low-stock" | "preorder";
  published: boolean;
};

const SUMMARY_COLUMNS =
  "slug, sku, category_slug, brand, name, price, stock_status, published";

const FULL_COLUMNS =
  "id, sku, slug, category_slug, brand, name, short_description, price, compare_at, stock_status, image_url, shipping_class, warranty_days, oem_part_number, published, metadata";

const SUPABASE_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: PromiseLike<T>, ms: number) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Supabase request timed out after ${ms}ms`)), ms);
    }),
  ]);
}

function formatSupabaseError(error: unknown) {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
    if (cause?.code) return `${error.message} (cause: ${cause.code})`;
    if (cause?.message && cause.message !== error.message) {
      return `${error.message} (cause: ${cause.message})`;
    }
    return error.message;
  }

  return "Failed to load product";
}

function toUpsertPayload(product: ProductRow, fitment: FitmentRow[]) {
  return {
    product: {
      sku: product.sku,
      slug: product.slug,
      category: product.category_slug,
      brand: product.brand,
      name: product.name,
      shortDescription: product.short_description ?? "",
      price: Number(product.price),
      compareAt: product.compare_at == null ? null : Number(product.compare_at),
      stock: product.stock_status,
      imageUrl: product.image_url,
      shippingClass: product.shipping_class,
      warrantyDays: product.warranty_days,
      oemPartNumber: product.oem_part_number,
      published: product.published,
      metadata: product.metadata ?? {},
    },
    fitment: fitment.map((row) => ({
      year: row.year,
      make: row.make,
      model: row.model,
      variant: row.variant,
      engine: row.engine,
      matchType: row.match_type,
      source: row.source ?? "admin-ui",
      confidence: row.confidence == null ? null : Number(row.confidence),
      notes: row.notes,
    })),
    replaceFitment: true,
  };
}

function fallbackProductToRow(product: FallbackProduct): ProductRow {
  return {
    id: product.slug,
    sku: product.sku,
    slug: product.slug,
    category_slug: product.category,
    brand: product.brand,
    name: product.name,
    short_description: product.shortDescription,
    price: product.price,
    compare_at: product.compareAt ?? null,
    stock_status: product.stock,
    image_url: product.imageUrl ?? null,
    shipping_class: product.shippingClass ?? null,
    warranty_days: product.warrantyDays ?? null,
    oem_part_number: product.oemPartNumber ?? null,
    published: true,
    metadata: {},
  };
}

function localProductToRow(product: LocalCatalogProduct): ProductRow {
  return {
    id: product.slug,
    sku: product.sku,
    slug: product.slug,
    category_slug: product.category,
    brand: product.brand,
    name: product.name,
    short_description: product.shortDescription,
    price: product.price,
    compare_at: product.compareAt,
    stock_status: product.stock,
    image_url: product.imageUrl,
    shipping_class: product.shippingClass,
    warranty_days: product.warrantyDays,
    oem_part_number: product.oemPartNumber,
    published: product.published,
    metadata: product.metadata,
  };
}

function localFitmentToRows(fitment: LocalCatalogFitment[]): FitmentRow[] {
  return fitment.map((row) => ({
    year: row.year,
    make: row.make,
    model: row.model,
    variant: row.variant,
    engine: row.engine,
    match_type: row.matchType,
    source: row.source,
    confidence: row.confidence,
    notes: row.notes,
  }));
}

function toProductSummary(product: ProductRow): ProductSummary {
  return {
    slug: product.slug,
    sku: product.sku,
    category_slug: product.category_slug,
    brand: product.brand,
    name: product.name,
    price: product.price,
    stock_status: product.stock_status,
    published: product.published,
  };
}

function getFallbackFitmentRows(productSlug: string): FitmentRow[] {
  return fitmentRules
    .filter((rule) => rule.productSlug === productSlug)
    .flatMap((rule) =>
      rule.vehicles.map((vehicle) => ({
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant ?? null,
        engine: vehicle.engine,
        match_type: rule.matchType,
        source: "generated-fallback",
        confidence: null,
        notes: null,
      })),
    )
    .sort((a, b) => {
      const yearCompare = a.year.localeCompare(b.year);
      if (yearCompare !== 0) return yearCompare;
      const makeCompare = a.make.localeCompare(b.make);
      if (makeCompare !== 0) return makeCompare;
      return a.model.localeCompare(b.model);
    });
}

async function getLocalPayloadBySlug(slug: string) {
  const record = await getLocalCatalogRecord(slug);
  if (!record) return null;

  const productRow = localProductToRow(record.product);
  const fitmentRows = localFitmentToRows(record.fitment);

  return {
    payload: toUpsertPayload(productRow, fitmentRows),
    fitmentCount: fitmentRows.length,
    source: "local",
    updatedAt: record.updatedAt,
  };
}

function getFallbackPayloadBySlug(slug: string) {
  const product = getFallbackProduct(slug);
  if (!product) return null;

  const productRow = fallbackProductToRow(product);
  const fitmentRows = getFallbackFitmentRows(slug);

  return {
    payload: toUpsertPayload(productRow, fitmentRows),
    fitmentCount: fitmentRows.length,
    source: "fallback",
  };
}

async function getLocalProductList(search: string | null, category: string | null) {
  const records = await listLocalCatalogRecords();
  const needle = search?.toLowerCase() ?? null;

  return records
    .filter((record) => {
      if (category && record.product.category !== category) return false;
      if (!needle) return true;
      return [record.product.slug, record.product.name, record.product.sku].some((value) =>
        value.toLowerCase().includes(needle),
      );
    })
    .map((record) => toProductSummary(localProductToRow(record.product)));
}

function getFallbackProductList(search: string | null, category: string | null) {
  let items = [...fallbackProducts];

  if (category) {
    items = items.filter((item) => item.category === category);
  }

  if (search) {
    const needle = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.slug.toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle) ||
        item.sku.toLowerCase().includes(needle),
    );
  }

  return items.map((item) =>
    toProductSummary({
      slug: item.slug,
      sku: item.sku,
      category_slug: item.category,
      brand: item.brand,
      name: item.name,
      price: item.price,
      stock_status: item.stock,
      published: true,
      id: item.slug,
      short_description: item.shortDescription,
      compare_at: item.compareAt ?? null,
      image_url: item.imageUrl ?? null,
      shipping_class: item.shippingClass ?? null,
      warranty_days: item.warrantyDays ?? null,
      oem_part_number: item.oemPartNumber ?? null,
      metadata: {},
    }),
  );
}

function mergeProductLists(baseProducts: ProductSummary[], localProducts: ProductSummary[], limit: number) {
  const merged = new Map(baseProducts.map((product) => [product.slug, product]));
  for (const product of localProducts) {
    merged.set(product.slug, product);
  }

  return [...merged.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function GET(req: Request) {
  if (!isAllowedAdminRequest(req, "FATMAN_ADMIN_WRITE_KEY")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim() || null;
  const search = url.searchParams.get("q")?.trim() || null;
  const category = url.searchParams.get("category")?.trim() || null;
  const limitRaw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 500) : 200;

  if (slug) {
    const local = await getLocalPayloadBySlug(slug);
    if (local) return NextResponse.json(local);
  }

  try {
    const supabase = createSupabaseAdminClient();

    if (slug) {
      const { data: productRow, error: productError } = await withTimeout(
        supabase.from("products").select(FULL_COLUMNS).eq("slug", slug).maybeSingle(),
        SUPABASE_TIMEOUT_MS,
      );

      if (productError) throw productError;
      if (!productRow) {
        const fallback = getFallbackPayloadBySlug(slug);
        if (!fallback) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(fallback);
      }

      const product = productRow as ProductRow;
      const { data: fitmentRows, error: fitmentError } = await withTimeout(
        supabase
          .from("fitment_rules")
          .select("year, make, model, variant, engine, match_type, source, confidence, notes")
          .eq("product_id", product.id)
          .order("year", { ascending: true })
          .order("make", { ascending: true })
          .order("model", { ascending: true }),
        SUPABASE_TIMEOUT_MS,
      );

      if (fitmentError) throw fitmentError;

      return NextResponse.json({
        payload: toUpsertPayload(product, (fitmentRows ?? []) as FitmentRow[]),
        fitmentCount: fitmentRows?.length ?? 0,
        source: "supabase",
      });
    }

    let query = supabase
      .from("products")
      .select(SUMMARY_COLUMNS)
      .order("name", { ascending: true })
      .limit(limit);

    if (category) query = query.eq("category_slug", category);
    if (search) {
      const escaped = search.replace(/[%,]/g, "");
      if (escaped) {
        query = query.or(`slug.ilike.%${escaped}%,name.ilike.%${escaped}%,sku.ilike.%${escaped}%`);
      }
    }

    const { data, error } = await withTimeout(query, SUPABASE_TIMEOUT_MS);
    if (error) throw error;

    const localProducts = await getLocalProductList(search, category);
    const products = mergeProductLists((data ?? []) as ProductSummary[], localProducts, limit);

    return NextResponse.json({
      products,
      count: products.length,
      limit,
      source: localProducts.length ? "supabase+local" : "supabase",
    });
  } catch (error) {
    if (slug) {
      const fallback = getFallbackPayloadBySlug(slug);
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json(
        { error: formatSupabaseError(error) },
        { status: 500 },
      );
    }

    const [fallbackProducts, localProducts] = await Promise.all([
      Promise.resolve(getFallbackProductList(search, category)),
      getLocalProductList(search, category),
    ]);
    const products = mergeProductLists(fallbackProducts, localProducts, limit);

    return NextResponse.json({
      products,
      count: products.length,
      limit,
      source: localProducts.length ? "fallback+local" : "fallback",
    });
  }
}
