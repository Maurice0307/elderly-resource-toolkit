-- =====================================================
-- 0014 資源多重細分類標籤（一個資源可同時掛多個子分類）
-- 主標籤仍用 subcategory_id；額外標籤放 extra_subcats(uuid[])
-- =====================================================

alter table public.resources
  add column if not exists extra_subcats uuid[] not null default '{}';

-- 陣列重疊查詢用 GIN index（篩選某子分類時 extra_subcats && {id} 會用到）
create index if not exists resources_extra_subcats_idx
  on public.resources using gin (extra_subcats);
