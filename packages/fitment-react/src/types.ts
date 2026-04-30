export interface Vehicle {
  year: string;
  make: string;
  model: string;
  variant?: string;
  engine: string;
}

export type PartialVehicle = Partial<Vehicle>;

export type VehicleField = "year" | "make" | "model" | "variant" | "engine";

export interface VehicleSelection {
  year: string;
  make: string;
  model: string;
  variant: string;
  engine: string;
}

/**
 * Tree-shaped catalog input. Charm.li exports collapse into this shape, but
 * any vendor with year → make → model → variant → engine can provide it.
 *
 * Composite-key maps use a configurable separator (default `|||`) so the
 * same flat lookup can hold different join arities at each level.
 */
export interface FitmentCatalogTreeData {
  years: string[];
  modelsByYearMake: Record<string, Record<string, string[]>>;
  variantsByYearMakeModel: Record<string, Record<string, string[]>>;
  enginesByYearMakeModelVariant: Record<string, Record<string, string[]>>;
}

export interface FitmentCatalogConfig {
  /** Separator used inside composite keys for variants/engines. Defaults to `|||`. */
  keySeparator?: string;
  /** Synthetic variant value used when a model has no real trims. Defaults to `Base`. */
  defaultVariant?: string;
  /** Optional metadata surfaced via `catalog.metadata`. Useful for source labels. */
  metadata?: FitmentCatalogMetadata;
}

export interface FitmentCatalogMetadata {
  source?: string;
  generatedAt?: string;
  [key: string]: unknown;
}

/** Read-only catalog facade that the selector + hooks consume. */
export interface FitmentCatalog {
  readonly years: readonly string[];
  readonly defaultVariant: string;
  readonly metadata: FitmentCatalogMetadata;

  getMakes(year: string): string[];
  getModels(year: string, make: string): string[];
  getVariants(year: string, make: string, model: string): string[];
  getEngines(year: string, make: string, model: string, variant: string): string[];

  /** Returns the sole variant when there's exactly one, otherwise empty string. */
  getDefaultVariant(variants: string[]): string;

  /** Cheap diagnostic for "is this vehicle present in the tree?" */
  hasVehicle(vehicle: Vehicle): boolean;
}
