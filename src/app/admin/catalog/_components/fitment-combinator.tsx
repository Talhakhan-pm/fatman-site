import { useState, useMemo } from "react";
import type { useCatalogEditor } from "./use-catalog-editor";
import { buttonClass, ghostButtonClass, inputClass, labelClass } from "./ui";
import { generateFitmentMatrix } from "./helpers";
import { charmFitmentCatalog } from "@/lib/fitment-catalog";

function MultiSelectPill({
  label,
  options,
  selected,
  onChange,
  disabled
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((x) => x !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  if (options.length === 0 && selected.length === 0) {
    return (
      <div className={disabled ? "opacity-50" : ""}>
        <label className={labelClass}>{label}</label>
        <p className="text-xs text-white/40 mt-1 italic">No options available yet</p>
      </div>
    );
  }

  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <div className="flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        {options.length > 1 && (
          <button
            type="button"
            className="text-[10px] text-white/40 hover:text-white/80"
            onClick={() => onChange(selected.length === options.length ? [] : [...options])}
          >
            {selected.length === options.length ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-2 
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-track]:bg-black/20 
        [&::-webkit-scrollbar-thumb]:bg-white/10 
        hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                isSelected
                  ? "bg-fatman-accent text-white border-fatman-accent font-semibold"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FitmentCombinator({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [years, setYears] = useState<string[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  const [matchType, setMatchType] = useState<"fits" | "verify" | "no-fit">("fits");
  const [notes, setNotes] = useState("");

  const availableYears = charmFitmentCatalog.years;

  const availableMakes = useMemo(() => {
    if (years.length === 0) return [];
    const set = new Set<string>();
    for (const y of years) {
      for (const m of charmFitmentCatalog.getMakes(y)) set.add(m);
    }
    return Array.from(set).sort();
  }, [years]);

  const availableModels = useMemo(() => {
    if (makes.length === 0) return [];
    const set = new Set<string>();
    for (const y of years) {
      for (const m of makes) {
        for (const mo of charmFitmentCatalog.getModels(y, m)) set.add(mo);
      }
    }
    return Array.from(set).sort();
  }, [years, makes]);

  const availableVariants = useMemo(() => {
    if (models.length === 0) return [];
    const set = new Set<string>();
    for (const y of years) {
      for (const m of makes) {
        for (const mo of models) {
          const vList = charmFitmentCatalog.getVariants(y, m, mo);
          if (vList.length === 0) set.add("All Trims");
          for (const v of vList) set.add(v || "All Trims");
        }
      }
    }
    return Array.from(set).sort();
  }, [years, makes, models]);

  const availableEngines = useMemo(() => {
    if (models.length === 0) return []; // Don't strictly require variants to allow basic engines
    const set = new Set<string>();
    for (const y of years) {
      for (const m of makes) {
        for (const mo of models) {
          const vList = variants.length > 0 ? variants : ["", charmFitmentCatalog.defaultVariant];
          for (const rawV of vList) {
            const v = rawV === "All Trims" ? "" : rawV;
            for (const e of charmFitmentCatalog.getEngines(y, m, mo, v)) set.add(e);
          }
        }
      }
    }
    return Array.from(set).sort();
  }, [years, makes, models, variants]);

  const generatedCount = Math.max(1, years.length) * 
                         Math.max(1, makes.length) * 
                         Math.max(1, models.length) * 
                         Math.max(1, variants.length) * 
                         Math.max(1, engines.length);

  const canGenerate = years.length > 0 && makes.length > 0 && models.length > 0;

  function handleGenerate() {
    if (!canGenerate) return;
    const newRows = generateFitmentMatrix(years, makes, models, variants, engines, matchType, notes);
    editor.addBulkFitment(newRows);
    
    // Reset state
    setIsOpen(false);
    setYears([]);
    setMakes([]);
    setModels([]);
    setVariants([]);
    setEngines([]);
    setNotes("");
  }

  if (!isOpen) {
    return (
      <div className="rounded-xl border border-fatman-accent/30 bg-fatman-accent/5 p-5 mb-6 flex flex-wrap items-center justify-between gap-4 transition-all">
        <div>
          <h3 className="text-lg font-bold text-fatman-accent-hover">Bulk Matrix Generator</h3>
          <p className="mt-1 text-sm text-white/60 max-w-xl">
            Tired of adding 50 individual fitment rows? Open the Matrix Generator to multi-select years, makes, and models to instantly add dozens of rows at once.
          </p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-fatman-accent px-4 py-2 text-sm font-bold text-white hover:bg-fatman-accent-hover shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-all"
        >
          Open Generator
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-fatman-accent/40 bg-black/30 p-5 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fatman-accent/0 via-fatman-accent to-fatman-accent/0 opacity-50"></div>
      
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Bulk Matrix Generator</h3>
          <p className="mt-1 text-sm text-white/60">
            Multi-select your options. We will automatically generate every possible combination.
          </p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-xs text-white/40 hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MultiSelectPill label="Years" options={availableYears} selected={years} onChange={(val) => { setYears(val); setMakes([]); setModels([]); setVariants([]); setEngines([]); }} />
        <MultiSelectPill label="Makes" options={availableMakes} selected={makes} onChange={(val) => { setMakes(val); setModels([]); setVariants([]); setEngines([]); }} disabled={years.length === 0} />
        <MultiSelectPill label="Models" options={availableModels} selected={models} onChange={(val) => { setModels(val); setVariants([]); setEngines([]); }} disabled={makes.length === 0} />
        <MultiSelectPill label="Variants / Trims" options={availableVariants} selected={variants} onChange={(val) => { setVariants(val); setEngines([]); }} disabled={models.length === 0} />
        <MultiSelectPill label="Engines" options={availableEngines} selected={engines} onChange={setEngines} disabled={models.length === 0} />
        
        <div className="space-y-4 pt-2">
          <div>
            <label className={labelClass}>Match Type</label>
            <select
              className={`${inputClass} mt-1`}
              value={matchType}
              onChange={(event) => setMatchType(event.target.value as any)}
            >
              <option value="fits">Fits (Confirmed)</option>
              <option value="verify">Verify</option>
              <option value="no-fit">No fit</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <input
              className={`${inputClass} mt-1`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Applied to all generated rows"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div className="text-sm">
          {canGenerate ? (
            <span>This will generate <strong className="text-fatman-accent text-lg">{generatedCount}</strong> individual row{generatedCount !== 1 ? 's' : ''}.</span>
          ) : (
            <span className="text-white/40">Select at least one Year, Make, and Model.</span>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsOpen(false)} className={ghostButtonClass}>
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`${buttonClass} ${canGenerate ? 'shadow-[0_0_15px_rgba(255,107,0,0.3)]' : ''}`}
          >
            Generate {canGenerate ? generatedCount : ''} Rows
          </button>
        </div>
      </div>
    </div>
  );
}
