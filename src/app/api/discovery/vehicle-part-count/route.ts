import { NextResponse } from "next/server";
import { getCategoryProductsForVehicle } from "@/lib/catalog-db";
import {
  getLiveFitmentModelCandidates,
  normalizeVehicle,
  type Vehicle,
} from "@/lib/fitment";

/**
 * Live part counts for a vehicle, across the whole catalog.
 *
 * Replaces syntheticPartCount(), which derived a number from the vehicle
 * string's character codes. `fits` is the confirmed-fit count; `total` also
 * includes parts that need VIN verification.
 */
type Payload = {
  vehicle?: Vehicle | null;
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const normalized = normalizeVehicle(body.vehicle);
  if (!normalized) {
    return NextResponse.json({ total: null, fits: null });
  }

  const page = await getCategoryProductsForVehicle(
    null,
    {
      year: normalized.year,
      make: normalized.make,
      models: getLiveFitmentModelCandidates(normalized),
      engine: normalized.engine,
      variant: normalized.variant ?? null,
    },
    { perPage: 1 },
  );

  return NextResponse.json({ total: page.total, fits: page.fitsTotal });
}
