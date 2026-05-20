create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'new',
  source text not null default 'contact-form',
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  subject text,
  vin text,
  order_number text,
  product_slug text,
  product_sku text,
  product_name text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_requests_status_check check (status in ('new', 'reviewing', 'resolved', 'closed'))
);

create index if not exists idx_contact_requests_status_created_at on public.contact_requests(status, created_at desc);
create index if not exists idx_contact_requests_email on public.contact_requests(customer_email);
create index if not exists idx_contact_requests_vin on public.contact_requests(vin);

drop trigger if exists contact_requests_set_updated_at on public.contact_requests;
create trigger contact_requests_set_updated_at
before update on public.contact_requests
for each row
execute function public.set_updated_at();

alter table public.contact_requests enable row level security;

-- Public users submit through server routes with the service role key.
-- No anonymous direct read/write policy is exposed.
