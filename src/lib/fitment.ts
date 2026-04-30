export type { Vehicle } from "@fatman/fitment-react";
import type { Vehicle } from "@fatman/fitment-react";
import { generatedFitmentRules, generatedVehicleOptions } from "@/lib/generated-data";

export type FitmentState = "fits" | "verify" | "no-fit";

export type ProductFitmentRule = {
  productSlug: string;
  matchType: FitmentState;
  vehicles: Vehicle[];
};

export const vehicleOptions = generatedVehicleOptions as unknown as {
  years: string[];
  makes: string[];
  modelsByMake: Record<string, string[]>;
  enginesByModel: Record<string, string[]>;
};

export const fitmentRules: ProductFitmentRule[] = generatedFitmentRules as unknown as ProductFitmentRule[];

export function formatVehicleLabel(vehicle?: Vehicle | null): string {
  if (!vehicle) return "";

  return [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.variant && vehicle.variant !== "Base" ? vehicle.variant : "",
    vehicle.engine,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFitmentState(productSlug: string, vehicle?: Vehicle | null): FitmentState {
  if (!vehicle) return "verify";

  const candidates = fitmentRules.filter((rule) => rule.productSlug === productSlug);
  for (const rule of candidates) {
    const matched = rule.vehicles.some(
      (v) =>
        v.year === vehicle.year &&
        v.make === vehicle.make &&
        v.model === vehicle.model &&
        v.engine === vehicle.engine,
    );
    if (matched) return rule.matchType;
  }

  return "verify";
}
