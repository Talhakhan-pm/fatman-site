import { getProducts } from "@/lib/catalog-db";
import { CategoryProductGrid } from "@/components/category-product-grid";
import { TrustStrip } from "@/components/trust-strip";

export const metadata = {
  title: "Shop All Parts | Fatman Parts",
  description: "Browse our full catalog of high-quality automotive parts.",
};

export default async function ShopPage(props: {
  searchParams: Promise<{ q?: string; year?: string; make?: string; model?: string }>;
}) {
  const searchParams = await props.searchParams;
  const products = await getProducts();
  const query = searchParams.q?.toLowerCase() || "";

  // Basic server-side search filtering
  const filteredProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
    : products;

  return (
    <div className="flex min-h-screen flex-col bg-fatman-900">
      <main className="flex-1">
        <div className="border-b border-white/5 bg-white/[0.02] py-8">
          <div className="mx-auto max-w-6xl px-6">
            <h1 className="text-3xl font-black italic tracking-tight text-white uppercase sm:text-4xl">
              {query ? `Search: ${query}` : "All Parts"}
            </h1>
            <p className="mt-2 text-white/50">
              {filteredProducts.length} results found for your search.
            </p>
          </div>
        </div>

        <CategoryProductGrid products={filteredProducts} />
      </main>
      <TrustStrip />
    </div>
  );
}
