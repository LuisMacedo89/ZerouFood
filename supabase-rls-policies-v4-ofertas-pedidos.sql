-- ZerouFood V4 — Políticas para pedidos e ofertas

alter table offers enable row level security;
alter table orders enable row level security;

drop policy if exists "offers_select_participants" on offers;
create policy "offers_select_participants" on offers
for select using (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

drop policy if exists "offers_insert_authenticated" on offers;
create policy "offers_insert_authenticated" on offers
for insert to authenticated
with check (auth.uid() = buyer_id);

drop policy if exists "offers_update_seller" on offers;
create policy "offers_update_seller" on offers
for update using (auth.uid() = seller_id);

drop policy if exists "orders_select_participants" on orders;
create policy "orders_select_participants" on orders
for select using (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

drop policy if exists "orders_insert_authenticated" on orders;
create policy "orders_insert_authenticated" on orders
for insert to authenticated
with check (auth.uid() = buyer_id);

drop policy if exists "orders_update_seller" on orders;
create policy "orders_update_seller" on orders
for update using (auth.uid() = seller_id);
