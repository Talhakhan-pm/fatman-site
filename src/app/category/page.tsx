import type { Metadata } from "next";
import Image from "next/image";
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
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Shop by <span className="text-[#ff6a00]">Category</span>
            </h1>
            <p className="mt-3 text-white/50 max-w-xl">
              Browse OEM-verified parts across every major system. Pick a category
              to see products with guaranteed fitment.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-white/60">
              Featured OEM Lighting Detail <span className="text-[#ff6a00]">●</span> Ready for category exploration
            </p>
          </div>

          <div className="relative min-h-[280px] overflow-hidden border border-white/[0.06] bg-[#1a1d24]">
            <Image
              src="/editorial/fatman-headlight-studio-detail.png"
              alt="Studio detail of an OEM replacement headlight assembly"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111318]/15 via-transparent to-[#111318]/55" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#ff6a00]">OEM Detail</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                Clean product-grade visuals for replacement lighting, body, and front-end categories.
              </p>
            </div>
          </div>
        </div>

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
