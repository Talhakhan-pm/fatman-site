import { NextResponse, type NextRequest } from "next/server";
import { getProducts } from "@/lib/catalog-db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const limitRaw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 24) : 12;
  const products = await getProducts();

  const filtered = query
    ? products.filter((product) => {
        const haystack = [
          product.name,
          product.brand,
          product.sku,
          product.slug,
          product.shortDescription,
          product.oemPartNumber ?? "",
          product.category,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : products;

  return NextResponse.json({ products: filtered.slice(0, limit), count: filtered.length });
}
