import type { Vehicle } from "./types";
/**
 * Renders a human-readable vehicle label, e.g. "2012 Ford F 150 4WD V8-6.2L".
 * Synthetic variants (the catalog's default-variant placeholder) are dropped.
 */
export declare function formatVehicleLabel(vehicle: Vehicle | null | undefined, options?: {
    syntheticVariants?: Iterable<string>;
}): string;
//# sourceMappingURL=format.d.ts.map