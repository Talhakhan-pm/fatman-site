export type ProductCondition = "new" | "used" | "remanufactured";
export type ProductPartSource = "oem" | "aftermarket";

export type ProductBadgeMetadata = {
  condition?: ProductCondition;
  partSource?: ProductPartSource;
};

export type ProductDisplayBadge =
  | { kind: "condition"; value: ProductCondition; label: string }
  | { kind: "partSource"; value: ProductPartSource; label: string };

const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "New",
  used: "Used",
  remanufactured: "Remanufactured",
};

const PART_SOURCE_LABELS: Record<ProductPartSource, string> = {
  oem: "OEM",
  aftermarket: "Aftermarket",
};

function normalizeToken(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeProductCondition(value: unknown): ProductCondition | undefined {
  const token = normalizeToken(value);
  if (token === "new" || token === "used" || token === "remanufactured") return token;
  return undefined;
}

export function normalizeProductPartSource(value: unknown): ProductPartSource | undefined {
  const token = normalizeToken(value).replace(/[_\s-]+/g, "-");
  if (token === "oem") return "oem";
  if (token === "aftermarket") return "aftermarket";
  return undefined;
}

export function getProductBadgeMetadata(product: { metadata?: Record<string, unknown> | null }): ProductBadgeMetadata {
  const metadata = product.metadata ?? {};
  const condition = normalizeProductCondition(metadata.condition);
  const partSource = normalizeProductPartSource(metadata.partSource ?? metadata.part_source);

  return {
    ...(condition ? { condition } : {}),
    ...(partSource ? { partSource } : {}),
  };
}

export function mergeProductBadgeMetadata(
  metadata: Record<string, unknown> | null | undefined,
  badges: { condition?: unknown; partSource?: unknown },
): Record<string, unknown> {
  const next = { ...(metadata ?? {}) };
  const condition = normalizeProductCondition(badges.condition);
  const partSource = normalizeProductPartSource(badges.partSource);

  delete next.part_source;

  if (condition) next.condition = condition;
  else delete next.condition;

  if (partSource) next.partSource = partSource;
  else delete next.partSource;

  return next;
}

export function getProductDisplayBadges(product: ProductBadgeMetadata): ProductDisplayBadge[] {
  const badges: ProductDisplayBadge[] = [];

  if (product.condition) {
    badges.push({ kind: "condition", value: product.condition, label: CONDITION_LABELS[product.condition] });
  }

  if (product.partSource) {
    badges.push({ kind: "partSource", value: product.partSource, label: PART_SOURCE_LABELS[product.partSource] });
  }

  return badges;
}
