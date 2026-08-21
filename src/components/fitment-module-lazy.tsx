"use client";

import dynamic from "next/dynamic";

/**
 * Defers the fitment box — and with it the 5.6 MB CHARM vehicle tree its
 * chunk carries — out of the homepage's critical path. The page paints and
 * becomes interactive first; the picker hydrates right after, behind a
 * same-size skeleton so nothing shifts.
 */
const FitmentModuleV2 = dynamic(
  () => import("./fitment-module-v2").then((mod) => mod.FitmentModuleV2),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-5 p-6 sm:p-8" aria-busy="true" aria-label="Loading fitment lookup">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-[#ff6a00]">
            ▶ FITMENT LOOKUP
          </span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-3 w-16 shrink-0 animate-pulse bg-white/[0.06]" />
              <div className="h-11 flex-1 animate-pulse border border-white/[0.04] bg-white/[0.04]" />
            </div>
          ))}
        </div>
        <div className="h-[52px] w-full animate-pulse bg-white/[0.06]" />
      </div>
    ),
  },
);

export function FitmentModuleLazy() {
  return <FitmentModuleV2 />;
}
