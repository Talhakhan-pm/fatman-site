const DEFAULT_KEY_SEPARATOR = "|||";
const DEFAULT_VARIANT_LABEL = "Base";
const cleanList = (values) => (values ?? []).filter((v) => typeof v === "string" && v.length > 0);
const cleanEngineList = (values) => cleanList(values).filter((value) => value.trim().toLowerCase() !== "unknown");
const dedupeSorted = (values) => Array.from(new Set(cleanList(values))).sort((a, b) => a.localeCompare(b));
/**
 * Builds a read-only catalog from a flat tree-shaped input. The tree is
 * normalized once up-front so downstream lookups are constant-time.
 *
 * The config lets you override the composite-key separator and the synthetic
 * "no-variant" placeholder so this works with non-Charm vendors too.
 */
export function createFitmentCatalog(data, config = {}) {
    const keySeparator = config.keySeparator ?? DEFAULT_KEY_SEPARATOR;
    const defaultVariant = config.defaultVariant ?? DEFAULT_VARIANT_LABEL;
    const metadata = config.metadata ?? {};
    const years = cleanList(data.years);
    const makesByYear = {};
    for (const [year, makesMap] of Object.entries(data.modelsByYearMake ?? {})) {
        makesByYear[year] = dedupeSorted(Object.keys(makesMap ?? {}));
    }
    const buildKey = (...parts) => parts.join(keySeparator);
    const getMakes = (year) => {
        if (!year)
            return [];
        return cleanList(makesByYear[year]);
    };
    const getModels = (year, make) => {
        if (!year || !make)
            return [];
        const yearBucket = data.modelsByYearMake?.[year];
        return cleanList(yearBucket?.[make]);
    };
    const getVariants = (year, make, model) => {
        if (!year || !make || !model)
            return [];
        const yearBucket = data.variantsByYearMakeModel?.[year];
        if (!yearBucket)
            return [];
        return cleanList(yearBucket[buildKey(make, model)]);
    };
    const getEngines = (year, make, model, variant) => {
        if (!year || !make || !model)
            return [];
        const yearBucket = data.enginesByYearMakeModelVariant?.[year];
        if (!yearBucket)
            return [];
        const lookupVariant = variant || defaultVariant;
        return cleanEngineList(yearBucket[buildKey(make, model, lookupVariant)]);
    };
    const getDefaultVariant = (variants) => {
        if (variants.length !== 1)
            return "";
        return variants[0] ?? "";
    };
    const hasVehicle = (vehicle) => {
        if (!vehicle.year || !vehicle.make || !vehicle.model || !vehicle.engine)
            return false;
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
//# sourceMappingURL=catalog.js.map