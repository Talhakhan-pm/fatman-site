import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase";

type ArchivePayload = {
  slug?: string;
  sku?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  if (!isAllowedAdminRequest(req, "FATMAN_ADMIN_WRITE_KEY")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as ArchivePayload | null;
  const slug = clean(body?.slug);
  const sku = clean(body?.sku);

  if (!slug && !sku) {
    return NextResponse.json({ error: "Product slug or SKU is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("products")
      .update({ published: false })
      .select("id, slug, sku, name, published")
      .limit(1);

    query = slug ? query.eq("slug", slug) : query.eq("sku", sku);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const product = data?.[0];
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not archive product" },
      { status: 500 },
    );
  }
}
