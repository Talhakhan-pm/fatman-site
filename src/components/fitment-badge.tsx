import type { FitmentState } from "@/lib/fitment";

const styles: Record<FitmentState, string> = {
  fits: "bg-fatman-success/20 text-green-200 border-green-400/40",
  verify: "bg-fatman-warning/20 text-amber-200 border-amber-400/40",
  "no-fit": "bg-fatman-danger/20 text-red-200 border-red-400/40",
};

const labels: Record<FitmentState, string> = {
  fits: "Fits your vehicle",
  verify: "Verify with VIN",
  "no-fit": "Doesn't fit",
};

export function FitmentBadge({ state }: { state: FitmentState }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[state]}`}>
      {labels[state]}
    </span>
  );
}
