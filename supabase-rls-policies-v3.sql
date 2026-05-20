-- ZerouFood V3 — Políticas básicas para MVP
-- Rode este SQL no Supabase SQL Editor se der erro ao cadastrar/listar produtos.

alter table profiles enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table offers enable row level security;
alter table orders enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
for update using (auth.uid() = id);

drop policy if exists "stores_select_public" on stores;
create policy "stores_select_public" on stores
for select using (true);

drop policy if exists "stores_insert_own" on stores;
create policy "stores_insert_own" on stores
for insert with check (auth.uid() = owner_id);

drop policy if exists "stores_update_own" on stores;
create policy "stores_update_own" on stores
for update using (auth.uid() = owner_id);

drop policy if exists "products_select_public" on products;
create policy "products_select_public" on products
for select using (true);

drop policy if exists "products_insert_own_store" on products;
create policy "products_insert_own_store" on products
for insert with check (
  exists (
    select 1 from stores
    where stores.id = products.store_id
    and stores.owner_id = auth.uid()
  )
);

drop policy if exists "products_update_own_store" on products;
create policy "products_update_own_store" on products
for update using (
  exists (
    select 1 from stores
    where stores.id = products.store_id
    and stores.owner_id = auth.uid()
  )
);

drop policy if exists "product_images_select_public" on product_images;
create policy "product_images_select_public" on product_images
for select using (true);

drop policy if exists "product_images_insert_own_product" on product_images;
create policy "product_images_insert_own_product" on product_images
for insert with check (
  exists (
    select 1
    from products
    join stores on stores.id = products.store_id
    where products.id = product_images.product_id
    and stores.owner_id = auth.uid()
  )
);
