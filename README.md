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

Phase 1 has real progress:
- live admin auth/session works
- admin save/load/upload works on Vercel
- storefront reads live Supabase products correctly
- production is less split-brain than before

Also verified:
- published products saved in admin can appear on product pages and category pages
- remote product images from Supabase Storage render correctly
- production admin no longer requires repeated developer-tools header pasting once session unlock is in place

## Current risks / known gaps

- fitment still has hybrid behavior and fallback logic in some places
- catalog quality is still separate from infrastructure quality
- admin/live-state messaging can still be clearer
- some generated-source assumptions still exist outside the ideal live-data path

## Next recommended work

Stay in Phase 1 a little longer and finish source-of-truth cleanup properly.

### Best next target
**Fitment/source-of-truth cleanup**

Review next:
- `src/lib/fitment-db.ts`
- `src/app/api/fitment/check/route.ts`
- `src/app/api/fitment/check-batch/route.ts`
- any places still relying on legacy/generated fitment when live DB should be primary

Why:
- product visibility is now much tighter
- fitment can still feel inconsistent if it resolves from mixed sources
- this is the next hidden split-truth problem

## After Phase 1
Move into Phase 2:
- homepage merchandising
- featured/new products
- better category discovery
- related products

Then Phase 3:
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
