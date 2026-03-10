# Fatman Brand Logo System

This project uses the Round 5 separated Fatman logo set.

## Logo files

- `public/brand/fatman-primary-horizontal.png`
- `public/brand/fatman-compact-horizontal.png`
- `public/brand/fatman-badge-round.png`
- `public/brand/fatman-fp-shield.png`

## Usage rules

### 1) Primary horizontal logo
Use as the default brand mark on desktop and wide surfaces:
- Header brand area (desktop/tablet)
- Footer brand lockup
- Any standard website branding placement where width is available

### 2) Compact horizontal logo
Use on narrow horizontal spaces:
- Mobile header / small nav bars
- Tight side panels or utility bars

### 3) Badge round logo
Use as a supporting brand mark, not the only wordmark on major surfaces:
- Footer accent/logo lockups
- Social/profile avatars
- Stickers, badges, and circular placements

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
