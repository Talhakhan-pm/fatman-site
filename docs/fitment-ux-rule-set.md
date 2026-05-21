# Fitment UX Rule Set

Status: draft implementation spec
Owner: Fatman Parts storefront
Phase: Phase 2, garage-aware discovery

This document defines the customer-facing UX rules for fitment confidence across the storefront.

The goal is simple:

**the same selected vehicle should produce the same honest fitment message everywhere.**

## 1. Confidence states

There are four customer-facing fitment states.

### A. Fits
Meaning:
- we have enough evidence to confidently say the part fits the selected vehicle

Customer-facing label:
- `Confirmed Fit`

Tone:
- strong yes

### B. Verify
Meaning:
- the part may fit, but we do not have enough confidence to present it as confirmed

Customer-facing label:
- `Verify Fitment`

Tone:
- possible match, check before ordering

### C. Unknown
Meaning:
- we do not have enough fitment data to claim either fit or no-fit

Customer-facing label:
- `Fitment Unknown`

Tone:
- honest uncertainty, not a disguised recommendation

### D. No fit
Meaning:
- the part is known not to fit the selected vehicle

Customer-facing label:
- `Does Not Fit`

Tone:
- strong no

## 2. Global ranking rules

Every vehicle-aware surface should rank products/categories in this order:

1. `fits`
2. `verify`
3. `unknown`
4. `no-fit`

Never let `verify` outrank `fits`.
Never let `unknown` present as a recommendation.
Never promote `no-fit` in vehicle-aware modules.

## 3. Badge rules

### Fits badge
- color: green
- text: `Confirmed Fit`
- icon: optional check icon
- usage: cards, PDP fitment summary, category vehicle-aware lists

### Verify badge
- color: amber/yellow
- text: `Verify Fitment`
- icon: optional alert icon
- usage: product cards and PDP only when we intentionally choose to surface verify-state inventory

### Unknown badge
- color: neutral gray
- text: `Fitment Unknown`
- usage: PDP or broad catalog browsing only, not vehicle-aware recommendation modules

### No-fit badge
- color: red
- text: `Does Not Fit`
- usage: PDP and broad catalog browsing only when the user needs a warning

## 4. Homepage rules

## 4.1 Compatible Products for Your Vehicle
Purpose:
- surface the strongest product-level matches after garage selection

Current rule:
- show `fits` only

Behavior:
- no selected vehicle -> hide module
- selected vehicle with confirmed matches -> show product cards
- selected vehicle with no confirmed matches -> show honest empty state

Empty-state copy baseline:
- `We don’t have confirmed-fit products for this vehicle yet.`

Do not:
- silently mix `verify` into confirmed matches
- fall back to generic filler while pretending it is vehicle-aware

## 4.2 Categories that Fit Your Vehicle
Purpose:
- help the customer start browsing in the most relevant category lanes

Current rule:
- rank categories by confirmed-fit product counts
- show `fits`-backed categories only

Behavior:
- no selected vehicle -> hide module
- selected vehicle with confirmed-fit category coverage -> show ranked categories
- selected vehicle with no confirmed-fit category coverage -> show honest empty state

Category card copy baseline:
- title: category title from registry
- subtext: `{count} confirmed-fit parts`

Do not:
- count `verify` rows as if they were confirmed-fit inventory
- show generic categories and imply they were selected for the vehicle

## 5. Product card rules

When a vehicle is selected, product cards should reflect the correct confidence level.

### Fits card
Show:
- green `Confirmed Fit` badge
- normal CTA behavior
- these cards can rank first in vehicle-aware listings

Optional helper copy:
- `Matches your selected vehicle`

### Verify card
Show:
- amber `Verify Fitment` badge
- helper copy: `May fit your vehicle. Confirm before ordering.`
- rank below all confirmed-fit cards

CTA guidance:
- keep `View Product`
- on PDP, give the user a stronger confirmation path before purchase

### Unknown card
Show:
- gray `Fitment Unknown` badge
- helper copy: `We don’t have enough fitment data for your vehicle yet.`
- rank below verify

### No-fit card
Preferred behavior:
- hide from vehicle-aware recommendation modules
- if visible in broad browsing, show red `Does Not Fit`
- visually de-prioritize compared to fit/verify/unknown

## 6. Category page rules

When a vehicle is selected, category pages should behave like guided browsing.

### Ranking
- `fits` first
- `verify` second
- `unknown` third
- `no-fit` last or hidden

### Page messaging
Primary section label:
- `Best matches for your vehicle`

Optional secondary section label for verify:
- `May fit, verify before ordering`

Optional tertiary section label for unknown:
- `More parts, fitment not confirmed`

### Category-page goals
- help customers browse the right lane first
- avoid mixing hard yes and maybe into one undifferentiated grid
- reduce accidental purchases of low-confidence parts

## 7. PDP rules

The PDP should be the clearest fitment truth surface on the site.

### Fits PDP state
Show near the title / fitment summary:
- green `Confirmed Fit`
- supporting line: `This part matches your selected vehicle.`

CTA:
- normal purchase flow

### Verify PDP state
Show near the title / fitment summary:
- amber `Verify Fitment`
- supporting line: `This part may fit your vehicle. Confirm with VIN, trim, engine, or part number before ordering.`

CTA guidance:
- keep buy path possible only if business rules allow
- strongly encourage a confirmation action
- Implemented CTA: Inline VIN Decoder widget allows instant vehicle decoding directly on the product page.

### Unknown PDP state
Show near the title / fitment summary:
- gray `Fitment Unknown`
- supporting line: `We don’t have enough fitment data for this vehicle yet.`

CTA guidance:
- encourage confirmation before purchase

### No-fit PDP state
Show near the title / fitment summary:
- red `Does Not Fit`
- supporting line: `This part is not compatible with your selected vehicle.`

CTA guidance:
- ideally suppress or interrupt add-to-cart for vehicle-aware users
- offer recovery path: `Browse matching parts`

## 8. Search and broad catalog rules

For non-vehicle-specific browsing surfaces, the site should stay flexible.

If no vehicle is selected:
- do not show fitment badges by default unless a product page specifically benefits from it
- allow normal merchandising and generic browsing

If a vehicle is selected:
- cards should pick up fitment badges consistently
- ranking should still follow `fits > verify > unknown > no-fit`

## 9. Empty-state rules

Empty states must explain the truth without sounding broken.

### Confirmed-fit empty state
Use when no confirmed matches exist:
- `We don’t have confirmed-fit matches for this vehicle yet.`

### Unknown-data empty state
Use when the gap is likely data completeness rather than a known no-fit:
- `We don’t have enough fitment data for this vehicle yet.`

### No-fit state
Use when the selected product/category truly has no compatible options:
- `We could not find compatible options for this vehicle in this section.`

Do not use vague copy like:
- `No products found`
- `Nothing here`
- `Unavailable`

Those sound broken instead of truthful.

## 10. Language rules

Preferred customer-facing phrases:
- `Confirmed Fit`
- `Verify Fitment`
- `Fitment Unknown`
- `Does Not Fit`

Avoid:
- `recommended` when confidence is low
- `compatible` when the actual state is only verify or unknown
- `may fit` without clearly labeling it as a lower-confidence state
- generic promotional language that hides uncertainty

## 11. Implementation rules for Fatman right now

### Current practical recommendation
Homepage:
- products module -> `fits` only
- categories module -> `fits` only

Category pages:
- show `fits` first
- `verify` second if intentionally surfaced
- `unknown` after that

PDP:
- support all four states clearly
- become the most explicit truth surface on the site

No-fit behavior:
- do not promote in vehicle-aware homepage modules
- do not let it pollute best-match lanes

## 12. Near-term implementation order

1. tighten fitment/discovery truth paths so all surfaces agree on verdicts
2. standardize fitment badge rendering across product cards and PDPs
3. decide if category pages should visibly split `fits` and `verify` into separate sections
4. decide whether homepage should ever expose a clearly labeled `verify` fallback module
5. **[COMPLETED]** add VIN/support-driven confirmation flows for verify and unknown states (Inline VIN Decoder on PDP, `/fitment-help` flow)

## 13. Acceptance test examples

### Example A: confirmed fit
Selected vehicle:
- 1983 Chevrolet C 10 1/2 Ton
- Pickup 2WD
- L6-250 4.1L VIN D 2-bbl

Expected behavior:
- homepage products show confirmed-fit matches
- homepage categories show confirmed-fit categories
- category pages rank matching products first
- PDP fitment area says `Confirmed Fit`

### Example B: missing fitment coverage
Selected vehicle:
- 1982 Chevrolet C 10 1/2 Ton

Expected behavior:
- homepage products show honest empty state
- homepage categories show honest empty state
- PDP does not falsely claim `Confirmed Fit`
- site does not present generic filler as a vehicle-confirmed answer

### Example C: possible but not confirmed
Selected vehicle:
- any future case where only partial fitment evidence exists

Expected behavior:
- never display as `Confirmed Fit`
- may appear as `Verify Fitment` only if the surface intentionally supports verify-state items
- copy explicitly asks the customer to confirm before ordering
