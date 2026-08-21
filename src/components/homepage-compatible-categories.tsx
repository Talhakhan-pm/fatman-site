"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGarage } from "@/components/garage-provider";
import {
  catalogRegistry,
  categoryIconMap,
  type RegistryIconKey,
} from "@/lib/catalog-registry";
import { getIconForCategorySlug, humanizeCategorySlug } from "@/lib/category-display";
import { formatCompactVehicleLabel } from "@/lib/fitment";

type CompatibleCategory = {
  slug: string;
  fitsCount: number;
  verifyCount: number;
};

const SECTION_LIMIT = 6;

type ResolvedCategory = CompatibleCategory & {
  title: string;
  shortDescription: string;
  icon: RegistryIconKey;
};

function resolveCategory(entry: CompatibleCategory): ResolvedCategory {
  const registry = catalogRegistry.find((item) => item.slug === entry.slug);
  return {
    ...entry,
    title: registry?.title ?? humanizeCategorySlug(entry.slug),
    shortDescription:
      registry?.shortDescription ?? "Confirmed-fit parts for your selected vehicle in this live catalog section.",
    icon: registry?.icon ?? getIconForCategorySlug(entry.slug),
  };
}

export function HomepageCompatibleCategories() {
  const { vehicle } = useGarage();
  const [categories, setCategories] = useState<CompatibleCategory[]>([]);
  const [loadedVehicleKey, setLoadedVehicleKey] = useState("");
  const vehicleKey = vehicle ? JSON.stringify(vehicle) : "";

  useEffect(() => {
    if (!vehicle) return;

    const controller = new AbortController();

    fetch("/api/discovery/compatible-categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vehicle }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { categories?: CompatibleCategory[] } | null) => {
        if (controller.signal.aborted) return;
        setCategories(payload?.categories ?? []);
        setLoadedVehicleKey(vehicleKey);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string } | null)?.name === "AbortError") return;
        setCategories([]);
        setLoadedVehicleKey(vehicleKey);
      });

    return () => controller.abort();
  }, [vehicle, vehicleKey]);

  if (!vehicle) return null;

  const vehicleLabel = formatCompactVehicleLabel(vehicle);
  const isLoading = loadedVehicleKey !== vehicleKey;
  const resolved = categories
    .filter((entry) => entry.fitsCount > 0)
    .map(resolveCategory)
    .slice(0, SECTION_LIMIT);

  return (
    <section className="relative bg-[#111318] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="rounded-[28px] border border-white/[0.08] bg-[#15181f] p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2">
                <span className="h-[2px] w-8 bg-[#ff6a00]" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#ff6a00]">
                  SHOP BY CATEGORY
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Categories that fit <span className="text-[#ff6a00]">{vehicleLabel}</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
                Ranked by the number of confirmed-fit parts in our live catalog. Counts reflect
                products verified for your exact vehicle, not the full category size.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
                />
              ))}
            </div>
          ) : resolved.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resolved.map((category) => {
                const Icon = categoryIconMap[category.icon];
                return (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}?fitsOnly=1`}
                    className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1d24] p-5 transition hover:-translate-y-[2px] hover:border-[#ff6a00]/40 hover:shadow-[0_12px_40px_rgba(255,106,0,0.12)]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/40 transition group-hover:border-[#ff6a00]/30 group-hover:bg-[#ff6a00]/15 group-hover:text-[#ff6a00]">
                      <div className="h-8 w-8">
                        <Icon />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-base font-black uppercase tracking-wide text-white transition group-hover:text-[#ff6a00] sm:text-lg">
                          {category.title}
                        </h3>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/[0.06] bg-white/[0.04] text-sm text-white/30 transition group-hover:border-[#ff6a00]/30 group-hover:bg-[#ff6a00]/20 group-hover:text-[#ff6a00]">
                          →
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-white/55">
                        {category.shortDescription}
                      </p>
                      <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
                        <span className="font-mono text-sm font-bold text-[#ff6a00]">
                          {category.fitsCount}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-white/45">
                          {category.fitsCount === 1 ? "confirmed fit" : "confirmed fits"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
              No categories have confirmed-fit parts for {vehicleLabel} yet. Try browsing the full
              catalog or refining the vehicle details to surface more exact matches.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
