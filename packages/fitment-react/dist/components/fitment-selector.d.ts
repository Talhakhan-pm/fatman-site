import { type ReactNode } from "react";
import type { FitmentCatalog, PartialVehicle, Vehicle, VehicleSelection } from "../types";
import { type FitmentDropdownClassNames } from "./fitment-dropdown";
export type FitmentConfirmSource = "manual" | "vin";
export interface FitmentSelectorLabels {
    year?: string;
    make?: string;
    model?: string;
    variant?: string;
    engine?: string;
    yearPlaceholder?: string;
    makePlaceholder?: string;
    modelPlaceholder?: string;
    variantPlaceholder?: string;
    enginePlaceholder?: string;
    searchIdle?: string;
    searchReady?: (vehicle: Vehicle, partCount: number | null) => string;
    vinDivider?: string;
    vinPlaceholder?: string;
    vinGo?: string;
    vinEmptyError?: string;
    vinInvalidError?: string;
    vinDecodeError?: string;
    confirmation?: (vehicle: Vehicle, partCount: number | null) => ReactNode;
    source?: ReactNode;
}
export interface FitmentSelectorClassNames {
    root?: string;
    header?: string;
    headerTitle?: string;
    headerSource?: string;
    fields?: string;
    searchButton?: string;
    searchButtonReady?: string;
    searchButtonIdle?: string;
    divider?: string;
    dividerLine?: string;
    dividerLabel?: string;
    vinSection?: string;
    vinRow?: string;
    vinInput?: string;
    vinSubmit?: string;
    vinError?: string;
    confirmation?: string;
    dropdown?: FitmentDropdownClassNames;
}
export interface FitmentSelectorRenderContext {
    selection: VehicleSelection;
    isComplete: boolean;
    vehicle: Vehicle | null;
    partCount: number | null;
    reset: () => void;
}
export interface FitmentSelectorProps {
    catalog: FitmentCatalog;
    initialVehicle?: PartialVehicle | null;
    /** Auto-fill variant/engine when only one option exists. Default `true`. */
    autoSelectSingleOption?: boolean;
    labels?: FitmentSelectorLabels;
    classNames?: FitmentSelectorClassNames;
    /** Hide the year/make/.../engine dropdowns header strip. */
    showHeader?: boolean;
    /** Hide the VIN section entirely. */
    showVinSection?: boolean;
    /** Optional consumer-provided count to display in the CTA + confirmation. */
    partCountResolver?: (vehicle: Vehicle) => number | null;
    /** Fires for any selection mutation (after cascading clears). */
    onSelectionChange?: (selection: VehicleSelection) => void;
    /** Fires when the user clicks the search CTA with a complete vehicle. */
    onConfirm: (vehicle: Vehicle, source: FitmentConfirmSource) => void;
    /**
     * Called when the user submits a VIN. Return a Vehicle (or Promise) to
     * decode + apply, or null to short-circuit. If omitted, the VIN section
     * is rendered but the GO button does nothing useful — pass
     * `showVinSection={false}` to hide it instead.
     */
    onVinSubmit?: (vin: string) => Vehicle | null | Promise<Vehicle | null>;
    renderHeader?: (ctx: FitmentSelectorRenderContext) => ReactNode;
    renderFooter?: (ctx: FitmentSelectorRenderContext) => ReactNode;
}
export declare function FitmentSelector(props: FitmentSelectorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=fitment-selector.d.ts.map