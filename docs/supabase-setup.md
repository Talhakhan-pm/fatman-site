# Fatman Supabase Setup

## Environment

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FATMAN_ADMIN_WRITE_KEY=...
FATMAN_ADMIN_SEED_KEY=...
```

- `NEXT_PUBLIC_*` values are safe for the app.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to client code.
- `FATMAN_ADMIN_*` keys are for production-only route protection on internal admin endpoints.

## Initial schema

1. Open the Supabase dashboard.
2. Go to **SQL Editor**.
3. Paste `supabase/001_fatman_core.sql`.
4. Run it.

This creates:
- `categories`
- `products`
- `fitment_rules`

## Storage

Admin product image uploads now go to **Supabase Storage**, not the local `public/` folder.

Current bucket used by the app:
- `fatman-catalog`

Current object folder used by the admin upload route:
- `catalog/`

Notes:
- the upload route can create the bucket automatically if it does not exist
- the bucket is expected to be public so storefront product images can render directly

## Intended write path

Agents should write through the Fatman app server, not directly from the browser.

Recommended flow:
1. Agent sends one structured payload to an internal route or server action.
2. The app validates the payload.
3. The app writes to Supabase with the service-role client.
4. The storefront reads published records with the public client.

## Admin routes

### Seed the current source-file catalog

`POST /api/admin/catalog/seed`

Body:

```json
{
  "includeFitment": true
}
```

Notes:
- In local development, the route is open.
- In production, send `x-fatman-admin-key: <FATMAN_ADMIN_SEED_KEY>`.

### Upload one product image

`POST /api/admin/catalog/upload-image`

Multipart form fields:
- `file` → image file
- `slug` → optional product slug/name hint for filename generation

Notes:
- In local development, the route is open.
- In production, send `x-fatman-admin-key: <FATMAN_ADMIN_WRITE_KEY>`.
- The route uploads to Supabase Storage bucket `fatman-catalog` under `catalog/`.
- The route returns a public URL that can be stored directly in `product.imageUrl`.

### Upsert one product with fitment in one call

`POST /api/admin/catalog/upsert`

Example body:

```json
{
  "category": {
    "slug": "cooling",
    "title": "Cooling",
    "description": "Radiators, fan assemblies, water pumps, thermostats, hoses, reservoirs, and heater cores.",
    "published": true,
    "sortOrder": 4
  },
  "product": {
    "sku": "FTM-COL-9999",
    "slug": "aluminum-test-radiator",
    "category": "cooling",
    "brand": "DriveCore",
    "name": "Aluminum Test Radiator",
    "shortDescription": "Draft radiator for admin upsert testing.",
    "price": 249.99,
    "stock": "in-stock",
    "published": false
  },
  "fitment": [
    {
      "year": "2004",
      "make": "Oldsmobile",
      "model": "Alero",
      "variant": "Base",
      "engine": "L4-2.2L VIN F",
      "matchType": "fits",
      "source": "agent-upsert",
      "confidence": 0.95
    }
  ],
  "replaceFitment": true
}
```

Notes:
- In local development, the route is open.
- In production, send `x-fatman-admin-key: <FATMAN_ADMIN_WRITE_KEY>`.
- `replaceFitment: true` deletes old fitment rows for that product before inserting the new set.
- Omit `fitment` if you only want to update product fields.
- Local JSON fallback is development-only. In production, Supabase write failures return an error instead of silently saving to `data/admin-catalog-local.json`.

## Current migration status

1. Category/product reads can now fall back to Supabase without breaking local source-file behavior.
2. Internal upsert endpoint for product + fitment now exists.
3. Current catalog + fitment have been seeded into Supabase.
4. Admin image uploads now target Supabase Storage instead of local disk.
5. Local admin JSON fallback is now restricted to development only.
6. Remaining work is to move more storefront behavior off generated source-file fitment and onto database-backed logic, and continue reducing split-truth behavior between fallback data and live Supabase records.
