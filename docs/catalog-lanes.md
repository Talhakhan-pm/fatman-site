# Fatman catalog lanes

Keep this lightweight. One source flow, four lanes, no stepping on each other.

## Source of truth

1. `../fatman-data/products.csv` = canonical catalog rows
2. `../fatman-data/fitment.csv` = canonical fitment rows
3. `src/lib/catalog-registry.json` = canonical category metadata for site UI
4. `npm run sync:data` = only supported step that turns CSV data into `src/lib/generated-data.ts`

If you change catalog rows directly in the site, you are doing it wrong.

## Safe flow

1. Edit catalog rows in `fatman-data`
2. Run `npm run sync:data`
3. Run `npm run catalog:doctor`
4. Run `npm run build`
5. Only then hand off for review

## Lane rules

### 1) Normalization lane
- Allowed: names, descriptions, category assignment, SKU cleanup, fitment cleanup
- Files: `fatman-data/*.csv`
- Not allowed: touching site components, public assets, or generated site data manually

### 2) Assets lane
- Allowed: create/replace real product images under `public/fatman-assets/...`
- Must also update matching `image_url` values in `fatman-data/products.csv`
- Not allowed: changing category slugs or product text unless explicitly bundled with integration

### 3) Integration lane
- Allowed: `npm run sync:data`, UI wiring, registry-driven category presentation, build fixes
- Files: `fatman-site/src/**`, `fatman-site/scripts/**`
- Not allowed: editing `generated-data.ts` by hand

### 4) Review lane
- Run checks, inspect category coverage, spot regressions, verify images exist
- Required commands:
  - `npm run catalog:doctor`
  - `npm run build`

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
