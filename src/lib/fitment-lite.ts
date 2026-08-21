import { formatVehicleLabel, type Vehicle } from "@fatman/fitment-react";

/**
 * Pure fitment helpers with no data dependencies. Client components import
 * from here; "@/lib/fitment" pulls the 5.6 MB CHARM vehicle tree and the
 * generated rules at module scope and is for server code only.
 */

export type { Vehicle };
export type { FitmentState } from "@/lib/fitment-types";
export { formatVehicleLabel };

export function formatCompactVehicleLabel(vehicle?: Vehicle | null) {
  if (!vehicle) return "";

  return [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
}
