-- MAOMI: single-row-style settings for public client reads (e.g. header logo)
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid (),
  logo_url text not null,
  updated_at timestamptz not null default now()
);

comment on table public.app_settings is 'App-wide settings readable by the storefront (e.g. logo_url).';

alter table public.app_settings enable row level security;

create policy "Allow public read app_settings"
  on public.app_settings
  for select
  to anon, authenticated
  using (true);

-- Seed default placeholder (skip if a row already exists)
insert into public.app_settings (logo_url)
select 'https://placehold.co/96x96/4A7344/FFFDD0/png?text=M'
where not exists (select 1 from public.app_settings);
