create table if not exists public.fitment_requests (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'new',
  source text not null default 'fitment-help',
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  vin text not null,
  product_slug text,
  product_sku text,
  product_name text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  vehicle_trim text,
  vehicle_engine text,
  decoded_vehicle jsonb not null default '{}'::jsonb,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fitment_requests_status_check check (status in ('new', 'reviewing', 'resolved', 'closed'))
);

create index if not exists idx_fitment_requests_status_created_at on public.fitment_requests(status, created_at desc);
create index if not exists idx_fitment_requests_vin on public.fitment_requests(vin);
create index if not exists idx_fitment_requests_product_slug on public.fitment_requests(product_slug);

drop trigger if exists fitment_requests_set_updated_at on public.fitment_requests;
create trigger fitment_requests_set_updated_at
before update on public.fitment_requests
for each row
execute function public.set_updated_at();

alter table public.fitment_requests enable row level security;

-- Public users submit through server routes with the service role key.
-- No anonymous direct read/write policy is exposed.
