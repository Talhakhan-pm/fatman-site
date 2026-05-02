import type {
  FitmentCatalog,
  FitmentCatalogConfig,
  FitmentCatalogMetadata,
  FitmentCatalogTreeData,
  Vehicle,
} from "./types";

const DEFAULT_KEY_SEPARATOR = "|||";
const DEFAULT_VARIANT_LABEL = "Base";

const cleanList = (values: readonly string[] | undefined): string[] =>
  (values ?? []).filter((v): v is string => typeof v === "string" && v.length > 0);

const cleanEngineList = (values: readonly string[] | undefined): string[] =>
  cleanList(values).filter((value) => value.trim().toLowerCase() !== "unknown");

const dedupeSorted = (values: readonly string[]): string[] =>
  Array.from(new Set(cleanList(values))).sort((a, b) => a.localeCompare(b));

/**
 * Builds a read-only catalog from a flat tree-shaped input. The tree is
 * normalized once up-front so downstream lookups are constant-time.
 *
 * The config lets you override the composite-key separator and the synthetic
 * "no-variant" placeholder so this works with non-Charm vendors too.
 */
export function createFitmentCatalog(
  data: FitmentCatalogTreeData,
  config: FitmentCatalogConfig = {},
): FitmentCatalog {
  const keySeparator = config.keySeparator ?? DEFAULT_KEY_SEPARATOR;
  const defaultVariant = config.defaultVariant ?? DEFAULT_VARIANT_LABEL;
  const metadata: FitmentCatalogMetadata = config.metadata ?? {};

  const years = cleanList(data.years);

  const makesByYear: Record<string, string[]> = {};
  for (const [year, makesMap] of Object.entries(data.modelsByYearMake ?? {})) {
    makesByYear[year] = dedupeSorted(Object.keys(makesMap ?? {}));
  }

  const buildKey = (...parts: string[]): string => parts.join(keySeparator);

  const getMakes = (year: string): string[] => {
    if (!year) return [];
    return cleanList(makesByYear[year]);
  };

  const getModels = (year: string, make: string): string[] => {
    if (!year || !make) return [];
    const yearBucket = data.modelsByYearMake?.[year];
    return cleanList(yearBucket?.[make]);
  };

  const getVariants = (year: string, make: string, model: string): string[] => {
    if (!year || !make || !model) return [];
    const yearBucket = data.variantsByYearMakeModel?.[year];
    if (!yearBucket) return [];
    return cleanList(yearBucket[buildKey(make, model)]);
  };

  const getEngines = (
    year: string,
    make: string,
    model: string,
    variant: string,
  ): string[] => {
    if (!year || !make || !model) return [];
    const yearBucket = data.enginesByYearMakeModelVariant?.[year];
    if (!yearBucket) return [];
    const lookupVariant = variant || defaultVariant;
    return cleanEngineList(yearBucket[buildKey(make, model, lookupVariant)]);
  };

  const getDefaultVariant = (variants: string[]): string => {
    if (variants.length !== 1) return "";
    return variants[0] ?? "";
  };

  const hasVehicle = (vehicle: Vehicle): boolean => {
    if (!vehicle.year || !vehicle.make || !vehicle.model || !vehicle.engine) return false;
    const variant = vehicle.variant || defaultVariant;
    const engines = getEngines(vehicle.year, vehicle.make, vehicle.model, variant);
    return engines.includes(vehicle.engine);
  };

  return Object.freeze({
    years,
    defaultVariant,
    metadata,
    getMakes,
    getModels,
    getVariants,
    getEngines,
    getDefaultVariant,
    hasVehicle,
  });
}
