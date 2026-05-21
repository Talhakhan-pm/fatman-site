import { NextResponse } from "next/server";
import { decodeVinWithNhtsa } from "@/lib/vin";

type Payload = {
  vin?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Payload | null;
  const vin = body?.vin;

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 });
  }

  const decoded = await decodeVinWithNhtsa(vin);

  if (!decoded.valid) {
    return NextResponse.json(decoded, { status: 400 });
  }

  return NextResponse.json(decoded);
}
