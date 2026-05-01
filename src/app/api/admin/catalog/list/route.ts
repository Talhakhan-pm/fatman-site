import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
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

const SUMMARY_COLUMNS =
  "slug, sku, category_slug, brand, name, price, stock_status, published";

const FULL_COLUMNS =
  "id, sku, slug, category_slug, brand, name, short_description, price, compare_at, stock_status, image_url, shipping_class, warranty_days, oem_part_number, published, metadata";

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

export async function GET(req: Request) {
  if (!isAllowedAdminRequest(req, "FATMAN_ADMIN_WRITE_KEY")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim() || null;
  const supabase = createSupabaseAdminClient();

  if (slug) {
    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select(FULL_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }
    if (!productRow) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productRow as ProductRow;
    const { data: fitmentRows, error: fitmentError } = await supabase
      .from("fitment_rules")
      .select("year, make, model, variant, engine, match_type, source, confidence, notes")
      .eq("product_id", product.id)
      .order("year", { ascending: true })
      .order("make", { ascending: true })
      .order("model", { ascending: true });

    if (fitmentError) {
      return NextResponse.json({ error: fitmentError.message }, { status: 500 });
    }

    return NextResponse.json({
      payload: toUpsertPayload(product, (fitmentRows ?? []) as FitmentRow[]),
      fitmentCount: fitmentRows?.length ?? 0,
    });
  }

  const search = url.searchParams.get("q")?.trim() || null;
  const category = url.searchParams.get("category")?.trim() || null;
  const limitRaw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 500) : 200;

  let query = supabase
    .from("products")
    .select(SUMMARY_COLUMNS)
    .order("name", { ascending: true })
    .limit(limit);

  if (category) query = query.eq("category_slug", category);
  if (search) {
    const escaped = search.replace(/[%,]/g, "");
    if (escaped) {
      query = query.or(
        `slug.ilike.%${escaped}%,name.ilike.%${escaped}%,sku.ilike.%${escaped}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: data ?? [],
    count: data?.length ?? 0,
    limit,
  });
}
