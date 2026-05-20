"use client";

import { useEffect, useMemo, useState } from "react";
import { catalogRegistry } from "@/lib/catalog-registry";
import { charmFitmentCatalog } from "@/lib/fitment-catalog";

type ApiResult = {
  endpoint: string;
  status: number;
  body: unknown;
};

type AdminSessionScope = "write" | "seed";
type AdminSessionState = "checking" | "locked" | "unlocked";

type ProductSummary = {
  slug: string;
  sku: string;
  category_slug: string;
  brand: string;
  name: string;
  price: number | string;
  stock_status: "in-stock" | "low-stock" | "preorder";
  published: boolean;
};

type UpsertPayload = {
  identity?: {
    originalSlug?: string | null;
    originalSku?: string | null;
  };
  product?: {
    sku?: string;
    slug?: string;
    category?: string;
    brand?: string;
    name?: string;
    shortDescription?: string;
    price?: number;
    compareAt?: number | null;
    stock?: "in-stock" | "low-stock" | "preorder";
    imageUrl?: string | null;
    shippingClass?: string | null;
    warrantyDays?: number | null;
    oemPartNumber?: string | null;
    published?: boolean;
  };
  fitment?: Array<{
    year?: string;
    make?: string;
    model?: string;
    variant?: string | null;
    engine?: string;
    matchType?: "fits" | "verify" | "no-fit";
    source?: string | null;
    notes?: string | null;
  }>;
  replaceFitment?: boolean;
};

type ProductForm = {
  sku: string;
  slug: string;
  category: string;
  brand: string;
  name: string;
  shortDescription: string;
  price: string;
  compareAt: string;
  stock: "in-stock" | "low-stock" | "preorder";
  imageUrl: string;
  shippingClass: string;
  warrantyDays: string;
  oemPartNumber: string;
  published: boolean;
};

type FitmentForm = {
  id: string;
  year: string;
  make: string;
  model: string;
  variant: string;
  engine: string;
  matchType: "fits" | "verify" | "no-fit";
  source: string;
  notes: string;
};

type EditorState = {
  product: ProductForm;
  originalSlug: string | null;
  originalSku: string | null;
  fitment: FitmentForm[];
  replaceFitment: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-fatman-accent";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-white/60";

const buttonClass =
  "rounded-lg bg-fatman-accent px-4 py-2 text-sm font-semibold text-fatman-900 disabled:cursor-not-allowed disabled:opacity-50";

const ghostButtonClass =
  "rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50";

function createFitmentId() {
  return globalThis.crypto?.randomUUID?.() ?? `fitment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugifyIdentifier(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function productNameToSlug(name: string) {
  return slugifyIdentifier(name) || "new-product";
}

function categoryToSkuCode(categorySlug: string) {
  const category = catalogRegistry.find((item) => item.slug === categorySlug);
  const source = category?.title || categorySlug || "parts";
  const words = source.match(/[a-z0-9]+/gi) ?? ["parts"];
  return words
    .slice(0, 2)
    .map((word) => word.slice(0, 3).toUpperCase())
    .join("")
    .slice(0, 6) || "PRT";
}

function productNameToSkuBase(name: string, categorySlug: string) {
  const code = categoryToSkuCode(categorySlug);
  const tokens = productNameToSlug(name)
    .split("-")
    .filter(Boolean)
    .slice(0, 4)
    .map((token) => token.slice(0, 4).toUpperCase());
  return `FTM-${code}-${tokens.length ? tokens.join("-") : "NEW"}`;
}

function makeUniqueIdentifier(base: string, taken: Set<string>) {
  const normalizedBase = base || "new-product";
  if (!taken.has(normalizedBase.toLowerCase())) return normalizedBase;

  for (let suffix = 2; suffix < 10000; suffix += 1) {
    const candidate = `${normalizedBase}-${suffix}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }

  return `${normalizedBase}-${Date.now().toString(36)}`;
}

function createBlankFitmentRow(): FitmentForm {
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

function createBlankEditor(): EditorState {
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
      published: true,
    },
    originalSlug: null,
    originalSku: null,
    fitment: [createBlankFitmentRow()],
    replaceFitment: true,
  };
}

function withCurrentOption(options: readonly string[], current: string) {
  if (!current.trim() || options.includes(current)) return [...options];
  return [current, ...options];
}

function getFitmentOptions(row: FitmentForm) {
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

function autofillFitmentRow(row: FitmentForm): FitmentForm {
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

const STARTER_EDITOR: EditorState = {
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

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : Number.NaN;
}

function editorToPayload(editor: EditorState): UpsertPayload {
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

function payloadToEditor(payload: UpsertPayload | null | undefined): EditorState {
  const product = payload?.product;
  const fitment = payload?.fitment ?? [];

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

export default function AdminCatalogPage() {
  const [adminKey, setAdminKey] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [sessionState, setSessionState] = useState<AdminSessionState>("checking");
  const [sessionScope, setSessionScope] = useState<AdminSessionScope | null>(null);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [includeFitment, setIncludeFitment] = useState(true);
  const [editor, setEditor] = useState<EditorState>(STARTER_EDITOR);
  const [autoSlugEnabled, setAutoSlugEnabled] = useState(false);
  const [autoSkuEnabled, setAutoSkuEnabled] = useState(false);
  const [seedBusy, setSeedBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listBusy, setListBusy] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [lastLoadedSnapshot, setLastLoadedSnapshot] = useState(
    JSON.stringify(STARTER_EDITOR),
  );
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);
  const [imageUploadBusy, setImageUploadBusy] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const draftPayload = useMemo(() => editorToPayload(editor), [editor]);
  const imagePreviewUrl = editor.product.imageUrl.trim();
  const currentSnapshot = useMemo(() => JSON.stringify(editor), [editor]);
  const isDirty = currentSnapshot !== lastLoadedSnapshot;
  const ok = result && result.status >= 200 && result.status < 300;
  const devLocalFallbackEnabled = process.env.NODE_ENV === "development";
  const adminSessionRequired = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!adminSessionRequired) {
      setSessionState("unlocked");
      setSessionScope("write");
      return;
    }

    void refreshAdminSession();
  }, [adminSessionRequired]);

  async function refreshAdminSession() {
    setSessionError(null);
    setSessionState("checking");

    try {
      const res = await fetch("/api/admin/session", {
        method: "GET",
        cache: "no-store",
      });
      const json = (await res.json().catch(() => null)) as
        | { authenticated?: boolean; scope?: AdminSessionScope | null; error?: string }
        | null;

      if (res.ok && json?.authenticated) {
        setSessionState("unlocked");
        setSessionScope(json.scope ?? "write");
        return;
      }

      setSessionState("locked");
      setSessionScope(null);
      if (json?.error) setSessionError(json.error);
    } catch (err) {
      setSessionState("locked");
      setSessionScope(null);
      setSessionError(err instanceof Error ? err.message : "Could not verify admin session");
    }
  }

  async function handleUnlockAdmin() {
    setSessionBusy(true);
    setSessionError(null);

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: sessionPassword }),
      });

      const json = (await res.json().catch(() => null)) as
        | { authenticated?: boolean; scope?: AdminSessionScope | null; error?: string }
        | null;

      if (!res.ok || !json?.authenticated) {
        setSessionState("locked");
        setSessionScope(null);
        setSessionError(json?.error || `Unlock failed (${res.status})`);
        return;
      }

      setSessionState("unlocked");
      setSessionScope(json.scope ?? "write");
      setSessionPassword("");
      setSessionError(null);
    } catch (err) {
      setSessionState("locked");
      setSessionScope(null);
      setSessionError(err instanceof Error ? err.message : "Unlock failed");
    } finally {
      setSessionBusy(false);
    }
  }

  async function handleLockAdmin() {
    setSessionBusy(true);
    setSessionError(null);

    try {
      await fetch("/api/admin/session", {
        method: "DELETE",
      });
    } finally {
      setSessionBusy(false);
      setSessionState("locked");
      setSessionScope(null);
      setSessionPassword("");
      setAdminKey("");
    }
  }

  function buildAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {};
    if (adminKey.trim()) headers["x-fatman-admin-key"] = adminKey.trim();
    return headers;
  }

  function buildHeaders(): HeadersInit {
    return {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    };
  }

  function getTakenSlugs(current: EditorState) {
    return new Set(
      (products ?? [])
        .filter((item) => item.slug !== current.originalSlug && item.sku !== current.originalSku)
        .map((item) => item.slug.toLowerCase()),
    );
  }

  function getTakenSkus(current: EditorState) {
    return new Set(
      (products ?? [])
        .filter((item) => item.slug !== current.originalSlug && item.sku !== current.originalSku)
        .map((item) => item.sku.toLowerCase()),
    );
  }

  function buildAutoSlug(name: string, current: EditorState) {
    return makeUniqueIdentifier(productNameToSlug(name), getTakenSlugs(current));
  }

  function buildAutoSku(name: string, category: string, current: EditorState) {
    return makeUniqueIdentifier(productNameToSkuBase(name, category), getTakenSkus(current));
  }

  function setProductField<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
    if (field === "slug") setAutoSlugEnabled(false);
    if (field === "sku") setAutoSkuEnabled(false);

    setEditor((current) => {
      const product = {
        ...current.product,
        [field]: value,
      };

      const next: EditorState = {
        ...current,
        product,
      };

      if (field === "name") {
        const name = String(value);
        if (autoSlugEnabled) next.product.slug = buildAutoSlug(name, current);
        if (autoSkuEnabled) next.product.sku = buildAutoSku(name, product.category, current);
      }

      if (field === "category" && autoSkuEnabled) {
        next.product.sku = buildAutoSku(product.name, String(value), current);
      }

      return next;
    });
  }

  function enableAutoSlug() {
    setEditor((current) => ({
      ...current,
      product: {
        ...current.product,
        slug: buildAutoSlug(current.product.name, current),
      },
    }));
    setAutoSlugEnabled(true);
  }

  function enableAutoSku() {
    setEditor((current) => ({
      ...current,
      product: {
        ...current.product,
        sku: buildAutoSku(current.product.name, current.product.category, current),
      },
    }));
    setAutoSkuEnabled(true);
  }

  function setFitmentField(index: number, field: keyof FitmentForm, value: string) {
    setEditor((current) => ({
      ...current,
      fitment: current.fitment.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const nextRow: FitmentForm = { ...row, [field]: value };

        if (field === "year") {
          nextRow.make = "";
          nextRow.model = "";
          nextRow.variant = "";
          nextRow.engine = "";
        } else if (field === "make") {
          nextRow.model = "";
          nextRow.variant = "";
          nextRow.engine = "";
        } else if (field === "model") {
          nextRow.variant = "";
          nextRow.engine = "";
        } else if (field === "variant") {
          nextRow.engine = "";
        }

        return autofillFitmentRow(nextRow);
      }),
    }));
  }

  function addFitmentRow() {
    setEditor((current) => ({
      ...current,
      fitment: [...current.fitment, createBlankFitmentRow()],
    }));
  }

  function removeFitmentRow(index: number) {
    setEditor((current) => ({
      ...current,
      fitment:
        current.fitment.length === 1
          ? [createBlankFitmentRow()]
          : current.fitment.filter((_, rowIndex) => rowIndex !== index),
    }));
  }

  async function postJSON(endpoint: string, body: unknown) {
    setError(null);
    setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        // leave as raw text
      }
      setResult({ endpoint, status: res.status, body: parsed });
      return { ok: res.ok, parsed };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      return { ok: false, parsed: null };
    }
  }

  async function handleSeed() {
    setSeedBusy(true);
    try {
      await postJSON("/api/admin/catalog/seed", { includeFitment });
    } finally {
      setSeedBusy(false);
    }
  }

  async function handleSave() {
    setSaveBusy(true);
    try {
      const response = await postJSON("/api/admin/catalog/upsert", draftPayload);
      if (response.ok) {
        const savedEditor: EditorState = {
          ...editor,
          originalSlug: editor.product.slug.trim(),
          originalSku: editor.product.sku.trim(),
        };
        setEditor(savedEditor);
        setLastLoadedSnapshot(JSON.stringify(savedEditor));
      }
    } finally {
      setSaveBusy(false);
    }
  }

  async function handleImageUpload(file: File) {
    setImageUploadBusy(true);
    setImageUploadError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("slug", editor.product.slug.trim() || editor.product.sku.trim() || editor.product.name.trim() || "product");

      const res = await fetch("/api/admin/catalog/upload-image", {
        method: "POST",
        headers: buildAuthHeaders(),
        body: formData,
      });

      const json = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!res.ok || !json?.url) {
        setImageUploadError(json?.error || `Upload failed (${res.status})`);
        return;
      }

      setProductField("imageUrl", json.url);
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setImageUploadBusy(false);
    }
  }

  function maybeReplaceEditor(nextEditor: EditorState, autoIdentifiers = false) {
    if (
      isDirty &&
      !window.confirm("You have unsaved changes. Replace them with the loaded product?")
    ) {
      return;
    }

    setEditor(nextEditor);
    setAutoSlugEnabled(autoIdentifiers);
    setAutoSkuEnabled(autoIdentifiers);
    setLastLoadedSnapshot(JSON.stringify(nextEditor));
    setResult(null);
    setError(null);
    setImageUploadError(null);
  }

  function loadStarter() {
    maybeReplaceEditor(STARTER_EDITOR);
  }

  function createNewProduct() {
    maybeReplaceEditor(createBlankEditor(), true);
  }

  async function handleListProducts() {
    setListBusy(true);
    setListError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const qs = params.toString();
      const res = await fetch(`/api/admin/catalog/list${qs ? `?${qs}` : ""}`, {
        headers: buildHeaders(),
      });
      const json = (await res.json().catch(() => null)) as
        | { products?: ProductSummary[]; error?: string }
        | null;
      if (!res.ok) {
        setListError(json?.error || `Request failed (${res.status})`);
        setProducts(null);
        return;
      }
      setProducts(json?.products ?? []);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Request failed");
      setProducts(null);
    } finally {
      setListBusy(false);
    }
  }

  async function handleLoad(slug: string) {
    setLoadingSlug(slug);
    setListError(null);
    try {
      const res = await fetch(`/api/admin/catalog/list?slug=${encodeURIComponent(slug)}`, {
        headers: buildHeaders(),
      });
      const json = (await res.json().catch(() => null)) as
        | { payload?: UpsertPayload; error?: string }
        | null;
      if (!res.ok || !json?.payload) {
        setListError(json?.error || `Failed to load ${slug} (${res.status})`);
        return;
      }
      maybeReplaceEditor(payloadToEditor(json.payload));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoadingSlug(null);
    }
  }

  const savedBody =
    result && typeof result.body !== "string" && result.body && "product" in (result.body as object)
      ? (result.body as {
          product?: { slug?: string };
          fitmentCount?: number;
          source?: string;
          fallbackReason?: { stage?: string; error?: string };
        })
      : null;

  const resultError =
    result && typeof result.body !== "string" && result.body && "error" in (result.body as object)
      ? (result.body as { error?: string; details?: string }).error ?? null
      : null;

  const resultErrorDetails =
    result && typeof result.body !== "string" && result.body && "details" in (result.body as object)
      ? (result.body as { error?: string; details?: string }).details ?? null
      : null;

  if (adminSessionRequired && sessionState !== "unlocked") {
    return (
      <div className="min-h-screen bg-fatman-900 text-white">
        <section className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-10">
          <div className="w-full rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl shadow-black/20">
            <div>
              <h1 className="text-3xl font-black">Catalog Admin</h1>
              <p className="mt-2 text-sm text-white/70">
                Unlock the admin area with your catalog password. This creates a secure server-side
                session cookie so you do not have to keep pasting the write key into developer tools.
              </p>
            </div>

            {sessionState === "checking" ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-white/75">
                Checking admin session…
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className={labelClass}>Admin password</label>
                  <input
                    type="password"
                    className={`${inputClass} mt-1`}
                    value={sessionPassword}
                    onChange={(event) => setSessionPassword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleUnlockAdmin();
                      }
                    }}
                    placeholder="Enter FATMAN_ADMIN_WRITE_KEY"
                    autoComplete="current-password"
                  />
                </div>

                {sessionError && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                    {sessionError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => void handleUnlockAdmin()}
                    disabled={sessionBusy || !sessionPassword.trim()}
                  >
                    {sessionBusy ? "Unlocking…" : "Unlock admin"}
                  </button>
                  <p className="text-xs text-white/55">
                    Write key unlocks normal catalog tools. Seed key also works if you need setup
                    actions later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-black">Catalog Admin</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Built for staff, not developers. Load a product, edit the fields, add fitment rows,
          then save. No JSON required.
        </p>

        {adminSessionRequired && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <div>
              <strong className="block text-emerald-50">Admin session active</strong>
              <span className="text-emerald-100/80">
                {sessionScope === "seed"
                  ? "Seed-level session is unlocked for catalog admin and setup tools."
                  : "Catalog admin is unlocked with a secure cookie session."}
              </span>
            </div>
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => void handleLockAdmin()}
              disabled={sessionBusy}
            >
              {sessionBusy ? "Locking…" : "Lock admin"}
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="space-y-6">
            <div className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Pick a product to edit</h2>
                <button
                  type="button"
                  className={ghostButtonClass}
                  onClick={handleListProducts}
                  disabled={listBusy}
                >
                  {listBusy ? "Loading…" : products ? "Refresh" : "Load list"}
                </button>
              </div>
              <p className="text-sm text-white/60">
                Search existing products, then click <strong>Load</strong> to bring one into the
                editor.
              </p>
              <input
                type="text"
                className={inputClass}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleListProducts();
                  }
                }}
                placeholder="Search by name, slug, or SKU"
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={ghostButtonClass} onClick={createNewProduct}>
                  New blank product
                </button>
                <button type="button" className={ghostButtonClass} onClick={loadStarter}>
                  Load sample product
                </button>
              </div>
              {listError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                  {listError}
                </div>
              )}
              {products && (
                <div className="max-h-96 overflow-auto rounded-lg border border-white/10">
                  {products.length === 0 ? (
                    <p className="p-3 text-sm text-white/60">No products match.</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-white/60">
                        <tr>
                          <th className="px-3 py-2 font-medium">Name</th>
                          <th className="px-3 py-2 font-medium">Category</th>
                          <th className="px-3 py-2 font-medium">Price</th>
                          <th className="px-3 py-2 font-medium">Live</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((item) => (
                          <tr key={item.slug} className="border-t border-white/5 align-top">
                            <td className="px-3 py-2">
                              <div className="font-medium text-white/90">{item.name}</div>
                              <div className="font-mono text-[11px] text-white/45">
                                {item.slug} · {item.sku}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-white/60">{item.category_slug}</td>
                            <td className="px-3 py-2 text-white/80">
                              ${Number(item.price).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-white/60">
                              {item.published ? "Yes" : "No"}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                className={ghostButtonClass}
                                onClick={() => handleLoad(item.slug)}
                                disabled={loadingSlug === item.slug}
                              >
                                {loadingSlug === item.slug ? "Loading…" : "Load"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Edit product and save</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Fill the product details, pick the vehicle step by step, then save.
                  </p>
                </div>
                <div className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                  {editor.product.slug ? `Editing: ${editor.product.slug}` : "New product draft"}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Product name</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.name}
                    onChange={(event) => setProductField("name", event.target.value)}
                    placeholder="Front brake kit"
                  />
                </div>
                <div>
                  <label className={labelClass}>Brand</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.brand}
                    onChange={(event) => setProductField("brand", event.target.value)}
                    placeholder="Powerline"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className={labelClass}>SKU</label>
                    <button type="button" className="text-xs font-semibold text-fatman-accent" onClick={enableAutoSku}>
                      Auto-generate
                    </button>
                  </div>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.sku}
                    onChange={(event) => setProductField("sku", event.target.value)}
                    placeholder="FTM-BRK-1001"
                  />
                  <p className="mt-1 text-xs text-white/45">
                    {autoSkuEnabled ? "Auto-updates from name/category until edited." : "Manual override active."}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className={labelClass}>Slug</label>
                    <button type="button" className="text-xs font-semibold text-fatman-accent" onClick={enableAutoSlug}>
                      Auto-generate
                    </button>
                  </div>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.slug}
                    onChange={(event) => setProductField("slug", event.target.value)}
                    placeholder="front-brake-kit"
                  />
                  <p className="mt-1 text-xs text-white/45">
                    {autoSlugEnabled ? "Auto-updates from product name until edited." : "Manual override active."}
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={`${inputClass} mt-1`}
                    value={editor.product.category}
                    onChange={(event) => setProductField("category", event.target.value)}
                  >
                    {catalogRegistry.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Stock status</label>
                  <select
                    className={`${inputClass} mt-1`}
                    value={editor.product.stock}
                    onChange={(event) =>
                      setProductField(
                        "stock",
                        event.target.value as ProductForm["stock"],
                      )
                    }
                  >
                    <option value="in-stock">In stock</option>
                    <option value="low-stock">Low stock</option>
                    <option value="preorder">Preorder</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Price</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.price}
                    onChange={(event) => setProductField("price", event.target.value)}
                    placeholder="199.99"
                  />
                </div>
                <div>
                  <label className={labelClass}>Compare-at price</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.compareAt}
                    onChange={(event) => setProductField("compareAt", event.target.value)}
                    placeholder="249.99"
                  />
                </div>
                <div>
                  <label className={labelClass}>Shipping class</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.shippingClass}
                    onChange={(event) => setProductField("shippingClass", event.target.value)}
                    placeholder="ground"
                  />
                </div>
                <div>
                  <label className={labelClass}>Warranty days</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.warrantyDays}
                    onChange={(event) => setProductField("warrantyDays", event.target.value)}
                    placeholder="180"
                  />
                </div>
                <div>
                  <label className={labelClass}>OEM part number</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.oemPartNumber}
                    onChange={(event) => setProductField("oemPartNumber", event.target.value)}
                    placeholder="OEM-12345"
                  />
                </div>
                <div>
                  <label className={labelClass}>Image URL</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.imageUrl}
                    onChange={(event) => setProductField("imageUrl", event.target.value)}
                    placeholder="/fatman-uploads/catalog/product-image.jpg"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <label className={labelClass}>Product image</label>
                    <p className="mt-1 text-sm text-white/60">
                      Upload a picture here. We will save it and fill the image URL automatically.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <label className={`${ghostButtonClass} cursor-pointer`}>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleImageUpload(file);
                            event.currentTarget.value = "";
                          }}
                        />
                        {imageUploadBusy ? "Uploading image…" : "Choose image"}
                      </label>
                      <button
                        type="button"
                        className={ghostButtonClass}
                        onClick={() => {
                          setProductField("imageUrl", "");
                          setImageUploadError(null);
                        }}
                        disabled={imageUploadBusy || !editor.product.imageUrl}
                      >
                        Clear image
                      </button>
                    </div>
                    {imageUploadError && (
                      <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                        {imageUploadError}
                      </div>
                    )}
                  </div>
                  <div className="w-full max-w-xs">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                      Preview
                    </div>
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-fatman-700/60">
                      {imagePreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imagePreviewUrl}
                          alt={editor.product.name || "Product preview"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="px-4 text-center text-sm text-white/45">
                          No image yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Short description</label>
                <textarea
                  className={`${inputClass} mt-1 min-h-28`}
                  value={editor.product.shortDescription}
                  onChange={(event) => setProductField("shortDescription", event.target.value)}
                  placeholder="Direct-fit replacement brake kit for heavy-duty use."
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editor.product.published}
                    onChange={(event) => setProductField("published", event.target.checked)}
                  />
                  Product is live on the site
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editor.replaceFitment}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        replaceFitment: event.target.checked,
                      }))
                    }
                  />
                  Replace existing fitment with the rows below
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Vehicle fitment rows</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Add one row per vehicle. Pick year first, then make, model, trim, and engine.
                  </p>
                </div>
                <button type="button" className={ghostButtonClass} onClick={addFitmentRow}>
                  Add fitment row
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {editor.fitment.map((row, index) => (
                  <div
                    key={row.id}
                    className="rounded-lg border border-white/10 bg-black/10 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="text-sm text-white/85">Fitment row {index + 1}</strong>
                      <button
                        type="button"
                        className={ghostButtonClass}
                        onClick={() => removeFitmentRow(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {(() => {
                        const options = getFitmentOptions(row);
                        return (
                          <>
                            <div>
                              <label className={labelClass}>Year</label>
                              <select
                                className={`${inputClass} mt-1`}
                                value={row.year}
                                onChange={(event) => setFitmentField(index, "year", event.target.value)}
                              >
                                <option value="">Select year</option>
                                {options.years.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Make</label>
                              <select
                                className={`${inputClass} mt-1`}
                                value={row.make}
                                onChange={(event) => setFitmentField(index, "make", event.target.value)}
                                disabled={!row.year}
                              >
                                <option value="">{row.year ? "Select make" : "Choose year first"}</option>
                                {options.makes.map((make) => (
                                  <option key={make} value={make}>
                                    {make}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Model</label>
                              <select
                                className={`${inputClass} mt-1`}
                                value={row.model}
                                onChange={(event) => setFitmentField(index, "model", event.target.value)}
                                disabled={!row.year || !row.make}
                              >
                                <option value="">
                                  {row.year && row.make ? "Select model" : "Choose make first"}
                                </option>
                                {options.models.map((model) => (
                                  <option key={model} value={model}>
                                    {model}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Variant / trim</label>
                              <select
                                className={`${inputClass} mt-1`}
                                value={row.variant}
                                onChange={(event) => setFitmentField(index, "variant", event.target.value)}
                                disabled={!row.year || !row.make || !row.model}
                              >
                                <option value="">
                                  {row.year && row.make && row.model ? "Select variant" : "Choose model first"}
                                </option>
                                {options.variants.map((variant) => (
                                  <option key={variant} value={variant}>
                                    {variant}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Engine</label>
                              <select
                                className={`${inputClass} mt-1`}
                                value={row.engine}
                                onChange={(event) => setFitmentField(index, "engine", event.target.value)}
                                disabled={!row.year || !row.make || !row.model || options.engines.length === 0}
                              >
                                <option value="">
                                  {row.year && row.make && row.model
                                    ? "Select engine"
                                    : "Choose variant first"}
                                </option>
                                {options.engines.map((engine) => (
                                  <option key={engine} value={engine}>
                                    {engine}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        );
                      })()}
                      <div>
                        <label className={labelClass}>Match</label>
                        <select
                          className={`${inputClass} mt-1`}
                          value={row.matchType}
                          onChange={(event) =>
                            setFitmentField(index, "matchType", event.target.value)
                          }
                        >
                          <option value="fits">Fits</option>
                          <option value="verify">Verify</option>
                          <option value="no-fit">No fit</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-white/55">
                        Use <strong>Fits</strong> for confirmed matches, <strong>Verify</strong> if someone should double-check, and <strong>No fit</strong> only when you know it does not fit.
                      </p>
                      <div>
                        <label className={labelClass}>Notes (optional)</label>
                        <input
                          className={`${inputClass} mt-1`}
                          value={row.notes}
                          onChange={(event) => setFitmentField(index, "notes", event.target.value)}
                          placeholder="Optional note, for example: verify with VIN or trim package"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Save</h2>
                  <p className="mt-1 text-sm text-white/60">
                    {devLocalFallbackEnabled
                      ? "Save this product and its fitment to Supabase. In local development only, drafts can still fall back to the local safety store if Supabase is unavailable."
                      : "Save this product and its fitment to Supabase. In production, a failed save stays failed so you know it is not live yet."}
                  </p>
                </div>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={handleSave}
                  disabled={saveBusy}
                >
                  {saveBusy ? "Saving…" : "Save product"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {isDirty ? "Unsaved changes" : "All changes saved or loaded"}
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
                <strong className="block text-red-100">Could not save</strong>
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div
                className={`rounded-xl border p-5 text-sm ${
                  ok
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>{ok ? "Saved" : "Response"}</strong>
                </div>

                {savedBody?.product?.slug && (
                  <p className="mt-3 text-sm text-white/90">
                    Saved <strong>{savedBody.product.slug}</strong>
                    {typeof savedBody.fitmentCount === "number"
                      ? ` with ${savedBody.fitmentCount} fitment row${savedBody.fitmentCount === 1 ? "" : "s"}.`
                      : "."}
                  </p>
                )}

                {savedBody?.source === "local" && (
                  <p className="mt-3 text-xs text-white/80">
                    Supabase write failed in local development, so this draft was saved to the
                    local safety store instead. It is not live until it exists in Supabase.
                  </p>
                )}

                {!ok && resultError && (
                  <div className="mt-3 rounded-lg border border-amber-400/30 bg-black/20 p-3 text-xs text-white/90">
                    <strong className="block text-amber-100">Save failed</strong>
                    <p className="mt-1">{resultError}</p>
                    {resultErrorDetails && <p className="mt-1 text-white/70">{resultErrorDetails}</p>}
                  </div>
                )}

                {showDeveloperTools && (
                  <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/40 p-3 text-xs text-white/90">
                    {typeof result.body === "string"
                      ? result.body
                      : JSON.stringify(result.body, null, 2)}
                  </pre>
                )}
              </div>
            )}
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <button
                type="button"
                className={ghostButtonClass}
                onClick={() => setShowDeveloperTools((current) => !current)}
              >
                {showDeveloperTools ? "Hide developer tools" : "Show developer tools"}
              </button>

              {showDeveloperTools && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-white/60">
                    These controls are mainly for debugging and setup, not normal catalog work.
                  </p>

                  <div className="space-y-2">
                    <label className={labelClass}>Optional override key</label>
                    <input
                      type="password"
                      className={inputClass}
                      value={adminKey}
                      onChange={(event) => setAdminKey(event.target.value)}
                      placeholder="Usually blank. Use only if you need to override the session or send a separate seed key."
                      autoComplete="off"
                    />
                    <p className="text-xs text-white/50">
                      Normal list, save, and image upload requests now use your admin session cookie.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-white/10 bg-black/10 p-4">
                    <h3 className="text-sm font-bold text-white/85">Reset / seed catalog</h3>
                    <p className="text-sm text-white/60">
                      Reload the starter catalog into Supabase. Use this only for setup or recovery.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={includeFitment}
                        onChange={(event) => setIncludeFitment(event.target.checked)}
                      />
                      Include fitment rules while seeding
                    </label>
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={handleSeed}
                      disabled={seedBusy}
                    >
                      {seedBusy ? "Seeding…" : "Run seed"}
                    </button>
                  </div>

                  <div>
                    <label className={labelClass}>Current payload preview</label>
                    <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/40 p-3 text-xs text-white/90">
                      {JSON.stringify(draftPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
