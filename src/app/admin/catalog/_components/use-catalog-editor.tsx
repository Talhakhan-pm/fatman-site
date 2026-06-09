import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AdminSessionScope, AdminSessionState, ApiResult, EditorState, FitmentForm, ProductForm, ProductSummary, UpsertPayload } from "./types";
import { autofillFitmentRow, buildAutoSku, buildAutoSlug, createBlankEditor, createBlankFitmentRow, editorToPayload, payloadToEditor, STARTER_EDITOR } from "./helpers";

type SavedCatalogBody = {
  product?: {
    slug?: string;
  };
  fitmentCount?: number;
  source?: string;
};

function isSavedCatalogBody(value: unknown): value is SavedCatalogBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return "product" in record || "fitmentCount" in record || "source" in record;
}

export function useCatalogEditor() {
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams?.get("slug");
  const hasSlug = !!slugFromUrl;
  
  const [adminKey, setAdminKey] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [sessionState, setSessionState] = useState<AdminSessionState>("checking");
  const [sessionScope, setSessionScope] = useState<AdminSessionScope | null>(null);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  const [includeFitment, setIncludeFitment] = useState(true);
  const [editor, setEditor] = useState<EditorState>(() => createBlankEditor());
  const [autoSlugEnabled, setAutoSlugEnabled] = useState(!hasSlug);
  const [autoSkuEnabled, setAutoSkuEnabled] = useState(!hasSlug);
  
  const [seedBusy, setSeedBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);
  
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [listBusy, setListBusy] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  
  const [lastLoadedSnapshot, setLastLoadedSnapshot] = useState<string | null>(null);
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);
  
  const [imageUploadBusy, setImageUploadBusy] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const draftPayload = useMemo(() => editorToPayload(editor), [editor]);
  const imagePreviewUrl = editor.product.imageUrl.trim();
  const currentSnapshot = useMemo(() => JSON.stringify(editor), [editor]);
  const isDirty = lastLoadedSnapshot !== null && currentSnapshot !== lastLoadedSnapshot;
  const ok = result && result.status >= 200 && result.status < 300;
  
  const devLocalFallbackEnabled = process.env.NODE_ENV === "development";
  const adminSessionRequired = process.env.NODE_ENV === "production";

  // Initialize snapshot on mount using the exact initial editor instance
  useEffect(() => {
    if (lastLoadedSnapshot === null) {
      setLastLoadedSnapshot(JSON.stringify(editor));
    }
  }, []);

  useEffect(() => {
    if (!adminSessionRequired) {
      setSessionState("unlocked");
      setSessionScope("write");
      return;
    }
    void refreshAdminSession();
  }, [adminSessionRequired]);

  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (sessionState === "unlocked" && slugFromUrl && slugFromUrl !== loadedSlug) {
      setLoadedSlug(slugFromUrl);
      void handleLoad(slugFromUrl, true);
    }
  }, [sessionState, slugFromUrl, loadedSlug]);

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
        headers: { "Content-Type": "application/json" },
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
      await fetch("/api/admin/session", { method: "DELETE" });
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

  function setProductField<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
    if (field === "slug") setAutoSlugEnabled(false);
    if (field === "sku") setAutoSkuEnabled(false);

    setEditor((current) => {
      const product = { ...current.product, [field]: value };
      const next: EditorState = { ...current, product };

      if (field === "name") {
        const name = String(value);
        if (autoSkuEnabled) next.product.sku = buildAutoSku(name, product.category, current, getTakenSkus(current));
        if (autoSlugEnabled) next.product.slug = buildAutoSlug(next.product, current, getTakenSlugs(current));
      }

      if (field === "brand" && autoSlugEnabled) {
        next.product.slug = buildAutoSlug(next.product, current, getTakenSlugs(current));
      }

      if (field === "category" && autoSkuEnabled) {
        next.product.sku = buildAutoSku(product.name, String(value), current, getTakenSkus(current));
        if (autoSlugEnabled) next.product.slug = buildAutoSlug(next.product, current, getTakenSlugs(current));
      }

      if (field === "sku" && autoSlugEnabled) {
        next.product.slug = buildAutoSlug(next.product, current, getTakenSlugs(current));
      }

      return next;
    });
  }

  function enableAutoSlug() {
    setEditor((current) => ({
      ...current,
      product: {
        ...current.product,
        slug: buildAutoSlug(current.product, current, getTakenSlugs(current)),
      },
    }));
    setAutoSlugEnabled(true);
  }

  function enableAutoSku() {
    setEditor((current) => ({
      ...current,
      product: {
        ...current.product,
        sku: buildAutoSku(current.product.name, current.product.category, current, getTakenSkus(current)),
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

  function addBulkFitment(rows: FitmentForm[]) {
    setEditor((current) => {
      // If the only row is blank, replace it
      const currentRows = current.fitment;
      const isOnlyBlank = currentRows.length === 1 && !currentRows[0].year && !currentRows[0].make;
      return {
        ...current,
        fitment: isOnlyBlank ? rows : [...currentRows, ...rows],
      };
    });
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

  function getRequiredProductFieldErrors(product: ProductForm) {
    const requiredFields: Array<[keyof ProductForm, string]> = [
      ["sku", "SKU"],
      ["slug", "URL slug"],
      ["category", "Category"],
      ["brand", "Brand"],
      ["name", "Name"],
    ];

    return requiredFields
      .filter(([field]) => !String(product[field] ?? "").trim())
      .map(([, label]) => label);
  }

  function prepareEditorForSave(current: EditorState): EditorState {
    const product: ProductForm = { ...current.product };

    if (!product.sku.trim() && product.name.trim() && product.category.trim()) {
      product.sku = buildAutoSku(product.name, product.category, current, getTakenSkus(current));
    }

    if (!product.slug.trim() && product.name.trim()) {
      product.slug = buildAutoSlug(product, current, getTakenSlugs(current));
    }

    return { ...current, product };
  }

  async function handleSave() {
    setSaveBusy(true);
    try {
      const editorForSave = prepareEditorForSave(editor);
      const missingFields = getRequiredProductFieldErrors(editorForSave.product);
      const payload = editorToPayload(editorForSave);

      if (missingFields.length > 0) {
        setEditor(editorForSave);
        setResult({
          endpoint: "/api/admin/catalog/upsert",
          status: 400,
          body: {
            error: `Missing required product fields: ${missingFields.join(", ")}`,
            details: "Fill the missing fields. SKU and URL slug auto-fill when name/category are present.",
          },
        });
        return;
      }

      if (editorForSave !== editor) {
        setEditor(editorForSave);
      }

      const response = await postJSON("/api/admin/catalog/upsert", payload);
      if (response.ok) {
        const savedEditor: EditorState = {
          ...editorForSave,
          originalSlug: editorForSave.product.slug.trim(),
          originalSku: editorForSave.product.sku.trim(),
        };
        setEditor(savedEditor);
        setLastLoadedSnapshot(JSON.stringify(savedEditor));
      }
    } finally {
      setSaveBusy(false);
    }
  }

  async function handleArchiveProduct() {
    const slug = editor.originalSlug ?? editor.product.slug.trim();
    const sku = editor.originalSku ?? editor.product.sku.trim();
    if (!slug && !sku) return;
    if (!window.confirm("Archive this product? It will be unpublished from the storefront but kept in the database.")) return;

    setArchiveBusy(true);
    try {
      const response = await postJSON("/api/admin/catalog/archive", { slug, sku });
      if (response.ok) {
        const archivedEditor: EditorState = {
          ...editor,
          product: { ...editor.product, published: false },
        };
        setEditor(archivedEditor);
        setLastLoadedSnapshot(JSON.stringify(archivedEditor));
        await handleListProducts();
      }
    } finally {
      setArchiveBusy(false);
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

      const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;

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

  function maybeReplaceEditor(nextEditor: EditorState, autoIdentifiers = false, force = false) {
    if (!force && isDirty && !window.confirm("You have unsaved changes. Replace them with the loaded product?")) {
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
      const json = (await res.json().catch(() => null)) as { products?: ProductSummary[]; error?: string } | null;
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

  async function handleLoad(slug: string, force = false) {
    setLoadingSlug(slug);
    setListError(null);
    try {
      const res = await fetch(`/api/admin/catalog/list?slug=${encodeURIComponent(slug)}`, {
        headers: buildHeaders(),
      });
      const json = (await res.json().catch(() => null)) as { payload?: UpsertPayload; error?: string } | null;
      if (!res.ok || !json?.payload) {
        setListError(json?.error || `Failed to load ${slug} (${res.status})`);
        return;
      }
      maybeReplaceEditor(payloadToEditor(json.payload), false, force);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoadingSlug(null);
    }
  }

  const resultBody = result?.body;
  const resultRecord =
    resultBody && typeof resultBody === "object" && !Array.isArray(resultBody)
      ? (resultBody as Record<string, unknown>)
      : null;

  const savedBody = isSavedCatalogBody(resultBody) ? resultBody : null;

  const resultError =
    resultRecord && "error" in resultRecord && typeof resultRecord.error === "string"
      ? resultRecord.error
      : null;

  const resultErrorDetails =
    resultRecord && "details" in resultRecord && typeof resultRecord.details === "string"
      ? resultRecord.details
      : null;

  return {
    // State
    adminKey, setAdminKey,
    sessionPassword, setSessionPassword,
    sessionState, sessionScope, sessionBusy, sessionError,
    includeFitment, setIncludeFitment,
    editor, setEditor,
    autoSlugEnabled, autoSkuEnabled,
    seedBusy, saveBusy, archiveBusy,
    result, error,
    listBusy, listError, products, search, setSearch, loadingSlug,
    showDeveloperTools, setShowDeveloperTools,
    imageUploadBusy, imageUploadError, setImageUploadError,
    
    // Derived
    draftPayload, imagePreviewUrl, isDirty, ok, devLocalFallbackEnabled, adminSessionRequired,
    savedBody, resultError, resultErrorDetails,
    
    // Handlers
    handleUnlockAdmin, handleLockAdmin,
    setProductField, enableAutoSlug, enableAutoSku,
    setFitmentField, addFitmentRow, addBulkFitment, removeFitmentRow,
    handleSeed, handleSave, handleArchiveProduct, handleImageUpload,
    createNewProduct, handleListProducts, handleLoad
  };
}
