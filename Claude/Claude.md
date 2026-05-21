# Fatman Parts — Claude Context File

## 1) Business Intent
Fatman Parts is a U.S.-focused automotive parts brand built to capture additional search and catalog demand with:
- OEM-first trust positioning
- fast shipping / dispatch messaging
- fitment confidence as a conversion moat
- a bolder voice in marketing, but professional clarity on PDP / cart / checkout flows

---

## 2) Current Project Location + Stack
Project path:
- `/Users/macbook/Projects/fatman-site`

Stack:
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- Supabase
- Stripe

---

## 3) Current Runtime Architecture
This project is a hybrid system utilizing:
1. **Supabase-backed live catalog layer** (Source of truth for products, orders, contact requests, fitment requests).
2. **Admin editing layer** (Password-gated UI to manage the live catalog and inbound customer requests).
3. **Source-file fallback layer** (Legacy baseline seed material for dev).

---

## 4) Admin & Inbound UX (Current State)
Main admin routes:
- `/admin/catalog`
- `/admin/contact-requests` (Added Phase 3)
- `/admin/fitment-requests` (Added Phase 3)

Recent additions:
- Admin now features dedicated inboxes for Contact Requests and VIN/Fitment requests.
- Customer support flows are fully backed by Supabase tables (`contact_requests`, `fitment_requests`).

---

## 5) Fitment & Discovery
- Storefront fitment logic normalizes vehicles through `charmFitmentCatalog`.
- Phase 2 shipped the garage-aware discovery layer (PDP related items, category sorting, homepage modules).
- Phase 3 introduced a floating Premium Navbar with an integrated Garage selection UI.

---

## 6) Conversion & Checkout (Phase 3)
- **Search:** Live `Cmd+K` command palette implemented in the new floating header, matching parts via `/api/products` for instant results.
- **Checkout:** Stripe Hosted Checkout is wired up via `/api/checkout/session`. Webhooks (`/api/stripe/webhook`) sync payment statuses back into a new Supabase `orders` table.

---

## 7) Current Verified State
- Live admin auth/session works
- Storefront reads live Supabase products
- Phase 2 garage-aware discovery is active (PDPs, Homepage, Categories).
- **Phase 3 components (Search, Stripe Checkout, Request Inboxes, Premium Navbar) have been successfully merged into `master`.**

---

## 8) Known Gaps / Current Risks
- **Fitment/discovery still has hybrid behavior:** While discovery relies on DB data, some backend check paths still use legacy mechanisms.
- **Catalog Scaling:** The site UI is now highly advanced, but the actual catalog data scaling (high quality titles, proper images, huge coverage) is still pending large-scale data imports.

---

## 9) Recommended Next Work
The project is currently in **Phase 3: Storefront Shell & Conversion**.
With the premium UI and Stripe checkout foundation laid, the next focus should be on refining the post-purchase experience (order fulfillment admin UX) and scaling real catalog data to match the high-end UI.

---

## 10) Useful Recent Commits
- `43fd8a1` `Merge remote-tracking branch 'origin/ui/premium-navbar-search'` (Floating navbar, ⌘K search, integrated garage)
- `c35e788` `Merge remote-tracking branch 'origin/phase3/storefront-shell'` (Stripe checkout, Contact + Fitment Admin inboxes)
