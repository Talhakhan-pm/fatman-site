import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { products as fallbackProducts, type Product } from "@/lib/catalog";
import type { CategorySlug } from "@/lib/catalog-registry";
import {
  cleanCheckoutCustomer,
  normalizeCheckoutLines,
  priceCartLines,
} from "@/lib/checkout";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const LOCAL_PRODUCT_FALLBACK_ENABLED = process.env.NODE_ENV === "development";

type ProductRow = {
  sku: string;
  slug: string;
  category_slug: string;
  brand: string;
  name: string;
  short_description: string | null;
  price: number | string;
  compare_at: number | string | null;
  stock_status: "in-stock" | "low-stock" | "preorder";
  image_url: string | null;
  shipping_class: string | null;
  warranty_days: number | null;
  oem_part_number: string | null;
};

type StoredOrder = {
  id: string;
  order_number: string;
};

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing env: STRIPE_SECRET_KEY");
  return new Stripe(secretKey);
}

function getOrigin(req: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
}

function productRowToProduct(row: ProductRow): Product {
  return {
    sku: row.sku,
    slug: row.slug,
    category: row.category_slug as CategorySlug,
    brand: row.brand,
    name: row.name,
    shortDescription: row.short_description ?? "",
    price: Number(row.price),
    compareAt: row.compare_at == null ? undefined : Number(row.compare_at),
    stock: row.stock_status,
    imageUrl: row.image_url ?? undefined,
    shippingClass: row.shipping_class ?? undefined,
    warrantyDays: row.warranty_days ?? undefined,
    oemPartNumber: row.oem_part_number ?? undefined,
  };
}

function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FTM-${date}-${suffix}`;
}

function absoluteImageUrl(origin: string, imageUrl?: string) {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (!imageUrl.startsWith("/")) return undefined;
  return `${origin}${imageUrl}`;
}

async function loadProducts(slugs: string[]) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("sku, slug, category_slug, brand, name, short_description, price, compare_at, stock_status, image_url, shipping_class, warranty_days, oem_part_number")
      .in("slug", slugs)
      .eq("published", true);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => productRowToProduct(row as ProductRow));
  } catch (error) {
    if (!LOCAL_PRODUCT_FALLBACK_ENABLED) throw error;
    return fallbackProducts.filter((product) => slugs.includes(product.slug));
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const requestedLines = normalizeCheckoutLines(body.lines);
  const customer = cleanCheckoutCustomer(body.customer);

  if (!requestedLines.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe is not configured" },
      { status: 503 },
    );
  }

  const slugs = requestedLines.map((line) => line.slug);
  let catalogProducts: Product[];
  try {
    catalogProducts = await loadProducts(slugs);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not load live catalog products",
        details: error instanceof Error ? error.message : "Unknown catalog error",
      },
      { status: 503 },
    );
  }

  const { pricedLines, missingSlugs, subtotalCents, shippingCents, totalCents } = priceCartLines(
    catalogProducts,
    requestedLines,
  );

  if (!pricedLines.length) {
    return NextResponse.json({ error: "No cart items are currently available" }, { status: 400 });
  }

  if (missingSlugs.length) {
    return NextResponse.json(
      { error: "Some cart items are no longer available", missingSlugs },
      { status: 409 },
    );
  }

  const origin = getOrigin(req);
  const orderNumber = makeOrderNumber();

  try {
    const supabase = createSupabaseAdminClient();
    const { data: orderRows, error: orderError } = await supabase
      .from("storefront_orders")
      .insert({
        order_number: orderNumber,
        status: "pending_payment",
        payment_status: "unpaid",
        customer_email: customer.email ?? null,
        customer_phone: customer.phone ?? null,
        customer_name: customer.name ?? null,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        tax_cents: 0,
        total_cents: totalCents,
        currency: "usd",
        metadata: {
          requestedLines,
          sourcePath: "/checkout",
        },
      })
      .select("id, order_number")
      .single();

    if (orderError || !orderRows) {
      return NextResponse.json(
        {
          error: "Could not create pending order",
          details: orderError?.message ?? "No order row returned",
        },
        { status: 503 },
      );
    }

    const order = orderRows as StoredOrder;
    const { error: itemError } = await supabase.from("storefront_order_items").insert(
      pricedLines.map((line) => ({
        storefront_order_id: order.id,
        product_slug: line.product.slug,
        product_sku: line.product.sku,
        product_name: line.product.name,
        product_brand: line.product.brand,
        quantity: line.quantity,
        unit_amount_cents: line.unitAmountCents,
        line_total_cents: line.lineTotalCents,
        metadata: {
          category: line.product.category,
          imageUrl: line.product.imageUrl ?? null,
          oemPartNumber: line.product.oemPartNumber ?? null,
          warrantyDays: line.product.warrantyDays ?? null,
        },
      })),
    );

    if (itemError) {
      return NextResponse.json(
        { error: "Could not create order items", details: itemError.message },
        { status: 503 },
      );
    }

    const lineItems = pricedLines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "usd",
        unit_amount: line.unitAmountCents,
        product_data: {
          name: line.product.name,
          description: line.product.shortDescription || line.product.sku,
          images: [absoluteImageUrl(origin, line.product.imageUrl)].filter(Boolean) as string[],
          metadata: {
            sku: line.product.sku,
            slug: line.product.slug,
          },
        },
      },
    }));

    if (shippingCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: shippingCents,
          product_data: {
            name: "Standard shipping",
            description: "Ground shipping",
            images: [],
            metadata: {
              sku: "SHIPPING",
              slug: "standard-shipping",
            },
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: customer.email,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
      billing_address_collection: "auto",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?order=${encodeURIComponent(order.order_number)}`,
      metadata: {
        storefrontOrderId: order.id,
        orderNumber: order.order_number,
      },
      payment_intent_data: {
        metadata: {
          storefrontOrderId: order.id,
          orderNumber: order.order_number,
        },
      },
    });

    const { error: sessionError } = await supabase
      .from("storefront_orders")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        stripe_payment_status: session.payment_status,
      })
      .eq("id", order.id);

    if (sessionError) {
      return NextResponse.json(
        { error: "Checkout session created but order update failed", details: sessionError.message },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderNumber: order.order_number,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not start checkout",
        details: error instanceof Error ? error.message : "Unknown checkout error",
      },
      { status: 500 },
    );
  }
}
