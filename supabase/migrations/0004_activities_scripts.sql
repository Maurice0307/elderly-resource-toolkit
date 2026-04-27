-- =====================================================
-- 0004 activity_cards + communication_scripts
-- =====================================================

-- ----- activity_cards -----
create table if not exists public.activity_cards (
  id uuid primary key default gen_random_uuid(),
  group_slug text not null check (group_slug in ('move','create','smart')),
  slug text not null unique,
  title text not null,
  summary text,
  cover_emoji text,
  identity_tags text[] not null default '{}',
  steps jsonb not null default '[]',
  -- steps: [{order, title, description, tip?}]
  tags text[] not null default '{}',
  like_count int not null default 0,
  status text not null default 'active' check (status in ('active','draft','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_cards_group_idx on public.activity_cards (group_slug);
create index if not exists activity_cards_status_idx on public.activity_cards (status);

drop trigger if exists set_activity_cards_updated_at on public.activity_cards;
create trigger set_activity_cards_updated_at
  before update on public.activity_cards
  for each row execute function public.set_updated_at();

-- ----- communication_scripts -----
create table if not exists public.communication_scripts (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('volunteer','family','difficult')),
  slug text not null unique,
  title text not null,
  context text,            -- 情境說明
  ok_examples jsonb not null default '[]',
  -- [{role, text}]
  ng_examples jsonb not null default '[]',
  -- [{role, text, reason?}]
  tips text[] not null default '{}',
  tags text[] not null default '{}',
  like_count int not null default 0,
  status text not null default 'active' check (status in ('active','draft','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comm_scripts_audience_idx on public.communication_scripts (audience);

drop trigger if exists set_comm_scripts_updated_at on public.communication_scripts;
create trigger set_comm_scripts_updated_at
  before update on public.communication_scripts
  for each row execute function public.set_updated_at();

-- ----- RLS -----
alter table public.activity_cards enable row level security;
alter table public.communication_scripts enable row level security;

create policy "activity_cards_read_active" on public.activity_cards
  for select using (status = 'active' or public.is_admin(auth.uid()));

create policy "activity_cards_admin_write" on public.activity_cards
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "comm_scripts_read_active" on public.communication_scripts
  for select using (status = 'active' or public.is_admin(auth.uid()));

create policy "comm_scripts_admin_write" on public.communication_scripts
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
