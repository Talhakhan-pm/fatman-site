import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalog-db";
import { createLocalFitmentRequest } from "@/lib/fitment-request-local-store";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { decodeVinWithNhtsa, type VinDecodeResult } from "@/lib/vin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPABASE_TIMEOUT_MS = 6000;
const LOCAL_FALLBACK_ENABLED = process.env.NODE_ENV === "development";

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

type RequestInput = {
  name: string;
  email: string;
  phone: string | null;
  source: string;
  message: string | null;
  product: Awaited<ReturnType<typeof getProduct>> | null;
  productSlug: string | null;
  decoded: VinDecodeResult;
  req: Request;
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

function buildSupabaseRow(input: RequestInput) {
  return {
    status: "new",
    source: input.source,
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone,
    vin: input.decoded.vin,
    product_slug: input.product?.slug ?? input.productSlug,
    product_sku: input.product?.sku ?? null,
    product_name: input.product?.name ?? null,
    vehicle_year: input.decoded.year ?? null,
    vehicle_make: input.decoded.make ?? null,
    vehicle_model: input.decoded.model ?? null,
    vehicle_trim: input.decoded.trim ?? null,
    vehicle_engine: input.decoded.engine ?? null,
    decoded_vehicle: input.decoded.raw ?? input.decoded,
    message: input.message,
    metadata: {
      userAgent: input.req.headers.get("user-agent"),
      referer: input.req.headers.get("referer"),
    },
  };
}

async function saveLocalFallback(input: RequestInput, reason: string) {
  if (!LOCAL_FALLBACK_ENABLED) {
    return NextResponse.json(
      {
        error: "Could not save fitment request",
        details: reason,
        source: "supabase",
      },
      { status: 503 },
    );
  }

  const row = buildSupabaseRow(input);
  const localRecord = await createLocalFitmentRequest({
    status: "new",
    source: input.source,
    customerName: input.name,
    customerEmail: input.email,
    customerPhone: input.phone,
    vin: input.decoded.vin,
    productSlug: input.product?.slug ?? input.productSlug,
    productSku: input.product?.sku ?? null,
    productName: input.product?.name ?? null,
    vehicleYear: input.decoded.year ?? null,
    vehicleMake: input.decoded.make ?? null,
    vehicleModel: input.decoded.model ?? null,
    vehicleTrim: input.decoded.trim ?? null,
    vehicleEngine: input.decoded.engine ?? null,
    decodedVehicle: (input.decoded.raw ?? input.decoded) as Record<string, unknown>,
    message: input.message,
    metadata: {
      ...row.metadata,
      fallbackReason: reason,
    },
  });

  return NextResponse.json({
    ok: true,
    source: "local",
    fallbackReason: reason,
    request: {
      id: localRecord.id,
      created_at: localRecord.createdAt,
    },
    decoded: input.decoded,
  });
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
  const input: RequestInput = {
    name,
    email,
    phone,
    source,
    message,
    product,
    productSlug,
    decoded,
    req,
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await withTimeout(
      supabase.from("fitment_requests").insert(buildSupabaseRow(input)).select("id, created_at").single(),
      SUPABASE_TIMEOUT_MS,
    );

    if (error) {
      return saveLocalFallback(input, error.message);
    }

    return NextResponse.json({ ok: true, source: "supabase", request: data, decoded });
  } catch (error) {
    return saveLocalFallback(input, error instanceof Error ? error.message : "Unknown error");
  }
}
