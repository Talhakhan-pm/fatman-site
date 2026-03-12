import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "All Categories | Fatman Parts",
  description:
    "Browse all auto part categories — engines, OEM parts, drivetrain, cooling, electrical, and suspension. OEM-verified fitment.",
  alternates: { canonical: "/category" },
};

export default function CategoriesIndexPage() {
  return (
    <div className="min-h-screen bg-[#111318] text-white">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-black tracking-tight">
          Shop by <span className="text-[#ff6a00]">Category</span>
        </h1>
        <p className="mt-3 text-white/50 max-w-xl">
          Browse OEM-verified parts across every major system. Pick a category
          to see products with guaranteed fitment.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative bg-[#1a1d24] border border-white/[0.06] hover:border-[#ff6a00]/40 p-6 transition-all duration-300 hover:translate-y-[-2px]"
            >
              <h2 className="text-lg font-black uppercase tracking-wide text-white group-hover:text-[#ff6a00] transition-colors">
                {cat.title}
              </h2>
              <p className="mt-2 text-white/40 text-sm leading-relaxed">
                {cat.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[#ff6a00] text-sm font-mono font-bold">
                Browse <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
