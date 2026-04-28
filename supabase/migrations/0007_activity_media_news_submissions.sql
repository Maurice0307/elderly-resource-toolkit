-- =====================================================
-- 0007 activity media + daily news + community submissions
-- =====================================================
-- Adds:
--   1. activity_cards: cover/hero/video/source columns
--      (steps jsonb gains optional image_url / video_url / video_start)
--   2. daily_news: aggregated elderly-friendly news cards
--   3. community_submissions: public submissions of activities/scripts
-- =====================================================

-- ─── 1. activity_cards extra columns ───────────────────
alter table public.activity_cards
  add column if not exists cover_image_url text,
  add column if not exists hero_image_url  text,
  add column if not exists video_url       text,
  add column if not exists video_provider  text
    check (video_provider in ('youtube','vimeo','self','none')),
  add column if not exists source_url      text,
  add column if not exists source_org      text,
  add column if not exists duration_min    int;

-- relax group_slug to allow new theme groups (handbook content)
alter table public.activity_cards drop constraint if exists activity_cards_group_slug_check;
alter table public.activity_cards add  constraint activity_cards_group_slug_check
  check (group_slug in ('move','create','smart','health','life'));

-- ─── 2. daily_news ─────────────────────────────────────
create table if not exists public.daily_news (
  id            uuid primary key default gen_random_uuid(),
  source_org    text not null,                     -- e.g. "幸福熟齡"
  source_url    text not null unique,
  title         text not null,
  summary_md    text not null,                     -- LLM-rewritten elderly-friendly bullets
  image_url     text,                              -- og:image
  tags          text[] not null default '{}',
  published_at  timestamptz,
  fetched_at    timestamptz not null default now(),
  status        text not null default 'active'
                  check (status in ('active','hidden','draft')),
  created_at    timestamptz not null default now()
);

create index if not exists daily_news_status_published_idx
  on public.daily_news (status, published_at desc);
create index if not exists daily_news_fetched_idx
  on public.daily_news (fetched_at desc);

alter table public.daily_news enable row level security;

drop policy if exists "daily_news_read_active" on public.daily_news;
create policy "daily_news_read_active" on public.daily_news
  for select using (status = 'active' or public.is_admin(auth.uid()));

drop policy if exists "daily_news_admin_write" on public.daily_news;
create policy "daily_news_admin_write" on public.daily_news
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── 3. community_submissions ──────────────────────────
-- 大眾投稿的「活動」或「溝通方法」, 後台審核後轉成正式卡
create table if not exists public.community_submissions (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('activity','script')),
  title         text not null,
  payload       jsonb not null default '{}',       -- 完整草稿: {summary, steps[], tips[], ...}
  source_url    text,
  contact       text,                              -- 投稿者聯絡方式 (optional)
  submitted_by  uuid references public.profiles(id) on delete set null,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected','needs_more_info')),
  review_notes  text,
  reviewed_by   uuid references public.profiles(id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists community_submissions_status_idx
  on public.community_submissions (status, created_at desc);
create index if not exists community_submissions_type_idx
  on public.community_submissions (type);

drop trigger if exists set_community_submissions_updated_at
  on public.community_submissions;
create trigger set_community_submissions_updated_at
  before update on public.community_submissions
  for each row execute function public.set_updated_at();

alter table public.community_submissions enable row level security;

-- 投稿者可看見自己的投稿；admin 可看全部
drop policy if exists "submissions_select_own_or_admin" on public.community_submissions;
create policy "submissions_select_own_or_admin" on public.community_submissions
  for select using (
    submitted_by = auth.uid() or public.is_admin(auth.uid())
  );

-- 已登入用戶都可以投稿
drop policy if exists "submissions_insert_authed" on public.community_submissions;
create policy "submissions_insert_authed" on public.community_submissions
  for insert with check (auth.uid() is not null);

-- 只有 admin 可以更新狀態
drop policy if exists "submissions_admin_update" on public.community_submissions;
create policy "submissions_admin_update" on public.community_submissions
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
