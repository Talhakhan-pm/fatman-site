import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalog-db";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { decodeVinWithNhtsa } from "@/lib/vin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPABASE_TIMEOUT_MS = 6000;

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  vin?: string;
  productSlug?: string;
  message?: string;
  source?: string;
  website?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Supabase request timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  if (clean(body.website)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const phone = clean(body.phone) || null;
  const vin = clean(body.vin);
  const productSlug = clean(body.productSlug) || null;
  const message = clean(body.message) || null;
  const source = clean(body.source) || "fitment-help";

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!vin) return NextResponse.json({ error: "VIN is required" }, { status: 400 });

  const decoded = await decodeVinWithNhtsa(vin);
  if (!decoded.valid) {
    return NextResponse.json({ error: decoded.error || "VIN could not be decoded", decoded }, { status: 400 });
  }

  const product = productSlug ? await getProduct(productSlug) : null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await withTimeout(
      supabase
        .from("fitment_requests")
        .insert({
          status: "new",
          source,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          vin: decoded.vin,
          product_slug: product?.slug ?? productSlug,
          product_sku: product?.sku ?? null,
          product_name: product?.name ?? null,
          vehicle_year: decoded.year ?? null,
          vehicle_make: decoded.make ?? null,
          vehicle_model: decoded.model ?? null,
          vehicle_trim: decoded.trim ?? null,
          vehicle_engine: decoded.engine ?? null,
          decoded_vehicle: decoded.raw ?? decoded,
          message,
          metadata: {
            userAgent: req.headers.get("user-agent"),
            referer: req.headers.get("referer"),
          },
        })
        .select("id, created_at")
        .single(),
      SUPABASE_TIMEOUT_MS,
    );

    if (error) {
      return NextResponse.json(
        {
          error: "Could not save fitment request",
          details: error.message,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, request: data, decoded });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not save fitment request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
