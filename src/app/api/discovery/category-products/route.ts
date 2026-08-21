import { NextResponse } from "next/server";
import {
  getCategoryProductsForVehicle,
  getProductsByCategory,
  type ProductSort,
} from "@/lib/catalog-db";
import {
  getLiveFitmentModelCandidates,
  normalizeVehicle,
  type Vehicle,
} from "@/lib/fitment";

/**
 * A page of products in a category, optionally narrowed to what fits a vehicle.
 *
 * The selected vehicle lives in the browser (localStorage), so the server can't
 * know it at render time. The category page renders the unfiltered page for
 * fast first paint and SEO; when the shopper turns on "Fits Only" the grid
 * calls this route, which resolves the fit in SQL rather than in the browser.
 */
type Payload = {
  slug?: string;
  vehicle?: Vehicle | null;
  page?: number;
  perPage?: number;
  sort?: ProductSort;
  inStockOnly?: boolean;
  fitsOnly?: boolean;
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const slug = body.slug?.trim() || null;

  const options = {
    page: body.page,
    perPage: body.perPage,
    sort: body.sort,
    inStockOnly: body.inStockOnly,
  };

  // normalizeVehicle resolves the CHARM variant (e.g. model "F 150 2WD" +
  // variant "Pickup"); the candidate list is what actually matches
  // fitment_rules.model, which stores the joined string.
  const normalized: Vehicle | null = body.fitsOnly ? normalizeVehicle(body.vehicle) : null;

  if (!slug && !normalized) {
    // Without a category, the query only makes sense narrowed to a vehicle.
    return NextResponse.json({ error: "slug or vehicle is required" }, { status: 400 });
  }

  if (normalized) {
    const result = await getCategoryProductsForVehicle(
      slug,
      {
        year: normalized.year,
        make: normalized.make,
        models: getLiveFitmentModelCandidates(normalized),
        engine: normalized.engine,
        variant: normalized.variant ?? null,
      },
      options,
    );
    return NextResponse.json(result);
  }

  // Reached only with a slug: the slug-less case without a vehicle 400s above,
  // and with a vehicle it returns from the branch before this.
  const result = await getProductsByCategory(slug as string, options);
  return NextResponse.json({ ...result, fitments: {} });
}
