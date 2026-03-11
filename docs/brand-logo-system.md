# Fatman Brand Logo System

This project uses the exact approved Round 5 fixed Fatman horizontal logo source, with a dark-mode-safe recolor derived from that same asset only.

## Logo files

- `public/brand/fatman-primary-horizontal.png` — dark-surface variant derived from the exact approved fixed primary asset
- `public/brand/fatman-primary-horizontal-dark.png` — exact approved fixed primary asset for light surfaces
- `public/brand/fatman-compact-horizontal.png` — dark-surface compact variant derived from the exact approved fixed compact asset
- `public/brand/fatman-compact-horizontal-dark.png` — exact approved fixed compact asset for light surfaces
- `public/brand/fatman-badge-round.png` — legacy file kept in repo, not used in header/footer
- `public/brand/fatman-fp-shield.png`

## Usage rules

### 1) Primary horizontal logo
Use as the default brand mark on desktop and wide surfaces:
- `fatman-primary-horizontal.png` on dark surfaces
- `fatman-primary-horizontal-dark.png` on light surfaces
- Header brand area (desktop/tablet)
- Footer brand lockup
- Any standard website branding placement where width is available

### 2) Compact horizontal logo
Use on narrow horizontal spaces:
- `fatman-compact-horizontal.png` on dark surfaces
- `fatman-compact-horizontal-dark.png` on light surfaces
- Mobile header / small nav bars
- Tight side panels or utility bars

### 3) Badge round logo
Legacy/supporting asset only. Do not use in the site header or footer for the exact-logo-only implementation.

### 4) FP shield icon
Use for app/icon-only contexts:
- Favicon and browser tab icon
- Apple touch icon / PWA icon
- UI icon slots where a simplified mark is needed

## Implementation notes

- Preserve aspect ratio at all times (`h-auto` / `w-auto`, `object-contain`).
- Never stretch or squash logos.
- Keep clear space around logos (minimum ~0.5x icon height).
- Do not recolor logo files in CSS; keep original brand artwork.
- Preserve existing site color palette and component styling; logos are swapped in as assets only.
