create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content_html text not null,
  content_markdown text,
  meta_description text,
  image_url text,
  alt_text text,
  tags text[] not null default '{}',
  author text,
  status text not null default 'Draft' check (status in ('Draft', 'Published')),
  source text not null default 'distribb',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_tags_idx
  on public.blog_posts using gin (tags);

create or replace function public.set_blog_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  if new.status = 'Published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before insert or update on public.blog_posts
for each row execute function public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Published blog posts are publicly readable" on public.blog_posts;
create policy "Published blog posts are publicly readable"
  on public.blog_posts for select
  using (status = 'Published');
