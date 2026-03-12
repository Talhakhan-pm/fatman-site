# Fatman Brakes Catalog Asset Set

## Output Folder
`/Users/macbook/Projects/fatman-site/public/fatman-assets/brakes-us-catalog-2026-03-12`

## Files
- `2026-03-12-07-01-00-brake-pad-set-ceramic-front.png` — front ceramic disc brake pad set; use for OE-style ceramic front/rear pad listings where a clean friction-material image fits best
- `2026-03-12-07-02-00-brake-rotor-pair-vented-corrosion-guard.png` — vented rotor pair with coated hats; best for stock-style front rotor listings and standard pad-and-rotor kits
- `2026-03-12-07-03-00-brake-rotor-pair-slotted-performance.png` — slotted vented rotor pair; use for street-performance rotor listings and truck-duty / sport-coupe rotor kits
- `2026-03-12-07-04-00-brake-caliper-loaded-front.png` — loaded front caliper assembly with pads/bracket hardware; best for loaded front caliper or loaded pair style listings
- `2026-03-12-07-05-00-brake-caliper-rear-parking-brake.png` — rear caliper with integrated parking-brake lever; best for rear caliper listings that mention parking-brake actuator geometry
- `2026-03-12-07-06-00-brake-hose-pair-rubber-front.png` — black DOT-style rubber front hose pair; use for direct-fit front hose pair and basic hydraulic refresh listings
- `2026-03-12-07-07-00-brake-hose-set-braided-stainless.png` — stainless braided hose upgrade set; best for street-performance hose upgrade listings
- `2026-03-12-07-08-00-brake-master-cylinder-aluminum.png` — aluminum master cylinder replacement unit; use for brake master cylinder / hydraulic pressure restoration listings
- `copy-guidance-brakes.md` — listing copy guidance tied to the normalized brake archetypes
- `prompts.tsv` — prompts used to generate the image batch

## Archetype Mapping
### OE / Daily Driver Disc Service
Use:
- `2026-03-12-07-01-00-brake-pad-set-ceramic-front.png`
- `2026-03-12-07-02-00-brake-rotor-pair-vented-corrosion-guard.png`

Fits normalized listings like:
- Front Ceramic Brake Pad Set - OE Shimmed Daily Driver
- 320mm Vented Front Brake Rotor - Corrosion Guard
- Rear Solid Brake Rotor Pair - Stock Replacement
- Front Pad and Rotor Kit - Ceramic Daily Driver
- Rear Pad and Rotor Kit - Quiet Street Spec
- Rear Ceramic Brake Pad Set - Low-Dust OE Formula

### Street Performance / Truck Duty Rotor Visuals
Use:
- `2026-03-12-07-03-00-brake-rotor-pair-slotted-performance.png`

Fits normalized listings like:
- Performance Street Brake Rotor Pair - Slotted Vented
- Front Brake Rotor and Pad Kit - Truck Duty
- Severe Duty Front Brake Pad Set - Tow Package

### Caliper Service
Use:
- `2026-03-12-07-04-00-brake-caliper-loaded-front.png`
- `2026-03-12-07-05-00-brake-caliper-rear-parking-brake.png`

Fits normalized listings like:
- Loaded Front Brake Caliper - Hardware Included
- Front Loaded Brake Caliper Pair - Premium Reman
- Rear Brake Caliper with Parking Brake Actuator

### Hydraulic Hose / Line Visuals
Use:
- `2026-03-12-07-06-00-brake-hose-pair-rubber-front.png`
- `2026-03-12-07-07-00-brake-hose-set-braided-stainless.png`

Fits normalized listings like:
- Front Brake Hose Pair - DOT-Compliant Rubber
- Stainless Braided Front Brake Hose Upgrade Set
- Hydraulic Brake Hose Kit - Rear Axle Service
- Front-to-Rear Steel Brake Line Set - OE Routing
- ABS-Compatible Rear Brake Line Replacement Set

### Hydraulic Control / Pressure Service
Use:
- `2026-03-12-07-08-00-brake-master-cylinder-aluminum.png`

Fits normalized listings like:
- Brake Master Cylinder - Aluminum OE Replacement
- Brake Proportioning Valve - OE Pressure Balance

## Top Picks
1. `2026-03-12-07-02-00-brake-rotor-pair-vented-corrosion-guard.png`
   - Broadest catalog utility for mainstream disc-brake inventory
2. `2026-03-12-07-04-00-brake-caliper-loaded-front.png`
   - Strongest front-caliper replacement visual without looking stylized
3. `2026-03-12-07-06-00-brake-hose-pair-rubber-front.png`
   - Clean hydraulic-service visual for otherwise image-thin hose/line listings
4. `2026-03-12-07-08-00-brake-master-cylinder-aluminum.png`
   - Best non-rotor/non-pad image for variety across brake PDPs and cards

## Integration Notes
- This batch stays strictly inside brakes: pads, rotors, calipers, hoses, and hydraulic brake hardware.
- Use these as product-card/PDP assets only; do not use as decorative category filler.
- Match the image to the visible brake archetype, not to a guessed brand, exact diameter, or fitment.
- No logos, labels, packaging art, or text overlays were added.
- Final files already live under the canonical site public tree.
