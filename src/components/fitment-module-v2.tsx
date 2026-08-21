"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FitmentSelector,
  type FitmentSelectorClassNames,
  type Vehicle,
} from "@fatman/fitment-react";
import { useGarage } from "@/components/garage-provider";
import { track } from "@/lib/analytics";
import { charmFitmentCatalog } from "@/lib/fitment-catalog";
import { buildFitsHref } from "@/lib/fits-link";
import { matchVinToCatalog, type DecodedVin } from "@/lib/vin-catalog-match";

const SELECTOR_CLASSES: FitmentSelectorClassNames = {
  root: "p-6 sm:p-8 space-y-5",
  header: "flex items-center justify-between",
  headerTitle: "text-sm font-black uppercase tracking-[0.2em] text-[#ff6a00]",
  headerSource: "text-[10px] font-mono text-white/30 uppercase",
  fields: "space-y-3",
  searchButton: "w-full font-black uppercase tracking-wider text-sm py-4 transition-all duration-200",
  searchButtonReady:
    "bg-[#ff6a00] hover:bg-[#e55d00] text-white hover:shadow-[0_4px_20px_rgba(255,106,0,0.3)] cursor-pointer",
  searchButtonIdle: "bg-white/[0.06] text-white/25 cursor-not-allowed",
  divider: "flex items-center gap-3",
  dividerLine: "flex-1 h-px bg-white/[0.08]",
  dividerLabel: "text-[10px] font-mono text-white/30 uppercase tracking-wider",
  vinSection: "space-y-2",
  vinRow: "flex gap-2",
  vinInput:
    "flex-1 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff6a00]/40 px-4 py-3 text-white text-sm font-mono outline-none transition-colors placeholder:text-white/25",
  vinSubmit:
    "bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-bold px-5 py-3 text-sm transition-colors uppercase tracking-wider cursor-pointer",
  vinError: "text-xs font-mono text-red-400/90",
  confirmation:
    "flex items-center gap-2 text-xs font-mono text-emerald-400/80 bg-emerald-400/[0.06] border border-emerald-400/10 px-3 py-2",
  dropdown: {
    root: "flex items-center gap-3",
    label: "w-16 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase shrink-0",
    triggerWrapper: "relative flex-1",
    trigger:
      "w-full text-left bg-white/[0.04] border px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between",
    triggerEnabled: "border-white/[0.08] hover:border-[#ff6a00]/30 text-white cursor-pointer",
    triggerDisabled: "border-white/[0.04] text-white/20 cursor-not-allowed",
    triggerOpen: "border-[#ff6a00]/50 text-white",
    triggerValue: "text-white",
    triggerPlaceholder: "text-white/30",
    caret: "text-xs transition-transform duration-200 text-white/20",
    caretOpen: "rotate-180",
    caretDisabled: "text-white/10",
    menu: "absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-[#1a1d24] border border-white/[0.12] shadow-2xl shadow-black/50",
    option: "w-full text-left px-4 py-2.5 text-sm transition-colors text-white/70 hover:bg-white/[0.06] hover:text-white",
    optionActive: "bg-[#ff6a00]/20 text-[#ff6a00] font-bold",
  },
};

const vehicleKey = (v: Vehicle) =>
  [v.year, v.make, v.model, v.variant ?? "", v.engine].join("|");

/**
 * Live confirmed-fit counts, cached per vehicle. FitmentSelector's
 * partCountResolver is synchronous, so the first call for a vehicle returns
 * null (rendered as a "checking" state) and kicks off the fetch; the state
 * update re-renders the selector with the real number.
 */
function useLivePartCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const pending = useRef<Set<string>>(new Set());

  return useCallback(
    (v: Vehicle): number | null => {
      if (!v.year || !v.make || !v.model || !v.engine) return null;
      const key = vehicleKey(v);
      const cached = counts[key];
      if (cached != null) return cached;

      if (!pending.current.has(key)) {
        pending.current.add(key);
        // Deferred: the resolver runs during render, so the fetch (and its
        // eventual setState) must start outside of it.
        setTimeout(() => {
          fetch("/api/discovery/vehicle-part-count", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ vehicle: v }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((payload: { fits?: number | null } | null) => {
              if (typeof payload?.fits === "number") {
                setCounts((prev) => ({ ...prev, [key]: payload.fits as number }));
              }
            })
            .catch(() => {})
            .finally(() => pending.current.delete(key));
        }, 0);
      }
      return null;
    },
    [counts],
  );
}

async function decodeVinToVehicle(vin: string): Promise<Vehicle | null> {
  try {
    const res = await fetch("/api/fitment/vin/decode", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vin }),
    });
    if (!res.ok) return null;
    const decoded = (await res.json()) as DecodedVin & { valid?: boolean };
    if (!decoded.valid) return null;
    return matchVinToCatalog(decoded, charmFitmentCatalog);
  } catch {
    return null;
  }
}

export function FitmentModuleV2() {
  const { vehicle, setVehicle } = useGarage();
  const resolvePartCount = useLivePartCounts();

  const labels = useMemo(
    () => ({
      source: "",
      vinDecodeError:
        "Couldn't match this VIN to our catalog — pick your vehicle manually below.",
      searchReady: (_v: Vehicle, partCount: number | null) =>
        `🔍 SEARCH ${partCount ?? "VERIFIED"} VERIFIED PARTS`,
      searchIdle: "🔍 SELECT VEHICLE TO SEARCH",
      confirmation: (v: Vehicle, partCount: number | null) => {
        const label = [
          v.year,
          v.make,
          v.model,
          v.variant && v.variant !== "Base" ? v.variant : "",
          v.engine,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {partCount == null ? (
              <>Checking live catalog for {label}…</>
            ) : (
              <>
                {partCount} parts verified for {label}
                {partCount > 0 ? (
                  <Link
                    href={buildFitsHref(v)}
                    className="ml-auto shrink-0 font-bold text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                  >
                    See all →
                  </Link>
                ) : null}
              </>
            )}
          </>
        );
      },
    }),
    [],
  );

  return (
    <FitmentSelector
      catalog={charmFitmentCatalog}
      initialVehicle={vehicle ?? null}
      classNames={SELECTOR_CLASSES}
      labels={labels}
      partCountResolver={resolvePartCount}
      onConfirm={(confirmed, source) => {
        setVehicle(confirmed);
        track(source === "vin" ? "vin_decoded" : "fitment_confirmed", { ...confirmed });
      }}
      onVinSubmit={decodeVinToVehicle}
      renderHeader={() => (
        <div className={SELECTOR_CLASSES.header}>
          <h2 className={SELECTOR_CLASSES.headerTitle}>▶ FITMENT LOOKUP</h2>
        </div>
      )}
    />
  );
}
