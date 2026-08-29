# Image Diversity Plan — 2026-08-28

Direction approved by Khan (evening session): real CHARM factory diagrams become the
primary image where available, AI renders stay as fallback; raster tables are
acceptable content. Implementation NOT started — needs a git checkpoint first per
working rules. Visual proof-of-concept artifact (product→illustration demos, range
gallery, quality assessment): https://claude.ai/code/artifact/0198eb8a-ecc7-4891-a64a-7f238f871351

## What was verified (2026-08-28 audit + PoC)

- **The repetition is a pipeline design decision, not a CHARM artifact.** 101 files
  under `fatman-site/public/ai-product-images/white-bg/` serve ~59k products; the top
  image (`transmission-drivetrain-detailed-white.png`) fronts 8,612 products (14.6%).
  Assignment happens at export in `fatman-data/scripts/catalog_db/export_live_import_plan.py`
  — `CATALOG_IMAGE_ASSETS` (~109 entries), first-match substring scan in
  `choose_catalog_image()`. CHARM Parts Information pages contain zero `<img>` tags.
- **CHARM bundles DO ship real factory art the extractor ignores.** Mustang '94:
  1,427 PNGs; F-150 '94: 2,085. ~79% unique per vehicle (only 302/1,427 shared), ~2/3
  are true illustrations after filtering rasterized tables/pinouts, median width
  ~1072px, all 1-bit black-on-white line art. Join key that works with zero fuzzy
  matching: parts page component name (`crumbs[-2]`) matched against ANY crumb of
  Repair-and-Diagnosis pages **within the same vehicle bundle**. Illustrated leaf
  types: Locations, Service and Repair, Description and Operation, Diagrams.
- **Strict-match coverage is 23–35% of parts components** (mostly 1–2 images each).
  Relaxed-rule measurement (parent/grandparent breadcrumb fallback, tables counted)
  is in flight; decision gate below.
- **Retention reality (the constraint that shapes everything):** workers `rm -rf` a
  year's zips immediately after a successful parse (`fanout.py:122`). Surviving art
  today: Mac `fatman-data/output/offline-bundles-unzipped/Ford/{1982,1983,1984,1994}`,
  coordinator Ford 1995/96/97 zips (~18G) + the 1988 rescue, and whatever Chevrolet
  years are still un-parsed on workers. Every other year's art requires re-downloading
  from CHARM.
- ~5,200 products are held back entirely (with their fitment) for having no image
  match — see STATUS.md.
- Side bug, separate task chip: 170/529 Mustang '94 parts pages have malformed tables
  (bare `<td>` with no opening `<tr>`) that the production extractor parses to zero
  rows, silently. A visible $253.05 Alternator (`F4PZ10346BRM1`) never reached the
  catalog.

## Phases

**A. Preserve art going forward — REVISED 2026-08-28 (late) after sizing on real
modern bundles.** Original spec (raw per-vehicle `images/` trees, est. 30–40MB per
vehicle) was sized on 1994-era bundles and is NOT viable for modern years: Chevrolet
2009 measures ~122MB of images per vehicle (~9.2GB/year raw; the 7 remaining years
would eat 64 of the coordinator's 69GB free, and GMC/Dodge would need ~260GB each).
Revised design, proposed by the automation session and approved: a content-hash
image store, deduped worker-side BEFORE transfer —
`/opt/fatman/output/images/{make}/{year}/blobs/{sha256}.png` + `index.json`
(vehicle → page → crumbs → [hashes]). Measured dedupe on 2009's surviving 24
bundles: 76.8% (123,045 files → 30,191 unique; 2.30GB → 0.53GB) — treat as an
optimistic bound (alphabetical sample over-represents platform variants) and budget
~3GB/year. The index preserves the crumbs join key, so Phase C is unaffected; this
IS Phase C's dedupe, done earlier.

**DEPLOYED 2026-08-28 (late evening):** `harvest_bundle_images.py` +
`fanout.py` wiring + `deploy.sh` manifest entry live on coordinator and all 4
workers (md5-verified), mirrored byte-identically into fatman-autopilot and
committed as `da01c2f`, with the ordering invariant recorded in that repo's
CLAUDE.md. Measured on two real 2009 bundles: 6,554 blobs / 137MB / 0 failures /
0 of 12,556 indexed pages with empty breadcrumbs. Cost ~13s/bundle (~17 min per
77-bundle year). Fanout stays stopped until the parser fix also deploys.

Scope reality as of the patch: **2002–2005 completed and were cleaned during a
~45-minute fanout window on Aug 28 — their art needs a re-download to recover**
(backlog it with the Ford years; decide alongside the fleet-retention call, since
re-downloads need workers). 2009 partially survives (24 zips on worker-4) and gets
harvested at parse time once the patch is live. **2006, 2007, 2008, 2010, 2011,
2012, 2013 were never downloaded — fully preservable if the patch deploys before
the fanout restarts.** Applies to all future makes (GMC ~2,143 bundles, Dodge and
Ram ~2,055).

**B. Coverage measurement — DONE 2026-08-28, gate cleared.** Product-row-weighted
coverage on Mustang + F-150 '94 (scripts + raw JSON preserved in the session
scratchpad `coverage/`):

| Rule | Mustang rows | F-150 rows |
|---|---|---|
| R1 exact component match | 47.3% | 50.4% |
| R2 + parent-crumb fallback | 96.6% | 96.4% |
| R3 + grandparent | 100% | 100% (coarse — subsystem roots) |

Khan's ~70% bar is beaten at R2. Honest split: ~44–51% of products get
part-specific art (R1); the rest of R2's lift is subsystem-level art — still a
diversity win, because a covered component has a median of 10–19 candidate images
(p90 163–290) to hash-pick from, vs exactly one render today. Implementation rule:
R1 matches may become the card face; parent-level matches ship as PDP
gallery/diagram tier with component-honest captions; grandparent (R3) not used.
Bonus finding for the parser task: the zero-row pages' rows are fully recoverable
(source HTML drops the opening `<tr>` + name `<td>`; count `</tr>` and take the
name from `breadcrumbs[-2]`) — worth +33% rows on the Mustang (649→864), +14% on
the F-150 (1,080→1,232).

**C. Enrichment stage — build locally first.** Develop against the 4 local Ford
bundles, no pipeline risk: component→image join, content-hash dedupe, page-type
ranking (Locations / Service and Repair / Description and Operation first), cap 2–4
images per product. Host deduped images in Supabase Storage (`next.config.ts` already
allows `*.supabase.co`). Write `metadata.images` (jsonb already flows to the client —
no schema migration); optionally promote the best diagram to `image_url` per Phase B.
Publish via the existing image-expansion batch pattern; runs post-apply, never inside
the gate path; **images stay optional and never feed the hold-back gate**.

**D. Frontend.** Light image wells for diagram art on the dark cards (1-bit
black-on-white cannot sit on dark directly; inversion/tinting is lossless if
preferred). PDP gallery rail from `metadata.images`, replacing the fake
duplicate-thumbnail. Per-grid dedup: a given image renders at most twice per page,
repeats fall back to the styled spec-plate card. Deterministic per-SKU presentation
variation for shared renders. Route the header search dropdown through
`getProductDisplayMedia` (it currently renders raw `imageUrl` and can leak
placeholders).

**E. AI pool expansion for whatever diagrams don't cover.** Generate 4–6
style-consistent variants per representative term (same nano-banana setup as
`gen_images.py`), pick by `hash(part_number)` in `choose_catalog_image()`. Add
terms/assets for the exporter's `missing_image_category_counts` worklist to recover
the ~5,200 held-back products and their fitment — this directly raises Gate A image
coverage (currently 92–96% vs the 99% auto-gate floor).

## Invariants to respect (from CLAUDE.md + audit)

- Never change exporter/image logic mid-batch — `build_payload` runs in BOTH dryrun
  and apply; a mid-batch edit silently publishes something other than what was
  approved.
- `fatman-data` and `fatman-autopilot` copies stay byte-identical; deploy via
  `deploy.sh --check` / `--push` between batches only.
- New static assets deploy to fatman-site BEFORE any product referencing them
  publishes.
- Captions stay honest: "factory diagram — <component>", never presented as a photo
  of the exact SKU (standing category-reference policy, LESSONS.md).
- No fatman-site commits without Khan's explicit instruction.
