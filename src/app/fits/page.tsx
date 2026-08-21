import type { Metadata } from "next";
import { FitsFromGarage } from "@/components/fits-from-garage";
import { TrustStrip } from "@/components/trust-strip";
import { VehiclePartsGrid, type VehicleCategoryFacet } from "@/components/vehicle-parts-grid";
import { getCategoryProductsForVehicle } from "@/lib/catalog-db";
import { getCompatibleCategoriesForVehicle } from "@/lib/discovery-db";
import {
  formatVehicleLabel,
  getLiveFitmentModelCandidates,
  normalizeVehicle,
  type Vehicle,
} from "@/lib/fitment";
import { catalogRegistry } from "@/lib/catalog-registry";
import { humanizeCategorySlug } from "@/lib/category-display";

const SITE_URL = "https://fatmanparts.com";

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

function vehicleFromParams(sp: SearchParams | undefined): Vehicle | null {
  const year = first(sp?.year);
  const make = first(sp?.make);
  const model = first(sp?.model);
  const engine = first(sp?.engine);
  if (!year || !make || !model || !engine) return null;
  return { year, make, model, variant: first(sp?.variant), engine };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}): Promise<Metadata> {
  const vehicle = vehicleFromParams(await searchParams);

  if (!vehicle) {
    return {
      title: "Parts That Fit Your Vehicle | Fatman Parts",
      description: "Every OEM-verified part in our live catalog that fits your exact vehicle.",
      robots: { index: false },
    };
  }

  const label = formatVehicleLabel(vehicle);
  return {
    title: `Parts That Fit ${label} | Fatman Parts`,
    description: `Every OEM-verified part in our live catalog confirmed to fit a ${label}, with fast U.S. shipping.`,
    alternates: { canonical: `${SITE_URL}/fits` },
  };
}

export default async function FitsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const requested = vehicleFromParams(sp);
  const normalized = requested ? normalizeVehicle(requested) : null;

  if (!normalized) {
    return (
      <div className="min-h-screen bg-fatman-900 text-white pt-24 lg:pt-32">
        <FitsFromGarage />
        <div className="mt-12">
          <TrustStrip />
        </div>
      </div>
    );
  }

  const label = formatVehicleLabel(normalized);
  const pageParam = Number(first(sp?.page));

  const [initialPage, categorySummaries] = await Promise.all([
    getCategoryProductsForVehicle(
      null,
      {
        year: normalized.year,
        make: normalized.make,
        models: getLiveFitmentModelCandidates(normalized),
        engine: normalized.engine,
        variant: normalized.variant ?? null,
      },
      { page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1 },
    ),
    getCompatibleCategoriesForVehicle(normalized),
  ]);

  const categories: VehicleCategoryFacet[] = categorySummaries.map((entry) => ({
    slug: entry.slug,
    title:
      catalogRegistry.find((item) => item.slug === entry.slug)?.title ??
      humanizeCategorySlug(entry.slug),
    count: entry.fitsCount + entry.verifyCount,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Parts that fit ${label}`, item: `${SITE_URL}/fits` },
    ],
  };

  return (
    <div className="min-h-screen bg-fatman-900 text-white pt-24 lg:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="mx-auto max-w-6xl px-4 pb-2 pt-2 sm:px-6">
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="h-[2px] w-8 bg-[#ff6a00]" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#ff6a00]">
            Verified for your vehicle
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
          Parts that fit <span className="text-[#ff6a00]">{label}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-white/70">
          {initialPage.total} parts in the live catalog matched to this exact vehicle —
          filter by category or browse everything.
        </p>
      </section>

      <VehiclePartsGrid
        vehicle={normalized}
        vehicleLabel={label}
        initialPage={initialPage}
        categories={categories}
      />

      <div className="mt-12">
        <TrustStrip />
      </div>
    </div>
  );
}
