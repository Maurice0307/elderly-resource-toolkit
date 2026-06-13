-- =====================================================
-- 0013 LINE 使用者偏好（記住每位 LINE 使用者選的地區）
-- =====================================================

create table if not exists public.line_user_prefs (
  line_user_id text primary key,
  region_id    uuid references public.regions(id) on delete set null,
  region_name  text,
  onboarded    boolean not null default false,
  updated_at   timestamptz not null default now()
);

alter table public.line_user_prefs enable row level security;
