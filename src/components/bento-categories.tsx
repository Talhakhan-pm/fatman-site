import Link from "next/link";
import { categories } from "@/lib/mock-data";

export function BentoCategories() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-5 flex items-end justify-between">
        <h3 className="text-2xl font-bold">Shop High-Intent Categories</h3>
        <p className="text-sm text-white/60">Stop playing parts roulette.</p>
      </div>
      <div className="grid auto-rows-[120px] gap-4 md:grid-cols-4">
        {categories.map((item, index) => (
          <Link
            href={`/category/${item.slug}`}
            key={item.title}
            className={`group rounded-2xl border border-white/15 bg-white/5 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-fatman-accent ${
              index % 3 === 0 ? "md:col-span-2" : "md:col-span-1"
            }`}
          >
            <p className="text-lg font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-white/65">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
