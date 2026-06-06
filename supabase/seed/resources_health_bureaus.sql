-- ============================================================
-- 各縣市衛生局 — 預防接種專線 種子資料
-- 資料來源：衛福部疾管署《地方政府衛生局預防接種專線》114/3/05 版本
-- 重跑安全：使用 WHERE NOT EXISTS 去重
-- ============================================================

-- ── 基隆市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-KEL')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '基隆市衛生局 — 預防接種專線',
  '辦理疫苗接種諮詢、接種計畫說明，可查詢公費疫苗接種地點與時程。',
  '02-24276154',
  '可說：「請問今年公費流感疫苗何時可以接種？長者需要預約嗎？」',
  '20147 基隆市信義區信二路 266 號',
  'https://www.klchb.klcg.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '基隆市衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '基隆市衛生局 — 預防接種專線');

-- ── 臺北市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-TPE')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '臺北市政府衛生局 — 預防接種專線',
  '辦理公費疫苗接種諮詢、接種地點查詢及疫情通報，可詢問長者優先接種相關資訊。',
  '02-23754341',
  '可說：「請問臺北市的公費流感疫苗接種地點，哪裡可以查詢？」',
  '11008 臺北市信義區市府路 1 號',
  'https://health.gov.taipei',
  array['elder','family'], array['疫苗','接種','公費'],
  '臺北市政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '臺北市政府衛生局 — 預防接種專線');

-- ── 新北市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-NTP')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '新北市政府衛生局 — 預防接種專線',
  '提供公費疫苗接種時程、接種地點查詢，及兒童、老人、高風險族群接種諮詢。',
  '02-22588923',
  '可說：「請問新北市的公費疫苗哪裡可以接種？我家長輩屬於優先接種族群嗎？」',
  '22006 新北市板橋區英士路 192 之 1 號',
  'https://www.health.ntpc.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '新北市政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '新北市政府衛生局 — 預防接種專線');

-- ── 桃園市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-TYC')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '桃園市政府衛生局 — 預防接種專線',
  '提供公費疫苗接種資訊、接種地點查詢，並提供預防接種相關衛教諮詢。',
  '0800-033355',
  '可說：「請問桃園市的公費流感疫苗幾月開始接種？需要預約嗎？」',
  '33053 桃園市桃園區縣府路 55 號',
  'https://dph.tycg.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '桃園市政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '桃園市政府衛生局 — 預防接種專線');

-- ── 新竹縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-HSQ')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '新竹縣政府衛生局 — 預防接種專線',
  '提供公費疫苗接種時程與地點查詢，老人、幼兒等高風險族群可優先接種。',
  '03-5511287',
  '可說：「請問新竹縣的公費疫苗接種，我家長輩屬於哪一波接種族群？」',
  '30210 新竹縣竹北市光明 7 街 1 號',
  'https://www.hcshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '新竹縣政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '新竹縣政府衛生局 — 預防接種專線');

-- ── 新竹市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-HSZ')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '新竹市衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢及接種地點查詢，含流感、肺炎鏈球菌等老人優先接種資訊。',
  '03-5355130',
  '可說：「請問新竹市的公費流感疫苗哪裡可以接種？」',
  '30041 新竹市中央路 241 號 10-12 樓',
  'https://dep.hccshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '新竹市衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '新竹市衛生局 — 預防接種專線');

-- ── 苗栗縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-MIA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '苗栗縣政府衛生局 — 預防接種專線',
  '提供公費疫苗接種時程、接種地點，以及流行病學諮詢服務。',
  '037-558809',
  '可說：「請問苗栗縣的公費疫苗今年從何時開始？哪些機構可以接種？」',
  '35646 苗栗縣後龍鎮大庄里 21 鄉光華路 373 號',
  'https://www.mlshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '苗栗縣政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '苗栗縣政府衛生局 — 預防接種專線');

-- ── 臺中市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-TXG')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '臺中市政府衛生局 — 預防接種專線',
  '提供公費疫苗接種時程與接種地點查詢，老人、慢性病患者可優先接種公費流感疫苗。',
  '04-25270780',
  '可說：「請問臺中市的公費疫苗接種，我家長輩屬於哪一優先族群？要去哪裡接種？」',
  '42053 臺中市豐原區中興路 136 號',
  'https://www.health.taichung.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '臺中市政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '臺中市政府衛生局 — 預防接種專線');

-- ── 彰化縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-CHA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '彰化縣衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢、接種地點及時程查詢。',
  '04-7115141',
  '撥通後轉分機 5136 或 5104，說：「請問彰化縣的公費流感疫苗接種，我家長輩要去哪裡？」',
  '50049 彰化市彰化路中山路二段 162 號',
  'https://www.chshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '彰化縣衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '彰化縣衛生局 — 預防接種專線');

-- ── 南投縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-NAN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '南投縣政府衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢，含山地偏遠地區接種服務資訊。',
  '049-2220904',
  '也可撥 049-2230607，說：「請問南投縣的公費疫苗接種，山地鄉有提供到部落的接種服務嗎？」',
  '54062 南投縣南投市復興路 6 號',
  'https://www.ntshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '南投縣政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '南投縣政府衛生局 — 預防接種專線');

-- ── 雲林縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-YUN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '雲林縣衛生局 — 預防接種專線',
  '提供公費疫苗接種時程與地點查詢，農業縣市多個衛生所均可接種。',
  '05-5345811',
  '可說：「請問雲林縣的公費疫苗可以在哪些衛生所接種？需要事先預約嗎？」',
  '64054 雲林縣斗六市府文路 34 號',
  'https://ylshb.yunlin.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '雲林縣衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '雲林縣衛生局 — 預防接種專線');

-- ── 嘉義縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-CHY')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '嘉義縣衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢、接種地點及時程，老人、慢性病患者可優先接種。',
  '05-3620607',
  '也可撥 05-3620600 轉分機 368，說：「請問嘉義縣的公費流感疫苗何時開始，哪裡可以打？」',
  '61249 嘉義縣太保市祥和二路東段 3 號',
  'https://cyshb.cyhg.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '嘉義縣衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '嘉義縣衛生局 — 預防接種專線');

-- ── 嘉義市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-CYI')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '嘉義市政府衛生局 — 預防接種專線',
  '提供公費疫苗接種時程、接種地點查詢，以及兒童、長者接種優先順序說明。',
  '05-2341150',
  '可說：「請問嘉義市的公費疫苗何時開始接種？我家長輩要去哪裡接種？」',
  '60097 嘉義市西區德明路 1 號',
  'https://health.chiayi.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '嘉義市政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '嘉義市政府衛生局 — 預防接種專線');

-- ── 臺南市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-TNN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '臺南市政府衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢、接種地點查詢，老人免費接種肺炎鏈球菌等公費疫苗。',
  '06-2880180',
  '可說：「請問臺南市的公費流感疫苗接種，我家長輩屬於優先族群嗎？需要預約嗎？」',
  '73064 臺南市新營區復興路 163 號（東興辦公室）',
  'https://health.tainan.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '臺南市政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '臺南市政府衛生局 — 預防接種專線');

-- ── 高雄市 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-KHH')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '高雄市政府衛生局 — 預防接種專線',
  '提供公費疫苗接種時程、接種地點查詢，含老人、慢性病患者優先接種說明。',
  '07-7134000',
  '也可撥 07-7320513，說：「請問高雄市的公費疫苗何時開始接種？離我最近的接種地點在哪？」',
  '80276 高雄市苓雅區凱旋二路 132 之 1 號',
  'https://health.kcg.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '高雄市政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '高雄市政府衛生局 — 預防接種專線');

-- ── 屏東縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-PIF')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '屏東縣政府衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢，含偏鄉原住民地區巡迴接種資訊，老人可就近於衛生所接種。',
  '08-7380208',
  '可說：「請問屏東縣的公費疫苗哪裡可以接種？恆春半島或偏鄉地區有服務嗎？」',
  '90054 屏東縣屏東市自由路 272 號',
  'https://www.ptshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '屏東縣政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '屏東縣政府衛生局 — 預防接種專線');

-- ── 宜蘭縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-ILA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '宜蘭縣政府衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢及接種地點查詢，老人可於各鄉鎮衛生所接種。',
  '03-9357011',
  '也可撥 03-9322634 轉分機 1202，說：「請問宜蘭縣的公費疫苗，我住蘇澳，最近的接種地點在哪？」',
  '26051 宜蘭縣宜蘭市女中路 2 段 287 號',
  'https://www.ilshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '宜蘭縣政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '宜蘭縣政府衛生局 — 預防接種專線');

-- ── 花蓮縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-HUA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '花蓮縣衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢，含偏鄉原住民部落巡迴接種資訊，老人可就近接種。',
  '03-8227141',
  '撥通後轉分機 526 或 311，說：「請問花蓮縣的公費疫苗接種，秀林鄉有提供服務嗎？」',
  '97058 花蓮縣花蓮市新興路 200 號',
  'https://www.hlshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '花蓮縣衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '花蓮縣衛生局 — 預防接種專線');

-- ── 臺東縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-TTT')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '臺東縣衛生局 — 預防接種專線',
  '提供公費疫苗接種諮詢，含原住民族部落巡迴接種與偏鄉長者就近接種資訊。',
  '089-331171',
  '撥通後轉分機 214，說：「請問臺東縣的公費疫苗，池上或成功鎮有接種點嗎？」',
  '95043 臺東縣臺東市博愛路 336 號',
  'https://www.ttshb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '臺東縣衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '臺東縣衛生局 — 預防接種專線');

-- ── 澎湖縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-PEH')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '澎湖縣政府衛生局 — 預防接種專線',
  '提供澎湖在地公費疫苗接種諮詢，離島各鄉衛生所均提供接種服務。',
  '06-9272162',
  '撥通後轉分機 211，說：「請問澎湖縣的公費疫苗接種，望安鄉或七美鄉有服務嗎？」',
  '88041 澎湖縣馬公市中正路 115 號',
  'https://www.phchb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '澎湖縣政府衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '澎湖縣政府衛生局 — 預防接種專線');

-- ── 金門縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-KIN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '金門縣衛生局 — 預防接種專線',
  '提供金門在地公費疫苗接種諮詢，老人可於各鄉衛生所就近接種流感等公費疫苗。',
  '082-330697',
  '撥通後轉分機 609，說：「請問金門縣的公費疫苗接種，烈嶼鄉（小金門）有提供接種嗎？」',
  '89148 金門縣金湖鎮新市里復興路 1 之 12 號',
  'https://www.phb.kinmen.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '金門縣衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '金門縣衛生局 — 預防接種專線');

-- ── 連江縣 ────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW-LIE')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   address, website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '連江縣衛生局 — 預防接種專線',
  '提供馬祖在地公費疫苗接種諮詢，各鄉（北竿、東引、莒光）均有衛生所提供接種。',
  '0836-22095',
  '撥通後轉分機 8855，說：「請問連江縣的公費疫苗，北竿鄉有接種點嗎？」',
  '20941 連江縣南竿鄉復興村 216 號',
  'https://www.matsuhb.gov.tw',
  array['elder','family'], array['疫苗','接種','公費'],
  '連江縣衛生局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '連江縣衛生局 — 預防接種專線');
