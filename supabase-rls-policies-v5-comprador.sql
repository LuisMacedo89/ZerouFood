-- ZerouFood V5 — Permissões para comprador responder contraoferta

alter table offers enable row level security;

drop policy if exists "offers_update_buyer_counter" on offers;
create policy "offers_update_buyer_counter" on offers
for update using (
  auth.uid() = buyer_id
  and status = 'countered'
);
