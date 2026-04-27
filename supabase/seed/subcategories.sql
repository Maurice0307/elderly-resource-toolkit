-- 子分類（與 src/config/categories.ts 對齊）
-- 醫療健康
with c as (select id from public.categories where slug = 'health')
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.so from c, (values
  ('accessible-taxi','無障礙計程車',1),
  ('rehab-bus','復康巴士',2),
  ('private-ambulance','民間救護車',3),
  ('ltc-1966','1966 長照服務',4),
  ('day-care','日照中心',5),
  ('assistive-device','輔具申請',6),
  ('presbyopia-hearing-denture-aid','老花眼鏡、助聽器、假牙補助',7),
  ('vaccine-info','疫苗資訊',8),
  ('nearby-clinic','鄰近醫學中心、診所',9),
  ('health-checkup','健康檢查',10),
  ('health-edu','衛教與流行病資訊',11),
  ('drug-delivery','藥物送到家',12),
  ('advance-decision','預立醫療決定書',13),
  ('first-aid','急救處置',14)
) as v(slug,name,so)
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 交通接駁
with c as (select id from public.categories where slug = 'transport')
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.so from c, (values
  ('elder-card','敬老卡教學',1),
  ('happy-bus','幸福小黃／巴士',2),
  ('pupu-rideshare','噗噗共乘',3),
  ('ltc-transport','長照交通接送',4),
  ('accessible-taxi','無障礙計程車',5),
  ('rehab-bus-booking','復康巴士預約',6),
  ('license-renewal','駕照更換（監理站）',7),
  ('road-safety','行車安全（路老師）',8)
) as v(slug,name,so)
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 居住安全
with c as (select id from public.categories where slug = 'housing')
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.so from c, (values
  ('fall-prevention','防跌施工（裝扶手）',1),
  ('solo-elder-alarm','獨居警報申請',2),
  ('home-care-worker','居服員申請',3),
  ('repair-subsidy','修繕補助',4),
  ('nearby-utility','附近水電行',5),
  ('earthquake-prep','地震準備',6),
  ('fire-prevention','消防檢查與火災預防',7),
  ('electric-safety','用電安全與檢測',8),
  ('urban-renewal','都市更新',9),
  ('social-housing','社會住宅',10),
  ('rent-agency','包租代管',11),
  ('tsuei-mama','崔媽媽基金會',12)
) as v(slug,name,so)
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 經濟財務
with c as (select id from public.categories where slug = 'finance')
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.so from c, (values
  ('elder-pension','老人年金（重陽禮金）',1),
  ('anti-fraud','防詐騙電話與案例',2),
  ('emergency-subsidy','緊急或日常補助申請',3),
  ('inheritance','財產繼承',4),
  ('will-prep','預立遺囑',5),
  ('asset-management','財產管理',6),
  ('elder-trust','安養信託',7),
  ('finance-course','理財投資課程',8)
) as v(slug,name,so)
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 社會資源
with c as (select id from public.categories where slug = 'social')
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.so from c, (values
  ('welfare-consult','社會福利諮詢',1),
  ('mental-hotline','心理諮詢專線',2),
  ('psych-clinic','附近的身心科',3),
  ('domestic-violence','家暴專線',4),
  ('elder-center','長青中心',5),
  ('meal-delivery','送餐服務',6),
  ('legal-consult','法律諮詢',7),
  ('laf','法扶基金會',8)
) as v(slug,name,so)
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 休閒活動
with c as (select id from public.categories where slug = 'leisure')
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.so from c, (values
  ('community-station','社區據點活動',1),
  ('community-meal','社區共餐活動',2),
  ('volunteer','志工參與',3),
  ('elder-exercise','長者運動建議',4),
  ('silver-travel','銀髮旅遊',5),
  ('activity-subsidy','活動補助',6)
) as v(slug,name,so)
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 教育進修
with c as (select id from public.categories where slug = 'education')
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.so from c, (values
  ('elder-university','樂齡大學／社區大學',1),
  ('second-career','二次就業',2),
  ('digital-tutorial','3C 教學影片',3)
) as v(slug,name,so)
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;
