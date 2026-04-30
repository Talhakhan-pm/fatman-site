export type {
  FitmentCatalog,
  FitmentCatalogConfig,
  FitmentCatalogMetadata,
  FitmentCatalogTreeData,
  PartialVehicle,
  Vehicle,
  VehicleField,
  VehicleSelection,
} from "./types";

export { createFitmentCatalog } from "./catalog";
export { formatVehicleLabel } from "./format";
export { isValidVin, normalizeVin } from "./vin";

export {
  useFitmentSelection,
  type UseFitmentSelectionParams,
  type UseFitmentSelectionResult,
} from "./use-fitment-selection";

export {
  FitmentDropdown,
  type FitmentDropdownClassNames,
  type FitmentDropdownProps,
} from "./components/fitment-dropdown";

export {
  FitmentSelector,
  type FitmentConfirmSource,
  type FitmentSelectorClassNames,
  type FitmentSelectorLabels,
  type FitmentSelectorProps,
  type FitmentSelectorRenderContext,
} from "./components/fitment-selector";
