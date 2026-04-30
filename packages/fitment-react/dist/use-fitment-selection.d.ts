import type { FitmentCatalog, PartialVehicle, Vehicle, VehicleField, VehicleSelection } from "./types";
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
/**
 * Headless state machine for the selector. Owns cascading clears and the
 * single-option auto-fill, but renders nothing — bring your own UI.
 */
export declare function useFitmentSelection({ catalog, initialVehicle, autoSelectSingleOption, onSelectionChange, }: UseFitmentSelectionParams): UseFitmentSelectionResult;
//# sourceMappingURL=use-fitment-selection.d.ts.map