import { NextResponse } from "next/server";
import { getFitmentState, type Vehicle } from "@/lib/fitment";

type Payload = {
  productSlug?: string;
  vehicle?: Vehicle;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Payload;

  if (!body.productSlug) {
    return NextResponse.json({ error: "productSlug is required" }, { status: 400 });
  }

  const fitment = getFitmentState(body.productSlug, body.vehicle ?? null);
  return NextResponse.json({ fitment });
}
