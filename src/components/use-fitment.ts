"use client";

import { useEffect, useMemo, useState } from "react";
import type { FitmentState, Vehicle } from "@/lib/fitment-lite";

/**
 * Fit verdicts come from the server (/api/fitment/check*), which resolves
 * against the live fitment_rules table. Until the response lands the verdict
 * is "verify" — the safe default. The in-browser fallback that scanned the
 * bundled generated rules is gone; it forced ~1.2 MB of data into every page
 * and disagreed with the database anyway.
 */
function vehicleKey(vehicle?: Vehicle | null): string {
  if (!vehicle) return "";
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.variant ?? "", vehicle.engine].join("|");
}

export function useFitment(
  productSlug: string,
  vehicle?: Vehicle | null,
  resolvedVerdict?: FitmentState,
): FitmentState {
  const initialVerdict = resolvedVerdict ?? "verify";
  const key = `${productSlug}|${vehicleKey(vehicle)}|${resolvedVerdict ?? ""}`;

  // Keyed state: when the inputs change, the stored verdict belongs to the
  // previous product/vehicle and is discarded during render instead of in an
  // effect (the React "adjust state when props change" pattern).
  const [entry, setEntry] = useState({ key, verdict: initialVerdict });
  if (entry.key !== key) setEntry({ key, verdict: initialVerdict });

  useEffect(() => {
    if (resolvedVerdict || !vehicle) return;

    let ignore = false;
    fetch("/api/fitment/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productSlug, vehicle }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { fitment?: FitmentState } | null) => {
        if (ignore || !payload?.fitment) return;
        setEntry({ key, verdict: payload.fitment });
      })
      .catch(() => {
        // keep the pending verdict on error
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return entry.key === key ? entry.verdict : initialVerdict;
}

export function useFitmentBatch(
  productSlugs: string[],
  vehicle?: Vehicle | null,
): Record<string, FitmentState> {
  const key = `${productSlugs.join(",")}|${vehicleKey(vehicle)}`;

  const [entry, setEntry] = useState<{ key: string; verdicts: Record<string, FitmentState> }>({
    key,
    verdicts: {},
  });
  if (entry.key !== key) setEntry({ key, verdicts: {} });

  useEffect(() => {
    if (!vehicle || !productSlugs.length) return;

    let ignore = false;
    fetch("/api/fitment/check-batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productSlugs, vehicle }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { fitments?: Record<string, FitmentState> } | null) => {
        if (ignore || !payload?.fitments) return;
        setEntry({ key, verdicts: payload.fitments });
      })
      .catch(() => {
        // keep the pending verdicts on error
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Every requested slug gets a verdict ("verify" until the batch lands), so
  // consumers passing map entries as resolved verdicts never hand ProductCard
  // an undefined state — which would trigger a per-card fallback fetch.
  return useMemo(() => {
    const resolved = entry.key === key ? entry.verdicts : {};
    const out: Record<string, FitmentState> = {};
    for (const slug of productSlugs) out[slug] = resolved[slug] ?? "verify";
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, key]);
}
