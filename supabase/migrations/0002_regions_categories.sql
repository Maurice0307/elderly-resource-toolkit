-- =====================================================
-- 0002 regions + categories + subcategories + region_moderators
-- =====================================================

-- ----- regions -----
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('national','county','district')),
  parent_id uuid references public.regions(id) on delete set null,
  name text not null,
  code text not null unique,            -- TW / TW-TYC / TW-TYC-ZL
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now()
);

create index if not exists regions_level_idx on public.regions (level);
create index if not exists regions_parent_idx on public.regions (parent_id);

-- 補上 profiles.home_region_id 外鍵
alter table public.profiles
  drop constraint if exists profiles_home_region_id_fkey,
  add constraint profiles_home_region_id_fkey
    foreign key (home_region_id) references public.regions(id) on delete set null;

-- ----- region_moderators (多對多) -----
create table if not exists public.region_moderators (
  region_id uuid not null references public.regions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  primary key (region_id, user_id)
);

create index if not exists region_moderators_user_idx on public.region_moderators (user_id);

-- ----- categories -----
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text,
  color text,
  sort_order int not null default 0
);

-- ----- subcategories -----
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  unique (category_id, slug)
);

create index if not exists subcategories_category_idx on public.subcategories (category_id);

-- RLS：分類表全公開讀，只有 admin 寫
alter table public.regions enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.region_moderators enable row level security;

create policy "regions_read_all" on public.regions for select using (true);
create policy "categories_read_all" on public.categories for select using (true);
create policy "subcategories_read_all" on public.subcategories for select using (true);

-- helper：判斷使用者是否為 admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

-- helper：判斷使用者是否為某地區的 moderator
create or replace function public.is_region_moderator(uid uuid, rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.region_moderators rm
    where rm.user_id = uid and rm.region_id = rid
  );
$$;

create policy "regions_admin_write" on public.regions
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "categories_admin_write" on public.categories
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "subcategories_admin_write" on public.subcategories
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "region_moderators_read_self_or_admin" on public.region_moderators
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "region_moderators_admin_write" on public.region_moderators
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
