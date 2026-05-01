import { NextResponse } from "next/server";
import { getFitmentState, type FitmentState, type Vehicle } from "@/lib/fitment";
import { getFitmentVerdictsFromDb } from "@/lib/fitment-db";

type Payload = {
  productSlugs?: string[];
  vehicle?: Vehicle;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Payload;
  const slugs = Array.isArray(body.productSlugs) ? body.productSlugs.filter(Boolean) : [];

  if (!slugs.length) {
    return NextResponse.json({ error: "productSlugs is required" }, { status: 400 });
  }

  const vehicle = body.vehicle ?? null;
  const dbVerdicts = await getFitmentVerdictsFromDb(slugs, vehicle);
  const fitments: Record<string, FitmentState> = {};

  for (const slug of slugs) {
    const dbVerdict = dbVerdicts?.[slug];
    fitments[slug] = dbVerdict ?? getFitmentState(slug, vehicle);
  }

  return NextResponse.json({ fitments });
}
