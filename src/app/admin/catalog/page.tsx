"use client";

import { useState } from "react";

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

const STARTER_PAYLOAD = `{
  "product": {
    "sku": "FTM-COL-9001",
    "slug": "demo-aluminum-radiator",
    "category": "cooling",
    "brand": "DriveCore",
    "name": "Demo Aluminum Radiator (Admin Upsert)",
    "shortDescription": "Internal test product created from the admin UI.",
    "price": 199.99,
    "compareAt": 249.99,
    "stock": "in-stock",
    "shippingClass": "ground",
    "warrantyDays": 180,
    "oemPartNumber": "OEM-DEMO-9001",
    "published": true
  },
  "fitment": [
    {
      "year": "2018",
      "make": "Toyota",
      "model": "Camry",
      "engine": "2.5L L4",
      "matchType": "fits",
      "source": "admin-ui"
    },
    {
      "year": "2019",
      "make": "Toyota",
      "model": "Camry",
      "engine": "2.5L L4",
      "matchType": "fits",
      "source": "admin-ui"
    }
  ],
  "replaceFitment": true
}`;

const inputClass =
  "w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-fatman-accent";

const buttonClass =
  "rounded-lg bg-fatman-accent px-4 py-2 text-sm font-semibold text-fatman-900 disabled:opacity-50 disabled:cursor-not-allowed";

const ghostButtonClass =
  "rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/5";

export default function AdminCatalogPage() {
  const [adminKey, setAdminKey] = useState("");
  const [includeFitment, setIncludeFitment] = useState(true);
  const [payload, setPayload] = useState(STARTER_PAYLOAD);
  const [seedBusy, setSeedBusy] = useState(false);
  const [upsertBusy, setUpsertBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listBusy, setListBusy] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [lastLoadedPayload, setLastLoadedPayload] = useState<string | null>(null);

  function buildHeaders(): HeadersInit {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminKey.trim()) headers["x-fatman-admin-key"] = adminKey.trim();
    return headers;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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

  async function handleUpsert() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch (err) {
      setResult(null);
      setError(`Invalid JSON: ${err instanceof Error ? err.message : "parse error"}`);
      return;
    }
    setUpsertBusy(true);
    try {
      await postJSON("/api/admin/catalog/upsert", parsed);
    } finally {
      setUpsertBusy(false);
    }
  }

  function loadStarter() {
    setPayload(STARTER_PAYLOAD);
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
      const res = await fetch(
        `/api/admin/catalog/list?slug=${encodeURIComponent(slug)}`,
        { headers: buildHeaders() },
      );
      const json = (await res.json().catch(() => null)) as
        | { payload?: unknown; error?: string }
        | null;
      if (!res.ok || !json?.payload) {
        setListError(json?.error || `Failed to load ${slug} (${res.status})`);
        return;
      }
      const next = JSON.stringify(json.payload, null, 2);

      // TODO: Decide how to overwrite the editor when the user clicks "Load".
      // Options discussed:
      //   1. Always overwrite (simple, but loses unsaved edits).
      //   2. Confirm only when the textarea differs from STARTER_PAYLOAD and
      //      from `lastLoadedPayload` (protects unsaved edits, allows free
      //      reloads when idle).
      //   3. Always confirm via window.confirm (safest, most annoying).
      // Replace the body below with your chosen behavior.
      setPayload(next);
      setLastLoadedPayload(next);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoadingSlug(null);
    }
  }

  const ok = result && result.status >= 200 && result.status < 300;

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Catalog Admin</h1>
        <p className="mt-2 text-sm text-white/70">
          Internal-only utility. Seeds bundled catalog data and upserts a single product +
          fitment via the Supabase-backed admin routes.
        </p>

        <div className="mt-6 space-y-2 rounded-xl border border-white/15 bg-white/5 p-5">
          <label className="block text-xs uppercase tracking-wide text-white/60">
            Admin key (header: x-fatman-admin-key)
          </label>
          <input
            type="password"
            className={inputClass}
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Required in production. Leave blank in dev."
            autoComplete="off"
          />
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-lg font-bold">Seed catalog</h2>
          <p className="text-sm text-white/60">
            Posts to <code className="text-fatman-accent">/api/admin/catalog/seed</code> using
            the bundled <code>categories</code> and <code>products</code> data.
          </p>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={includeFitment}
              onChange={(event) => setIncludeFitment(event.target.checked)}
            />
            Include fitment rules (replaces existing rules for seeded products)
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

        <div className="mt-6 space-y-3 rounded-xl border border-white/15 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Existing products</h2>
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
            Reads from Supabase via{" "}
            <code className="text-fatman-accent">/api/admin/catalog/list</code>. Click a row to
            pull the product + fitment into the upsert editor below.
          </p>
          <div className="flex gap-2">
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
              placeholder="Search slug / name / sku (Enter to search)"
            />
          </div>
          {listError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
              {listError}
            </div>
          )}
          {products && (
            <div className="max-h-80 overflow-auto rounded-lg border border-white/10">
              {products.length === 0 ? (
                <p className="p-3 text-sm text-white/60">No products match.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60">
                    <tr>
                      <th className="px-3 py-2 font-medium">Slug</th>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Cat</th>
                      <th className="px-3 py-2 font-medium">Price</th>
                      <th className="px-3 py-2 font-medium">Pub</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.slug} className="border-t border-white/5">
                        <td className="px-3 py-2 font-mono text-white/80">{p.slug}</td>
                        <td className="px-3 py-2 text-white/90">{p.name}</td>
                        <td className="px-3 py-2 text-white/60">{p.category_slug}</td>
                        <td className="px-3 py-2 text-white/80">{Number(p.price).toFixed(2)}</td>
                        <td className="px-3 py-2 text-white/60">{p.published ? "✓" : "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            className={ghostButtonClass}
                            onClick={() => handleLoad(p.slug)}
                            disabled={loadingSlug === p.slug}
                          >
                            {loadingSlug === p.slug ? "Loading…" : "Load"}
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

        <div className="mt-6 space-y-3 rounded-xl border border-white/15 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Upsert product + fitment</h2>
            <button type="button" className={ghostButtonClass} onClick={loadStarter}>
              Load starter template
            </button>
          </div>
          <p className="text-sm text-white/60">
            Posts JSON to <code className="text-fatman-accent">/api/admin/catalog/upsert</code>.
            Required keys: <code>product.sku</code>, <code>product.slug</code>,{" "}
            <code>product.category</code>, <code>product.brand</code>,{" "}
            <code>product.name</code>, <code>product.price</code>. Optional: <code>fitment[]</code>,{" "}
            <code>category</code>, <code>replaceFitment</code>.
          </p>
          <textarea
            className={`${inputClass} h-96 font-mono text-xs`}
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            spellCheck={false}
          />
          <button
            type="button"
            className={buttonClass}
            onClick={handleUpsert}
            disabled={upsertBusy}
          >
            {upsertBusy ? "Upserting…" : "Run upsert"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
            <strong className="block text-red-100">Error</strong>
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div
            className={`mt-6 rounded-xl border p-5 text-sm ${
              ok
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                : "border-amber-500/40 bg-amber-500/10 text-amber-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <strong>
                {ok ? "Success" : "Response"} · {result.status}
              </strong>
              <code className="text-xs opacity-80">{result.endpoint}</code>
            </div>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/40 p-3 text-xs text-white/90">
              {typeof result.body === "string"
                ? result.body
                : JSON.stringify(result.body, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
