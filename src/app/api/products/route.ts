import { NextResponse, type NextRequest } from "next/server";
import { getProductSample, searchProducts } from "@/lib/catalog-db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const limitRaw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 24) : 12;

  if (query) {
    const { products, count } = await searchProducts(query, limit);
    return NextResponse.json({ products, count });
  }

  // No query: return a small sample rather than the whole catalog.
  const products = await getProductSample(limit);
  return NextResponse.json({ products, count: products.length });
}
