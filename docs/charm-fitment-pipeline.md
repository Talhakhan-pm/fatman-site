# Charm fitment pipeline

Script: `scripts/charm-fitment-firecrawl.mjs`

## Purpose

Scrapes year and vehicle fitment listings from https://charm.li/ with Firecrawl, then normalizes them into:

- row-oriented JSON for downstream transforms
- a nested fitment tree for homepage lookup work
- CSV for spreadsheet or import workflows
- a summary file with coverage and failures

## Run

```bash
npm run fitment:charm -- --year-start 2010 --year-end 2013
```

Useful flags:

- `--makes all` or `--make Ford`
- `--year-start 2010`
- `--year-end 2013`
- `--cache-dir tmp/charm-fitment-cache`
- `--out-dir data/charm-fitment`
- `--force`

## Outputs

Default output directory: `data/charm-fitment/`

- `charm-fitment-rows.json`
- `charm-fitment-tree.json`
- `charm-fitment.csv`
- `charm-fitment-summary.json`

Raw markdown cache stays in `tmp/charm-fitment-cache/` by make/year.

## Notes

Charm labels are inconsistent across years. The script keeps both normalized fields and the original `rawDescriptor` plus `lineage` so future fitment integration can tighten matching without re-scraping.

## Relationship to live fitment

This pipeline produces structured fitment source data, but it is not the same thing as the final live storefront truth by itself.

Current reality:
- generated/source fitment still exists in the repo for fallback behavior
- live product/catalog work is moving toward Supabase-backed truth
- fitment is the next cleanup target, because some fitment verdict paths still mix DB-backed and legacy/generated logic

Practical rule:
- use this pipeline to improve source fitment quality
- use Supabase-backed fitment flows to improve live storefront behavior
- avoid assuming generated fitment output automatically equals final production truth everywhere
