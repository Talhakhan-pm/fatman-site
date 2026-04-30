import { useCallback, useEffect, useMemo, useRef, useState } from "react";
const EMPTY_SELECTION = {
    year: "",
    make: "",
    model: "",
    variant: "",
    engine: "",
};
const FIELD_ORDER = ["year", "make", "model", "variant", "engine"];
const fromPartial = (vehicle) => ({
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
export function useFitmentSelection({ catalog, initialVehicle, autoSelectSingleOption = true, onSelectionChange, }) {
    const [selection, setSelection] = useState(() => fromPartial(initialVehicle));
    // Keep the latest onSelectionChange in a ref so we can invoke it from effects
    // without re-subscribing every render or creating stale-closure bugs.
    const onChangeRef = useRef(onSelectionChange);
    useEffect(() => {
        onChangeRef.current = onSelectionChange;
    }, [onSelectionChange]);
    const emit = useCallback((next) => {
        onChangeRef.current?.(next);
    }, []);
    const update = useCallback((next) => {
        setSelection((prev) => {
            const same = FIELD_ORDER.every((field) => prev[field] === next[field]);
            if (same)
                return prev;
            emit(next);
            return next;
        });
    }, [emit]);
    const setField = useCallback((field, value) => {
        setSelection((prev) => {
            if (prev[field] === value)
                return prev;
            // Cascading clears: any field downstream of the one being set resets.
            const cleared = { ...prev, [field]: value };
            const idx = FIELD_ORDER.indexOf(field);
            for (let i = idx + 1; i < FIELD_ORDER.length; i += 1) {
                const downstream = FIELD_ORDER[i];
                if (downstream)
                    cleared[downstream] = "";
            }
            emit(cleared);
            return cleared;
        });
    }, [emit]);
    const setYear = useCallback((v) => setField("year", v), [setField]);
    const setMake = useCallback((v) => setField("make", v), [setField]);
    const setModel = useCallback((v) => setField("model", v), [setField]);
    const setVariant = useCallback((v) => setField("variant", v), [setField]);
    const setEngine = useCallback((v) => setField("engine", v), [setField]);
    const applyVehicle = useCallback((vehicle) => {
        update(fromPartial(vehicle));
    }, [update]);
    const reset = useCallback(() => {
        update({ ...EMPTY_SELECTION });
    }, [update]);
    const options = useMemo(() => {
        const makes = catalog.getMakes(selection.year);
        const models = catalog.getModels(selection.year, selection.make);
        const variants = catalog.getVariants(selection.year, selection.make, selection.model);
        const engines = catalog.getEngines(selection.year, selection.make, selection.model, selection.variant);
        return { years: catalog.years, makes, models, variants, engines };
    }, [catalog, selection.year, selection.make, selection.model, selection.variant]);
    // Auto-select when exactly one option exists at a level. Runs after render
    // so the selection event still fires through the normal setField path.
    useEffect(() => {
        if (!autoSelectSingleOption)
            return;
        if (selection.variant)
            return;
        if (options.variants.length === 1) {
            const only = options.variants[0];
            if (only)
                setField("variant", only);
        }
    }, [autoSelectSingleOption, selection.variant, options.variants, setField]);
    useEffect(() => {
        if (!autoSelectSingleOption)
            return;
        if (selection.engine)
            return;
        if (options.engines.length === 1) {
            const only = options.engines[0];
            if (only)
                setField("engine", only);
        }
    }, [autoSelectSingleOption, selection.engine, options.engines, setField]);
    const isComplete = Boolean(selection.year && selection.make && selection.model && selection.variant && selection.engine);
    const asVehicle = useCallback(() => {
        if (!isComplete)
            return null;
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
//# sourceMappingURL=use-fitment-selection.js.map