import type { FitmentState } from "@/lib/fitment";

const variants: Record<FitmentState, string> = {
  fits: "fitment-badge--fits",
  verify: "fitment-badge--verify",
  "no-fit": "fitment-badge--no-fit",
};

const labels: Record<FitmentState, string> = {
  fits: "Fits your vehicle",
  verify: "Verify with VIN",
  "no-fit": "Doesn't fit",
};

export function FitmentBadge({ state }: { state: FitmentState }) {
  return <span className={`fitment-badge ${variants[state]}`}>{labels[state]}</span>;
}
