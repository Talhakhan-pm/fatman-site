/**
 * Type-only fitment exports. Client components should import these instead of
 * "@/lib/fitment", which pulls the CHARM vehicle tree and generated rules into
 * the bundle at module scope.
 */
export type { Vehicle } from "@fatman/fitment-react";

export type FitmentState = "fits" | "verify" | "no-fit";
