import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
import { listLocalContactRequests } from "@/lib/contact-request-local-store";
import { createSupabaseAdminClient } from "@/lib/supabase";

const SUPABASE_TIMEOUT_MS = 6000;
const LOCAL_FALLBACK_ENABLED = process.env.NODE_ENV === "development";

type ContactRequestRow = {
  id: string;
  status: string;
  source: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subject: string | null;
  vin: string | null;
  orderNumber: string | null;
  productSlug: string | null;
  productSku: string | null;
  productName: string | null;
  message: string;
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
  const requests = await listLocalContactRequests();
  return NextResponse.json({
    source: "local",
    fallbackReason: reason,
    requests: requests.map((request): ContactRequestRow => ({
      id: request.id,
      status: request.status,
      source: request.source,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      subject: request.subject,
      vin: request.vin,
      orderNumber: request.orderNumber,
      productSlug: request.productSlug,
      productSku: request.productSku,
      productName: request.productName,
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
        .from("contact_requests")
        .select("id, status, source, customer_name, customer_email, customer_phone, subject, vin, order_number, product_slug, product_sku, product_name, message, created_at")
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
      requests: (data ?? []).map((row): ContactRequestRow => ({
        id: String(row.id),
        status: String(row.status),
        source: String(row.source),
        customerName: String(row.customer_name),
        customerEmail: String(row.customer_email),
        customerPhone: row.customer_phone,
        subject: row.subject,
        vin: row.vin,
        orderNumber: row.order_number,
        productSlug: row.product_slug,
        productSku: row.product_sku,
        productName: row.product_name,
        message: String(row.message),
        createdAt: String(row.created_at),
      })),
    });
  } catch (error) {
    if (LOCAL_FALLBACK_ENABLED) return listLocalRows(error instanceof Error ? error.message : "Unknown Supabase error");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 503 });
  }
}
