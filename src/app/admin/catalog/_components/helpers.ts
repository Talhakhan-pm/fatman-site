import { catalogRegistry } from "@/lib/catalog-registry";
import { charmFitmentCatalog } from "@/lib/fitment-catalog";
import { getProductBadgeMetadata, mergeProductBadgeMetadata } from "@/lib/product-badges";
import type { EditorState, FitmentForm, ProductForm, UpsertPayload } from "./types";

export function buildAutoSlug(product: ProductForm, current: EditorState, takenSlugs: Set<string>) {
  return makeUniqueIdentifier(productToSlugBase(product), takenSlugs);
}

export function buildAutoSku(name: string, category: string, current: EditorState, takenSkus: Set<string>) {
  return makeUniqueIdentifier(productNameToSkuBase(name, category), takenSkus);
}

export function createFitmentId() {
  return globalThis.crypto?.randomUUID?.() ?? `fitment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugifyIdentifier(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function productNameToSlug(name: string) {
  return slugifyIdentifier(name) || "new-product";
}

export function productToSlugBase(product: ProductForm) {
  const parts = [product.brand, product.name, product.sku]
    .map((part) => part.trim())
    .filter(Boolean);

  return slugifyIdentifier(parts.join(" ")) || productNameToSlug(product.name);
}

export function categoryToSkuCode(categorySlug: string) {
  const category = catalogRegistry.find((item) => item.slug === categorySlug);
  const source = category?.title || categorySlug || "parts";
  const words = source.match(/[a-z0-9]+/gi) ?? ["parts"];
  return words
    .slice(0, 2)
    .map((word) => word.slice(0, 3).toUpperCase())
    .join("")
    .slice(0, 6) || "PRT";
}

export function productNameToSkuBase(name: string, categorySlug: string) {
  const code = categoryToSkuCode(categorySlug);
  const tokens = productNameToSlug(name)
    .split("-")
    .filter(Boolean)
    .slice(0, 4)
    .map((token) => token.slice(0, 4).toUpperCase());
  return `FTM-${code}-${tokens.length ? tokens.join("-") : "NEW"}`;
}

export function makeUniqueIdentifier(base: string, taken: Set<string>) {
  const normalizedBase = base || "new-product";
  if (!taken.has(normalizedBase.toLowerCase())) return normalizedBase;

  for (let suffix = 2; suffix < 10000; suffix += 1) {
    const candidate = `${normalizedBase}-${suffix}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }

  return `${normalizedBase}-${Date.now().toString(36)}`;
}

export function createBlankFitmentRow(): FitmentForm {
  return {
    id: createFitmentId(),
    year: "",
    make: "",
    model: "",
    variant: "",
    engine: "",
    matchType: "fits",
    source: "admin-ui",
    notes: "",
  };
}

export function createBlankEditor(): EditorState {
  return {
    product: {
      sku: "",
      slug: "",
      category: catalogRegistry[0]?.slug ?? "cooling",
      brand: "",
      name: "",
      shortDescription: "",
      price: "",
      compareAt: "",
      stock: "in-stock",
      imageUrl: "",
      shippingClass: "ground",
      warrantyDays: "",
      oemPartNumber: "",
      condition: "new",
      partSource: "aftermarket",
      published: true,
    },
    originalSlug: null,
    originalSku: null,
    fitment: [createBlankFitmentRow()],
    replaceFitment: true,
  };
}

export function generateFitmentMatrix(
  years: string[],
  makes: string[],
  models: string[],
  variants: string[],
  engines: string[],
  matchType: "fits" | "verify" | "no-fit",
  notes: string
): FitmentForm[] {
  const rows: FitmentForm[] = [];
  
  const yList = years.length > 0 ? years : [""];
  const mList = makes.length > 0 ? makes : [""];
  const moList = models.length > 0 ? models : [""];
  const vList = variants.length > 0 ? variants : [""];
  const eList = engines.length > 0 ? engines : [""];

  for (const year of yList) {
    for (const make of mList) {
      for (const model of moList) {
        for (const variant of vList) {
          for (const engine of eList) {
            rows.push({
              id: createFitmentId(),
              year,
              make,
              model,
              variant: variant === "All Trims" ? "" : variant,
              engine,
              matchType,
              source: "admin-ui-matrix",
              notes,
            });
          }
        }
      }
    }
  }

  return rows.map(autofillFitmentRow);
}

export function withCurrentOption(options: readonly string[], current: string) {
  if (!current.trim() || options.includes(current)) return [...options];
  return [current, ...options];
}

export function getFitmentOptions(row: FitmentForm) {
  const years = withCurrentOption(charmFitmentCatalog.years, row.year);
  const makes = row.year
    ? withCurrentOption(charmFitmentCatalog.getMakes(row.year), row.make)
    : row.make
      ? [row.make]
      : [];
  const models = row.year && row.make
    ? withCurrentOption(charmFitmentCatalog.getModels(row.year, row.make), row.model)
    : row.model
      ? [row.model]
      : [];

  const catalogVariants = row.year && row.make && row.model
    ? charmFitmentCatalog.getVariants(row.year, row.make, row.model)
    : [];
  const normalizedVariants = catalogVariants.length > 0
    ? catalogVariants
    : row.year && row.make && row.model
      ? [charmFitmentCatalog.defaultVariant]
      : [];
  const variants = normalizedVariants.length > 0
    ? withCurrentOption(normalizedVariants, row.variant)
    : row.variant
      ? [row.variant]
      : [];

  const variantForEngines =
    row.variant || charmFitmentCatalog.getDefaultVariant(normalizedVariants) || normalizedVariants[0] || "";
  const engines = row.year && row.make && row.model && variantForEngines
    ? withCurrentOption(
        charmFitmentCatalog.getEngines(row.year, row.make, row.model, variantForEngines),
        row.engine,
      )
    : row.engine
      ? [row.engine]
      : [];

  return { years, makes, models, variants, engines };
}

export function autofillFitmentRow(row: FitmentForm): FitmentForm {
  const next = { ...row };
  const { makes, models, variants } = getFitmentOptions(next);

  if (!next.make && makes.length === 1) next.make = makes[0];
  if (!next.model && models.length === 1) next.model = models[0];

  const resolvedVariants = variants;
  const defaultVariant = charmFitmentCatalog.getDefaultVariant(resolvedVariants);

  if (!next.variant && resolvedVariants.length === 1) next.variant = resolvedVariants[0];
  else if (!next.variant && defaultVariant) next.variant = defaultVariant;

  const resolvedEngines = next.year && next.make && next.model && (next.variant || defaultVariant)
    ? charmFitmentCatalog.getEngines(next.year, next.make, next.model, next.variant || defaultVariant)
    : [];

  if (!next.engine && resolvedEngines.length === 1) next.engine = resolvedEngines[0];

  return next;
}

export const STARTER_EDITOR: EditorState = {
  product: {
    sku: "FTM-COL-9001",
    slug: "demo-aluminum-radiator",
    category: "cooling",
    brand: "DriveCore",
    name: "Demo Aluminum Radiator",
    shortDescription: "Internal test product created from the admin editor.",
    price: "199.99",
    compareAt: "249.99",
    stock: "in-stock",
    imageUrl: "",
    shippingClass: "ground",
    warrantyDays: "180",
    oemPartNumber: "OEM-DEMO-9001",
    condition: "new",
    partSource: "aftermarket",
    published: true,
  },
  originalSlug: "demo-aluminum-radiator",
  originalSku: "FTM-COL-9001",
  fitment: [
    {
      id: createFitmentId(),
      year: "2018",
      make: "Toyota",
      model: "Camry",
      variant: "Base",
      engine: "2.5L L4",
      matchType: "fits",
      source: "admin-ui",
      notes: "",
    },
    {
      id: createFitmentId(),
      year: "2019",
      make: "Toyota",
      model: "Camry",
      variant: "Base",
      engine: "2.5L L4",
      matchType: "fits",
      source: "admin-ui",
      notes: "",
    },
  ],
  replaceFitment: true,
};

export function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : Number.NaN;
}

export function editorToPayload(editor: EditorState): UpsertPayload {
  const product = editor.product;
  const fitmentRows = editor.fitment.filter((row) =>
    [row.year, row.make, row.model, row.variant, row.engine, row.notes].some((value) => value.trim()),
  );

  return {
    identity: {
      originalSlug: editor.originalSlug,
      originalSku: editor.originalSku,
    },
    product: {
      sku: product.sku.trim(),
      slug: product.slug.trim(),
      category: product.category.trim(),
      brand: product.brand.trim(),
      name: product.name.trim(),
      shortDescription: product.shortDescription.trim(),
      price: Number(product.price),
      compareAt: toOptionalNumber(product.compareAt),
      stock: product.stock,
      imageUrl: product.imageUrl.trim() || null,
      shippingClass: product.shippingClass.trim() || null,
      warrantyDays: toOptionalNumber(product.warrantyDays),
      oemPartNumber: product.oemPartNumber.trim() || null,
      condition: product.condition,
      partSource: product.partSource,
      metadata: mergeProductBadgeMetadata(product.metadata, {
        condition: product.condition,
        partSource: product.partSource,
      }),
      published: product.published,
    },
    fitment: fitmentRows.map((row) => ({
      year: row.year.trim(),
      make: row.make.trim(),
      model: row.model.trim(),
      variant: row.variant.trim() || null,
      engine: row.engine.trim(),
      matchType: row.matchType,
      source: row.source.trim() || "admin-ui",
      notes: row.notes.trim() || null,
    })),
    replaceFitment: editor.replaceFitment,
  };
}

export function payloadToEditor(payload: UpsertPayload | null | undefined): EditorState {
  const product = payload?.product;
  const fitment = payload?.fitment ?? [];
  const badges = getProductBadgeMetadata({
    metadata: {
      ...(product?.metadata ?? {}),
      condition: product?.condition ?? product?.metadata?.condition,
      partSource: product?.partSource ?? product?.metadata?.partSource,
    },
  });

  return {
    product: {
      sku: product?.sku ?? "",
      slug: product?.slug ?? "",
      category: product?.category ?? catalogRegistry[0]?.slug ?? "cooling",
      brand: product?.brand ?? "",
      name: product?.name ?? "",
      shortDescription: product?.shortDescription ?? "",
      price: product?.price == null ? "" : String(product.price),
      compareAt: product?.compareAt == null ? "" : String(product.compareAt),
      stock: product?.stock ?? "in-stock",
      imageUrl: product?.imageUrl ?? "",
      shippingClass: product?.shippingClass ?? "ground",
      warrantyDays: product?.warrantyDays == null ? "" : String(product.warrantyDays),
      oemPartNumber: product?.oemPartNumber ?? "",
      condition: badges.condition ?? "",
      partSource: badges.partSource ?? "",
      metadata: product?.metadata ?? {},
      published: product?.published ?? true,
    },
    originalSlug: product?.slug ?? null,
    originalSku: product?.sku ?? null,
    fitment:
      fitment.length > 0
        ? fitment.map((row) =>
            autofillFitmentRow({
              id: createFitmentId(),
              year: row.year ?? "",
              make: row.make ?? "",
              model: row.model ?? "",
              variant: row.variant ?? "",
              engine: row.engine ?? "",
              matchType: row.matchType ?? "fits",
              source: row.source ?? "admin-ui",
              notes: row.notes ?? "",
            }),
          )
        : [createBlankFitmentRow()],
    replaceFitment: payload?.replaceFitment ?? true,
  };
}
