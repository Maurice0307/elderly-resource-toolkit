-- =====================================================
-- 0015 伺服器端收藏（供「多人推薦」排序）+ 聊天 LINE 頭貼
-- =====================================================

-- 收藏計數（顯示與排序用，去正規化欄位）
alter table public.resources
  add column if not exists bookmark_count int not null default 0;

-- 每位使用者的收藏（避免重複計數、可在個人中心列出）
create table if not exists public.resource_bookmarks (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, resource_id)
);
alter table public.resource_bookmarks enable row level security;

-- 聊天對方（LINE 使用者）大頭貼網址
alter table public.line_messages
  add column if not exists avatar_url text;
