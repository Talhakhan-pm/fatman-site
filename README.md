# Fatman Parts

Fatman Parts is a Next.js automotive parts storefront moving from mock/demo data into a real Supabase-backed catalog system.

This repo is no longer just a frontend demo. It now includes:
- a live storefront
- a Supabase-backed admin catalog editor
- image uploads to Supabase Storage
- fitment-aware product flows
- Vercel-ready production behavior

## Project location

- App: `/Users/macbook/Projects/fatman-site`
- Related source data: `/Users/macbook/Projects/fatman-data`

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- Supabase

## Current architecture

There are three important layers:

### 1. Live catalog layer
Storefront catalog reads go through:
- `src/lib/catalog-db.ts`

Current rule:
- **Supabase is the live catalog source of truth**

Important behavior:
- in production, storefront catalog reads now use server-side Supabase credentials
- in production, storefront catalog reads no longer silently fall back to source-file catalog data if live Supabase catalog reads fail
- in development, source-file fallback still exists as a safety net

### 2. Admin catalog layer
Admin UI:
- `/admin/catalog`

Key routes:
- `/api/admin/session`
- `/api/admin/catalog/list`
- `/api/admin/catalog/upsert`
- `/api/admin/catalog/upload-image`
- `/api/admin/catalog/seed`

Current behavior:
- admin unlocks in production with a password-gated HttpOnly cookie session
- successful saves write to Supabase
- image uploads go to Supabase Storage bucket `fatman-catalog/catalog/`
- local JSON fallback is development-only

### 3. Source-file fallback layer
Legacy/generated baseline catalog + fitment data still exists in:
- `src/lib/catalog.ts`
- `src/lib/fitment.ts`
- `src/lib/generated-data.ts`

This layer still matters in development and for some fallback behavior, but it is no longer the desired production truth.

## Environment variables

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FATMAN_ADMIN_WRITE_KEY=...
FATMAN_ADMIN_SEED_KEY=...
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- `FATMAN_ADMIN_WRITE_KEY` is the normal admin password
- `FATMAN_ADMIN_SEED_KEY` is higher-privilege for seed/reset actions

## Run locally

```bash
cd /Users/macbook/Projects/fatman-site
npm install
npm run dev
```

Open:
- `http://localhost:3000`

## Useful scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run sync:data
npm run catalog:doctor
npm run catalog:baseline
npm run fitment:charm
```

## Current verified status

### Phase 1, largely completed
Phase 1 infrastructure work now has real progress:
- live admin auth/session works
- admin save/load/upload works on Vercel
- storefront reads live Supabase products correctly
- production is less split-brain than before

Also verified:
- published products saved in admin can appear on product pages and category pages
- remote product images from Supabase Storage render correctly
- production admin no longer requires repeated developer-tools header pasting once session unlock is in place

### Phase 2, started
The first garage-aware discovery slice is now shipped:
- server-side compatible-product retrieval layer lives in `src/lib/discovery-db.ts`
- API route lives at `/api/discovery/compatible-products`
- PDPs can now show **Also fits your vehicle** for selected-vehicle matches in the same category
- if no vehicle is selected, the module stays hidden instead of falling back to generic recommendations
- the first UI polish pass is also done for this flow (badge contrast, tighter related-products layout, shorter garage labels, better placeholder states)

## Current risks / known gaps

- fitment still has hybrid behavior and fallback logic in some places
- garage-aware discovery is now real, but not every live DB fitment row will surface cleanly yet because some fitment flows are still gated by legacy/catalog-aware assumptions
- homepage and category pages are not garage-aware yet
- catalog quality is still separate from infrastructure quality
- admin/live-state messaging can still be clearer
- some generated-source assumptions still exist outside the ideal live-data path

## Current phase direction

Fatman is now in **Phase 2: garage-aware discovery**, not just Phase 1 cleanup.

Current principle:
- use selected vehicle state to make the storefront feel smarter
- prefer fitment-aware discovery over generic merchandising first
- do not overclaim fitment certainty

## Next recommended work

### Best next target
**Category-page fitment-aware ordering, after tightening the fitment gate/source-of-truth path**

Recommended immediate sequence:
1. tighten the fitment/discovery gate so live DB-compatible products are trusted more directly where appropriate
2. make category pages reorder products by fitment state (`fits` first, then `verify`, then `no-fit`)
3. optionally add a stronger `Verified Fit` / `Show only fits` browsing mode
4. then move to homepage compatible-product merchandising

Files most worth reviewing next:
- `src/lib/fitment-db.ts`
- `src/lib/discovery-db.ts`
- `src/app/api/fitment/check/route.ts`
- `src/app/api/fitment/check-batch/route.ts`
- `src/components/category-product-grid.tsx`

Why:
- PDP compatible discovery is already live
- category pages are where real browsing happens
- fitment trust becomes much more valuable when it changes product ordering, not just badges and one PDP module

## Phase roadmap from here

### Remaining Phase 2
- tighten fitment/source-of-truth behavior for discovery
- category-page fitment-aware ordering/filtering
- homepage **Compatible Products for Your Vehicle**
- homepage or category **Shop Categories for Your Vehicle**
- later, broader merchandising modules (featured/new) once vehicle-aware discovery is stronger

### Phase 3
- conversion work
- stronger PDP trust/support flows
- VIN verification improvements
- analytics and funnel improvement

## Quick testing checklist

### Admin
1. Open `/admin/catalog`
2. Unlock admin with the write key
3. Load a product
4. Save a product
5. Upload an image

### Storefront
1. Open `/product/<slug>` for a newly saved published product
2. Open `/category/<category>` and confirm visibility
3. Confirm uploaded image renders

## Model-facing project context

For deeper AI/project-state context, see:
- `Claude/Claude.md`
