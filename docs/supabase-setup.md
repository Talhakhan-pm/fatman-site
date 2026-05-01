# Fatman Supabase Setup

## Environment

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

- `NEXT_PUBLIC_*` values are safe for the app.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to client code.

## Initial schema

1. Open the Supabase dashboard.
2. Go to **SQL Editor**.
3. Paste `supabase/001_fatman_core.sql`.
4. Run it.

This creates:
- `categories`
- `products`
- `fitment_rules`

## Intended write path

Agents should write through the Fatman app server, not directly from the browser.

Recommended flow:
1. Agent sends one structured payload to an internal route or server action.
2. The app validates the payload.
3. The app writes to Supabase with the service-role client.
4. The storefront reads published records with the public client.

## Next migration phases

1. Move category/product reads from source files into Supabase.
2. Add an internal upsert endpoint for products + fitment.
3. Import the current catalog into Supabase.
4. Retire remaining generated source-file data paths.
