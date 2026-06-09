"use client";

import { Suspense, useState } from "react";
import { useCatalogEditor } from "./_components/use-catalog-editor";
import { AdminAuth } from "./_components/admin-auth";
import { ProductPicker } from "./_components/product-picker";
import { ProductForm } from "./_components/product-form";
import { FitmentEditor } from "./_components/fitment-editor";
import { FitmentCombinator } from "./_components/fitment-combinator";
import { DeveloperTools } from "./_components/developer-tools";
import { ghostButtonClass } from "./_components/ui";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";
import type { CategorySlug } from "@/lib/catalog-registry";
import type { ProductForm as ProductFormType } from "./_components/types";

function formToProduct(form: ProductFormType): Product {
  return {
    sku: form.sku || "FTM-TEMP-SKU",
    slug: form.slug || "temp-slug",
    category: (form.category || "cooling") as CategorySlug,
    brand: form.brand || "Brand",
    name: form.name || "Product Name Placeholder",
    shortDescription: form.shortDescription || "No description provided yet.",
    price: Number(form.price) || 0,
    compareAt: form.compareAt ? Number(form.compareAt) : undefined,
    stock: form.stock || "in-stock",
    imageUrl: form.imageUrl || undefined,
    shippingClass: form.shippingClass || undefined,
    warrantyDays: form.warrantyDays ? Number(form.warrantyDays) : undefined,
    oemPartNumber: form.oemPartNumber || undefined,
    condition: form.condition || undefined,
    partSource: form.partSource || undefined,
    metadata: form.metadata,
  };
}

export default function AdminCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-fatman-900 pt-32 text-center text-white">Loading editor...</div>}>
      <AdminCatalogContent />
    </Suspense>
  );
}

function AdminCatalogContent() {
  const editor = useCatalogEditor();
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "fitment">("general");

  const {
    sessionState,
    sessionScope,
    adminSessionRequired,
    handleLockAdmin,
    sessionBusy,
    isDirty,
    error,
    result,
    ok,
    savedBody,
    resultError,
    resultErrorDetails,
    handleSave,
    saveBusy,
    handleArchiveProduct,
    archiveBusy,
    loadingSlug,
  } = editor;

  const isArchive = result?.endpoint?.endsWith("/archive");

  // Render the auth wall if required
  if (adminSessionRequired && sessionState !== "unlocked") {
    return <AdminAuth editor={editor} />;
  }

  return (
    <div className="min-h-screen bg-fatman-900 text-white pt-28 lg:pt-32">
      <section className="mx-auto max-w-7xl px-6 pb-20">
        
        {/* Sticky Workspace Status Bar */}
        <div className="sticky top-20 z-40 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-fatman-900/90 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            <div>
              <h2 className="text-sm font-black text-white">
                {editor.editor.product.name ? `Editing: ${editor.editor.product.name}` : "New Product Draft"}
              </h2>
              <p className="font-mono text-[10px] text-white/50">
                {editor.editor.product.sku || "No SKU"} · {editor.editor.product.slug || "No Slug"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs font-bold text-amber-400 mr-2 animate-pulse">Unsaved Changes</span>
            )}
            <button
              type="button"
              className="rounded-lg border border-red-500/30 px-3.5 py-1.5 text-xs font-semibold text-red-455 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void handleArchiveProduct()}
              disabled={archiveBusy || editor.editor.product.published === false}
            >
              {archiveBusy ? "Archiving…" : editor.editor.product.published === false ? "Archived" : "Archive"}
            </button>
            <button
              type="button"
              className="rounded-lg bg-fatman-accent px-5 py-1.5 text-xs font-black text-fatman-900 hover:bg-fatman-accent-hover transition disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_15px_rgba(234,88,12,0.3)]"
              onClick={() => void handleSave()}
              disabled={saveBusy}
            >
              {saveBusy ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black">Catalog Admin</h1>
            <p className="mt-1 text-sm text-white/70">
              Built for staff, not developers. No JSON required.
            </p>
          </div>
          {adminSessionRequired && (
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => void handleLockAdmin()}
              disabled={sessionBusy}
            >
              {sessionBusy ? "Locking…" : "Lock Admin"}
            </button>
          )}
        </div>

        {loadingSlug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-fatman-900/80 backdrop-blur-sm">
            <div className="rounded-2xl border border-fatman-accent/20 bg-fatman-800 p-8 text-center shadow-2xl">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-fatman-accent border-t-transparent"></div>
              <p className="font-semibold text-white">Loading product data...</p>
              <p className="mt-1 text-sm text-white/60">Fetching {loadingSlug}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[330px_1fr] xl:grid-cols-[360px_1fr]">
          {/* Left Column: Selectors, Live Card Preview, Dev Tools */}
          <div className="space-y-6">
            <ProductPicker editor={editor} />

            {/* Storefront Card Preview Container */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-inner">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-4 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-fatman-accent" />
                Live Card Preview
              </h3>
              <div className="mx-auto w-full max-w-[340px] pointer-events-none select-none origin-top transition-transform duration-300">
                <ProductCard product={formToProduct(editor.editor.product)} />
              </div>
            </div>

            <DeveloperTools editor={editor} />
          </div>

          {/* Right Column: Tabbed Editor Content */}
          <div className="space-y-6">
            
            {/* Horizontal Tabs Navigation */}
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
              {[
                { id: "general", label: "1. General Info" },
                { id: "pricing", label: "2. Pricing & Specs" },
                { id: "fitment", label: "3. Vehicle Fitment" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 text-sm font-black transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-fatman-accent text-fatman-accent"
                      : "border-transparent text-white/50 hover:text-white/85"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conditionally rendered form groups */}
            {activeTab === "general" && (
              <ProductForm editor={editor} tab="general" />
            )}
            {activeTab === "pricing" && (
              <ProductForm editor={editor} tab="pricing" />
            )}
            {activeTab === "fitment" && (
              <div className="space-y-6">
                <FitmentCombinator editor={editor} />
                <FitmentEditor editor={editor} />
              </div>
            )}

            {/* Error / Result Display */}
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
                  <strong>{ok ? (isArchive ? "Archived successfully" : "Saved successfully") : (isArchive ? "Archive failed" : "Save failed")}</strong>
                </div>

                {savedBody?.product?.slug && (
                  <p className="mt-3 text-sm text-white/90">
                    {isArchive ? "Archived" : "Saved"} <strong>{savedBody.product.slug}</strong>
                    {!isArchive && typeof savedBody.fitmentCount === "number"
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
                    <strong className="block text-amber-100">Error Details</strong>
                    <p className="mt-1">{resultError}</p>
                    {resultErrorDetails && <p className="mt-1 text-white/70">{resultErrorDetails}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
