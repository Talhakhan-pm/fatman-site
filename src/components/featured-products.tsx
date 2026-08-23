import { products } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14">
      <div className="mb-5 flex items-end justify-between">
        <h3 className="text-2xl font-bold">Featured Products</h3>
        <p className="text-sm text-white/60">Funny brand. Serious fitment.</p>
      </div>
      <div className="fm-grid">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
