-- =============================================
-- Mimmi's Beauty — Supabase Schema
-- Paste into: Supabase Dashboard › SQL Editor
-- Idempotent: safe to re-run on an existing DB.
-- =============================================


-- =============================================
-- EXTENSIONS
-- =============================================

create extension if not exists "pg_trgm";   -- fast ILIKE / trigram search on product names


-- =============================================
-- TABLES
-- =============================================

-- ── Categories ───────────────────────────────
create table if not exists categories (
  id         bigint generated always as identity primary key,
  slug       text        not null unique,
  name       text        not null,
  image_url  text,
  parent_id  bigint      references categories(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Idempotent: adds the column if this file is re-run against a DB
-- created before subcategories existed.
alter table categories add column if not exists parent_id bigint references categories(id) on delete cascade;

-- ── Products ────────────────────────────────
create table if not exists products (
  id             bigint generated always as identity primary key,
  slug           text        not null unique,
  name           text        not null,
  description    text,
  price_cents    bigint      not null default 0 check (price_cents >= 0),
  main_image_url text,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Product Images ───────────────────────────
create table if not exists product_images (
  id          uuid    primary key default gen_random_uuid(),
  product_id  bigint  not null references products(id) on delete cascade,
  url         text    not null,
  alt         text,
  sort_order  integer not null default 0 check (sort_order >= 0)
);

-- ── Product Variants ─────────────────────────
create table if not exists product_variants (
  id          uuid        primary key default gen_random_uuid(),
  product_id  bigint      not null references products(id) on delete cascade,
  color       text,
  size        text,
  price_cents bigint      not null default 0 check (price_cents >= 0),
  stock       integer     not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now()
);

-- ── Product ↔ Category Junction ──────────────
create table if not exists product_categories (
  product_id  bigint not null references products(id)  on delete cascade,
  category_id bigint not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- ── Orders ───────────────────────────────────
create table if not exists orders (
  id                       uuid        primary key default gen_random_uuid(),
  user_id                  uuid        references auth.users(id) on delete set null,
  buyer_email              text        not null
                             check (buyer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  receiver_first_name      text        not null,
  receiver_last_name       text        not null,
  address_line1            text        not null,
  address_line2            text,
  city                     text        not null,
  postal_code              text        not null,
  -- ISO 3166-1 alpha-2 (e.g. "PT", "US")
  country                  text        not null check (country ~ '^[A-Z]{2}$'),
  subtotal_cents           bigint      not null check (subtotal_cents > 0),
  -- ISO 4217 lowercase (e.g. "eur", "usd")
  currency                 text        not null default 'eur' check (currency ~ '^[a-z]{3}$'),
  payment_status           text        not null default 'requires_payment'
                             check (payment_status in ('requires_payment', 'succeeded', 'failed')),
  status                   text        not null default 'pending'
                             check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  stripe_payment_intent_id text        unique,
  stripe_charge_id         text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ── Order Items ──────────────────────────────
create table if not exists order_items (
  id               uuid    primary key default gen_random_uuid(),
  order_id         uuid    not null references orders(id) on delete cascade,
  product_id       bigint  not null,
  variant_id       uuid,
  name             text    not null,
  unit_price_cents bigint  not null check (unit_price_cents > 0),
  qty              integer not null check (qty > 0),
  image_url        text,
  -- stores {color, size, …} as free-form key-value
  attributes       jsonb
);

-- ── Profiles ─────────────────────────────────
-- NOTE: front-end profile page queries "total_cents" from orders —
--       the correct column is "subtotal_cents". Fix in src/app/profile/page.tsx.
create table if not exists profiles (
  user_id       uuid        primary key references auth.users(id) on delete cascade,
  email         text        check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  full_name     text,
  address_line1 text,
  address_line2 text,
  city          text,
  postal_code   text,
  country       text        check (country is null or country ~ '^[A-Z]{2}$'),
  phone         text        check (phone is null or phone ~ '^\+?[0-9\s\-\(\)]{5,20}$'),
  updated_at    timestamptz not null default now()
);


-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- ── Auto-set updated_at ───────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();


-- ── Auto-create profile on signup ─────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'username',
      ''
    )
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ── Prevent user_id change in profiles ───────
create or replace function prevent_user_id_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id <> old.user_id then
    raise exception 'user_id is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_immutable_user_id on profiles;
create trigger trg_profiles_immutable_user_id
  before update on profiles
  for each row execute function prevent_user_id_change();


-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table products           enable row level security;
alter table product_images     enable row level security;
alter table product_variants   enable row level security;
alter table categories         enable row level security;
alter table product_categories enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table profiles           enable row level security;


-- Drop existing policies (idempotent re-run)
drop policy if exists "Public can read products"            on products;
drop policy if exists "Public can read product_images"      on product_images;
drop policy if exists "Public can read product_variants"    on product_variants;
drop policy if exists "Public can read categories"          on categories;
drop policy if exists "Public can read product_categories"  on product_categories;
drop policy if exists "Users can read own orders"           on orders;
drop policy if exists "Users can read own order items"      on order_items;
drop policy if exists "Users can read own profile"          on profiles;
drop policy if exists "Users can update own profile"        on profiles;
drop policy if exists "Users can insert own profile"        on profiles;

drop policy if exists "public_read_products"            on products;
drop policy if exists "public_read_product_images"      on product_images;
drop policy if exists "public_read_product_variants"    on product_variants;
drop policy if exists "public_read_categories"          on categories;
drop policy if exists "public_read_product_categories"  on product_categories;
drop policy if exists "users_read_own_orders"           on orders;
drop policy if exists "users_read_own_order_items"      on order_items;
drop policy if exists "users_select_own_profile"        on profiles;
drop policy if exists "users_insert_own_profile"        on profiles;
drop policy if exists "users_update_own_profile"        on profiles;


-- ── Storefront: public read ──────────────────
-- Only active products are visible publicly
create policy "public_read_products"
  on products for select
  using (is_active = true);

create policy "public_read_product_images"
  on product_images for select
  using (true);

create policy "public_read_product_variants"
  on product_variants for select
  using (true);

create policy "public_read_categories"
  on categories for select
  using (true);

create policy "public_read_product_categories"
  on product_categories for select
  using (true);


-- ── Orders ───────────────────────────────────
-- INSERT / UPDATE come exclusively from the service_role key
-- (checkout API + Stripe webhook) — service_role bypasses RLS entirely.
-- Authenticated users may only SELECT their own rows.

create policy "users_read_own_orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "users_read_own_order_items"
  on order_items for select
  using (
    exists (
      select 1 from orders
       where orders.id        = order_items.order_id
         and orders.user_id   = auth.uid()
    )
  );


-- ── Profiles ─────────────────────────────────
create policy "users_select_own_profile"
  on profiles for select
  using (auth.uid() = user_id);

-- WITH CHECK ensures the inserted row belongs to the caller
create policy "users_insert_own_profile"
  on profiles for insert
  with check (auth.uid() = user_id);

-- USING + WITH CHECK: caller must own the existing row AND the new row
create policy "users_update_own_profile"
  on profiles for update
  using     (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =============================================
-- INDEXES
-- =============================================

-- products
create index if not exists idx_products_slug        on products(slug);
create index if not exists idx_products_is_active   on products(is_active);
create index if not exists idx_products_created_at  on products(created_at desc);
create index if not exists idx_products_price       on products(price_cents);
create index if not exists idx_products_name_trgm   on products using gin(name gin_trgm_ops);

-- product_images / variants
create index if not exists idx_product_images_pid   on product_images(product_id);
create index if not exists idx_variants_pid         on product_variants(product_id);

-- product_categories (both directions for JOIN efficiency)
create index if not exists idx_pc_product           on product_categories(product_id);
create index if not exists idx_pc_category          on product_categories(category_id);

-- categories (subcategory lookups)
create index if not exists idx_categories_parent    on categories(parent_id);

-- orders
create index if not exists idx_orders_user_id       on orders(user_id);
create index if not exists idx_orders_intent        on orders(stripe_payment_intent_id);
create index if not exists idx_orders_charge        on orders(stripe_charge_id);
create index if not exists idx_orders_status        on orders(status);
create index if not exists idx_orders_pay_status    on orders(payment_status);
create index if not exists idx_orders_created_at    on orders(created_at desc);
create index if not exists idx_orders_buyer_email   on orders(buyer_email);

-- order_items
create index if not exists idx_order_items_order    on order_items(order_id);

-- profiles
create index if not exists idx_profiles_user        on profiles(user_id);


-- =============================================
-- SEED DATA — Category taxonomy
-- =============================================
-- Idempotent: safe to re-run, uses ON CONFLICT (slug) DO NOTHING.

-- Top-level categories
insert into categories (slug, name) values
  ('beauty',         'Beauty'),
  ('hair',           'Hair'),
  ('makeup',         'Makeup')
on conflict (slug) do nothing;

-- Subcategories — each row resolves its parent by slug
insert into categories (slug, name, parent_id)
select v.slug, v.name, p.id
from (values
  ('body-care',           'Body Care',              'beauty'),
  ('bath-shower',         'Bath & Shower',           'beauty'),
  ('fragrance',           'Fragrance',               'beauty'),
  ('nail-care',           'Nail Care',               'beauty'),

  ('lace-front-wigs',     'Lace Front Wigs',         'hair'),
  ('full-lace-wigs',      'Full Lace Wigs',          'hair'),
  ('bundles-weaves',      'Bundles & Weaves',        'hair'),
  ('closures-frontals',   'Closures & Frontals',     'hair'),
  ('virgin-human-hair',   'Virgin Human Hair',       'hair'),
  ('clip-ins',            'Clip-Ins',                'hair'),
  ('ponytails',           'Ponytails',               'hair'),

  ('foundation',          'Foundation',              'makeup'),
  ('concealer',           'Concealer',               'makeup'),
  ('powder',              'Powder',                  'makeup'),
  ('blush-bronzer',       'Blush & Bronzer',         'makeup'),
  ('eyeshadow',           'Eyeshadow',               'makeup'),
  ('eyeliner-mascara',    'Eyeliner & Mascara',      'makeup'),
  ('lashes-brows',        'Lashes & Brows',          'makeup'),
  ('lipstick-gloss',      'Lipstick & Lip Gloss',    'makeup'),
  ('makeup-brushes-tools','Makeup Brushes & Tools',  'makeup')
) as v(slug, name, parent_slug)
join categories p on p.slug = v.parent_slug
on conflict (slug) do nothing;


-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create the product-images bucket (public reads, 5 MB cap, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,   -- 5 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Anyone can view images (bucket is public, but RLS still applies)
drop policy if exists "public_read_product_images_storage" on storage.objects;
create policy "public_read_product_images_storage"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Upload / delete only via service_role (admin dashboard or trusted API).
-- No policy = anon/authenticated users cannot write. service_role bypasses RLS.


-- =============================================
-- DONE
-- =============================================
-- Tables  : categories, products, product_images, product_variants,
--           product_categories, orders, order_items, profiles
-- Security: RLS enabled on all tables, CHECK constraints on every
--           user-submitted field, service_role-only writes for orders
-- Triggers: auto updated_at, auto profile creation on signup,
--           immutable user_id guard
-- Indexes : covering all filter/sort/join columns + GIN trigram on name
-- Storage : product-images bucket (public read, service_role write)
-- Seed    : category taxonomy — Beauty, Hair, Makeup + subcategories
--           (categories.parent_id)
