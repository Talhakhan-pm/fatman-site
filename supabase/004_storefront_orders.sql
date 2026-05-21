create table if not exists public.storefront_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending_payment',
  payment_status text not null default 'unpaid',
  source text not null default 'fatman-site',
  customer_email text,
  customer_phone text,
  customer_name text,
  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'usd',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  stripe_payment_status text,
  paid_at timestamptz,
  canceled_at timestamptz,
  crm_sync_status text not null default 'not_synced',
  crm_synced_at timestamptz,
  crm_error text,
  crm_order_ids jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storefront_orders_status_check check (status in ('pending_payment', 'paid', 'payment_failed', 'canceled', 'fulfilled', 'refunded')),
  constraint storefront_orders_payment_status_check check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  constraint storefront_orders_crm_sync_status_check check (crm_sync_status in ('not_synced', 'pending', 'synced', 'failed'))
);

create table if not exists public.storefront_order_items (
  id uuid primary key default gen_random_uuid(),
  storefront_order_id uuid not null references public.storefront_orders(id) on delete cascade,
  product_slug text not null,
  product_sku text not null,
  product_name text not null,
  product_brand text,
  quantity integer not null,
  unit_amount_cents integer not null,
  line_total_cents integer not null,
  crm_order_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storefront_order_items_quantity_check check (quantity > 0),
  constraint storefront_order_items_amount_check check (unit_amount_cents >= 0 and line_total_cents >= 0)
);

create index if not exists idx_storefront_orders_created_at on public.storefront_orders(created_at desc);
create index if not exists idx_storefront_orders_customer_email on public.storefront_orders(customer_email);
create index if not exists idx_storefront_orders_stripe_session on public.storefront_orders(stripe_checkout_session_id);
create index if not exists idx_storefront_orders_status on public.storefront_orders(status);
create index if not exists idx_storefront_order_items_order_id on public.storefront_order_items(storefront_order_id);
create index if not exists idx_storefront_order_items_product_slug on public.storefront_order_items(product_slug);

drop trigger if exists storefront_orders_set_updated_at on public.storefront_orders;
create trigger storefront_orders_set_updated_at
before update on public.storefront_orders
for each row
execute function public.set_updated_at();

drop trigger if exists storefront_order_items_set_updated_at on public.storefront_order_items;
create trigger storefront_order_items_set_updated_at
before update on public.storefront_order_items
for each row
execute function public.set_updated_at();

alter table public.storefront_orders enable row level security;
alter table public.storefront_order_items enable row level security;

-- Public customer reads stay closed for now. Server-side APIs use the Supabase service role.
