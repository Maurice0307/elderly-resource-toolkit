-- =====================================================
-- 0008 activity_cards: 新增 materials 欄位
-- =====================================================
-- materials: 需要準備的材料清單，顯示在圖卡左側邊欄

alter table public.activity_cards
  add column if not exists materials text[] not null default '{}';
