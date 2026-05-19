import { NextResponse } from "next/server";
import {
  getCompatibleProductsForVehicle,
  type CompatibleProductsOptions,
} from "@/lib/discovery-db";
import type { Vehicle } from "@/lib/fitment";

type Payload = {
  vehicle?: Vehicle;
} & CompatibleProductsOptions;

export async function POST(req: Request) {
  const body = (await req.json()) as Payload;

  if (!body.vehicle) {
    return NextResponse.json({ products: [] });
  }

  const products = await getCompatibleProductsForVehicle(body.vehicle, {
    categorySlug: body.categorySlug,
    excludeSlug: body.excludeSlug,
    limit: body.limit,
    includeVerify: body.includeVerify,
  });

  return NextResponse.json({ products });
}
