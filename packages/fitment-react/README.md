> Note: this README is intentionally non-marketing — it documents the API. There are no setup/install instructions because the package is consumed locally inside the `fatman-site` repo (see "Local consumption" below).

# @fatman/fitment-react

Reusable React selector + catalog adapter for vehicle fitment lookups
(year → make → model → trim → engine).

The package ships three layers, each usable on its own:

1. **Catalog adapter** (`createFitmentCatalog`) — turns a flat tree-shaped
   vendor export into a constant-time, read-only lookup facade.
2. **Headless hook** (`useFitmentSelection`) — owns the selection state machine,
   cascading clears, and single-option auto-fill. Renders nothing.
3. **Default UI** (`FitmentSelector`, `FitmentDropdown`) — opt-in components
   wired through the hook. Style with `classNames` or replace entirely.

The package is **app-agnostic**: no Next.js aliases, no analytics calls, no
hardcoded JSON. Callers pass catalog data in.

## Quick start

```tsx
import {
  createFitmentCatalog,
  FitmentSelector,
  type Vehicle,
} from "@fatman/fitment-react";
import treeData from "./my-vendor-export.json";

const catalog = createFitmentCatalog(treeData, {
  metadata: { source: "MyVendor" },
});

export function MyFitmentBox() {
  return (
    <FitmentSelector
      catalog={catalog}
      onConfirm={(vehicle: Vehicle, source) => {
        console.log("user confirmed", vehicle, "via", source);
      }}
      onVinSubmit={async (vin) => {
        const decoded = await fetch(`/api/vin/${vin}`).then((r) => r.json());
        return decoded as Vehicle | null;
      }}
    />
  );
}
```

## Catalog input

`createFitmentCatalog(data, config?)` expects this tree shape:

```ts
interface FitmentCatalogTreeData {
  years: string[];
  modelsByYearMake: Record<string, Record<string, string[]>>;
  variantsByYearMakeModel: Record<string, Record<string, string[]>>;
  enginesByYearMakeModelVariant: Record<string, Record<string, string[]>>;
}
```

Composite keys (variants/engines) join on a configurable separator
(`config.keySeparator`, default `"|||"`) so multiple arities collapse into a
single map. If a model has no real trims, the catalog falls back to
`config.defaultVariant` (default `"Base"`).

Once built, the catalog is frozen and exposes:

- `years` (sorted, from input)
- `getMakes(year)`
- `getModels(year, make)`
- `getVariants(year, make, model)`
- `getEngines(year, make, model, variant)`
- `getDefaultVariant(variants)` — returns the sole variant when there's
  exactly one, otherwise `""`
- `hasVehicle(vehicle)` — diagnostic membership check
- `metadata` — whatever you passed in `config.metadata`

## Headless hook

`useFitmentSelection({ catalog, initialVehicle?, autoSelectSingleOption?, onSelectionChange? })`
returns `{ selection, isComplete, options, setField, set<Field>, applyVehicle, reset, asVehicle }`.

- `setField` performs **cascading clears** — setting `make` resets `model`, `variant`, `engine`.
- `autoSelectSingleOption` (default `true`) auto-fills `variant`/`engine` when
  exactly one option exists at that level.
- `applyVehicle(partial | null)` is the bulk setter for VIN-decode flows.

## Default UI

`FitmentSelector` is wired through the hook and renders five dropdowns, a CTA,
optional VIN section, and a confirmation slot. It is fully restyleable through
`classNames` and `labels`, with optional `renderHeader`/`renderFooter` slots
for fully custom chrome.

Key props:

| prop | purpose |
| ---- | ------- |
| `catalog` | A `FitmentCatalog` (required). |
| `initialVehicle` | Hydrate from a saved garage. |
| `autoSelectSingleOption` | Toggle the auto-fill behavior. |
| `partCountResolver(vehicle)` | Optional consumer-provided count for the CTA + confirmation. |
| `onConfirm(vehicle, "manual"\|"vin")` | Required. Fired on search or VIN-decode. |
| `onVinSubmit(vin)` | Async VIN decoder; return a `Vehicle` or `null`. Omit to inert the GO button. |
| `onSelectionChange(selection)` | Fires for any in-progress edit. |
| `labels` | All copy is overridable, including the `searchReady` and `confirmation` renderers. |
| `classNames` | Maps class strings onto every node — bring your own Tailwind/CSS. |
| `renderHeader`/`renderFooter` | Fully custom chrome. |

`FitmentDropdown` is exported separately for callers who want the hook +
their own layout.

## Local consumption (this repo)

The host app (`fatman-site`) consumes this package via a tsconfig path alias —
no install step needed. See `tsconfig.json`:

```jsonc
{
  "paths": {
    "@/*": ["./src/*"],
    "@fatman/fitment-react": ["./packages/fitment-react/src/index.ts"]
  }
}
```

The build artifact at `dist/` is what would ship if this package were ever
extracted into its own repo or published privately.

## Scripts

- `npm run build` — emits `dist/` via `tsc -p tsconfig.build.json`.
- `npm run typecheck` — type-checks without emitting.
- `npm run clean` — removes `dist/` and the build cache.

## Versioning

Pre-1.0. Surface area is stable in spirit but unsigned — breaking changes will
be called out in commit messages until v1.
