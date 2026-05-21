"use client";

import { useCatalogEditor } from "./_components/use-catalog-editor";
import { AdminAuth } from "./_components/admin-auth";
import { ProductPicker } from "./_components/product-picker";
import { ProductForm } from "./_components/product-form";
import { FitmentEditor } from "./_components/fitment-editor";
import { DeveloperTools } from "./_components/developer-tools";
import { buttonClass, ghostButtonClass } from "./_components/ui";

export default function AdminCatalogPage() {
  const editor = useCatalogEditor();
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
    devLocalFallbackEnabled,
    handleSave,
    saveBusy,
    handleArchiveProduct,
    archiveBusy,
  } = editor;

  const isArchive = result?.endpoint?.endsWith("/archive");

  // Render the auth wall if required
  if (adminSessionRequired && sessionState !== "unlocked") {
    return <AdminAuth editor={editor} />;
  }

  return (
    <div className="min-h-screen bg-fatman-900 text-white pt-28 lg:pt-32">
      <section className="mx-auto max-w-6xl px-6 pb-10">
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
            <ProductPicker editor={editor} />
            <DeveloperTools editor={editor} />
          </div>

          <div className="space-y-6">
            <ProductForm editor={editor} />
            <FitmentEditor editor={editor} />

            {/* Save Section */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Save changes</h2>
                  <p className="mt-1 text-sm text-white/60">
                    {devLocalFallbackEnabled
                      ? "Save this product and its fitment to Supabase. In local development only, drafts can fall back to the local safety store."
                      : "Save this product and its fitment directly to Supabase."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void handleArchiveProduct()}
                    disabled={archiveBusy || editor.editor.product.published === false}
                  >
                    {archiveBusy ? "Archiving…" : editor.editor.product.published === false ? "Archived" : "Archive product"}
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => void handleSave()}
                    disabled={saveBusy}
                  >
                    {saveBusy ? "Saving…" : "Save product"}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {isDirty ? "Unsaved changes" : "All changes saved or loaded"}
                </span>
              </div>
            </div>

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
