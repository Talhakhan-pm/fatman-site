import { NextResponse } from "next/server";
import { getFitmentState, type Vehicle } from "@/lib/fitment";
import { getFitmentVerdictFromDb } from "@/lib/fitment-db";

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
  const dbVerdict = await getFitmentVerdictFromDb(body.productSlug, vehicle);

  if (dbVerdict) {
    return NextResponse.json({ fitment: dbVerdict, source: "db" });
  }

  const fitment = getFitmentState(body.productSlug, vehicle);
  return NextResponse.json({ fitment, source: "legacy" });
}
