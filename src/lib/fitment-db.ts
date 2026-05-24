import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getFitmentState as getLegacyFitmentState,
  getLiveFitmentModelCandidates,
  liveFitmentVariantMatches,
  normalizeVehicle,
  type FitmentState,
  type Vehicle,
} from "@/lib/fitment";

type ProductRow = {
  id: string;
  slug: string;
};

type FitmentRow = {
  product_id: string;
  variant: string | null;
  match_type: FitmentState;
};

const STATE_RANK: Record<FitmentState, number> = {
  fits: 3,
  "no-fit": 2,
  verify: 1,
};

function buildFallbackStates(productSlugs: string[], vehicle?: Vehicle | null) {
  return Object.fromEntries(
    productSlugs.map((slug) => [slug, getLegacyFitmentState(slug, vehicle)]),
  ) as Record<string, FitmentState>;
}

export async function getFitmentStatesFromDb(
  productSlugs: string[],
  vehicle?: Vehicle | null,
) {
  const uniqueSlugs = [...new Set(productSlugs.filter(Boolean))];
  const fallback = buildFallbackStates(uniqueSlugs, vehicle);
  const normalized = normalizeVehicle(vehicle);

  if (!uniqueSlugs.length) return fallback;
  if (!normalized) return fallback;

  try {
    const supabase = createSupabaseServerClient();
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select("id, slug")
      .in("slug", uniqueSlugs)
      .eq("published", true);

    if (productError || !productRows?.length) return fallback;

    const products = productRows as ProductRow[];
    const productIds = products.map((row) => row.id);

    const modelCandidates = getLiveFitmentModelCandidates(normalized);
    const { data: fitmentRows, error: fitmentError } = await supabase
      .from("fitment_rules")
      .select("product_id, variant, match_type")
      .in("product_id", productIds)
      .eq("year", normalized.year)
      .eq("make", normalized.make)
      .in("model", modelCandidates)
      .eq("engine", normalized.engine);

    if (fitmentError) return fallback;

    const grouped = new Map<string, FitmentRow[]>();
    for (const row of (fitmentRows ?? []) as FitmentRow[]) {
      const rows = grouped.get(row.product_id) ?? [];
      rows.push(row);
      grouped.set(row.product_id, rows);
    }

    const states = { ...fallback };

    for (const product of products) {
      const candidates = grouped.get(product.id) ?? [];
      let best:
        | { variantRank: number; stateRank: number; state: FitmentState }
        | null = null;

      for (const candidate of candidates) {
        const variantRank = !candidate.variant
          ? 1
          : liveFitmentVariantMatches(candidate.variant, normalized)
            ? 2
            : 0;

        if (!variantRank) continue;

        const stateRank = STATE_RANK[candidate.match_type] ?? 0;
        if (
          !best ||
          variantRank > best.variantRank ||
          (variantRank === best.variantRank && stateRank > best.stateRank)
        ) {
          best = {
            variantRank,
            stateRank,
            state: candidate.match_type,
          };
        }
      }

      if (best) {
        states[product.slug] = best.state;
      }
    }

    return states;
  } catch {
    return fallback;
  }
}

export async function getFitmentStateFromDb(
  productSlug: string,
  vehicle?: Vehicle | null,
) {
  const states = await getFitmentStatesFromDb([productSlug], vehicle);
  return states[productSlug] ?? getLegacyFitmentState(productSlug, vehicle);
}

export async function getFitmentVerdictsFromDb(
  productSlugs: string[],
  vehicle?: Vehicle | null,
) {
  return getFitmentStatesFromDb(productSlugs, vehicle);
}

export async function getFitmentVerdictFromDb(
  productSlug: string,
  vehicle?: Vehicle | null,
) {
  return getFitmentStateFromDb(productSlug, vehicle);
}
