"use client";

import Link from "next/link";
import { formatVehicleLabel } from "@/lib/fitment";
import { useGarage } from "./garage-provider";

export function StickyFitmentBar() {
  const { vehicle } = useGarage();

  return (
    <div className="sticky top-[64px] z-30 border-b border-white/10 bg-fatman-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-xs">
        <p className="text-white/80">
          {vehicle
            ? `Shopping for ${formatVehicleLabel(vehicle)}`
            : "No vehicle selected, fitment results may vary."}
        </p>
        <Link href="/#fitment" className="rounded-md border border-white/20 px-2.5 py-1 text-white/85 transition hover:bg-white/10">
          Update Fitment
        </Link>
      </div>
    </div>
  );
}
