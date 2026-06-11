-- =====================================================
-- 帳號綁定：一個主帳號可連結多個登入方式（LINE / Google / 手機）
-- 避免同一人用不同方式登入時產生重複帳號，紀錄集中於主帳號。
-- =====================================================

create table if not exists public.account_links (
  provider     text not null check (provider in ('line','google','phone','email')),
  provider_key text not null,                       -- LINE userId / Google email / 手機 E.164
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (provider, provider_key)
);

create index if not exists account_links_user_idx on public.account_links (user_id);

-- 僅服務端（service role）讀寫；一般使用者不可直接存取
alter table public.account_links enable row level security;
