-- 7 大分類
insert into public.categories (slug, name, icon, color, sort_order) values
  ('health',    '醫療健康', 'heart',  '#EF4444', 1),
  ('transport', '交通接駁', 'bus',    '#3B82F6', 2),
  ('housing',   '居住安全', 'home',   '#10B981', 3),
  ('finance',   '經濟財務', 'wallet', '#F59E0B', 4),
  ('social',    '社會資源', 'users',  '#8B5CF6', 5),
  ('leisure',   '休閒活動', 'smile',  '#EC4899', 6),
  ('education', '教育進修', 'book',   '#0EA5E9', 7)
on conflict (slug) do update
  set name = excluded.name,
      icon = excluded.icon,
      color = excluded.color,
      sort_order = excluded.sort_order;
