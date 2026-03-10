# Fatman Parts — Claude Context File

## 1) Business Intent
Fatman Parts is a U.S.-focused automotive parts brand built as an additional market-capture brand.

Core strategy:
- OEM-first trust positioning
- Fast shipping and dispatch messaging
- Fitment confidence as conversion moat
- Bold/funny voice in marketing, professional clarity at checkout/PDP

Primary goals:
- Increase total market share across branded + non-branded search
- Reduce wrong-part returns via fitment controls
- Build scalable product + fitment data operations

---

## 2) Current Tech Infrastructure
Project path:
- `/Users/macbook/.openclaw/workspace/fatman-site`

Stack:
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript

Core app routes:
- `/` homepage
- `/category/[slug]` dynamic category pages
- `/product/[slug]` dynamic product pages
- `/blog`, `/about`, `/contact`, `/cart`
- `/api/products`
- `/api/fitment/check`
- `/sitemap.xml`, `/robots.txt`

UI/UX systems:
- Dark/Light theme toggle with localStorage
- My Garage vehicle persistence (localStorage)
- Fitment badges: `fits` | `verify` | `no-fit`
- Sticky fitment bar on category and PDP
- Product cards with stock/savings signals

---

## 3) Data Architecture (Current)
Primary source folder:
- `/Users/macbook/.openclaw/workspace/fatman-data`

Files:
- `products.csv` (catalog)
- `fitment.csv` (vehicle compatibility)
- `DATA-DICTIONARY.md` (schema doc)
- `validate-data.mjs` (CSV validation)
- `generate-seed-data.mjs` (mock seed generation)

Sync pipeline:
1. Edit CSV files in `fatman-data/`
2. Validate: `node validate-data.mjs`
3. Sync into app: `cd fatman-site && npm run sync:data`
4. Generated app data output: `src/lib/generated-data.ts`

This generated file powers:
- `src/lib/mock-data.ts` (products/categories access)
- `src/lib/fitment.ts` (fitment rules + vehicle options)

---

## 4) Fitment System (Critical)
Fitment keys:
- Year
- Make
- Model
- Engine

Fitment decision model:
- `fits`: direct compatibility match
- `verify`: likely match but VIN confirmation recommended
- `no-fit`: incompatible

Frontend behavior:
- Vehicle selection saved via My Garage
- Category cards and PDP evaluate fitment against selected vehicle
- PDP includes additional VIN verification CTA

Business rule:
Never claim guaranteed fitment without matching structured data.
Use `verify` state when confidence is partial.

---

## 5) SEO + Discoverability
Implemented:
- Dynamic metadata for category/product routes
- JSON-LD schema:
  - Product schema on PDP
  - Breadcrumb schema on category and PDP
- Sitemap generation (`/sitemap.xml`)
- Robots policy (`/robots.txt`)

Domain placeholder currently used in metadata:
- `https://fatmanparts.com`

---

## 6) Analytics Events (Current)
Tracked event hooks in frontend:
- `view_item`
- `add_to_cart`
- `begin_checkout`
- `fitment_confirmed`
- `vin_verify_clicked`

Tracking utility:
- `src/lib/analytics.ts`
- currently logs to console (dev) and pushes to `dataLayer`

---

## 7) Known Gaps / Next Critical Work
1. Replace seeded mock catalog with real supplier/OEM data
2. Implement robust importer for real feeds (CSV/API)
3. Add conflict handling (duplicate SKU, bad fitment rows, missing OEM refs)
4. Add account flow pages and order-tracking flow
5. Integrate real checkout/commerce backend

---

## 8) Safety + Brand Voice Guardrails
Voice split:
- Site UX/PDP/checkout: clear + trustworthy (F2)
- Ads/social: bolder meme-lite flavor (F3)

Avoid:
- Body/identity jokes
- Trust-breaking humor in transactional flows
- Overpromising shipping/fitment claims

---

## 9) Operational Commands
From `fatman-data/`:
- `node validate-data.mjs`
- `node generate-seed-data.mjs 200`

From `fatman-site/`:
- `npm run sync:data`
- `npm run dev`
- `npm run lint`
- `npm run build`

---

This file is intended to onboard Claude (or any coding assistant) quickly to business context, architecture, and fitment-critical logic for Fatman Parts.
