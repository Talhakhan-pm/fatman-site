"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FitmentCatalog, Vehicle } from "@fatman/fitment-react";

/**
 * A FitmentCatalog backed by /api/fitment/options instead of the bundled
 * 5.6 MB CHARM tree.
 *
 * The year list loads on mount (~1 KB); each year's options (1–55 KB) load
 * the first time the catalog is asked about that year. The catalog interface
 * is synchronous, so a cache miss returns [] and schedules the fetch — the
 * state update re-renders the selector with the options filled in.
 */

const SEP = "|||";
const DEFAULT_VARIANT = "Base";

type YearSlice = {
  models: Record<string, string[]>;
  variants: Record<string, string[]>;
  engines: Record<string, string[]>;
};

const cleanList = (values: readonly string[] | undefined): string[] =>
  (values ?? []).filter((v): v is string => typeof v === "string" && v.length > 0);

const cleanEngineList = (values: readonly string[] | undefined): string[] =>
  cleanList(values).filter((value) => value.trim().toLowerCase() !== "unknown");

const dedupeSorted = (values: readonly string[]): string[] =>
  Array.from(new Set(cleanList(values))).sort((a, b) => a.localeCompare(b));

function buildCatalog(years: string[], slices: Record<string, YearSlice>): FitmentCatalog & {
  requestYear?: (year: string) => void;
} {
  const catalog = {
    years,
    defaultVariant: DEFAULT_VARIANT,
    metadata: { source: "Charm" },
    requestYear: undefined as ((year: string) => void) | undefined,

    getMakes(year: string): string[] {
      if (!year) return [];
      const slice = slices[year];
      if (!slice) {
        catalog.requestYear?.(year);
        return [];
      }
      return dedupeSorted(Object.keys(slice.models));
    },
    getModels(year: string, make: string): string[] {
      if (!year || !make) return [];
      const slice = slices[year];
      if (!slice) {
        catalog.requestYear?.(year);
        return [];
      }
      return cleanList(slice.models[make]);
    },
    getVariants(year: string, make: string, model: string): string[] {
      if (!year || !make || !model) return [];
      return cleanList(slices[year]?.variants[[make, model].join(SEP)]);
    },
    getEngines(year: string, make: string, model: string, variant: string): string[] {
      if (!year || !make || !model) return [];
      const lookupVariant = variant || DEFAULT_VARIANT;
      return cleanEngineList(slices[year]?.engines[[make, model, lookupVariant].join(SEP)]);
    },
    getDefaultVariant(variants: string[]): string {
      if (variants.length !== 1) return "";
      return variants[0] ?? "";
    },
    hasVehicle(vehicle: Vehicle): boolean {
      if (!vehicle.year || !vehicle.make || !vehicle.model || !vehicle.engine) return false;
      const engines = catalog.getEngines(
        vehicle.year,
        vehicle.make,
        vehicle.model,
        vehicle.variant || DEFAULT_VARIANT,
      );
      return engines.includes(vehicle.engine);
    },
  };
  return catalog;
}

export function useLazyFitmentCatalog() {
  const [years, setYears] = useState<string[] | null>(null);
  const [slices, setSlices] = useState<Record<string, YearSlice>>({});
  // Synchronous mirrors for code that can't wait for a re-render (VIN match).
  const slicesRef = useRef<Record<string, YearSlice>>({});
  const yearsRef = useRef<string[]>([]);
  const pending = useRef<Map<string, Promise<YearSlice | null>>>(new Map());

  useEffect(() => {
    let ignore = false;
    fetch("/api/fitment/options")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { years?: string[] } | null) => {
        if (ignore) return;
        const list = payload?.years ?? [];
        yearsRef.current = list;
        setYears(list);
      })
      .catch(() => {
        if (!ignore) setYears([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const loadYear = useCallback((year: string): Promise<YearSlice | null> => {
    if (!year) return Promise.resolve(null);
    const cached = slicesRef.current[year];
    if (cached) return Promise.resolve(cached);

    const inFlight = pending.current.get(year);
    if (inFlight) return inFlight;

    const request = fetch(`/api/fitment/options?year=${encodeURIComponent(year)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((slice: YearSlice | null) => {
        if (slice) {
          slicesRef.current = { ...slicesRef.current, [year]: slice };
          setSlices(slicesRef.current);
        }
        return slice;
      })
      .catch(() => null)
      .finally(() => {
        pending.current.delete(year);
      });

    pending.current.set(year, request);
    return request;
  }, []);

  const catalog = useMemo(() => {
    const built = buildCatalog(years ?? [], slices);
    // Deferred: catalog getters run during render; the fetch (and its
    // setState) must start outside of it.
    built.requestYear = (year: string) => {
      setTimeout(() => void loadYear(year), 0);
    };
    return built as FitmentCatalog;
  }, [years, slices, loadYear]);

  /**
   * Synchronous snapshot for after an awaited loadYear — the state-backed
   * catalog may not have re-rendered yet, but the ref mirror is current.
   */
  const getSnapshot = useCallback(
    (): FitmentCatalog => buildCatalog(yearsRef.current, slicesRef.current) as FitmentCatalog,
    [],
  );

  return { catalog, ready: years !== null, loadYear, getSnapshot };
}
