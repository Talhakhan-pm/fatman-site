import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
import { listLocalFitmentRequests } from "@/lib/fitment-request-local-store";
import { createSupabaseAdminClient } from "@/lib/supabase";

const SUPABASE_TIMEOUT_MS = 6000;
const LOCAL_FALLBACK_ENABLED = process.env.NODE_ENV === "development";

type FitmentRequestRow = {
  id: string;
  status: string;
  source: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  vin: string;
  productSlug: string | null;
  productSku: string | null;
  productName: string | null;
  vehicleYear: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleTrim: string | null;
  vehicleEngine: string | null;
  message: string | null;
  createdAt: string;
};

function withTimeout<T>(promise: PromiseLike<T>, ms: number) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Supabase request timed out after ${ms}ms`)), ms);
    }),
  ]);
}

async function listLocalRows(reason?: string) {
  const requests = await listLocalFitmentRequests();
  return NextResponse.json({
    source: "local",
    fallbackReason: reason,
    requests: requests.map((request): FitmentRequestRow => ({
      id: request.id,
      status: request.status,
      source: request.source,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      vin: request.vin,
      productSlug: request.productSlug,
      productSku: request.productSku,
      productName: request.productName,
      vehicleYear: request.vehicleYear,
      vehicleMake: request.vehicleMake,
      vehicleModel: request.vehicleModel,
      vehicleTrim: request.vehicleTrim,
      vehicleEngine: request.vehicleEngine,
      message: request.message,
      createdAt: request.createdAt,
    })),
  });
}

export async function GET(req: Request) {
  if (!isAllowedAdminRequest(req, "FATMAN_ADMIN_WRITE_KEY")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await withTimeout(
      supabase
        .from("fitment_requests")
        .select(
          "id, status, source, customer_name, customer_email, customer_phone, vin, product_slug, product_sku, product_name, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, vehicle_engine, message, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      SUPABASE_TIMEOUT_MS,
    );

    if (error) {
      if (LOCAL_FALLBACK_ENABLED) return listLocalRows(error.message);
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json({
      source: "supabase",
      requests: (data ?? []).map((row): FitmentRequestRow => ({
        id: String(row.id),
        status: String(row.status),
        source: String(row.source),
        customerName: String(row.customer_name),
        customerEmail: String(row.customer_email),
        customerPhone: row.customer_phone,
        vin: String(row.vin),
        productSlug: row.product_slug,
        productSku: row.product_sku,
        productName: row.product_name,
        vehicleYear: row.vehicle_year,
        vehicleMake: row.vehicle_make,
        vehicleModel: row.vehicle_model,
        vehicleTrim: row.vehicle_trim,
        vehicleEngine: row.vehicle_engine,
        message: row.message,
        createdAt: String(row.created_at),
      })),
    });
  } catch (error) {
    if (LOCAL_FALLBACK_ENABLED) {
      return listLocalRows(error instanceof Error ? error.message : "Unknown Supabase error");
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 503 },
    );
  }
}
