import { NextResponse } from "next/server";
import { createLocalContactRequest } from "@/lib/contact-request-local-store";
import { createSupabaseAdminClient } from "@/lib/supabase";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPABASE_TIMEOUT_MS = 6000;
const LOCAL_FALLBACK_ENABLED = process.env.NODE_ENV === "development";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  vin?: string;
  orderNumber?: string;
  productSlug?: string;
  productSku?: string;
  productName?: string;
  message?: string;
  source?: string;
  website?: string;
};

type ContactInput = {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  vin: string | null;
  orderNumber: string | null;
  productSlug: string | null;
  productSku: string | null;
  productName: string | null;
  message: string;
  source: string;
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

function buildSupabaseRow(input: ContactInput) {
  return {
    status: "new",
    source: input.source,
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone,
    subject: input.subject,
    vin: input.vin,
    order_number: input.orderNumber,
    product_slug: input.productSlug,
    product_sku: input.productSku,
    product_name: input.productName,
    message: input.message,
    metadata: {
      userAgent: input.req.headers.get("user-agent"),
      referer: input.req.headers.get("referer"),
    },
  };
}

async function saveLocalFallback(input: ContactInput, reason: string) {
  if (!LOCAL_FALLBACK_ENABLED) {
    return NextResponse.json(
      { error: "Could not save contact request", details: reason, source: "supabase" },
      { status: 503 },
    );
  }

  const row = buildSupabaseRow(input);
  const localRecord = await createLocalContactRequest({
    status: "new",
    source: input.source,
    customerName: input.name,
    customerEmail: input.email,
    customerPhone: input.phone,
    subject: input.subject,
    vin: input.vin,
    orderNumber: input.orderNumber,
    productSlug: input.productSlug,
    productSku: input.productSku,
    productName: input.productName,
    message: input.message,
    metadata: { ...row.metadata, fallbackReason: reason },
  });

  return NextResponse.json({
    ok: true,
    source: "local",
    fallbackReason: reason,
    request: { id: localRecord.id, created_at: localRecord.createdAt },
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  if (clean(body.website)) return NextResponse.json({ ok: true, ignored: true });

  const input: ContactInput = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone) || null,
    subject: clean(body.subject) || null,
    vin: clean(body.vin).toUpperCase() || null,
    orderNumber: clean(body.orderNumber) || null,
    productSlug: clean(body.productSlug) || null,
    productSku: clean(body.productSku) || null,
    productName: clean(body.productName) || null,
    message: clean(body.message),
    source: clean(body.source) || "contact-form",
    req,
  };

  if (!input.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!EMAIL_PATTERN.test(input.email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!input.message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await withTimeout(
      supabase.from("contact_requests").insert(buildSupabaseRow(input)).select("id, created_at").single(),
      SUPABASE_TIMEOUT_MS,
    );

    if (error) return saveLocalFallback(input, error.message);
    return NextResponse.json({ ok: true, source: "supabase", request: data });
  } catch (error) {
    return saveLocalFallback(input, error instanceof Error ? error.message : "Unknown error");
  }
}
