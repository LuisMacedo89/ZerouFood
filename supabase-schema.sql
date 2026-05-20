-- ZerouFood MVP - estrutura inicial Supabase/PostgreSQL

create table if not exists profiles (
  id uuid primary key,
  name text not null,
  email text unique not null,
  role text not null check (role in ('buyer','seller','admin')),
  created_at timestamp with time zone default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text not null,
  city text,
  status text default 'pending' check (status in ('pending','approved','suspended')),
  created_at timestamp with time zone default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id),
  name text not null,
  description text,
  category text,
  original_price numeric(10,2),
  sale_price numeric(10,2) not null,
  quantity integer default 1,
  expiry_date date,
  status text default 'active' check (status in ('draft','active','paused','sold','removed')),
  created_at timestamp with time zone default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  position integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  amount numeric(10,2) not null,
  counter_amount numeric(10,2),
  status text default 'sent' check (status in ('sent','accepted','rejected','countered','counter_accepted','counter_rejected')),
  message text,
  created_at timestamp with time zone default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  product_id uuid references products(id),
  amount numeric(10,2) not null,
  payment_method text check (payment_method in ('pix','pickup')),
  status text default 'pending' check (status in ('pending','paid','ready','completed','cancelled')),
  created_at timestamp with time zone default now()
);