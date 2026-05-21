import type { useCatalogEditor } from "./use-catalog-editor";
import { buttonClass, ghostButtonClass, labelClass } from "./ui";

export function DeveloperTools({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const {
    showDeveloperTools,
    setShowDeveloperTools,
    includeFitment,
    setIncludeFitment,
    seedBusy,
    handleSeed,
    draftPayload,
  } = editor;

  return (
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
  );
}
