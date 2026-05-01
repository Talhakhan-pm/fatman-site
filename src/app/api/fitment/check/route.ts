import { NextResponse } from "next/server";
import { getFitmentState, type Vehicle } from "@/lib/fitment";
import { getFitmentStateFromDb } from "@/lib/fitment-db";

type Payload = {
  productSlug?: string;
  vehicle?: Vehicle;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Payload;

  if (!body.productSlug) {
    return NextResponse.json({ error: "productSlug is required" }, { status: 400 });
  }

  const vehicle = body.vehicle ?? null;
  const fitment = await getFitmentStateFromDb(body.productSlug, vehicle);
  const fallback = getFitmentState(body.productSlug, vehicle);
  const source = fitment === fallback ? "legacy-or-db" : "db";

  return NextResponse.json({ fitment, source });
}
