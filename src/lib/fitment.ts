export type { Vehicle } from "@fatman/fitment-react";
import { formatVehicleLabel, type Vehicle } from "@fatman/fitment-react";
import { generatedFitmentRules } from "@/lib/generated-data";
import { charmFitmentCatalog } from "@/lib/fitment-catalog";

export type FitmentState = "fits" | "verify" | "no-fit";

export type ProductFitmentVehicle = Vehicle & {
  variant?: string;
};

export type ProductFitmentRule = {
  productSlug: string;
  matchType: FitmentState;
  vehicles: ProductFitmentVehicle[];
};

export const fitmentRules: ProductFitmentRule[] =
  generatedFitmentRules as unknown as ProductFitmentRule[];

export { formatVehicleLabel };

function normalizeVehicle(vehicle?: Vehicle | null): Vehicle | null {
  if (!vehicle?.year || !vehicle.make || !vehicle.model || !vehicle.engine) return null;

  const variants = charmFitmentCatalog.getVariants(vehicle.year, vehicle.make, vehicle.model);
  const variant = vehicle.variant || charmFitmentCatalog.getDefaultVariant(variants);

  return {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    variant,
    engine: vehicle.engine,
  };
}

export function isVehicleInCatalog(vehicle?: Vehicle | null): boolean {
  const normalized = normalizeVehicle(vehicle);
  if (!normalized) return false;
  return charmFitmentCatalog.hasVehicle(normalized);
}

export function getFitmentState(productSlug: string, vehicle?: Vehicle | null): FitmentState {
  const normalized = normalizeVehicle(vehicle);
  if (!normalized) return "verify";
  if (!charmFitmentCatalog.hasVehicle(normalized)) return "verify";

  const candidates = fitmentRules.filter((rule) => rule.productSlug === productSlug);
  for (const rule of candidates) {
    const matched = rule.vehicles.some((candidate) => {
      const variantMatches =
        !candidate.variant ||
        !normalized.variant ||
        candidate.variant === normalized.variant;

      return (
        candidate.year === normalized.year &&
        candidate.make === normalized.make &&
        candidate.model === normalized.model &&
        candidate.engine === normalized.engine &&
        variantMatches
      );
    });

    if (matched) return rule.matchType;
  }

  return "verify";
}
