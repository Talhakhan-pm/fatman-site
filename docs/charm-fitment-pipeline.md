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

Charm labels are inconsistent across years. The script keeps both normalized fields and the original `rawDescriptor` plus `lineage` so future homepage integration can tighten matching without re-scraping.
