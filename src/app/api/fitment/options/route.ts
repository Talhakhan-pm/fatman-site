import { NextResponse } from "next/server";
import charmFitmentTree from "../../../../../data/charm-fitment/charm-fitment-tree.json";

/**
 * Vehicle-picker options, served per year.
 *
 * The full CHARM tree is 5.6 MB; a single year's slice is 1–55 KB. The
 * browser fetches the year list up front and one slice per year the shopper
 * actually picks, instead of downloading the whole tree in the bundle.
 */
type Tree = {
  years: string[];
  modelsByYearMake: Record<string, Record<string, string[]>>;
  variantsByYearMakeModel: Record<string, Record<string, string[]>>;
  enginesByYearMakeModelVariant: Record<string, Record<string, string[]>>;
  metadata?: { generatedAt?: string; source?: string };
};

const tree = charmFitmentTree as unknown as Tree;

// The tree changes only when the CHARM export is regenerated (a deploy), so
// long browser caching plus a week of CDN caching is safe.
const CACHE_HEADERS = {
  "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
};

export function GET(req: Request) {
  const year = new URL(req.url).searchParams.get("year");

  if (!year) {
    return NextResponse.json(
      {
        years: tree.years,
        defaultVariant: "Base",
        source: tree.metadata?.source ?? "Charm",
      },
      { headers: CACHE_HEADERS },
    );
  }

  if (!tree.years.includes(year)) {
    return NextResponse.json({ error: "unknown year" }, { status: 404 });
  }

  return NextResponse.json(
    {
      models: tree.modelsByYearMake[year] ?? {},
      variants: tree.variantsByYearMakeModel[year] ?? {},
      engines: tree.enginesByYearMakeModelVariant[year] ?? {},
    },
    { headers: CACHE_HEADERS },
  );
}
