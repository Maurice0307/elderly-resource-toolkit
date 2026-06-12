-- =====================================================
-- 0012 LINE bot 對話紀錄（後台收件匣 / 客服）
-- =====================================================

create table if not exists public.line_messages (
  id           uuid primary key default gen_random_uuid(),
  line_user_id text not null,                 -- LINE 使用者 ID
  display_name text,                          -- LINE 顯示名稱
  direction    text not null check (direction in ('in','out')),  -- in=使用者傳來 out=回覆給使用者
  text         text not null,
  by_admin     boolean not null default false, -- out 是否為管理員人工回覆
  created_at   timestamptz not null default now()
);

create index if not exists line_messages_user_idx on public.line_messages (line_user_id, created_at);
create index if not exists line_messages_created_idx on public.line_messages (created_at desc);

-- 僅由 service role（webhook / 後台）讀寫
alter table public.line_messages enable row level security;
