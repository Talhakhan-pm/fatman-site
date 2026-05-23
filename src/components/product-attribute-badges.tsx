import { getProductDisplayBadges } from "@/lib/product-badges";
import type { Product } from "@/lib/catalog";

const badgeClassByKind = {
  condition: "border-emerald-400/35 bg-emerald-400/15 text-emerald-100",
  partSource: "border-sky-400/35 bg-sky-400/15 text-sky-100",
} as const;

export function ProductAttributeBadges({ product }: { product: Product }) {
  const badges = getProductDisplayBadges(product);
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map((badge) => {
        const isOEM = badge.label === "OEM";
        const isUSED = badge.label === "USED";
        const isNEW = badge.label === "NEW";
        return (
          <span
            key={`${badge.kind}-${badge.value}`}
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${badgeClassByKind[badge.kind]}`}
          >
            {isOEM && (
              <svg className="w-3 h-3 mr-1 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            )}
            {isUSED && (
              <svg className="w-3 h-3 mr-1 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
              </svg>
            )}
            {isNEW && (
              <svg className="w-3 h-3 mr-1 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            )}
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
