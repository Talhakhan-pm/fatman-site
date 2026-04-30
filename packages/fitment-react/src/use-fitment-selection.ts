import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FitmentCatalog,
  PartialVehicle,
  Vehicle,
  VehicleField,
  VehicleSelection,
} from "./types";

export interface UseFitmentSelectionParams {
  catalog: FitmentCatalog;
  initialVehicle?: PartialVehicle | null;
  /** When a step has exactly one option, auto-fill it. Defaults to `true`. */
  autoSelectSingleOption?: boolean;
  onSelectionChange?: (selection: VehicleSelection) => void;
}

export interface UseFitmentSelectionResult {
  selection: VehicleSelection;
  isComplete: boolean;
  options: {
    years: readonly string[];
    makes: string[];
    models: string[];
    variants: string[];
    engines: string[];
  };
  setField: (field: VehicleField, value: string) => void;
  setYear: (value: string) => void;
  setMake: (value: string) => void;
  setModel: (value: string) => void;
  setVariant: (value: string) => void;
  setEngine: (value: string) => void;
  applyVehicle: (vehicle: PartialVehicle | null) => void;
  reset: () => void;
  asVehicle: () => Vehicle | null;
}

const EMPTY_SELECTION: VehicleSelection = {
  year: "",
  make: "",
  model: "",
  variant: "",
  engine: "",
};

const FIELD_ORDER: VehicleField[] = ["year", "make", "model", "variant", "engine"];

const fromPartial = (vehicle: PartialVehicle | null | undefined): VehicleSelection => ({
  year: vehicle?.year ?? "",
  make: vehicle?.make ?? "",
  model: vehicle?.model ?? "",
  variant: vehicle?.variant ?? "",
  engine: vehicle?.engine ?? "",
});

/**
 * Headless state machine for the selector. Owns cascading clears and the
 * single-option auto-fill, but renders nothing — bring your own UI.
 */
export function useFitmentSelection({
  catalog,
  initialVehicle,
  autoSelectSingleOption = true,
  onSelectionChange,
}: UseFitmentSelectionParams): UseFitmentSelectionResult {
  const [selection, setSelection] = useState<VehicleSelection>(() => fromPartial(initialVehicle));

  // Keep the latest onSelectionChange in a ref so we can invoke it from effects
  // without re-subscribing every render or creating stale-closure bugs.
  const onChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  const emit = useCallback((next: VehicleSelection) => {
    onChangeRef.current?.(next);
  }, []);

  const update = useCallback(
    (next: VehicleSelection) => {
      setSelection((prev) => {
        const same = FIELD_ORDER.every((field) => prev[field] === next[field]);
        if (same) return prev;
        emit(next);
        return next;
      });
    },
    [emit],
  );

  const setField = useCallback(
    (field: VehicleField, value: string) => {
      setSelection((prev) => {
        if (prev[field] === value) return prev;

        // Cascading clears: any field downstream of the one being set resets.
        const cleared: VehicleSelection = { ...prev, [field]: value };
        const idx = FIELD_ORDER.indexOf(field);
        for (let i = idx + 1; i < FIELD_ORDER.length; i += 1) {
          const downstream = FIELD_ORDER[i];
          if (downstream) cleared[downstream] = "";
        }
        emit(cleared);
        return cleared;
      });
    },
    [emit],
  );

  const setYear = useCallback((v: string) => setField("year", v), [setField]);
  const setMake = useCallback((v: string) => setField("make", v), [setField]);
  const setModel = useCallback((v: string) => setField("model", v), [setField]);
  const setVariant = useCallback((v: string) => setField("variant", v), [setField]);
  const setEngine = useCallback((v: string) => setField("engine", v), [setField]);

  const applyVehicle = useCallback(
    (vehicle: PartialVehicle | null) => {
      update(fromPartial(vehicle));
    },
    [update],
  );

  const reset = useCallback(() => {
    update({ ...EMPTY_SELECTION });
  }, [update]);

  const options = useMemo(() => {
    const makes = catalog.getMakes(selection.year);
    const models = catalog.getModels(selection.year, selection.make);
    const variants = catalog.getVariants(selection.year, selection.make, selection.model);
    const engines = catalog.getEngines(
      selection.year,
      selection.make,
      selection.model,
      selection.variant,
    );
    return { years: catalog.years, makes, models, variants, engines };
  }, [catalog, selection.year, selection.make, selection.model, selection.variant]);

  // Auto-select when exactly one option exists at a level. Runs after render
  // so the selection event still fires through the normal setField path.
  useEffect(() => {
    if (!autoSelectSingleOption) return;
    if (selection.variant) return;
    if (options.variants.length === 1) {
      const only = options.variants[0];
      if (only) setField("variant", only);
    }
  }, [autoSelectSingleOption, selection.variant, options.variants, setField]);

  useEffect(() => {
    if (!autoSelectSingleOption) return;
    if (selection.engine) return;
    if (options.engines.length === 1) {
      const only = options.engines[0];
      if (only) setField("engine", only);
    }
  }, [autoSelectSingleOption, selection.engine, options.engines, setField]);

  const isComplete = Boolean(
    selection.year && selection.make && selection.model && selection.variant && selection.engine,
  );

  const asVehicle = useCallback((): Vehicle | null => {
    if (!isComplete) return null;
    return {
      year: selection.year,
      make: selection.make,
      model: selection.model,
      variant: selection.variant,
      engine: selection.engine,
    };
  }, [isComplete, selection]);

  return {
    selection,
    isComplete,
    options,
    setField,
    setYear,
    setMake,
    setModel,
    setVariant,
    setEngine,
    applyVehicle,
    reset,
    asVehicle,
  };
}
