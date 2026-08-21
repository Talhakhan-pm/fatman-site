"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGarage } from "@/components/garage-provider";
import { buildFitsHref } from "@/lib/fits-link";

/**
 * /fits without vehicle params: forward to the canonical parameterised URL
 * from the saved garage vehicle, or ask for a vehicle if there is none.
 */
export function FitsFromGarage() {
  const { vehicle } = useGarage();
  const router = useRouter();

  useEffect(() => {
    if (vehicle) router.replace(buildFitsHref(vehicle));
  }, [vehicle, router]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
      {vehicle ? (
        <p className="text-sm text-white/60">Loading parts for your vehicle…</p>
      ) : (
        <div className="mx-auto max-w-md space-y-4">
          <h2 className="text-xl font-black text-white">No vehicle selected</h2>
          <p className="text-sm text-white/60">
            Pick your year, make, model and engine and we&apos;ll show every part in the
            catalog verified to fit it.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#ff6a00] px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#e55d00]"
          >
            Select your vehicle
          </Link>
        </div>
      )}
    </section>
  );
}
