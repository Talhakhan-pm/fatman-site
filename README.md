# Fatman Parts

Fatman Parts is a Next.js automotive parts storefront moving from mock/demo data into a real Supabase-backed catalog system.

This repo is no longer just a frontend demo. It now includes:
- a live storefront
- a Supabase-backed admin catalog editor
- image uploads to Supabase Storage
- fitment-aware product flows
- Vercel-ready production behavior
- live checkout and order management via Stripe
- real customer support request handling

## Project location

- App: `/Users/macbook/Projects/fatman-site`
- Related source data: `/Users/macbook/Projects/fatman-data`

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- Supabase
- Stripe

## Current architecture

There are three important layers:

### 1. Live catalog layer
Storefront catalog reads go through:
- `src/lib/catalog-db.ts`

Current rule:
- **Supabase is the live catalog source of truth**

### 2. Admin catalog layer
Admin UI:
- `/admin/catalog` (Modular, component-driven architecture)
- `/admin/contact-requests`
- `/admin/fitment-requests`

Key features:
- password-gated HttpOnly cookie session
- successful saves write to Supabase
- image uploads go to Supabase Storage bucket `fatman-catalog/catalog/`
- customer inquiries (contact/fitment) are stored in Supabase and viewable in the admin dashboard

### 3. Source-file fallback layer
Legacy/generated baseline catalog + fitment data still exists in:
- `src/lib/catalog.ts`
- `src/lib/fitment.ts`
- `src/lib/generated-data.ts`
(Fallback layer for dev only)

### 4. SEO & Google Visibility layer
All pages are fully optimized for organic crawl indexing:
- **Global Analytics:** Conditional GA4/GTM script injection in `src/app/layout.tsx` using `NEXT_PUBLIC_GA_ID` (defaults to `G-XY67JLB385` fallback) and `NEXT_PUBLIC_GTM_ID`.
- **Dynamic Sitemaps & Robots:** Automated crawling config (`src/app/sitemap.ts` and `src/app/robots.ts`) with custom categories and product mappings.
- **Rich JSON-LD Schemas:** 
  - Homepage: `AutoPartsStore` (LocalBusiness) and `WebSite` (with Sitelinks Searchbox action).
  - About & Contact: `AboutPage` and `ContactPage` schemas referencing the physical store address.
  - Blog: `Blog` & `BlogPosting` schemas for post discoverability.
  - Product Pages: Rich `Product` and `Offer` schema including SKU/MPN mappings, item condition, price validity dates, and nested merchant return policies/shipping details to satisfy GSC Merchant Listings.
- **Canonical Meta Polish:** Unique descriptive meta tags and canonical self-references on all static, dynamic, and policy/auxiliary pages.


## Environment variables

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FATMAN_ADMIN_WRITE_KEY=...
FATMAN_ADMIN_SEED_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## Current verified status

### Phase 1: Infrastructure (Completed)
- Live admin auth/session works
- Admin save/load/upload works on Vercel
- Storefront reads live Supabase products correctly

### Phase 2: Garage-Aware Discovery (Completed)
- Server-side compatible-product retrieval layer
- PDPs show **Also fits your vehicle**
- Category pages sort by fitment relevance
- Homepage shows **Compatible Products** and **Categories** modules
- Discovery flows successfully parse Supabase fitment data

### Production Status (Live at fatmanparts.com)
The storefront is fully live on the `master` branch with high-fidelity UI, conversion flows, and Google Analytics/Search Console integrations:
- **Premium Navbar:** Floating pill-shaped global header with a ⌘K rich search palette, live API text-matching, and an integrated Garage dropdown.
- **Stripe Checkout:** End-to-end checkout flow built (`/api/checkout/session`, `/api/stripe/webhook`), backed by Supabase `orders` table.
- **Inbound Requests:** 
  - Live Contact form and Admin Inbox (`/admin/contact-requests`)
  - Live VIN/Fitment Request flow (`/fitment-help`) with VIN decoding and Admin Inbox (`/admin/fitment-requests`)
- **Production UI Polish:** Global container alignment (`max-w-6xl`), inline VIN decoding on product pages, floating sticky theme toggle, and conversion-optimized marketing copy.
- **Admin Catalog Refactor:** Component-driven modular architecture for easy maintenance, featuring a **Multi-Dimensional Fitment Combinator** that instantly generates massive blocks of fitment matrix rows to accelerate data entry. Additionally includes a **Storefront-to-Admin Bridge** that renders direct shortcut links on product pages for authorized staff, auto-loading the editor instantly.

## Current risks / known gaps

- Fitment still has hybrid behavior and fallback logic in some legacy places
- The UI is highly polished now, but actual catalog quality (titles, images, real fitment rows) still needs data-entry scaling

## Next recommended work
Focus on completing the checkout lifecycle and handling order fulfillment, then loop back to data pipelines for real catalog inventory expansion.

## Quick testing checklist
1. **Search:** Hit `Cmd+K` anywhere on the site and type a part name.
2. **Garage:** Click the vehicle icon in the floating header.
3. **Checkout:** Add item to cart and initiate checkout (uses Stripe test mode).
4. **Admin Inboxes:** Submit a form on `/fitment-help` and view it at `/admin/fitment-requests`.

For deeper AI/project-state context, see:
- `Claude/Claude.md`
