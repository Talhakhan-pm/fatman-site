# Fatman Parts — OpenClaw Handoff

This file is the shared working memory for any OpenClaw instance touching Fatman Parts.

If you are a new agent on this project, read this file first.

---

## 1) Canonical repo

- Repo path on Khan's Mac: `/Users/macbook/Projects/fatman-site`
- Related source-data repo: `/Users/macbook/Projects/fatman-data`

If working from another machine or VPS:
- pull latest Git state first
- do not assume access to Khan's local filesystem beyond the repo you cloned
- make sure `.env.local` exists before claiming build/runtime confidence

---

## 2) Read these files before coding

1. `docs/OPENCLAW-HANDOFF.md`
2. `README.md`
3. `Claude/Claude.md`
4. `docs/phase-2-garage-aware-discovery.md`

---

## 3) Current phase

**Phase 2: garage-aware discovery**

This project is no longer in pure Phase 1 plumbing cleanup.
Phase 1 got the catalog/admin/storefront infrastructure into a workable live state.
Phase 2 has started and already shipped its first slice.

---

## 4) What is already shipped

### Phase 1, effectively completed foundation
- live admin auth/session works
- admin save/load/upload works on Vercel
- storefront reads live Supabase products correctly
- production is less split-brain than before
- admin image uploads go to Supabase Storage
- production admin no longer needs repeated manual developer-tools header pasting

### Phase 2, shipped slices already live in repo
- server-side compatible-product retrieval layer:
  - `src/lib/discovery-db.ts`
- API route:
  - `/api/discovery/compatible-products`
- PDP compatible-products module:
  - `src/components/product/compatible-products.tsx`
- wired into:
  - `src/components/product/product-page-client.tsx`
- current behavior:
  - if no vehicle is selected, compatible-products section hides entirely
  - no generic fallback recommendations
  - same-category compatible products can surface on PDPs

### UI polish already shipped for that slice
- fitment badge contrast fixed for light mode
- stock badge contrast improved too
- garage labels shortened in header / sticky fitment bar
- awkward PDP related-products layout tightened
- placeholder media states made more intentional
- placeholder eyebrow text like `BLAH BLAH` no longer blindly leaks through on PDP

### New slices now implemented
- the most obvious fitment/discovery catalog-presence gate has been removed from:
  - `src/lib/discovery-db.ts`
  - `src/lib/fitment-db.ts`
- category pages now use fitment-aware relevance ordering when a vehicle is selected:
  - `fits` first
  - `verify` second
  - `no-fit` last
- category UI now communicates that it is showing best matches for the selected vehicle
- homepage now has a **Compatible Products for Your Vehicle** module driven by the same discovery flow
- homepage now also has a **Categories that fit your vehicle** module driven by per-category discovery aggregation
- homepage behavior stays honest:
  - confirmed fits show as product cards
  - compatible categories are ranked by confirmed-fit counts
  - no-fit-data cases show empty-state messaging instead of fake fallback matches

---

## 5) Important current caveat

**Do not assume all live DB fitment rows already flow cleanly through discovery.**

Original issue:
- some vehicle + category combinations existed in live `fitment_rules`
- but did not surface through the new discovery flow as expected
- reason: parts of the fitment/discovery path still relied on catalog-aware / legacy assumptions

Current state:
- the most obvious choke point has now been fixed
- at least one previously failing live DB-compatible case now returns correctly through `/api/discovery/compatible-products`
- homepage compatible-products behavior is now data-honest, which means some vehicles will still show empty states when live fitment rows are missing for that exact case
- however, fitment still has hybrid fallback behavior in some verdict paths

So the caveat is smaller now, but not fully gone.

---

## 6) Exact next recommended task

### Next implementation slice
**Fitment/discovery truth cleanup**

That means:
1. audit remaining legacy fallback and verdict paths in fitment/discovery
2. make live DB-backed truth flow more consistently through check/check-batch/discovery behavior
3. identify known vehicle cases where rows exist but UI/API outcomes still feel misleading
4. only after that, decide whether homepage should expose an explicit lower-confidence `verify` fallback state

### Why this is next
- PDP compatible discovery is already shipped
- category browsing is now fitment-aware
- homepage now has both compatible products and compatible categories
- the largest remaining product risk is inconsistent truth flow, not missing top-level homepage UI

---

## 7) Known-good test case for PDP compatible discovery

Use this exact vehicle:
- **Year:** `1983`
- **Make:** `Chevrolet`
- **Model:** `C 10 1/2 Ton`
- **Variant:** `Pickup 2WD`
- **Engine:** `L6-250 4.1L VIN D 2-bbl`

Known-good PDP test route:
- `http://localhost:3000/product/front-test-kit`

Expected result after selecting the vehicle:
- PDP shows **Also fits your vehicle**
- returned compatible product includes:
  - `test-product-2`
- current product should be excluded from the compatible-products section

Negative test:
- with no vehicle selected, the compatible-products section should be hidden entirely

---

## 8) Operational rules for any OpenClaw touching this repo

### Before starting work
1. `git pull`
2. read the required docs listed above
3. ensure env exists
4. run:
   - `npm install` if needed
   - `npm run build`
5. restate:
   - current phase
   - what is already shipped
   - current caveat
   - exact next recommended task

### After finishing work
1. update code
2. update this handoff file if phase/state/next-task changed
3. update `README.md` and `Claude/Claude.md` if project status meaningfully changed
4. run `npm run build`
5. commit
6. push

---

## 9) Branch / concurrency rule

Do **not** let multiple OpenClaw instances code on the same branch at the same time unless Khan explicitly wants that mess.

Safe default:
- one active implementation agent at a time on the main branch

If parallelizing:
- one branch per agent
- merge only after review

---

## 10) Required completion format

Every OpenClaw finishing a Fatman task should report back in this format:

1. what changed
2. files changed
3. how it was tested
4. any caveats
5. commit hash

---

## 11) Recent important commits

- `76d37b3` `Add garage-aware compatible product discovery`
- `6d9ceb3` `Polish garage-aware PDP discovery UI`
- `7b14e67` `Refresh Fatman phase docs`
- `9f431a4` `Add fitment-aware category ordering`
- `052be55` `Add homepage compatible products`
- latest: `904f67c` `Add homepage compatible categories`

Update this list when a new slice materially changes project state.
