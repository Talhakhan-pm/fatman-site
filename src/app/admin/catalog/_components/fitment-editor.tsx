import { useMemo } from "react";
import type { useCatalogEditor } from "./use-catalog-editor";
import { ghostButtonClass } from "./ui";
import { getFitmentOptions } from "./helpers";

const tableSelectClass =
  "w-full rounded-md border border-white/10 bg-fatman-700/50 px-2 py-1 text-xs text-white outline-none focus:border-fatman-accent/50 focus:ring-0 disabled:opacity-50";

const tableInputClass =
  "w-full rounded-md border border-white/10 bg-fatman-700/50 px-2.5 py-1 text-xs text-white outline-none placeholder:text-white/30 focus:border-fatman-accent/50 focus:ring-0";

export function FitmentEditor({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const {
    editor: editorState,
    setFitmentField,
    addFitmentRow,
    removeFitmentRow,
    setEditor,
  } = editor;

  // Calculate quick fitment summaries
  const summary = useMemo(() => {
    let fits = 0;
    let verify = 0;
    let noFit = 0;
    for (const row of editorState.fitment) {
      if (row.matchType === "fits") fits++;
      else if (row.matchType === "verify") verify++;
      else if (row.matchType === "no-fit") noFit++;
    }
    return { fits, verify, noFit, total: editorState.fitment.length };
  }, [editorState.fitment]);

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold">Vehicle Fitment List</h2>
          <p className="mt-1 text-xs text-white/50">
            Define YMME specifications for storefront fitment compatibility warnings.
          </p>
        </div>
        <button
          type="button"
          onClick={addFitmentRow}
          className="rounded-lg bg-fatman-accent/10 border border-fatman-accent/25 hover:bg-fatman-accent/20 px-3.5 py-2 text-xs font-bold text-fatman-accent transition"
        >
          + Add Fitment Row
        </button>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
          Total Configurations: <strong className="text-white">{summary.total}</strong>
        </span>
        <span className="rounded bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
          Fits: <strong>{summary.fits}</strong>
        </span>
        <span className="rounded bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
          Verify: <strong>{summary.verify}</strong>
        </span>
        {summary.noFit > 0 && (
          <span className="rounded bg-red-500/10 border border-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-400">
            No Fit: <strong>{summary.noFit}</strong>
          </span>
        )}
      </div>

      {/* Fitment Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 max-h-[500px] overflow-y-auto pr-1
        [&::-webkit-scrollbar]:w-2 
        [&::-webkit-scrollbar-track]:bg-black/20 
        [&::-webkit-scrollbar-thumb]:bg-white/10 
        hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-[#161a22] text-white/60 shadow-sm">
            <tr>
              <th className="px-3 py-2.5 w-12 text-center">#</th>
              <th className="px-3 py-2.5 w-24">Year</th>
              <th className="px-3 py-2.5 w-32">Make</th>
              <th className="px-3 py-2.5 w-40">Model</th>
              <th className="px-3 py-2.5 w-40">Variant / Trim</th>
              <th className="px-3 py-2.5 w-40">Engine</th>
              <th className="px-3 py-2.5 w-32">Match</th>
              <th className="px-3 py-2.5 min-w-[200px]">Notes</th>
              <th className="px-3 py-2.5 w-16 text-center" />
            </tr>
          </thead>
          <tbody>
            {editorState.fitment.map((row, index) => {
              const options = getFitmentOptions(row);
              return (
                <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.01] align-middle">
                  <td className="px-3 py-2 text-center text-white/40 font-mono font-bold">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={tableSelectClass}
                      value={row.year}
                      onChange={(event) => setFitmentField(index, "year", event.target.value)}
                    >
                      <option value="">Year</option>
                      {options.years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={tableSelectClass}
                      value={row.make}
                      onChange={(event) => setFitmentField(index, "make", event.target.value)}
                      disabled={!row.year}
                    >
                      <option value="">Make</option>
                      {options.makes.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={tableSelectClass}
                      value={row.model}
                      onChange={(event) => setFitmentField(index, "model", event.target.value)}
                      disabled={!row.year || !row.make}
                    >
                      <option value="">Model</option>
                      {options.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={tableSelectClass}
                      value={row.variant}
                      onChange={(event) => setFitmentField(index, "variant", event.target.value)}
                      disabled={!row.year || !row.make || !row.model}
                    >
                      <option value="">Variant</option>
                      {options.variants.map((variant) => (
                        <option key={variant} value={variant}>
                          {variant}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={tableSelectClass}
                      value={row.engine}
                      onChange={(event) => setFitmentField(index, "engine", event.target.value)}
                      disabled={!row.year || !row.make || !row.model || options.engines.length === 0}
                    >
                      <option value="">Engine</option>
                      {options.engines.map((engine) => (
                        <option key={engine} value={engine}>
                          {engine}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className={tableSelectClass}
                      value={row.matchType}
                      onChange={(event) => setFitmentField(index, "matchType", event.target.value as any)}
                    >
                      <option value="fits">Fits</option>
                      <option value="verify">Verify</option>
                      <option value="no-fit">No fit</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      className={tableInputClass}
                      value={row.notes}
                      onChange={(event) => setFitmentField(index, "notes", event.target.value)}
                      placeholder="Optional notes"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      className="rounded bg-red-500/10 hover:bg-red-500/20 px-2 py-1 text-[10px] font-black uppercase text-red-400 transition"
                      onClick={() => removeFitmentRow(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/75 border-t border-white/10 pt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded bg-black/20 border-white/20 text-fatman-accent focus:ring-fatman-accent"
            checked={editorState.replaceFitment}
            onChange={(event) =>
              setEditor((current) => ({
                ...current,
                replaceFitment: event.target.checked,
              }))
            }
          />
          Replace existing database fitment configurations with table rows above when saving
        </label>
      </div>
    </div>
  );
}
