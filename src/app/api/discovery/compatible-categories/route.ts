import { NextResponse } from "next/server";
import { getCompatibleCategoriesForVehicle } from "@/lib/discovery-db";
import type { Vehicle } from "@/lib/fitment";

type Payload = {
  vehicle?: Vehicle;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Payload;

  if (!body.vehicle) {
    return NextResponse.json({ categories: [] });
  }

  const categories = await getCompatibleCategoriesForVehicle(body.vehicle);

  return NextResponse.json({ categories });
}
