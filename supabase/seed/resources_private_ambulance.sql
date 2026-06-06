-- ============================================================
-- 民間救護車公司 種子資料
-- 資料來源：中華民國救護車協會工具包整理（建議定期核對電話）
-- 分區方式：依服務電話區碼歸屬縣市
-- 重跑安全：使用 WHERE NOT EXISTS 去重
-- ============================================================

-- ── 北區（台北 / 新北） ──────────────────────────────────────

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-NTP')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '常晉救護車（新北）',
  '提供非緊急救護接送服務，適合長者就醫、出院返家、轉院等需求。',
  '(02)2455-8989',
  '可說：「我家長輩需要從醫院回家，請問可以安排救護車接送嗎？費用大概多少？」',
  array['elder','family'], array['救護車','非緊急','就醫接送'],
  '常晉救護車', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '常晉救護車（新北）');

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-NTP')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '遠東救護車（板橋）',
  '提供非緊急救護車接送，含臥床病患就醫、轉院、長途接送等服務。',
  '(02)3234-5998',
  '可說：「我家長輩臥床，需要救護車接送就醫，請問費用和預約方式？」',
  array['elder','family'], array['救護車','非緊急','轉院'],
  '遠東救護車', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '遠東救護車（板橋）');

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-TPE')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '一心救護（台北）',
  '提供非緊急救護車接送，適合長者就醫、出院、轉院等需求，24 小時服務。',
  '(02)2565-7030',
  '可說：「我家長輩需要救護車從 OO 醫院回家，請問如何預約及費用？」',
  array['elder','family'], array['救護車','非緊急','就醫接送'],
  '一心救護', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '一心救護（台北）');

-- ── 中區（台中） ─────────────────────────────────────────────

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-TXG')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '大雅救護（台中）',
  '提供非緊急救護接送服務，適合台中市長者就醫、轉院及長途接送。',
  '(04)2225-5120',
  '可說：「我家長輩需要臥式救護車接送就醫，請問服務範圍和費用是？」',
  array['elder','family'], array['救護車','非緊急','台中'],
  '大雅救護有限公司', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '大雅救護（台中）');

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-TXG')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  'EASY 救護（台中）',
  '提供台中及中部地區非緊急救護接送，適合臥床或行動不便的長者就醫。',
  '(04)9291-1100',
  '可說：「我家長輩需要救護車接送，從台中到南投的醫院，請問費用和預約方式？」',
  array['elder','family'], array['救護車','非緊急','中部'],
  'EASY救護', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = 'EASY 救護（台中）');

-- ── 南區（台南 / 高雄） ──────────────────────────────────────

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-TNN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '啟弘救護車（台南）',
  '提供台南地區非緊急救護接送，適合臥床長者就醫、轉院或長途接送。',
  '(06)221-0777',
  '可說：「我家長輩臥床，需要救護車從台南的醫院轉到其他醫院，請問費用和預約方式？」',
  array['elder','family'], array['救護車','非緊急','台南'],
  '啟弘救護車', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '啟弘救護車（台南）');

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-KHH')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '華勝救護車（高雄）',
  '提供高雄及南部地區非緊急救護接送，適合長者就醫、轉院、出院返家等需求。',
  '(07)3341-059',
  '可說：「我家長輩需要救護車接送就醫或出院，請問費用和預約方式？」',
  array['elder','family'], array['救護車','非緊急','高雄'],
  '華勝救護有限公司', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '華勝救護車（高雄）');

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-KHH')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '益區救護車（高雄）',
  '提供高雄地區非緊急救護車接送，適合臥床或行動不便的長者就醫接送服務。',
  '(07)3422-186',
  '可說：「我家長輩行動不便，需要安排救護車到醫院，請問費用和預約方式？」',
  array['elder','family'], array['救護車','非緊急','高雄'],
  '益區救護車', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '益區救護車（高雄）');

-- 全國慈善救護（免費）
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '慈善救護車（公益）',
  '公益性非緊急救護接送，協助弱勢、老人等就醫接送，費用低廉或免費（依情況審核）。',
  '0800-229-119',
  '可說：「我家長輩是弱勢老人，需要就醫接送，請問可以申請慈善救護嗎？」',
  array['elder','family'], array['救護車','公益','弱勢'],
  '慈善救護車', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '慈善救護車（公益）');

-- ── 東區（花蓮 / 台東） ──────────────────────────────────────

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-TTT')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '東達救護車（台東）',
  '提供台東地區非緊急救護接送，適合長者就醫、轉院及長途接送服務。',
  '(08)7512-911',
  '可說：「我家長輩需要救護車接送就醫，請問台東地區的服務範圍和費用？」',
  array['elder','family'], array['救護車','非緊急','台東'],
  '東達救護車', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '東達救護車（台東）');

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW-TTT')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '全安救護管理（台東）',
  '提供台東地區非緊急救護接送服務，適合臥床或行動不便長者就醫、轉院需求。',
  '(08)7836-121',
  '可說：「我家長輩需要救護車接送到醫院，請問服務範圍和費用？」',
  array['elder','family'], array['救護車','非緊急','台東'],
  '全安救護管理有限公司', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '全安救護管理（台東）');

-- ── 補充說明（全國）─────────────────────────────────────────
-- 提示使用者如何找到附近民間救護車的通用資源

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'private-ambulance' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, description, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '119 緊急救護（生命危急請優先撥打）',
  '遇到突發的胸痛、跌倒、無意識、呼吸困難、嚴重出血等緊急狀況，優先撥打 119。',
  '民間救護車適合非緊急的就醫接送（如轉院、出院返家）。若為生命危急情況，請立即撥打 119，不要猶豫。報案時請說清楚：人在哪裡、發生什麼事、意識清楚嗎。',
  '119',
  '請說：「這裡是 OO 路 XX 號，有人胸痛冒冷汗、意識還清楚，需要救護車。」',
  array['elder','family','volunteer'], array['急救','119','緊急'],
  '內政部消防署', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '119 緊急救護（生命危急請優先撥打）');
