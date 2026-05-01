import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
import { categories, products } from "@/lib/catalog";
import { fitmentRules } from "@/lib/fitment";
import { createSupabaseAdminClient } from "@/lib/supabase";

const FITMENT_CHUNK_SIZE = 500;

export async function POST(req: Request) {
  if (!isAllowedAdminRequest(req, "FATMAN_ADMIN_SEED_KEY")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const includeFitment = Boolean(body?.includeFitment);
  const supabase = createSupabaseAdminClient();

  const categoryPayload = categories.map((category, index) => ({
    slug: category.slug,
    title: category.title,
    description: category.description,
    short_description: category.description,
    published: true,
    sort_order: index,
  }));

  const { error: categoriesError } = await supabase
    .from("categories")
    .upsert(categoryPayload, { onConflict: "slug" });

  if (categoriesError) {
    return NextResponse.json({ error: categoriesError.message, stage: "categories" }, { status: 500 });
  }

  const productPayload = products.map((product) => ({
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
  }));

  const { data: upsertedProducts, error: productsError } = await supabase
    .from("products")
    .upsert(productPayload, { onConflict: "slug" })
    .select("id, slug");

  if (productsError) {
    return NextResponse.json({ error: productsError.message, stage: "products" }, { status: 500 });
  }

  let fitmentInserted = 0;

  if (includeFitment) {
    const productIdBySlug = new Map((upsertedProducts ?? []).map((row) => [row.slug, row.id]));
    const productIds = [...productIdBySlug.values()];

    if (productIds.length) {
      const { error: deleteError } = await supabase
        .from("fitment_rules")
        .delete()
        .in("product_id", productIds);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message, stage: "fitment_delete" }, { status: 500 });
      }
    }

    const fitmentPayload = fitmentRules.flatMap((rule) => {
      const productId = productIdBySlug.get(rule.productSlug);
      if (!productId) return [];
      return rule.vehicles.map((vehicle) => ({
        product_id: productId,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant ?? null,
        engine: vehicle.engine,
        match_type: rule.matchType,
        source: "generated-data",
        confidence: rule.matchType === "fits" ? 0.95 : rule.matchType === "verify" ? 0.6 : 0.2,
      }));
    });

    for (let index = 0; index < fitmentPayload.length; index += FITMENT_CHUNK_SIZE) {
      const chunk = fitmentPayload.slice(index, index + FITMENT_CHUNK_SIZE);
      const { error } = await supabase.from("fitment_rules").insert(chunk);
      if (error) {
        return NextResponse.json(
          { error: error.message, stage: "fitment_insert", inserted: fitmentInserted },
          { status: 500 },
        );
      }
      fitmentInserted += chunk.length;
    }
  }

  return NextResponse.json({
    ok: true,
    categories: categoryPayload.length,
    products: productPayload.length,
    fitmentInserted,
  });
}
