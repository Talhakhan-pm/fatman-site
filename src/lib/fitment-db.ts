import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase";
import { charmFitmentCatalog } from "@/lib/fitment-catalog";
import type { FitmentState, Vehicle } from "@/lib/fitment";

type FitmentRuleRow = {
  match_type: FitmentState;
  variant: string | null;
  products: { slug: string } | { slug: string }[] | null;
};

function normalizeForDb(vehicle?: Vehicle | null): Vehicle | null {
  if (!vehicle?.year || !vehicle.make || !vehicle.model || !vehicle.engine) return null;
  const variants = charmFitmentCatalog.getVariants(vehicle.year, vehicle.make, vehicle.model);
  const variant = vehicle.variant || charmFitmentCatalog.getDefaultVariant(variants);
  return {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    variant,
    engine: vehicle.engine,
  };
}

function rowSlug(row: FitmentRuleRow): string | null {
  if (!row.products) return null;
  if (Array.isArray(row.products)) return row.products[0]?.slug ?? null;
  return row.products.slug;
}

function pickVerdict(rows: FitmentRuleRow[], normalizedVariant: string | undefined): FitmentState | null {
  // Prefer an exact-variant match; fall through to NULL-variant ("any variant") rules.
  const exact = rows.find((row) => row.variant && row.variant === normalizedVariant);
  if (exact) return exact.match_type;
  const wildcard = rows.find((row) => !row.variant);
  if (wildcard) return wildcard.match_type;
  return rows[0]?.match_type ?? null;
}

export async function getFitmentVerdictFromDb(
  productSlug: string,
  vehicle?: Vehicle | null,
): Promise<FitmentState | null> {
  const normalized = normalizeForDb(vehicle);
  if (!normalized) return null;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("fitment_rules")
      .select("match_type, variant, products!inner(slug)")
      .eq("products.slug", productSlug)
      .eq("year", normalized.year)
      .eq("make", normalized.make)
      .eq("model", normalized.model)
      .eq("engine", normalized.engine);

    if (error || !data) return null;

    const rows = data as FitmentRuleRow[];
    if (!rows.length) return null;
    return pickVerdict(rows, normalized.variant);
  } catch {
    return null;
  }
}

export async function getFitmentVerdictsFromDb(
  productSlugs: string[],
  vehicle?: Vehicle | null,
): Promise<Record<string, FitmentState> | null> {
  if (!productSlugs.length) return {};
  const normalized = normalizeForDb(vehicle);
  if (!normalized) return null;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("fitment_rules")
      .select("match_type, variant, products!inner(slug)")
      .in("products.slug", productSlugs)
      .eq("year", normalized.year)
      .eq("make", normalized.make)
      .eq("model", normalized.model)
      .eq("engine", normalized.engine);

    if (error || !data) return null;

    const grouped = new Map<string, FitmentRuleRow[]>();
    for (const row of data as FitmentRuleRow[]) {
      const slug = rowSlug(row);
      if (!slug) continue;
      const list = grouped.get(slug) ?? [];
      list.push(row);
      grouped.set(slug, list);
    }

    const out: Record<string, FitmentState> = {};
    for (const [slug, rows] of grouped) {
      const verdict = pickVerdict(rows, normalized.variant);
      if (verdict) out[slug] = verdict;
    }
    return out;
  } catch {
    return null;
  }
}
