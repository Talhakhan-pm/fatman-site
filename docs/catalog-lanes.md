# Fatman catalog lanes

Keep this lightweight. One flow, clear lanes, no stepping on each other.

## Source of truth

Fatman now has **two different truths for two different jobs**:

### Live storefront truth
1. Supabase `products`
2. Supabase `categories`
3. Supabase `fitment_rules`

This is what production storefront behavior should follow.

### Baseline/source-data truth
1. `../fatman-data/products.csv`
2. `../fatman-data/fitment.csv`
3. `src/lib/catalog-registry.json` = canonical category metadata for site UI
4. `npm run sync:data` = supported step that turns CSV data into `src/lib/generated-data.ts`

This baseline/source-data layer still matters for development fallback, seeding, and bulk source maintenance.

## Safe flow

### For live product/admin changes
1. Use `/admin/catalog`
2. Save to Supabase
3. Verify on `/product/[slug]` and `/category/[slug]`
4. Run `npm run build` before merging code changes tied to the flow

### For baseline/source-data changes
1. Edit catalog rows in `fatman-data`
2. Run `npm run sync:data`
3. Run `npm run catalog:doctor`
4. Run `npm run build`
5. Only then hand off for review

## Lane rules

### 1) Normalization lane
- Allowed: names, descriptions, category assignment, SKU cleanup, fitment cleanup
- Primary files: `fatman-data/*.csv`
- May also include: cleanup planning for existing Supabase live rows when fixing live catalog quality
- Not allowed: touching generated site data manually

### 2) Assets lane
- Allowed: create/replace real product images under `public/fatman-assets/...`
- Also allowed: upload live product images through admin to Supabase Storage when the goal is live catalog improvement
- If working from baseline source data, also update matching image references in `fatman-data/products.csv`
- Not allowed: changing category slugs or product text unless explicitly bundled with integration

### 3) Integration lane
- Allowed: `npm run sync:data`, UI wiring, Supabase/storefront integration, registry-driven category presentation, build fixes
- Files: `fatman-site/src/**`, `fatman-site/scripts/**`
- Not allowed: editing `generated-data.ts` by hand

### 4) Review lane
- Run checks, inspect category coverage, spot regressions, verify images exist
- Required commands:
  - `npm run catalog:doctor`
  - `npm run build`

## Important rule

Do not confuse **live storefront state** with **baseline source-data state**.

- Admin saves affect live Supabase-backed storefront behavior.
- CSV sync affects baseline/generated fallback data.
- If the two diverge, treat that as a conscious transition state, not an invisible assumption.

## What the doctor protects against

- missing required categories, especially `engines`, `brakes`, `oem-parts`, `suspension`
- real image counts dropping below the committed baseline
- placeholder image URLs coming back
- invalid image URLs
- missing local image files for `/fatman-assets/...`
- hardcoded category links in key UI files instead of registry-driven links

## Baseline maintenance

When a category intentionally gains or loses products/images and the new state is correct:

1. confirm the change is intentional
2. run `npm run catalog:doctor`
3. run `npm run catalog:baseline`
4. commit the updated baseline together with the catalog change

Do **not** refresh the baseline just to silence a bad regression.
