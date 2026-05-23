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
5. `docs/fitment-ux-rule-set.md`

---

## 3) Current status

**Live in Production (master branch)**

This project has completed its Phase 1 (infrastructure), Phase 2 (garage-aware discovery), and Phase 3 (storefront shell & conversion) milestones. It is currently live in production at `fatmanparts.com` on the `master` branch, fully integrated with Google Analytics and Google Search Console.

---

## 4) What is already shipped

### Production Foundation
- live admin auth/session works (Supabase)
- storefront reads live Supabase products correctly
- PDP compatible-products module ("Also fits your vehicle")
- Category pages use fitment-aware relevance ordering
- Homepage has "Compatible Products for Your Vehicle" and "Categories that fit"

### Core Conversion & UI (Now in master)
- **Premium Navbar & Search:**
  - Replaced static header with a floating pill-shaped navbar.
  - Implemented ⌘K live search dropdown that queries `/api/products` for instant results (with images, prices, SKUs).
  - Integrated the Garage fitment toggle directly into the navbar.
- **Stripe Checkout Integration:**
  - Created `/api/checkout/session` and `/api/stripe/webhook`.
  - Added a `004_storefront_orders.sql` table in Supabase.
  - Created success/cancel pages with Stripe session sync.
- **Admin Inbound Request Inboxes:**
  - Contact Requests: built form and admin dashboard (`/admin/contact-requests`, backed by `003_contact_requests.sql`).
  - VIN/Fitment Requests: built `/fitment-help` form with VIN decoding, and admin dashboard (`/admin/fitment-requests`, backed by `002_fitment_requests.sql`).
- **Admin Catalog Refactor & Fitment Combinator:**
  - Refactored the `/admin/catalog` page into a modular, component-driven architecture.
  - Built the **Multi-Dimensional Fitment Combinator**, a matrix generator that instantly produces combinatorial rows (Years × Makes × Models × Trims × Engines) to drastically speed up data entry.
  - Implemented the **Storefront-to-Admin Bridge**: Authorized staff automatically see an "Edit in Admin" button on any public product page. Clicking it performs a direct hard-navigation that securely auto-loads the product into the backend editor, bypassing manual searches.
- **Production UI Polish:**
  - Standardized max-width containers and fixed grid alignment bugs.
  - Replaced legacy theme toggles with a premium floating frosted-glass toggle.
  - Rewrote placeholder copy for high-conversion authentic marketing.
- **SEO & Google Visibility:**
  - Integrated Google Analytics (GA4) with a fallback tag of `G-XY67JLB385`.
  - Added unique meta tags and canonical self-references across all static, dynamic, and policy pages.
  - Added `AutoPartsStore` (Organization/LocalBusiness) and `WebSite` (with Searchbox) schemas to the homepage.
  - Built custom schemas for About (`AboutPage`), Contact (`ContactPage`), and Blog (`Blog` + `BlogPosting` list).
  - Enriched the product page catalog schema with dynamic images, SKU/MPN codes, NewCondition, price valid dates, return policy links, and delivery rates for rich merchant listing snippets.
  - Submitted and verified `https://fatmanparts.com/sitemap.xml` (processed with 240 indexable pages).

---

## 5) Important current caveat

- **Data Quality:** The frontend UI and SEO setups are highly advanced (floating navbar, live search, Stripe checkout, rich schemas), but the underlying catalog data still relies heavily on the baseline data imports. Do not confuse the polished UI with a finished, robust database of parts.
- **Fitment Fallbacks:** While discovery flows read from Supabase, there are still some legacy fitment check paths that have fallback behavior. 

---

## 6) Exact next recommended task

### Next implementation slice
1. **Catalog Scaling:** Build import pipelines/scripts to load real auto parts database data into Supabase (replacing the default fallback seed data).
2. **Order Fulfillment:** Refine the admin flow to handle Stripe paid orders and order state tracking.

---

## 7) Known-good test case for UI

- **Global Search:** Hit `Cmd/Ctrl + K`, type "test" or "front". Expect a rich dropdown with part cards.
- **Fitment Help:** Navigate to `/fitment-help`, enter a valid 17-char VIN, and verify the frontend decodes it correctly before submission. Submit and check `/admin/fitment-requests`.
- **Checkout:** Add item to Cart, click checkout, and ensure you hit the Stripe Hosted Checkout page.

---

## 8) Operational rules for any OpenClaw touching this repo

### Before starting work
1. `git pull`
2. read the required docs listed above
3. ensure env exists (needs Stripe keys now too)
4. run `npm install` if needed, then `npm run build`
5. restate current phase and next task.

### After finishing work
1. update code
2. update this handoff file if phase/state/next-task changed
3. update `README.md` and `Claude/Claude.md` if project status meaningfully changed
4. run `npm run build`
5. commit and push

---

## 9) Branch / concurrency rule

Do **not** let multiple OpenClaw instances code on the same branch at the same time unless Khan explicitly wants that mess.

Safe default:
- one active implementation agent at a time on the main branch

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

- `43fd8a1` `Merge remote-tracking branch 'origin/ui/premium-navbar-search'` (Premium navbar & ⌘K search)
- `c35e788` `Merge remote-tracking branch 'origin/phase3/storefront-shell'` (Checkout & request inboxes)
