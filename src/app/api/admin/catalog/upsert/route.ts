import { NextResponse } from "next/server";
import { isAllowedAdminRequest } from "@/lib/admin-api";
import {
  listLocalCatalogRecords,
  upsertLocalCatalogRecord,
} from "@/lib/admin-catalog-local-store";
import { mergeProductBadgeMetadata } from "@/lib/product-badges";
import { createSupabaseAdminClient } from "@/lib/supabase";

const FITMENT_CHUNK_SIZE = 500;
const STOCK_STATUSES = new Set(["in-stock", "low-stock", "preorder"]);
const MATCH_TYPES = new Set(["fits", "verify", "no-fit"]);
const SUPABASE_TIMEOUT_MS = 6000;
const LOCAL_FALLBACK_ENABLED = process.env.NODE_ENV === "development";

function withTimeout<T>(promise: PromiseLike<T>, ms: number) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Supabase request timed out after ${ms}ms`)), ms);
    }),
  ]);
}

function formatSupabaseError(error: unknown) {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
    if (cause?.code) return `${error.message} (cause: ${cause.code})`;
    if (cause?.message && cause.message !== error.message) {
      return `${error.message} (cause: ${cause.message})`;
    }
    return error.message;
  }

  return "Unknown Supabase error";
}

type ProductInput = {
  sku: string;
  slug: string;
  category: string;
  brand: string;
  name: string;
  shortDescription?: string;
  price: number;
  compareAt?: number | null;
  stock?: "in-stock" | "low-stock" | "preorder";
  imageUrl?: string | null;
  shippingClass?: string | null;
  warrantyDays?: number | null;
  oemPartNumber?: string | null;
  condition?: string;
  partSource?: string;
  published?: boolean;
  metadata?: Record<string, unknown>;
};

type CategoryInput = {
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  published?: boolean;
  sortOrder?: number;
};

type FitmentInput = {
  year: string;
  make: string;
  model: string;
  variant?: string | null;
  engine: string;
  matchType?: "fits" | "verify" | "no-fit";
  source?: string | null;
  confidence?: number | null;
  notes?: string | null;
};

type Payload = {
  identity?: {
    originalSlug?: string | null;
    originalSku?: string | null;
  };
  product?: ProductInput;
  category?: CategoryInput;
  fitment?: FitmentInput[];
  replaceFitment?: boolean;
};

type NormalizedProduct = {
  sku: string;
  slug: string;
  category: string;
  brand: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAt: number | null;
  stock: "in-stock" | "low-stock" | "preorder";
  imageUrl: string | null;
  shippingClass: string | null;
  warrantyDays: number | null;
  oemPartNumber: string | null;
  published: boolean;
  metadata: Record<string, unknown>;
};

type NormalizedCategory = {
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  published: boolean;
  sortOrder: number;
};

type NormalizedFitment = {
  year: string;
  make: string;
  model: string;
  variant: string | null;
  engine: string;
  matchType: "fits" | "verify" | "no-fit";
  source: string;
  confidence: number | null;
  notes: string | null;
};

type ProductIdentity = {
  provided: boolean;
  originalSlug: string | null;
  originalSku: string | null;
};

type ExistingProductRow = {
  id: string;
  slug: string;
  sku: string;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function badRequest(error: string, details?: unknown) {
  return NextResponse.json({ error, details }, { status: 400 });
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getProductIdentity(body: Payload): ProductIdentity {
  return {
    provided: Object.prototype.hasOwnProperty.call(body, "identity"),
    originalSlug: normalizeString(body.identity?.originalSlug) || null,
    originalSku: normalizeString(body.identity?.originalSku) || null,
  };
}

function isIdentityMatch(row: Pick<ExistingProductRow, "slug" | "sku">, identity: ProductIdentity) {
  return Boolean(
    (identity.originalSlug && row.slug === identity.originalSlug) ||
      (identity.originalSku && row.sku === identity.originalSku),
  );
}

function findIdentifierConflict(
  rows: Array<Pick<ExistingProductRow, "slug" | "sku">>,
  productInput: NormalizedProduct,
  identity: ProductIdentity,
) {
  if (!identity.provided) return null;

  for (const row of rows) {
    if (isIdentityMatch(row, identity)) continue;
    if (row.slug === productInput.slug) return `Slug already exists: ${productInput.slug}`;
    if (row.sku === productInput.sku) return `SKU already exists: ${productInput.sku}`;
  }

  return null;
}

function validateProduct(input: ProductInput | undefined): ValidationResult<NormalizedProduct> {
  if (!input) return { ok: false, error: "Missing product payload" };

  const stock = input.stock ?? "in-stock";
  const product: NormalizedProduct = {
    sku: normalizeString(input.sku),
    slug: normalizeString(input.slug),
    category: normalizeString(input.category),
    brand: normalizeString(input.brand),
    name: normalizeString(input.name),
    shortDescription:
      typeof input.shortDescription === "string" ? input.shortDescription.trim() : "",
    price: Number(input.price),
    compareAt: input.compareAt == null ? null : Number(input.compareAt),
    stock,
    imageUrl:
      typeof input.imageUrl === "string" && input.imageUrl.trim()
        ? input.imageUrl.trim()
        : null,
    shippingClass:
      typeof input.shippingClass === "string" && input.shippingClass.trim()
        ? input.shippingClass.trim()
        : null,
    warrantyDays: input.warrantyDays == null ? null : Number(input.warrantyDays),
    oemPartNumber:
      typeof input.oemPartNumber === "string" && input.oemPartNumber.trim()
        ? input.oemPartNumber.trim()
        : null,
    published: Boolean(input.published),
    metadata: mergeProductBadgeMetadata(input.metadata, {
      condition: input.condition,
      partSource: input.partSource,
    }),
  };

  const missingRequiredFields = [
    ["sku", product.sku],
    ["slug", product.slug],
    ["category", product.category],
    ["brand", product.brand],
    ["name", product.name],
  ]
    .filter(([, value]) => !value)
    .map(([field]) => field);

  if (missingRequiredFields.length > 0) {
    return {
      ok: false,
      error: `Missing required product fields: ${missingRequiredFields.join(", ")}`,
    };
  }

  if (Number.isNaN(product.price)) {
    return { ok: false, error: "Product price must be a number" };
  }

  if (product.compareAt != null && Number.isNaN(product.compareAt)) {
    return { ok: false, error: "compareAt must be a number when provided" };
  }

  if (product.warrantyDays != null && Number.isNaN(product.warrantyDays)) {
    return { ok: false, error: "warrantyDays must be a number when provided" };
  }

  if (!STOCK_STATUSES.has(product.stock)) {
    return { ok: false, error: "stock must be one of in-stock, low-stock, preorder" };
  }

  return { ok: true, value: product };
}

function validateCategory(
  input: CategoryInput | undefined,
  fallbackSlug: string,
): ValidationResult<NormalizedCategory | null> {
  if (!input) return { ok: true, value: null };

  const category: NormalizedCategory = {
    slug: normalizeString(input.slug || fallbackSlug),
    title: normalizeString(input.title),
    description: typeof input.description === "string" ? input.description.trim() : "",
    shortDescription:
      typeof input.shortDescription === "string" ? input.shortDescription.trim() : undefined,
    published: input.published ?? true,
    sortOrder: input.sortOrder ?? 0,
  };

  if (!category.slug || !category.title) {
    return { ok: false, error: "Category requires slug and title when provided" };
  }

  return { ok: true, value: category };
}

function validateFitment(
  rows: FitmentInput[] | undefined,
): ValidationResult<NormalizedFitment[] | null> {
  if (!rows) return { ok: true, value: null };
  if (!Array.isArray(rows)) return { ok: false, error: "fitment must be an array when provided" };

  const fitment: NormalizedFitment[] = rows.map((row, index) => {
    const matchType = row.matchType ?? "fits";
    const normalized: NormalizedFitment = {
      year: normalizeString(row.year),
      make: normalizeString(row.make),
      model: normalizeString(row.model),
      variant: typeof row.variant === "string" && row.variant.trim() ? row.variant.trim() : null,
      engine: normalizeString(row.engine),
      matchType,
      source:
        typeof row.source === "string" && row.source.trim() ? row.source.trim() : "agent-upsert",
      confidence: row.confidence == null ? null : Number(row.confidence),
      notes: typeof row.notes === "string" && row.notes.trim() ? row.notes.trim() : null,
    };

    if (!normalized.year || !normalized.make || !normalized.model || !normalized.engine) {
      throw new Error(`fitment[${index}] requires year, make, model, and engine`);
    }

    if (!MATCH_TYPES.has(normalized.matchType)) {
      throw new Error(`fitment[${index}] matchType must be fits, verify, or no-fit`);
    }

    if (normalized.confidence != null && Number.isNaN(normalized.confidence)) {
      throw new Error(`fitment[${index}] confidence must be numeric when provided`);
    }

    return normalized;
  });

  return { ok: true, value: fitment };
}

async function saveLocalFallback(
  productInput: NormalizedProduct,
  fitmentInput: NormalizedFitment[] | null,
  replaceFitment: boolean,
  stage: string,
  error: string,
  identity: ProductIdentity,
) {
  if (!LOCAL_FALLBACK_ENABLED) {
    return NextResponse.json(
      {
        error: `Supabase write failed during ${stage}`,
        details: error,
        source: "supabase",
      },
      { status: 503 },
    );
  }

  const localRecords = await listLocalCatalogRecords();
  const localConflict = findIdentifierConflict(
    localRecords.map((record) => record.product),
    productInput,
    identity,
  );

  if (localConflict) {
    return NextResponse.json(
      {
        error: localConflict,
        details: "Local development fallback blocked the save before writing because slug/SKU must be unique.",
        source: "local",
      },
      { status: 409 },
    );
  }

  const localRecord = await upsertLocalCatalogRecord({
    product: {
      sku: productInput.sku,
      slug: productInput.slug,
      category: productInput.category,
      brand: productInput.brand,
      name: productInput.name,
      shortDescription: productInput.shortDescription,
      price: productInput.price,
      compareAt: productInput.compareAt,
      stock: productInput.stock,
      imageUrl: productInput.imageUrl,
      shippingClass: productInput.shippingClass,
      warrantyDays: productInput.warrantyDays,
      oemPartNumber: productInput.oemPartNumber,
      published: productInput.published,
      metadata: productInput.metadata,
    },
    fitment:
      fitmentInput?.map((row) => ({
        year: row.year,
        make: row.make,
        model: row.model,
        variant: row.variant,
        engine: row.engine,
        matchType: row.matchType,
        source: row.source,
        confidence: row.confidence,
        notes: row.notes,
      })) ?? [],
    replaceFitment,
  });

  return NextResponse.json({
    ok: true,
    source: "local",
    fallbackReason: { stage, error },
    product: {
      id: localRecord.product.slug,
      slug: localRecord.product.slug,
      published: localRecord.product.published,
    },
    fitmentCount: localRecord.fitment.length,
    replaceFitment,
  });
}

export async function POST(req: Request) {
  if (!isAllowedAdminRequest(req, "FATMAN_ADMIN_WRITE_KEY")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body) return badRequest("Invalid JSON body");

  const productResult = validateProduct(body.product);
  if (!productResult.ok) return badRequest(productResult.error);
  const productInput = productResult.value;
  const identity = getProductIdentity(body);

  const categoryResult = validateCategory(body.category, productInput.category);
  if (!categoryResult.ok) return badRequest(categoryResult.error);
  const categoryInput = categoryResult.value;

  let fitmentResult: ValidationResult<NormalizedFitment[] | null>;
  try {
    fitmentResult = validateFitment(body.fitment);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Invalid fitment payload");
  }
  if (!fitmentResult.ok) return badRequest(fitmentResult.error);
  const fitmentInput = fitmentResult.value;

  const replaceFitment = body.replaceFitment ?? Boolean(fitmentInput);

  try {
    const supabase = createSupabaseAdminClient();

    if (categoryInput) {
      const { error } = await withTimeout(
        supabase.from("categories").upsert(
          {
            slug: categoryInput.slug,
            title: categoryInput.title,
            description: categoryInput.description,
            short_description: categoryInput.shortDescription ?? categoryInput.description,
            published: categoryInput.published,
            sort_order: categoryInput.sortOrder,
          },
          { onConflict: "slug" },
        ),
        SUPABASE_TIMEOUT_MS,
      );

      if (error) {
        return saveLocalFallback(
          productInput,
          fitmentInput,
          replaceFitment,
          "category_upsert",
          error.message,
          identity,
        );
      }
    }

    const productWrite = {
      sku: productInput.sku,
      slug: productInput.slug,
      category_slug: productInput.category,
      brand: productInput.brand,
      name: productInput.name,
      short_description: productInput.shortDescription,
      price: productInput.price,
      compare_at: productInput.compareAt,
      stock_status: productInput.stock,
      image_url: productInput.imageUrl,
      shipping_class: productInput.shippingClass,
      warranty_days: productInput.warrantyDays,
      oem_part_number: productInput.oemPartNumber,
      published: productInput.published,
      metadata: productInput.metadata,
    };

    let currentProductId: string | null = null;

    if (identity.provided) {
      const identifierFilters = [
        `slug.eq.${productInput.slug}`,
        `sku.eq.${productInput.sku}`,
        identity.originalSlug ? `slug.eq.${identity.originalSlug}` : null,
        identity.originalSku ? `sku.eq.${identity.originalSku}` : null,
      ].filter(Boolean);

      const { data: existingRows, error: existingError } = await withTimeout(
        supabase.from("products").select("id, slug, sku").or(identifierFilters.join(",")),
        SUPABASE_TIMEOUT_MS,
      );

      if (existingError) {
        return saveLocalFallback(
          productInput,
          fitmentInput,
          replaceFitment,
          "identifier_check",
          existingError.message,
          identity,
        );
      }

      const rows = (existingRows ?? []) as ExistingProductRow[];
      const currentRows = rows.filter((row) => isIdentityMatch(row, identity));
      const currentIds = new Set(currentRows.map((row) => row.id));

      if (currentIds.size > 1) {
        return NextResponse.json(
          {
            error: "Original slug/SKU point to different products",
            details: "Reload the product before saving so uniqueness checks can exclude the correct current item.",
          },
          { status: 409 },
        );
      }

      currentProductId = currentRows[0]?.id ?? null;
      const conflict = rows.find((row) => {
        if (currentProductId && row.id === currentProductId) return false;
        return row.slug === productInput.slug || row.sku === productInput.sku;
      });

      if (conflict) {
        const field = conflict.slug === productInput.slug ? "Slug" : "SKU";
        const value = conflict.slug === productInput.slug ? productInput.slug : productInput.sku;
        return NextResponse.json(
          {
            error: `${field} already exists: ${value}`,
            details: "Pick a unique slug/SKU or load the existing product before editing it.",
          },
          { status: 409 },
        );
      }
    }

    const productMutation = currentProductId
      ? supabase.from("products").update(productWrite).eq("id", currentProductId)
      : supabase.from("products").upsert(productWrite, { onConflict: "slug" });

    const { data: productRows, error: productError } = await withTimeout(
      productMutation.select("id, slug, published").limit(1),
      SUPABASE_TIMEOUT_MS,
    );

    if (productError) {
      return saveLocalFallback(
        productInput,
        fitmentInput,
        replaceFitment,
        currentProductId ? "product_update" : "product_upsert",
        productError.message,
        identity,
      );
    }

    const product = productRows?.[0];
    if (!product) {
      return saveLocalFallback(
        productInput,
        fitmentInput,
        replaceFitment,
        currentProductId ? "product_update" : "product_upsert",
        "Product save returned no row",
        identity,
      );
    }

    let fitmentCount = 0;

    if (replaceFitment) {
      const { error: deleteError } = await withTimeout(
        supabase.from("fitment_rules").delete().eq("product_id", product.id),
        SUPABASE_TIMEOUT_MS,
      );

      if (deleteError) {
        return saveLocalFallback(
          productInput,
          fitmentInput,
          replaceFitment,
          "fitment_delete",
          deleteError.message,
          identity,
        );
      }
    }

    if (fitmentInput?.length) {
      const rows = fitmentInput.map((rule) => ({
        product_id: product.id,
        year: rule.year,
        make: rule.make,
        model: rule.model,
        variant: rule.variant,
        engine: rule.engine,
        match_type: rule.matchType,
        source: rule.source,
        confidence: rule.confidence,
        notes: rule.notes,
      }));

      for (let index = 0; index < rows.length; index += FITMENT_CHUNK_SIZE) {
        const chunk = rows.slice(index, index + FITMENT_CHUNK_SIZE);
        const { error } = await withTimeout(
          supabase.from("fitment_rules").insert(chunk),
          SUPABASE_TIMEOUT_MS,
        );
        if (error) {
          return saveLocalFallback(
            productInput,
            fitmentInput,
            replaceFitment,
            "fitment_insert",
            error.message,
            identity,
          );
        }
        fitmentCount += chunk.length;
      }
    }

    if (LOCAL_FALLBACK_ENABLED) {
      await upsertLocalCatalogRecord({
        product: {
          sku: productInput.sku,
          slug: productInput.slug,
          category: productInput.category,
          brand: productInput.brand,
          name: productInput.name,
          shortDescription: productInput.shortDescription,
          price: productInput.price,
          compareAt: productInput.compareAt,
          stock: productInput.stock,
          imageUrl: productInput.imageUrl,
          shippingClass: productInput.shippingClass,
          warrantyDays: productInput.warrantyDays,
          oemPartNumber: productInput.oemPartNumber,
          published: productInput.published,
          metadata: productInput.metadata,
        },
        fitment:
          fitmentInput?.map((rule) => ({
            year: rule.year,
            make: rule.make,
            model: rule.model,
            variant: rule.variant,
            engine: rule.engine,
            matchType: rule.matchType,
            source: rule.source,
            confidence: rule.confidence,
            notes: rule.notes,
          })) ?? [],
        replaceFitment,
      });
    }

    return NextResponse.json({
      ok: true,
      source: "supabase",
      product: {
        id: product.id,
        slug: product.slug,
        published: product.published,
      },
      fitmentCount,
      replaceFitment,
    });
  } catch (error) {
    return saveLocalFallback(
      productInput,
      fitmentInput,
      replaceFitment,
      "supabase_exception",
      formatSupabaseError(error),
      identity,
    );
  }
}
