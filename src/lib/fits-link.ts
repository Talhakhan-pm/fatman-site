import type { Vehicle } from "@fatman/fitment-react";

/**
 * URL for the "all parts that fit this vehicle" page. Kept dependency-free so
 * client components can import it without pulling in the fitment catalog.
 */
export function buildFitsHref(vehicle: Vehicle): string {
  const params = new URLSearchParams();
  params.set("year", vehicle.year);
  params.set("make", vehicle.make);
  params.set("model", vehicle.model);
  if (vehicle.variant) params.set("variant", vehicle.variant);
  params.set("engine", vehicle.engine);
  return `/fits?${params.toString()}`;
}
