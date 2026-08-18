/**
 * Shared category taxonomy helpers.
 *
 * The live catalog stores products against granular CHARM-derived slugs
 * (e.g. "transmission-and-drivetrain-manual-transmission-transaxle-input-shaft-4th-gear")
 * while the storefront presents the 17 approved registry categories
 * (e.g. "transmission-drivetrain"). These helpers translate between the two
 * directions:
 *
 *   - `isCategoryOrDescendant` / `categoryTreePrefixes` walk *down* from a
 *     registry slug to every source prefix that belongs under it.
 *   - `resolveTopLevelCategorySlug` walks *up* from any granular slug to the
 *     registry slug it should be displayed under.
 *
 * Unmapped slugs are returned unchanged so nothing silently disappears from
 * the storefront when the source data grows a branch we have not mapped yet.
 */
import { catalogRegistry } from "@/lib/catalog-registry";

export const CATEGORY_DESCENDANT_PREFIXES: Record<string, string[]> = {
  "transmission-drivetrain": ["transmission-and-drivetrain"],
  "engine-cooling-exhaust": ["engine-cooling-and-exhaust"],
  "steering-suspension": ["steering-and-suspension"],
  "brakes-traction-control": ["brakes-and-traction-control"],
  "starting-charging": ["starting-and-charging"],
  "sensors-switches": ["sensors-and-switches"],
  // Restraints (airbags, clocksprings, impact + seat-belt sensors) are folded in
  // here for now. To promote them to their own storefront category later: remove
  // "restraints-and-safety-systems" from this list, add a registry entry, and
  // insert a matching `categories` row in Supabase.
  "body-frame": ["body-and-frame", "restraints-and-safety-systems"],
  "heating-air-conditioning": ["heating-and-air-conditioning"],
  "instrument-panel-gauges": ["instrument-panel-gauges-and-warning-indicators"],
  "wiper-washer": ["wiper-and-washer-systems"],
  "lighting-horns": ["lighting-and-horns"],
  "windows-glass": ["windows-and-glass"],
  "relays-modules": ["relays-and-modules"],
  "accessories-optional-equipment": ["accessories-and-optional-equipment"],
};

export const categoryTreePrefixes = (slug: string) => [
  slug,
  ...(CATEGORY_DESCENDANT_PREFIXES[slug] ?? []),
];

export const isCategoryOrDescendant = (categorySlug: string, parentSlug: string) =>
  categoryTreePrefixes(parentSlug).some(
    (prefix) => categorySlug === prefix || categorySlug.startsWith(`${prefix}-`),
  );

/**
 * Every (source prefix -> registry slug) pair, longest prefix first so that
 * the most specific branch wins.
 */
const ROLLUP_PREFIXES: Array<[prefix: string, topLevelSlug: string]> = catalogRegistry
  .flatMap((entry) => categoryTreePrefixes(entry.slug).map((prefix): [string, string] => [prefix, entry.slug]))
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Map any catalog category slug up to the approved storefront category it
 * belongs to. Returns the input unchanged when no mapping applies.
 */
export function resolveTopLevelCategorySlug(slug: string): string {
  const normalized = slug.toLowerCase();
  const match = ROLLUP_PREFIXES.find(
    ([prefix]) => normalized === prefix || normalized.startsWith(`${prefix}-`),
  );
  return match ? match[1] : slug;
}
