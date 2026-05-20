# Fatman Parts — Claude Context File

## 1) Business Intent
Fatman Parts is a U.S.-focused automotive parts brand built to capture additional search and catalog demand with:
- OEM-first trust positioning
- fast shipping / dispatch messaging
- fitment confidence as a conversion moat
- a bolder voice in marketing, but professional clarity on PDP / cart / checkout flows

Primary goals:
- grow total market share across branded + non-branded search
- reduce wrong-part returns with fitment controls
- build scalable catalog + fitment operations
- move toward a real commerce-ready catalog stack, not a static demo catalog

---

## 2) Current Project Location + Stack
Project path:
- `/Users/macbook/Projects/fatman-site`

Related source-data project:
- `/Users/macbook/Projects/fatman-data`

Stack:
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- Supabase

Workspace package:
- `packages/fitment-react`

Important scripts:
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run sync:data`
- `npm run catalog:doctor`
- `npm run catalog:baseline`
- `npm run fitment:charm`

---

## 3) Current Runtime Architecture
This project is now a hybrid system with three layers:

### A) Source-file fallback layer
Generated baseline catalog data still exists in:
- `src/lib/generated-data.ts`
- `src/lib/catalog.ts`
- `src/lib/fitment.ts`

This comes from CSV sync via:
- `scripts/sync-fatman-data.mjs`
- source CSVs in `../fatman-data`

### B) Supabase-backed live catalog layer
Storefront reads now go through:
- `src/lib/catalog-db.ts`

Current behavior:
- storefront tries to read published products + categories from Supabase first
- if Supabase is unavailable, it falls back to source-file catalog data

### C) Admin editing layer
Admin catalog editor lives at:
- `/admin/catalog`

Internal admin routes:
- `/api/admin/session`
- `/api/admin/catalog/list`
- `/api/admin/catalog/upsert`
- `/api/admin/catalog/upload-image`
- `/api/admin/catalog/seed`

Current behavior:
- admin writes go through the app server, not directly from browser to Supabase
- production admin access is unlocked by posting the write key or seed key once to `/api/admin/session`, which sets an HttpOnly cookie session for later admin requests
- successful admin saves write to Supabase
- storefront catalog reads now use server-side Supabase credentials and request-cached catalog reads, so product/category pages within one request see the same live snapshot
- in local development only, admin saves are also mirrored into a local fallback file:
  - `data/admin-catalog-local.json`
- this local fallback exists so staff work is not lost if Supabase is temporarily unavailable during local dev
- in production, local fallback is disabled, so failed saves stay failed instead of pretending to be live
- in production, storefront catalog reads no longer silently fall back to source-file catalog data when live Supabase catalog reads fail

Important: local fallback is a dev safety net, not the desired source of truth.

---

## 4) Current Source of Truth Rules
### What is live on storefront?
A product shows on storefront when:
- it is saved successfully to Supabase
- `published = true`
- the storefront read path is using Supabase successfully

### What is not truly live?
If an admin save returns local fallback only, then:
- this should only happen in local development
- the product may appear in admin flows
- but it is not guaranteed to appear on storefront
- it is not truly synced/live until it exists in Supabase

### Current intended direction
- **Supabase = canonical live catalog source**
- source-file generated catalog = fallback / baseline seed material
- local admin JSON store = local-dev emergency safety net only, never a production persistence layer

---

## 5) Admin Catalog UI (Current State)
Main file:
- `src/app/admin/catalog/page.tsx`

Recent state of the admin editor:
- rewritten into a staff-friendly form, not a raw JSON-first dev tool
- supports loading existing products, editing fields, and saving back through internal routes
- fitment rows now use dependent dropdowns:
  - Year -> Make -> Model -> Variant/Trim -> Engine
- fitment dropdowns are backed by `charmFitmentCatalog`
- parent changes clear child fields correctly
- single obvious next options auto-fill when possible
- internal `source` field is hidden from normal staff UI
- admin key, seed tools, and raw payload preview are hidden behind developer tools
- image upload is supported through `/api/admin/catalog/upload-image`
- admin product images now upload to Supabase Storage bucket:
  - `fatman-catalog/catalog/`

Important UX reality:
- the editor is much better now, but it still sits on top of a hybrid data architecture
- clear sync-state messaging is still worth improving later

---

## 6) Fitment System (Current)
Main files:
- `src/lib/fitment.ts`
- `src/lib/fitment-catalog.ts`
- `data/charm-fitment/charm-fitment-tree.json`
- `packages/fitment-react`

Fitment model:
- `fits`
- `verify`
- `no-fit`

Current vehicle structure includes:
- year
- make
- model
- variant / trim
- engine

Important behavior:
- storefront fitment logic normalizes vehicles through `charmFitmentCatalog`
- unknown / unusable engines are treated cautiously
- if vehicle is missing or not confidently matched, storefront tends to fall back to `verify`

Business rule:
Never overclaim fitment certainty.
If structured data is incomplete or uncertain, prefer `verify`.

---

## 7) Charm Fitment Pipeline
Pipeline docs:
- `docs/charm-fitment-pipeline.md`

Script:
- `scripts/charm-fitment-firecrawl.mjs`

Behavior:
- scrapes and normalizes Charm vehicle data
- writes final usable outputs into:
  - `data/charm-fitment/`
- uses raw markdown cache in:
  - `tmp/charm-fitment-cache/`

Important repo note:
- `tmp/` is scratch/cache data and should not be committed
- `.gitignore` now ignores `/tmp/`

---

## 8) Supabase Notes (Current)
Environment variables used by app:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FATMAN_ADMIN_WRITE_KEY`
- `FATMAN_ADMIN_SEED_KEY`

Recent reality:
- the Supabase project was temporarily paused
- once resumed, host connectivity returned
- admin writes were still failing because API timeout was too short
- admin catalog timeout was increased from `1200ms` to `6000ms`

Recent fixes verified:
- admin upsert can return `source: "supabase"`
- admin single-product load now prefers Supabase over local fallback when DB data exists
- storefront product/category reads can reflect newly saved published products from Supabase

---

## 9) Current Verified State
Verified in recent work:
- admin catalog saves can write successfully to Supabase
- published products can appear on storefront after admin save
- `L0231` was initially only local fallback, then was pushed into Supabase and became visible on storefront
- a fresh browser-created product was saved from the real admin UI and showed up on:
  - product page
  - engines category listing
- live admin auth/session works
- admin save/load/upload works on Vercel
- storefront reads live Supabase products correctly
- production is less split-brain than before
- Phase 2 garage-aware discovery is now underway, not just planned
- server-side compatible-product retrieval now exists in:
  - `src/lib/discovery-db.ts`
- PDPs can now show fitment-aware related products via:
  - `src/components/product/compatible-products.tsx`
  - `/api/discovery/compatible-products`
- current shipped behavior: if no vehicle is selected, the compatible-products module hides entirely instead of falling back to generic recommendations
- the discovery gate has been tightened so normalized live DB fitment can surface without requiring catalog-presence checks first
- category pages now sort by fitment relevance when a vehicle is selected (`fits` first, then `verify`, then `no-fit`)
- homepage now has a vehicle-aware **Compatible Products for Your Vehicle** module driven by the same discovery flow
- homepage now also has a vehicle-aware **Categories that fit your vehicle** module powered by per-category discovery aggregation
- current homepage behavior is intentionally honest: if the selected vehicle has no confirmed fit rows, it shows empty-state messaging instead of fake fallback matches

Important caveat:
- browser-created test product had `0 fitment rows` and still saved/published correctly as a product
- fitment completeness and live product presence are related, but not identical concerns
- some live DB fitment rows still do not surface through discovery as expected because there are still catalog-aware / legacy fitment gates in the path

---

## 10) Known Gaps / Current Risks
### A) Split truth still exists, but is smaller now
There is still a hybrid state between:
- Supabase live catalog
- generated source-file fallback catalog
- local admin fallback JSON

However, production storefront catalog reads are now stricter and no longer silently fall back to source-file catalog data when Supabase live reads fail. The remaining split-truth risk is mostly around development fallback behavior and any flows that still intentionally rely on generated source data.

### B) Fitment/discovery still has hybrid behavior
The most obvious catalog-presence choke point has now been removed from discovery + DB fitment lookups, which fixed at least one previously failing live DB-compatible case.

Remaining reality:
- fitment still has legacy fallback behavior in verdict paths
- homepage is now vehicle-aware for compatible products, but empty states still depend directly on live fitment data completeness
- further cleanup should keep pushing verdict and discovery behavior toward live DB-backed truth where appropriate

### C) Admin sync-state clarity
The admin UI still needs clearer messaging for:
- saved to Supabase / live
- saved locally only / not truly live

### D) Catalog quality remains a separate problem
Infrastructure is improving, but data quality still matters:
- believable titles
- useful descriptions
- real fitment rows
- real imagery
- sane SKU / OEM data

---

## 11) Recommended Next Work
Best next step from current state:

Continue **Phase 2**, but do it in the right order.

### What is already shipped in Phase 2
- compatible-product retrieval layer
- PDP **Also fits your vehicle** module
- first UI polish pass for the garage-aware PDP flow
- fitment/discovery gate loosened so normalized live DB fitment is trusted more directly in discovery + DB verdict lookups
- category-page fitment-aware ordering/filtering baseline
- homepage **Compatible Products for Your Vehicle** module baseline
- homepage **Categories that fit your vehicle** module baseline

### Best next target
**Fitment/discovery truth cleanup, then homepage `verify` strategy**

Review next:
- `src/lib/discovery-db.ts`
- `src/lib/fitment-db.ts`
- `src/app/api/fitment/check/route.ts`
- `src/app/api/fitment/check-batch/route.ts`

Why this should be next:
- homepage now has both core vehicle-aware modules
- the biggest remaining risk is inconsistent truth flow in verdict/discovery paths, not missing top-level UI

### Remaining Phase 2 direction
- fitment/discovery cleanup where legacy fallback still distorts truth
- possible stronger fitment-only browsing controls on category pages
- homepage decisions around `fits`-only vs explicit `verify` fallback states
- only after that, broaden into generic merchandising modules like featured/new

Current Phase 2 principle:
- prefer **garage-aware discovery** over generic related products first
- use selected vehicle state to surface compatible products, category paths, and later homepage modules
- preserve honest fitment separation (`fits`, `verify`, `no-fit`)
- see `docs/phase-2-garage-aware-discovery.md`

### Later, Phase 3
- conversion work
- stronger PDP trust/support flows
- VIN verification improvements
- analytics and funnel improvement

---

## 12) Useful Recent Commits
Recent relevant commits:
- `30f63d9` Fix catalog loader and local admin fallback
- `5cdfadb` Add dependent fitment dropdowns
- `f2d0e2e` Simplify admin catalog staff UI
- `0f791f1` Improve Supabase error diagnostics
- `2b146b7` Increase Supabase admin API timeout
- `ed50141` Prefer Supabase for admin catalog loads
- `89ef5b2` Ignore tmp fitment cache
- `76d37b3` Add garage-aware compatible product discovery
- `6d9ceb3` Polish garage-aware PDP discovery UI
- `9f431a4` Add fitment-aware category ordering
- `052be55` Add homepage compatible products
- latest: `904f67c` Add homepage compatible categories

---

## 13) Operational Commands
From `fatman-site/`:
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run sync:data`
- `npm run fitment:charm -- --year-start 2010 --year-end 2013`
- `npm run catalog:doctor`

Git hygiene:
- `tmp/` is ignored
- legacy local uploads under `public/fatman-uploads/` are ignored
- local admin fallback JSON is ignored

---

This file should give a coding assistant the real current picture: Fatman is no longer just a static mock-data site. It is now a partially Supabase-backed catalog system with a working admin editor, live storefront reads, and remaining work centered on reducing split truth and getting production-ready.
