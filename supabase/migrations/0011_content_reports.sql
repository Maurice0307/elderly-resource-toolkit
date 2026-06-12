-- =====================================================
-- 0011 內容問題回報（資源/活動/錦囊/新知 的回報按鈕）
-- =====================================================

create table if not exists public.content_reports (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,                 -- resource | activity | script | news
  subject     text not null,                 -- 被回報的項目名稱
  reasons     text[] not null default '{}',  -- 勾選的問題
  note        text,                          -- 使用者自行輸入
  user_id     uuid references public.profiles(id) on delete set null,
  status      text not null default 'open' check (status in ('open','resolved')),
  created_at  timestamptz not null default now()
);

create index if not exists content_reports_status_idx on public.content_reports (status);
create index if not exists content_reports_created_idx on public.content_reports (created_at desc);

-- 由 service role（後台 / server action）讀寫；前台不直接存取
alter table public.content_reports enable row level security;
