import type { useCatalogEditor } from "./use-catalog-editor";
import { ghostButtonClass, inputClass, labelClass } from "./ui";
import { getFitmentOptions } from "./helpers";

export function FitmentEditor({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const {
    editor: editorState,
    setFitmentField,
    addFitmentRow,
    removeFitmentRow,
    setEditor,
  } = editor;

  return (
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

      <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-2 pb-2 
        [&::-webkit-scrollbar]:w-2 
        [&::-webkit-scrollbar-track]:bg-black/20 
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-white/10 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        {editorState.fitment.map((row, index) => (
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

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80 border-t border-white/10 pt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={editorState.replaceFitment}
            onChange={(event) =>
              setEditor((current) => ({
                ...current,
                replaceFitment: event.target.checked,
              }))
            }
          />
          Replace existing fitment with the rows above when saving
        </label>
      </div>
    </div>
  );
}
