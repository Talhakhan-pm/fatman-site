"use client";

import { useMemo, useState } from "react";
import { catalogRegistry } from "@/lib/catalog-registry";

type ApiResult = {
  endpoint: string;
  status: number;
  body: unknown;
};

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

function createBlankFitmentRow(): FitmentForm {
  return {
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
    fitment: [createBlankFitmentRow()],
    replaceFitment: true,
  };
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
  fitment: [
    {
      year: "2018",
      make: "Toyota",
      model: "Camry",
      variant: "",
      engine: "2.5L L4",
      matchType: "fits",
      source: "admin-ui",
      notes: "",
    },
    {
      year: "2019",
      make: "Toyota",
      model: "Camry",
      variant: "",
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
    fitment:
      fitment.length > 0
        ? fitment.map((row) => ({
            year: row.year ?? "",
            make: row.make ?? "",
            model: row.model ?? "",
            variant: row.variant ?? "",
            engine: row.engine ?? "",
            matchType: row.matchType ?? "fits",
            source: row.source ?? "admin-ui",
            notes: row.notes ?? "",
          }))
        : [createBlankFitmentRow()],
    replaceFitment: payload?.replaceFitment ?? true,
  };
}

export default function AdminCatalogPage() {
  const [adminKey, setAdminKey] = useState("");
  const [includeFitment, setIncludeFitment] = useState(true);
  const [editor, setEditor] = useState<EditorState>(STARTER_EDITOR);
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const draftPayload = useMemo(() => editorToPayload(editor), [editor]);
  const currentSnapshot = useMemo(() => JSON.stringify(editor), [editor]);
  const isDirty = currentSnapshot !== lastLoadedSnapshot;
  const ok = result && result.status >= 200 && result.status < 300;

  function buildHeaders(): HeadersInit {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminKey.trim()) headers["x-fatman-admin-key"] = adminKey.trim();
    return headers;
  }

  function setProductField<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
    setEditor((current) => ({
      ...current,
      product: {
        ...current.product,
        [field]: value,
      },
    }));
  }

  function setFitmentField(index: number, field: keyof FitmentForm, value: string) {
    setEditor((current) => ({
      ...current,
      fitment: current.fitment.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
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
        setLastLoadedSnapshot(JSON.stringify(editor));
      }
    } finally {
      setSaveBusy(false);
    }
  }

  function maybeReplaceEditor(nextEditor: EditorState) {
    if (
      isDirty &&
      !window.confirm("You have unsaved changes. Replace them with the loaded product?")
    ) {
      return;
    }

    setEditor(nextEditor);
    setLastLoadedSnapshot(JSON.stringify(nextEditor));
    setResult(null);
    setError(null);
  }

  function loadStarter() {
    maybeReplaceEditor(STARTER_EDITOR);
  }

  function createNewProduct() {
    maybeReplaceEditor(createBlankEditor());
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
      ? (result.body as { product?: { slug?: string }; fitmentCount?: number })
      : null;

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-black">Catalog Admin</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Built for staff, not developers. Load a product, edit the fields, add fitment rows,
          then save. No JSON required.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="space-y-6">
            <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-5">
              <label className={labelClass}>Admin key (optional in local dev)</label>
              <input
                type="password"
                className={inputClass}
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                placeholder="Required only in production"
                autoComplete="off"
              />
            </div>

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

            <div className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-5">
              <h2 className="text-lg font-bold">Reset / seed tools</h2>
              <p className="text-sm text-white/60">
                Only use this when you want to reload the starter catalog into Supabase.
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
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Edit product and save</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Fill the fields, add fitment rows, then click <strong>Save product</strong>.
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
                  <label className={labelClass}>SKU</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.sku}
                    onChange={(event) => setProductField("sku", event.target.value)}
                    placeholder="FTM-BRK-1001"
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug</label>
                  <input
                    className={`${inputClass} mt-1`}
                    value={editor.product.slug}
                    onChange={(event) => setProductField("slug", event.target.value)}
                    placeholder="front-brake-kit"
                  />
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
                    placeholder="https://..."
                  />
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
                    Add one row per vehicle combination this product fits.
                  </p>
                </div>
                <button type="button" className={ghostButtonClass} onClick={addFitmentRow}>
                  Add fitment row
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {editor.fitment.map((row, index) => (
                  <div
                    key={`${index}-${row.year}-${row.make}-${row.model}`}
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
                      <div>
                        <label className={labelClass}>Year</label>
                        <input
                          className={`${inputClass} mt-1`}
                          value={row.year}
                          onChange={(event) => setFitmentField(index, "year", event.target.value)}
                          placeholder="2021"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Make</label>
                        <input
                          className={`${inputClass} mt-1`}
                          value={row.make}
                          onChange={(event) => setFitmentField(index, "make", event.target.value)}
                          placeholder="Ford"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Model</label>
                        <input
                          className={`${inputClass} mt-1`}
                          value={row.model}
                          onChange={(event) => setFitmentField(index, "model", event.target.value)}
                          placeholder="F-150"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Variant / trim</label>
                        <input
                          className={`${inputClass} mt-1`}
                          value={row.variant}
                          onChange={(event) =>
                            setFitmentField(index, "variant", event.target.value)
                          }
                          placeholder="Base"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Engine</label>
                        <input
                          className={`${inputClass} mt-1`}
                          value={row.engine}
                          onChange={(event) => setFitmentField(index, "engine", event.target.value)}
                          placeholder="V6-3.5L"
                        />
                      </div>
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
                      <div>
                        <label className={labelClass}>Source</label>
                        <input
                          className={`${inputClass} mt-1`}
                          value={row.source}
                          onChange={(event) => setFitmentField(index, "source", event.target.value)}
                          placeholder="admin-ui"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className={labelClass}>Notes (optional)</label>
                      <input
                        className={`${inputClass} mt-1`}
                        value={row.notes}
                        onChange={(event) => setFitmentField(index, "notes", event.target.value)}
                        placeholder="Use VIN if trim is unclear"
                      />
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
                    This saves the product and fitment into Supabase using the same backend route
                    agents use.
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
                <button
                  type="button"
                  className={ghostButtonClass}
                  onClick={() => setShowAdvanced((current) => !current)}
                >
                  {showAdvanced ? "Hide raw payload" : "Show raw payload"}
                </button>
              </div>

              {showAdvanced && (
                <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/40 p-3 text-xs text-white/90">
                  {JSON.stringify(draftPayload, null, 2)}
                </pre>
              )}
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
                  <code className="text-xs opacity-80">{result.endpoint}</code>
                </div>

                {savedBody?.product?.slug && (
                  <p className="mt-3 text-sm text-white/90">
                    Saved <strong>{savedBody.product.slug}</strong>
                    {typeof savedBody.fitmentCount === "number"
                      ? ` with ${savedBody.fitmentCount} fitment row${savedBody.fitmentCount === 1 ? "" : "s"}.`
                      : "."}
                  </p>
                )}

                <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/40 p-3 text-xs text-white/90">
                  {typeof result.body === "string"
                    ? result.body
                    : JSON.stringify(result.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
