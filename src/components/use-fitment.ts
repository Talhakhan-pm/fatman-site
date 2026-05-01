"use client";

import { useEffect, useMemo, useState } from "react";
import { getFitmentState, type FitmentState, type Vehicle } from "@/lib/fitment";

function vehicleKey(vehicle?: Vehicle | null): string {
  if (!vehicle) return "";
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.variant ?? "", vehicle.engine].join("|");
}

export function useFitment(
  productSlug: string,
  vehicle?: Vehicle | null,
  resolvedVerdict?: FitmentState,
): FitmentState {
  const legacy = useMemo(() => getFitmentState(productSlug, vehicle), [productSlug, vehicle]);
  const initialVerdict = resolvedVerdict ?? legacy;
  const [verdict, setVerdict] = useState<FitmentState>(initialVerdict);

  useEffect(() => {
    setVerdict(initialVerdict);
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
        setVerdict(payload.fitment);
      })
      .catch(() => {
        // keep legacy verdict on error
      });

    return () => {
      ignore = true;
    };
  }, [productSlug, initialVerdict, resolvedVerdict, vehicle]);

  return verdict;
}

export function useFitmentBatch(
  productSlugs: string[],
  vehicle?: Vehicle | null,
): Record<string, FitmentState> {
  const slugKey = productSlugs.join(",");
  const vKey = vehicleKey(vehicle);

  const legacyMap = useMemo(() => {
    const out: Record<string, FitmentState> = {};
    for (const slug of productSlugs) out[slug] = getFitmentState(slug, vehicle);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugKey, vKey]);

  const [verdicts, setVerdicts] = useState<Record<string, FitmentState>>(legacyMap);

  useEffect(() => {
    setVerdicts(legacyMap);
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
        setVerdicts({ ...legacyMap, ...payload.fitments });
      })
      .catch(() => {
        // keep legacy verdicts on error
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugKey, vKey, legacyMap]);

  return verdicts;
}
