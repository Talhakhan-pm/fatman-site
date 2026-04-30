import type { Vehicle } from "./types";

const SYNTHETIC_VARIANTS = new Set(["Base", "base", "BASE"]);

/**
 * Renders a human-readable vehicle label, e.g. "2012 Ford F 150 4WD V8-6.2L".
 * Synthetic variants (the catalog's default-variant placeholder) are dropped.
 */
export function formatVehicleLabel(
  vehicle: Vehicle | null | undefined,
  options: { syntheticVariants?: Iterable<string> } = {},
): string {
  if (!vehicle) return "";

  const synthetic = options.syntheticVariants
    ? new Set(options.syntheticVariants)
    : SYNTHETIC_VARIANTS;

  return [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.variant && !synthetic.has(vehicle.variant) ? vehicle.variant : "",
    vehicle.engine,
  ]
    .filter(Boolean)
    .join(" ");
}
