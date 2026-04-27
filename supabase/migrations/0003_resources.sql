-- =====================================================
-- 0003 resources + likes + feedback + reports
-- =====================================================

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  subcategory_id uuid not null references public.subcategories(id) on delete restrict,
  scope text not null default 'local' check (scope in ('national','local')),
  region_id uuid references public.regions(id) on delete set null,

  name text not null,
  summary text,
  description text,

  phone text,
  phone_hint text,
  address text,
  latitude numeric,
  longitude numeric,
  website_url text,
  hours jsonb,

  identity_tags text[] not null default '{}',
  tags text[] not null default '{}',

  source_url text,
  source_org text,

  like_count int not null default 0,
  view_count int not null default 0,

  status text not null default 'active'
    check (status in ('active','pending','ended','archived')),

  submitted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint resources_local_needs_region
    check (scope = 'national' or region_id is not null)
);

create index if not exists resources_subcategory_idx on public.resources (subcategory_id);
create index if not exists resources_region_idx on public.resources (region_id);
create index if not exists resources_status_idx on public.resources (status);
create index if not exists resources_identity_tags_idx on public.resources using gin (identity_tags);
create index if not exists resources_tags_idx on public.resources using gin (tags);
create index if not exists resources_name_trgm_idx on public.resources using gin (name gin_trgm_ops);

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- ----- likes -----
create table if not exists public.resource_likes (
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (resource_id, user_id)
);

create or replace function public.bump_resource_like_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update public.resources set like_count = like_count + 1 where id = new.resource_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.resources set like_count = greatest(like_count - 1, 0) where id = old.resource_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_resource_likes_count on public.resource_likes;
create trigger trg_resource_likes_count
  after insert or delete on public.resource_likes
  for each row execute function public.bump_resource_like_count();

-- ----- feedback -----
create table if not exists public.resource_feedback (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists resource_feedback_resource_idx on public.resource_feedback (resource_id);

-- ----- reports（服務結束 / 資料錯誤 回報） -----
create table if not exists public.resource_reports (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  report_type text not null check (report_type in ('ended','wrong_info','duplicate','other')),
  detail text,
  status text not null default 'open' check (status in ('open','resolved','rejected')),
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists resource_reports_status_idx on public.resource_reports (status);
create index if not exists resource_reports_resource_idx on public.resource_reports (resource_id);

-- ----- RLS -----
alter table public.resources enable row level security;
alter table public.resource_likes enable row level security;
alter table public.resource_feedback enable row level security;
alter table public.resource_reports enable row level security;

-- 所有人看得到 active 資源；admin / moderator 看得到全部
create policy "resources_read_active_or_privileged" on public.resources
  for select using (
    status = 'active'
    or public.is_admin(auth.uid())
    or (region_id is not null and public.is_region_moderator(auth.uid(), region_id))
    or submitted_by = auth.uid()
  );

-- 一般使用者可投稿（status 由 trigger 強制成 pending；MVP 先靠應用層）
create policy "resources_insert_authenticated" on public.resources
  for insert with check (auth.uid() is not null and submitted_by = auth.uid());

-- admin 全寫；地區 moderator 可寫該地區
create policy "resources_update_admin_or_moderator" on public.resources
  for update using (
    public.is_admin(auth.uid())
    or (region_id is not null and public.is_region_moderator(auth.uid(), region_id))
  ) with check (
    public.is_admin(auth.uid())
    or (region_id is not null and public.is_region_moderator(auth.uid(), region_id))
  );

create policy "resources_delete_admin" on public.resources
  for delete using (public.is_admin(auth.uid()));

-- likes：登入者可按／取消自己的讚
create policy "resource_likes_read_all" on public.resource_likes for select using (true);
create policy "resource_likes_insert_self" on public.resource_likes
  for insert with check (auth.uid() = user_id);
create policy "resource_likes_delete_self" on public.resource_likes
  for delete using (auth.uid() = user_id);

-- feedback：登入者可寫；公開可讀
create policy "resource_feedback_read_all" on public.resource_feedback for select using (true);
create policy "resource_feedback_insert_authenticated" on public.resource_feedback
  for insert with check (auth.uid() is not null);

-- reports：登入者可送出；只有 moderator/admin 看與處理
create policy "resource_reports_insert_authenticated" on public.resource_reports
  for insert with check (auth.uid() is not null);
create policy "resource_reports_read_privileged" on public.resource_reports
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.resources r
      join public.region_moderators rm on rm.region_id = r.region_id
      where r.id = resource_reports.resource_id and rm.user_id = auth.uid()
    )
    or user_id = auth.uid()
  );
create policy "resource_reports_update_privileged" on public.resource_reports
  for update using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.resources r
      join public.region_moderators rm on rm.region_id = r.region_id
      where r.id = resource_reports.resource_id and rm.user_id = auth.uid()
    )
  );
