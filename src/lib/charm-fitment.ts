import charmFitmentTree from "../../data/charm-fitment/charm-fitment-tree.json";

const KEY_SEPARATOR = "|||";
const DEFAULT_VARIANT = "Base";

type CharmFitmentTreeData = {
  years: string[];
  modelsByYearMake: Record<string, Record<string, string[]>>;
  variantsByYearMakeModel: Record<string, Record<string, string[]>>;
  enginesByYearMakeModelVariant: Record<string, Record<string, string[]>>;
};

const source = charmFitmentTree as CharmFitmentTreeData;

const cleanList = (values: string[] = []) => values.filter(Boolean);
const buildCompositeKey = (...parts: string[]) => parts.join(KEY_SEPARATOR);

const makesByYear = Object.fromEntries(
  Object.entries(source.modelsByYearMake).map(([year, makes]) => [year, cleanList(Object.keys(makes)).sort()]),
) as Record<string, string[]>;

export const charmVehicleOptions = {
  years: cleanList(source.years),
  makesByYear,
  modelsByYearMake: source.modelsByYearMake,
  variantsByYearMakeModel: source.variantsByYearMakeModel,
  enginesByYearMakeModelVariant: source.enginesByYearMakeModelVariant,
};

export function getCharmMakes(year: string) {
  return cleanList(charmVehicleOptions.makesByYear[year] ?? []);
}

export function getCharmModels(year: string, make: string) {
  return cleanList(charmVehicleOptions.modelsByYearMake[year]?.[make] ?? []);
}

export function getCharmVariants(year: string, make: string, model: string) {
  const key = buildCompositeKey(make, model);
  return cleanList(charmVehicleOptions.variantsByYearMakeModel[year]?.[key] ?? []);
}

export function getCharmEngines(year: string, make: string, model: string, variant: string) {
  const key = buildCompositeKey(make, model, variant || DEFAULT_VARIANT);
  return cleanList(charmVehicleOptions.enginesByYearMakeModelVariant[year]?.[key] ?? []);
}

export function getDefaultCharmVariant(variants: string[]) {
  if (variants.length !== 1) return "";
  return variants[0] ?? "";
}

export const charmFitmentMetadata = {
  source: "Charm",
  defaultVariant: DEFAULT_VARIANT,
};
