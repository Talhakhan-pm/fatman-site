create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  short_description text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  category_slug text not null references public.categories(slug) on update cascade,
  brand text not null,
  name text not null,
  short_description text,
  price numeric(12,2) not null,
  compare_at numeric(12,2),
  stock_status text not null default 'in-stock',
  image_url text,
  shipping_class text,
  warranty_days integer,
  oem_part_number text,
  published boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_stock_status_check check (stock_status in ('in-stock', 'low-stock', 'preorder'))
);

create table if not exists public.fitment_rules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  year text not null,
  make text not null,
  model text not null,
  variant text,
  engine text not null,
  match_type text not null default 'fits',
  source text,
  confidence numeric(4,3),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fitment_rules_match_type_check check (match_type in ('fits', 'verify', 'no-fit'))
);

create index if not exists idx_products_category_slug on public.products(category_slug);
create index if not exists idx_products_published on public.products(published);
create index if not exists idx_fitment_rules_product_id on public.fitment_rules(product_id);
create index if not exists idx_fitment_rules_lookup on public.fitment_rules(year, make, model, coalesce(variant, ''), engine);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists fitment_rules_set_updated_at on public.fitment_rules;
create trigger fitment_rules_set_updated_at
before update on public.fitment_rules
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.fitment_rules enable row level security;

drop policy if exists "public can read published categories" on public.categories;
create policy "public can read published categories"
on public.categories
for select
using (published = true);

drop policy if exists "public can read published products" on public.products;
create policy "public can read published products"
on public.products
for select
using (published = true);

drop policy if exists "public can read fitment for published products" on public.fitment_rules;
create policy "public can read fitment for published products"
on public.fitment_rules
for select
using (
  exists (
    select 1 from public.products
    where products.id = fitment_rules.product_id
      and products.published = true
  )
);
