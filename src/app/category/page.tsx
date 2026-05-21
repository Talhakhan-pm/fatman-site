import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/catalog-db";
import { catalogRegistry, categoryIconMap } from "@/lib/catalog-registry";

export const metadata: Metadata = {
  title: "All Categories | Fatman Parts",
  description:
    "Browse all Fatman catalog categories from the synced registry and live catalog snapshot. OEM-verified fitment.",
  alternates: { canonical: "/category" },
};

export default async function CategoriesIndexPage() {
  const generatedCategories = await getCategories();

  // Map database categories to registry data to get the icon
  const categories = generatedCategories.map((category) => {
    const registry = catalogRegistry.find((entry) => entry.slug === category.slug);
    return {
      ...category,
      Icon: registry ? categoryIconMap[registry.icon] : categoryIconMap.parts,
    };
  });

  return (
    <div className="min-h-screen bg-[#111318] text-white pt-28 lg:pt-32">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-black tracking-tight">
          Shop by <span className="text-[#ff6a00]">Category</span>
        </h1>
        <p className="mt-3 max-w-xl text-white/50">
          Browse OEM-verified parts across every major system. Pick a category
          to see products with guaranteed fitment.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = cat.Icon;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden border border-white/[0.06] bg-[#1a1d24] transition-all duration-300 hover:translate-y-[-2px] hover:border-[#ff6a00]/40"
              >
                <div className="relative h-44 overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,106,0,0.20),_transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))]" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1a1d24] to-transparent opacity-40 category-icon-wash" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="h-24 w-24 text-white/[0.35] transition-all duration-500 group-hover:scale-110 group-hover:text-[#ff6a00]/60 sm:h-28 sm:w-28">
                      <Icon />
                    </div>
                  </div>
                  <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                    {cat.title}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-black uppercase tracking-wide text-white transition-colors group-hover:text-[#ff6a00]">
                    {cat.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    {cat.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-mono font-bold text-[#ff6a00]">
                    Browse <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
