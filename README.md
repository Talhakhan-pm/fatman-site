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

### Phase 2, underway
Garage-aware discovery now has two real slices shipped:
- server-side compatible-product retrieval layer lives in `src/lib/discovery-db.ts`
- API route lives at `/api/discovery/compatible-products`
- PDPs can now show **Also fits your vehicle** for selected-vehicle matches in the same category
- if no vehicle is selected, the module stays hidden instead of falling back to generic recommendations
- the first UI polish pass is also done for this flow (badge contrast, tighter related-products layout, shorter garage labels, better placeholder states)
- the fitment/discovery gate has been loosened to trust normalized live DB fitment more directly instead of requiring catalog-presence checks first
- category pages now sort by fitment relevance when a vehicle is selected (`fits` first, then `verify`, then `no-fit`)

## Current risks / known gaps

- fitment still has hybrid behavior and fallback logic in some places
- the biggest catalog-aware discovery choke point is improved, but fitment still has legacy fallback behavior in verdict paths
- homepage is not garage-aware yet
- category pages are now fitment-aware for ordering, but not yet deeply merchandised
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
**Homepage garage-aware discovery**

Recommended immediate sequence:
1. add homepage **Compatible Products for Your Vehicle**
2. optionally add **Shop Categories for Your Vehicle**
3. decide whether to expose `verify` products in a clearly lower-confidence secondary module or keep homepage `fits`-only
4. after that, broaden into featured/new merchandising only if it does not dilute the fitment-first UX

Files most worth reviewing next:
- `src/app/page.tsx`
- `src/lib/discovery-db.ts`
- `src/lib/catalog-db.ts`
- `src/components/garage-provider.tsx`

Why:
- PDP discovery is already live
- category browsing is now fitment-aware
- homepage is the next major surface that still does not fully respond to selected vehicle state

## Phase roadmap from here

### Remaining Phase 2
- homepage **Compatible Products for Your Vehicle**
- homepage or category **Shop Categories for Your Vehicle**
- possible deeper category filtering / fitment-only browsing controls
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
