# Phase 2 — Garage-Aware Discovery (V1)

## Goal

Turn Fatman from a catalog that can answer fitment questions into a storefront that actively helps customers discover products for **their specific vehicle**.

This is a better next step than generic related products because Fatman’s real moat is fitment confidence, not random merchandising.

---

## Why this is the right next move

Current status after Phase 1:
- live admin auth/session works
- admin save/load/upload works on Vercel
- storefront reads live Supabase catalog data correctly
- production is less split-brain than before

Current discovery gap:
- the customer can select a vehicle
- product cards and PDPs can show fitment states
- but the storefront still does not do enough to **guide browsing based on the selected vehicle**

So the next step should not be “generic recommendations.”
It should be:

**garage-aware discovery**

Meaning:
- once a customer selects year/make/model/variant/engine
- the storefront should surface products and category paths that make sense for that exact vehicle

---

## Core principle

Do not overclaim fitment.

Use the existing model honestly:
- `fits`
- `verify`
- `no-fit`

V1 should prefer:
- showing `fits` products first
- optionally showing `verify` products in a separate or lower-confidence area
- never using `no-fit` products as positive recommendations

---

## Current architecture we can build on

Already available:
- selected vehicle stored in `GarageProvider`
- fitment selection UI in `FitmentModuleV2`
- product-level verdicts via:
  - `src/components/use-fitment.ts`
  - `src/app/api/fitment/check/route.ts`
  - `src/app/api/fitment/check-batch/route.ts`
- DB-backed fitment lookup in:
  - `src/lib/fitment-db.ts`
- live storefront product/category reads in:
  - `src/lib/catalog-db.ts`

This means we do **not** need to invent a recommendation engine first.
We need to convert existing vehicle + fitment signals into better discovery flows.

---

## V1 outcome

After selecting a vehicle, the storefront should begin behaving like:

> “Show me what fits my car”

instead of:

> “Here is the same generic catalog, but now with fitment badges.”

---

## V1 scope

### 1. Garage-aware homepage discovery

When a vehicle is selected, homepage should surface a section like:
- **Compatible Products for Your Vehicle**

Rules:
- use `fits` products first
- cap the section to a manageable number, for example 6 to 12 items
- if not enough `fits` products exist, optionally backfill with `verify` products in a clearly lower-confidence way
- if no vehicle is selected, show normal merchandising instead

Optional companion module:
- **Shop Categories for Your Vehicle**
  - categories ranked by count of compatible live products

Why this matters:
- proves the store responds to the customer’s vehicle
- makes homepage feel live and useful, not just decorative

---

### 2. Garage-aware category browsing

Category pages should become smarter when a vehicle is selected.

V1 behavior:
- products with `fits` sort first
- `verify` after that
- `no-fit` last or optionally hidden behind a toggle
- keep existing sorting options, but add a strong default behavior tied to selected vehicle

Optional UI additions:
- “Show only verified fit” toggle
- short category helper text such as:
  - `Showing best matches for your 2018 Toyota Camry`

Why this matters:
- category pages are where real browsing happens
- fitment-aware sort is more useful than a generic related-products widget alone

---

### 3. Garage-aware PDP related products

On product pages, add a section like:
- **Also fits your vehicle**

Rules for V1:
- exclude current product
- same category first
- only include products with `fits` verdict for selected vehicle
- if there are too few, optionally allow `verify` items in a separate secondary row or lower-priority section

Why this matters:
- prevents PDP dead ends
- helps basket building
- stays aligned with the fitment-first brand promise

---

## What not to do in V1

Do **not** start with:
- AI recommendations
- behavioral recommendation engines
- “customers also bought” logic
- bundles
- personalization based on sessions/history
- generic same-brand suggestions without fitment awareness

Those can come later.
V1 should stay focused on **vehicle-aware relevance**.

---

## Recommended data/query model for V1

Do not solve V1 in the browser by brute-forcing everything if we can avoid it.

### Better approach
Use DB-backed fitment discovery for server or API-driven product retrieval.

We likely need a helper that can answer:
- given a vehicle, which live products are `fits`
- given a vehicle and category, which live products are `fits` / `verify`
- given a vehicle and current product/category, which related products also fit

Likely implementation area:
- extend `src/lib/fitment-db.ts`
- or add a focused helper like `src/lib/discovery-db.ts`

Potential helper functions:
- `getCompatibleProductsForVehicle(vehicle, options)`
- `getCompatibleProductsByCategory(vehicle, categorySlug, options)`
- `getRelatedCompatibleProducts(productSlug, vehicle, options)`

The main rule:
- use live Supabase-backed truth where possible
- avoid drifting back into purely legacy/generated fitment logic for discovery decisions

---

## UI surfaces to change

### Homepage
- `src/app/page.tsx`
- likely add one or more discovery sections/components

### Category pages
- `src/components/category-product-grid.tsx`
- `src/app/category/[slug]/page.tsx`

### Product pages
- `src/components/product/product-page-client.tsx`
- possibly add a `RelatedProducts` component

### Shared fitment / garage awareness
- `src/components/garage-provider.tsx`
- `src/components/use-fitment.ts`
- maybe a new discovery hook or server-driven fetch layer

---

## V1 behavior details

### If no vehicle selected
Use standard merchandising behavior.
No garage-aware modules should pretend to know what fits.

### If vehicle selected
Prefer garage-aware discovery modules.

### If no `fits` products found
Fallback options:
1. show `verify` products with explicit wording
2. show category links for that vehicle
3. show standard merchandising, but do not label it as compatible

### If fitment data is incomplete
Prefer conservative messaging.
Do not blur `verify` into `fits` just to fill slots.

---

## Current shipped progress

### Shipped already
The first Phase 2 slice is now in the repo:
- server-side compatible-product retrieval layer in `src/lib/discovery-db.ts`
- API route at `/api/discovery/compatible-products`
- PDP **Also fits your vehicle** module in `src/components/product/compatible-products.tsx`
- current live behavior hides the module entirely when no vehicle is selected
- first UI polish pass is also done for this flow:
  - badge contrast improved
  - garage labels shortened
  - related-products section tightened
  - placeholder media states made more intentional

### Important caveat discovered during testing
The new discovery layer initially missed some live DB fitment combinations because parts of the fitment path still depended on catalog-aware / legacy assumptions.

That issue has now been partially addressed by removing the catalog-presence gate from discovery + DB fitment lookup entry points.

Remaining caveat:
- fitment still has hybrid fallback behavior in some verdict paths
- more cleanup is still justified, but the most obvious discovery choke point is no longer blocking progress to broader Phase 2 UI work

## Implementation order

### Slice 1
Build the data/query layer for vehicle-compatible product retrieval.

Status: **done**

This now exists and becomes the foundation for:
- homepage compatible section
- category fitment-aware ordering
- PDP related products

### Slice 2
Tighten the fitment/discovery gate so live DB-backed compatible products are trusted more directly where appropriate.

Status: **done as first pass**

### Slice 3
Add category fitment-aware ordering / filtering.

Status: **baseline done**

Current behavior:
- when a vehicle is selected, category relevance now sorts `fits` first, then `verify`, then `no-fit`
- category UI now communicates that it is showing best matches for the selected vehicle

### Slice 4
Add homepage **Compatible Products for Your Vehicle** and/or **Shop Categories for Your Vehicle**.

### Slice 5
Broaden garage-aware merchandising only after the above is solid.

---

## Success criteria

Phase 2 V1 is successful when:
- selecting a vehicle changes discovery behavior in a visible way
- homepage can surface vehicle-compatible products
- category pages prioritize products that fit the selected vehicle
- PDPs can lead to other compatible products
- the storefront feels smarter without overclaiming fitment certainty

Current partial success already achieved:
- PDPs can now lead to other compatible products
- vehicle-aware discovery is now visible in at least one real storefront surface

Still needed to call V1 truly complete:
- homepage surfaces compatible discovery intentionally
- fitment/discovery gate behavior is tightened further wherever legacy fallback still distorts verdicts
- the vehicle-aware browsing experience is strong across homepage, category pages, and PDPs together

---

## Best immediate next build task

**Add homepage garage-aware discovery.**

That is now the cleanest next step because:
- compatible-product retrieval already exists
- PDP discovery is already live
- category pages now have fitment-aware ordering
- homepage is the next major surface that still needs to react meaningfully to the selected vehicle
