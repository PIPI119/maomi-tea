-- MAOMI: Products RLS — public read, authenticated full write (insert/update/delete).
-- Run in Supabase SQL Editor or via `supabase db push`.
-- Fixes silent failures when authenticated lacks matching policies.

alter table public.products enable row level security;

-- Remove previous policies (names from MAOMI migration; safe if missing)
drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_insert_auth" on public.products;
drop policy if exists "products_update_auth" on public.products;
drop policy if exists "products_delete_auth" on public.products;
drop policy if exists "products_authenticated_all" on public.products;
drop policy if exists "Enable all for authenticated users" on public.products;

-- Anyone can read the menu (storefront + anon key)
create policy "products_select_public"
  on public.products
  for select
  using (true);

-- Logged-in admins: full CRUD (requires Supabase Auth session on client)
create policy "Enable all for authenticated users"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);
