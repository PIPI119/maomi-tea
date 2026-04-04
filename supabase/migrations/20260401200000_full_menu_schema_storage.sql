-- MAOMI: categories, products, modifiers, app_settings, storage buckets, RLS, seed data
-- Run in Supabase SQL Editor (or supabase db push). Prices in UAH (₴).

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid (),
  name_ua text not null,
  name_en text not null,
  order_index int not null default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid (),
  category_id uuid not null references public.categories (id) on delete cascade,
  name_ua text not null,
  name_en text not null,
  description_ua text not null default '',
  description_en text not null default '',
  price_base_uah int not null,
  price_large_uah int not null,
  image_url text not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);

create table if not exists public.modifiers (
  id uuid primary key default gen_random_uuid (),
  modifier_type text not null check (modifier_type in ('topping', 'extra')),
  name_ua text not null,
  name_en text not null,
  extra_price_uah int not null default 0,
  is_available boolean not null default true
);

create index if not exists modifiers_type_idx on public.modifiers (modifier_type);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid (),
  logo_url text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- STORAGE (public buckets)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true), ('brand-assets', 'brand-assets', true)
on conflict (id) do update
set public = excluded.public;

-- ---------------------------------------------------------------------------
-- RLS: tables
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.modifiers enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories for select using (true);
drop policy if exists "categories_insert_auth" on public.categories;
create policy "categories_insert_auth" on public.categories for insert to authenticated with check (true);
drop policy if exists "categories_update_auth" on public.categories;
create policy "categories_update_auth" on public.categories for update to authenticated using (true) with check (true);
drop policy if exists "categories_delete_auth" on public.categories;
create policy "categories_delete_auth" on public.categories for delete to authenticated using (true);

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products for select using (true);
drop policy if exists "products_insert_auth" on public.products;
create policy "products_insert_auth" on public.products for insert to authenticated with check (true);
drop policy if exists "products_update_auth" on public.products;
create policy "products_update_auth" on public.products for update to authenticated using (true) with check (true);
drop policy if exists "products_delete_auth" on public.products;
create policy "products_delete_auth" on public.products for delete to authenticated using (true);

drop policy if exists "modifiers_select_public" on public.modifiers;
create policy "modifiers_select_public" on public.modifiers for select using (true);
drop policy if exists "modifiers_insert_auth" on public.modifiers;
create policy "modifiers_insert_auth" on public.modifiers for insert to authenticated with check (true);
drop policy if exists "modifiers_update_auth" on public.modifiers;
create policy "modifiers_update_auth" on public.modifiers for update to authenticated using (true) with check (true);
drop policy if exists "modifiers_delete_auth" on public.modifiers;
create policy "modifiers_delete_auth" on public.modifiers for delete to authenticated using (true);

drop policy if exists "Allow public read app_settings" on public.app_settings;
drop policy if exists "app_settings_select_public" on public.app_settings;
create policy "app_settings_select_public" on public.app_settings for select using (true);
drop policy if exists "app_settings_insert_auth" on public.app_settings;
create policy "app_settings_insert_auth" on public.app_settings for insert to authenticated with check (true);
drop policy if exists "app_settings_update_auth" on public.app_settings;
create policy "app_settings_update_auth" on public.app_settings for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- RLS: storage.objects
-- ---------------------------------------------------------------------------
drop policy if exists "storage_public_read_maomi" on storage.objects;
create policy "storage_public_read_maomi" on storage.objects for select using (bucket_id in ('product-images', 'brand-assets'));

drop policy if exists "storage_auth_insert_maomi" on storage.objects;
create policy "storage_auth_insert_maomi" on storage.objects for insert to authenticated with check (bucket_id in ('product-images', 'brand-assets'));

drop policy if exists "storage_auth_update_maomi" on storage.objects;
create policy "storage_auth_update_maomi" on storage.objects for update to authenticated using (bucket_id in ('product-images', 'brand-assets')) with check (bucket_id in ('product-images', 'brand-assets'));

drop policy if exists "storage_auth_delete_maomi" on storage.objects;
create policy "storage_auth_delete_maomi" on storage.objects for delete to authenticated using (bucket_id in ('product-images', 'brand-assets'));

-- ---------------------------------------------------------------------------
-- SEED: categories (fixed UUIDs)
-- ---------------------------------------------------------------------------
insert into public.categories (id, name_ua, name_en, order_index) values
  ('a0000001-0000-4000-8000-000000000001', 'MILK BUBBLE', 'Milk Bubble', 0),
  ('a0000001-0000-4000-8000-000000000002', 'FRUIT BUBBLE', 'Fruit Bubble', 1),
  ('a0000001-0000-4000-8000-000000000003', 'TEA', 'Tea', 2),
  ('a0000001-0000-4000-8000-000000000004', 'COFFEE', 'Coffee', 3)
on conflict (id) do update set
  name_ua = excluded.name_ua,
  name_en = excluded.name_en,
  order_index = excluded.order_index;

-- ---------------------------------------------------------------------------
-- SEED: products
-- ---------------------------------------------------------------------------
insert into public.products (id, category_id, name_ua, name_en, description_ua, description_en, price_base_uah, price_large_uah, image_url, is_available) values
  ('b0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 'Таро', 'Taro', 'Молочний бабл з таро.', 'Milk bubble with taro.', 140, 160, 'https://picsum.photos/seed/maomi-taro/400/500', true),
  ('b0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000001', 'Полуниця', 'Strawberry', 'Молочний бабл з полуницею.', 'Milk bubble with strawberry.', 140, 160, 'https://picsum.photos/seed/maomi-strawb/400/500', true),
  ('b0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000001', 'Матча', 'Matcha', 'Молочний бабл з матчею.', 'Milk bubble with matcha.', 140, 160, 'https://picsum.photos/seed/maomi-matcha/400/500', true),
  ('b0000001-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000001', 'Кокос', 'Coconut', 'Молочний бабл з кокосом.', 'Milk bubble with coconut.', 140, 160, 'https://picsum.photos/seed/maomi-coco/400/500', true),
  ('b0000001-0000-4000-8000-000000000005', 'a0000001-0000-4000-8000-000000000001', 'Манго', 'Mango', 'Молочний бабл з манго.', 'Milk bubble with mango.', 140, 160, 'https://picsum.photos/seed/maomi-mango-milk/400/500', true),
  ('b0000001-0000-4000-8000-000000000006', 'a0000001-0000-4000-8000-000000000002', 'Фруктовий бабл', 'Fruit Bubble', 'Універсальний фруктовий бабл.', 'Generic fruit bubble tea.', 140, 160, 'https://picsum.photos/seed/maomi-fruit/400/500', true),
  ('b0000001-0000-4000-8000-000000000007', 'a0000001-0000-4000-8000-000000000003', 'Ассам', 'Assam', 'Чай Ассам.', 'Assam tea.', 140, 160, 'https://picsum.photos/seed/maomi-assam/400/500', true),
  ('b0000001-0000-4000-8000-000000000008', 'a0000001-0000-4000-8000-000000000003', 'Улун', 'Oolong', 'Чай улун.', 'Oolong tea.', 140, 160, 'https://picsum.photos/seed/maomi-oolong/400/500', true),
  ('b0000001-0000-4000-8000-000000000009', 'a0000001-0000-4000-8000-000000000003', 'Ерл Грей', 'Earl Grey', 'Чай Ерл Грей.', 'Earl Grey tea.', 140, 160, 'https://picsum.photos/seed/maomi-earl/400/500', true),
  ('b0000001-0000-4000-8000-000000000010', 'a0000001-0000-4000-8000-000000000003', 'Жасмин', 'Jasmine', 'Жасминовий чай.', 'Jasmine tea.', 140, 160, 'https://picsum.photos/seed/maomi-jasmine/400/500', true),
  ('b0000001-0000-4000-8000-000000000011', 'a0000001-0000-4000-8000-000000000003', 'Класичний', 'Classic', 'Класичний чай.', 'Classic tea.', 140, 160, 'https://picsum.photos/seed/maomi-classic-tea/400/500', true),
  ('b0000001-0000-4000-8000-000000000012', 'a0000001-0000-4000-8000-000000000003', 'Карамель', 'Caramel', 'Карамельний чай.', 'Caramel tea.', 140, 160, 'https://picsum.photos/seed/maomi-caramel-tea/400/500', true),
  ('b0000001-0000-4000-8000-000000000013', 'a0000001-0000-4000-8000-000000000004', 'Еспресо', 'Espresso', 'Еспресо.', 'Espresso.', 50, 70, 'https://picsum.photos/seed/maomi-espresso/400/500', true),
  ('b0000001-0000-4000-8000-000000000014', 'a0000001-0000-4000-8000-000000000004', 'Американо', 'Americano', 'Американо.', 'Americano.', 50, 70, 'https://picsum.photos/seed/maomi-americano/400/500', true),
  ('b0000001-0000-4000-8000-000000000015', 'a0000001-0000-4000-8000-000000000004', 'Лате', 'Latte', 'Лате.', 'Latte.', 75, 95, 'https://picsum.photos/seed/maomi-latte/400/500', true),
  ('b0000001-0000-4000-8000-000000000016', 'a0000001-0000-4000-8000-000000000004', 'Капучино', 'Cappuccino', 'Капучино.', 'Cappuccino.', 70, 90, 'https://picsum.photos/seed/maomi-cap/400/500', true),
  ('b0000001-0000-4000-8000-000000000017', 'a0000001-0000-4000-8000-000000000004', 'Флет уайт', 'Flat White', 'Флет уайт.', 'Flat white.', 90, 110, 'https://picsum.photos/seed/maomi-fw/400/500', true),
  ('b0000001-0000-4000-8000-000000000018', 'a0000001-0000-4000-8000-000000000004', 'Бабл лате', 'Bubble Latte', 'Бабл лате.', 'Bubble latte.', 140, 160, 'https://picsum.photos/seed/maomi-bubble-latte/400/500', true),
  ('b0000001-0000-4000-8000-000000000019', 'a0000001-0000-4000-8000-000000000004', 'Бабл какао', 'Bubble Cocoa', 'Бабл какао.', 'Bubble cocoa.', 140, 160, 'https://picsum.photos/seed/maomi-bubble-cocoa/400/500', true)
on conflict (id) do update set
  category_id = excluded.category_id,
  name_ua = excluded.name_ua,
  name_en = excluded.name_en,
  description_ua = excluded.description_ua,
  description_en = excluded.description_en,
  price_base_uah = excluded.price_base_uah,
  price_large_uah = excluded.price_large_uah,
  image_url = excluded.image_url,
  is_available = excluded.is_available;

-- ---------------------------------------------------------------------------
-- SEED: modifiers (toppings +50, extras as listed)
-- ---------------------------------------------------------------------------
insert into public.modifiers (id, modifier_type, name_ua, name_en, extra_price_uah, is_available) values
  ('e0000001-0000-4000-8000-000000000001', 'topping', 'Тапіока · Класична', 'Tapioca · Classic', 50, true),
  ('e0000001-0000-4000-8000-000000000002', 'topping', 'Тапіока · Полуниця', 'Tapioca · Strawberry', 50, true),
  ('e0000001-0000-4000-8000-000000000003', 'topping', 'Тапіока · Манго', 'Tapioca · Mango', 50, true),
  ('e0000001-0000-4000-8000-000000000004', 'topping', 'Желе · Манго', 'Jelly · Mango', 50, true),
  ('e0000001-0000-4000-8000-000000000005', 'topping', 'Желе · Тропік', 'Jelly · Tropical', 50, true),
  ('e0000001-0000-4000-8000-000000000006', 'topping', 'Боба · Полуниця', 'Boba · Strawberry', 50, true),
  ('e0000001-0000-4000-8000-000000000007', 'topping', 'Боба · Персик', 'Boba · Peach', 50, true),
  ('e0000001-0000-4000-8000-000000000008', 'topping', 'Боба · Манго', 'Boba · Mango', 50, true),
  ('e0000001-0000-4000-8000-000000000009', 'topping', 'Боба · Драконфрут', 'Boba · Dragon Fruit', 50, true),
  ('e0000001-0000-4000-8000-000000000010', 'topping', 'Боба · Лічі', 'Boba · Lychee', 50, true),
  ('e0000001-0000-4000-8000-000000000011', 'topping', 'Боба · Банан', 'Boba · Banana', 50, true),
  ('e0000001-0000-4000-8000-000000000012', 'topping', 'Боба · Лайм', 'Boba · Lime', 50, true),
  ('e0000001-0000-4000-8000-000000000013', 'topping', 'Боба · Маракуйя', 'Boba · Passion Fruit', 50, true),
  ('e0000001-0000-4000-8000-000000000014', 'topping', 'Боба · Чорниця', 'Boba · Blueberry', 50, true),
  ('e0000001-0000-4000-8000-000000000015', 'extra', 'Сирна піна', 'Cheese Cream Foam', 30, true),
  ('e0000001-0000-4000-8000-000000000016', 'extra', 'Карамель', 'Caramel', 15, true),
  ('e0000001-0000-4000-8000-000000000017', 'extra', 'Молоко без лактози', 'Lactose-free milk', 10, true)
on conflict (id) do update set
  modifier_type = excluded.modifier_type,
  name_ua = excluded.name_ua,
  name_en = excluded.name_en,
  extra_price_uah = excluded.extra_price_uah,
  is_available = excluded.is_available;

-- ---------------------------------------------------------------------------
-- SEED: app_settings (logo placeholder)
-- ---------------------------------------------------------------------------
insert into public.app_settings (logo_url)
select 'https://placehold.co/96x96/4A7344/FFFDD0/png?text=M'
where not exists (select 1 from public.app_settings limit 1);
