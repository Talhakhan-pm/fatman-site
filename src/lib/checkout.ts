import type { Product } from "@/lib/catalog";

export const STANDARD_SHIPPING_CENTS = 2499;
export const FREE_SHIPPING_THRESHOLD_CENTS = 49900;
export const CART_LINE_LIMIT = 50;
export const CART_QUANTITY_LIMIT = 99;

export type CheckoutCartLineInput = {
  slug: string;
  quantity: number;
};

export type CheckoutCustomerInput = {
  email?: string;
  phone?: string;
  name?: string;
};

export type CheckoutPricedLine = {
  product: Product;
  quantity: number;
  unitAmountCents: number;
  lineTotalCents: number;
};

export function toCents(value: number) {
  return Math.round(value * 100);
}

export function fromCents(value: number) {
  return value / 100;
}

export function getShippingCents(subtotalCents: number) {
  if (subtotalCents <= 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return STANDARD_SHIPPING_CENTS;
}

export function normalizeCheckoutLines(input: unknown): CheckoutCartLineInput[] {
  if (!Array.isArray(input)) return [];

  const merged = new Map<string, number>();

  for (const rawLine of input) {
    const line = rawLine as Partial<CheckoutCartLineInput> | null;
    const slug = typeof line?.slug === "string" ? line.slug.trim() : "";
    const quantity = Math.floor(Number(line?.quantity ?? 0));

    if (!slug || !Number.isFinite(quantity) || quantity <= 0) continue;

    merged.set(slug, Math.min(CART_QUANTITY_LIMIT, (merged.get(slug) ?? 0) + quantity));
  }

  return Array.from(merged, ([slug, quantity]) => ({ slug, quantity })).slice(0, CART_LINE_LIMIT);
}

export function priceCartLines(products: Product[], lines: CheckoutCartLineInput[]) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const pricedLines: CheckoutPricedLine[] = [];
  const missingSlugs: string[] = [];

  for (const line of lines) {
    const product = bySlug.get(line.slug);
    if (!product) {
      missingSlugs.push(line.slug);
      continue;
    }

    const unitAmountCents = toCents(product.price);
    pricedLines.push({
      product,
      quantity: line.quantity,
      unitAmountCents,
      lineTotalCents: unitAmountCents * line.quantity,
    });
  }

  const subtotalCents = pricedLines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const shippingCents = getShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  return { pricedLines, missingSlugs, subtotalCents, shippingCents, totalCents };
}

export function cleanCheckoutCustomer(input: unknown): CheckoutCustomerInput {
  const raw = (input ?? {}) as Record<string, unknown>;
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  return {
    email: email || undefined,
    phone: phone || undefined,
    name: name || undefined,
  };
}
