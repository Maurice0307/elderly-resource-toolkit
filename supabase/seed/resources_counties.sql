-- ============================================================
-- 各縣市長照管理中心 + 社會局老人服務 種子資料
-- 資料來源：各縣市政府官網公開電話（建議定期核對）
-- 重跑安全：使用 WHERE NOT EXISTS 去重
-- ============================================================

-- ── 台北市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-TPE')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '台北市長期照顧管理中心',
  '提供失能長者與家屬長照 2.0 評估、資源媒合，含居家服務、日照、輔具等。',
  '02-2375-3087',
  '可說：「我家長輩最近走路不穩，想申請居家服務，需要怎麼評估？」',
  'https://dosw.gov.taipei',
  array['elder','family'], array['長照','居家服務','日照'],
  '台北市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '台北市長期照顧管理中心');

with sub as (select id from public.subcategories where slug = 'welfare-consult'),
     reg as (select id from public.regions where code = 'TW-TPE')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '台北市社會局老人福利科',
  '辦理中低收入老人補助、獨居老人關懷、老人保護通報等業務。',
  '02-2729-7985',
  '可說：「請問我符合中低收入老人生活津貼的申請資格嗎？」',
  'https://dosw.gov.taipei',
  array['elder','family'], array['補助','老人福利','諮詢'],
  '台北市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '台北市社會局老人福利科');


-- ── 新北市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-NTP')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '新北市長期照顧管理中心',
  '長照 2.0 需求評估與資源媒合，服務遍及全市 29 個行政區。',
  '02-2960-3456',
  '可說：「我住板橋，家人有失智情形，想申請日照中心，請問怎麼辦理？」',
  'https://www.sw.ntpc.gov.tw',
  array['elder','family'], array['長照','失智','日照'],
  '新北市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '新北市長期照顧管理中心');

with sub as (select id from public.subcategories where slug = 'welfare-consult'),
     reg as (select id from public.regions where code = 'TW-NTP')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '新北市政府社會局老人福利科',
  '辦理老人福利補助申請、長者急難救助、老人保護案件受理。',
  '02-2960-3456',
  '可說：「我父母都七十幾歲，想了解有哪些政府補助可以申請。」',
  'https://www.sw.ntpc.gov.tw',
  array['elder','family'], array['補助','急難救助','老人保護'],
  '新北市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '新北市政府社會局老人福利科');


-- ── 台中市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-TXG')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '台中市長期照顧管理中心',
  '提供失能或失智長者評估，媒合居家服務、日照、家庭托顧、輔具補助等資源。',
  '04-2228-9111',
  '可說：「我媽媽最近走路很不穩，想申請居家服務和防跌輔具，麻煩幫我說明流程。」',
  'https://www.sab.taichung.gov.tw',
  array['elder','family'], array['長照','輔具','居家服務'],
  '台中市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '台中市長期照顧管理中心');

with sub as (select id from public.subcategories where slug = 'welfare-consult'),
     reg as (select id from public.regions where code = 'TW-TXG')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '台中市政府社會局老人福利科',
  '辦理老人生活補助、低收入老人津貼、老人保護通報、居家服務申請。',
  '04-2228-9111',
  '可說：「請問台中市的中低收入老人生活津貼，每個月可以領多少？怎麼申請？」',
  'https://www.sab.taichung.gov.tw',
  array['elder','family'], array['補助','津貼','老人福利'],
  '台中市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '台中市政府社會局老人福利科');


-- ── 台南市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-TNN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '台南市長期照顧管理中心',
  '長照 2.0 評估與服務媒合，提供居家、社區及機構式服務，免付費撥打 1966 可轉至台南中心。',
  '06-226-0507',
  '可說：「我父親有輕度失智，想申請日照中心，請問評估要怎麼安排？」',
  'https://social.tainan.gov.tw',
  array['elder','family'], array['長照','失智','日照'],
  '台南市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '台南市長期照顧管理中心');

with sub as (select id from public.subcategories where slug = 'welfare-consult'),
     reg as (select id from public.regions where code = 'TW-TNN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '台南市政府社會局老人福利科',
  '辦理老人生活補助、獨居老人關懷、老人保護及緊急安置等業務。',
  '06-299-1111',
  '可說：「我鄰居是獨居老人，好幾天沒看到人，可以請人去確認嗎？」',
  'https://social.tainan.gov.tw',
  array['elder','family','volunteer'], array['補助','獨居','老人保護'],
  '台南市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '台南市政府社會局老人福利科');


-- ── 高雄市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-KHH')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '高雄市長期照顧管理中心',
  '長照 2.0 資源入口，提供居家服務、日照、輔具補助等評估與媒合，也可撥 1966 轉入。',
  '07-713-4000',
  '可說：「我媽媽最近跌倒過一次，想申請輔具和居家服務，請問怎麼開始？」',
  'https://www.kslaf.org.tw',
  array['elder','family'], array['長照','輔具','居家服務'],
  '高雄市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '高雄市長期照顧管理中心');

with sub as (select id from public.subcategories where slug = 'welfare-consult'),
     reg as (select id from public.regions where code = 'TW-KHH')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '高雄市政府社會局老人福利科',
  '辦理老人年金申請、低收入老人補助、獨居老人安全通報及保護業務。',
  '07-336-8333',
  '可說：「我想了解高雄市的老人津貼有哪幾種，我家長輩符合資格嗎？」',
  'https://socbu.kcg.gov.tw',
  array['elder','family'], array['津貼','補助','老人福利'],
  '高雄市政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '高雄市政府社會局老人福利科');


-- ── 基隆市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-KEL')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '基隆市長期照顧管理中心',
  '提供長照需求評估，媒合居家服務、日照及相關長照資源。',
  '02-2431-3232',
  '可說：「我家長輩需要人幫忙洗澡、備餐，請問居家服務怎麼申請？」',
  array['elder','family'], array['長照','居家服務'],
  '基隆市政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '基隆市長期照顧管理中心');


-- ── 新竹市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-HSZ')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '新竹市長期照顧管理中心',
  '提供長照 2.0 服務評估與資源媒合，含居家、社區及輔具等服務。',
  '03-523-6597',
  '可說：「我母親行動不便，想申請居家服務和日照，請問第一步要怎麼做？」',
  array['elder','family'], array['長照','居家服務','輔具'],
  '新竹市政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '新竹市長期照顧管理中心');


-- ── 嘉義市 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-CYI')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '嘉義市長期照顧管理中心',
  '提供失能長者與家屬長照 2.0 評估及資源媒合。',
  '05-278-6621',
  '可說：「我家長輩最近記憶力很差，想申請失智照顧服務，請問要如何評估？」',
  array['elder','family'], array['長照','失智','評估'],
  '嘉義市政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '嘉義市長期照顧管理中心');


-- ── 新竹縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-HSQ')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '新竹縣長期照顧管理中心',
  '提供長照需求評估，媒合居家服務、日照、輔具等資源。',
  '03-551-8101',
  '可說：「我家長輩行動不便，需要人幫忙洗澡和復健，請問可以申請什麼服務？」',
  array['elder','family'], array['長照','居家服務','復健'],
  '新竹縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '新竹縣長期照顧管理中心');


-- ── 苗栗縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-MIA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '苗栗縣長期照顧管理中心',
  '長照 2.0 需求評估與服務媒合，涵蓋居家、日照、交通接送等。',
  '037-322-888',
  '可說：「我父親中風後行動困難，請問可以申請哪些長照服務幫忙照顧？」',
  array['elder','family'], array['長照','中風','居家照顧'],
  '苗栗縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '苗栗縣長期照顧管理中心');


-- ── 彰化縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-CHA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '彰化縣長期照顧管理中心',
  '提供失能長者評估，媒合居家服務、日照及機構轉介等長照資源。',
  '04-726-7658',
  '可說：「我家長輩需要人幫忙復健和備餐，請問我住彰化市，可以申請什麼？」',
  array['elder','family'], array['長照','居家服務','復健'],
  '彰化縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '彰化縣長期照顧管理中心');


-- ── 南投縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-NAN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '南投縣長期照顧管理中心',
  '提供長照需求評估，服務涵蓋居家、社區及山地偏遠地區。',
  '049-222-1783',
  '可說：「我家長輩住偏遠山區，行動不便，請問有辦法申請居家服務或交通接送嗎？」',
  array['elder','family'], array['長照','偏遠地區','居家服務'],
  '南投縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '南投縣長期照顧管理中心');


-- ── 雲林縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-YUN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '雲林縣長期照顧管理中心',
  '長照 2.0 服務評估與媒合，農業縣市也設有多個社區照顧據點。',
  '05-534-5936',
  '可說：「我住虎尾，想替年邁父母申請長照服務，請問第一步怎麼做？」',
  array['elder','family'], array['長照','據點','居家服務'],
  '雲林縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '雲林縣長期照顧管理中心');


-- ── 嘉義縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-CHY')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '嘉義縣長期照顧管理中心',
  '提供長照需求評估與資源媒合，涵蓋居家、日照及輔具等服務。',
  '05-362-8993',
  '可說：「我父親最近膝蓋退化很嚴重，想申請輔具補助和居家服務，請問怎麼辦理？」',
  array['elder','family'], array['長照','輔具補助','居家服務'],
  '嘉義縣政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '嘉義縣長期照顧管理中心');


-- ── 屏東縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-PIF')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '屏東縣長期照顧管理中心',
  '長照 2.0 評估與服務媒合，含偏鄉原住民地區均有服務。',
  '08-732-0415',
  '可說：「我媽媽住恆春，年紀大了需要長期照顧，請問有哪些服務可以申請？」',
  array['elder','family'], array['長照','偏鄉','原住民'],
  '屏東縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '屏東縣長期照顧管理中心');


-- ── 宜蘭縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-ILA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '宜蘭縣長期照顧管理中心',
  '提供長照評估與資源媒合，含居家、日照、家庭托顧等服務。',
  '03-925-2115',
  '可說：「我家長輩最近跌倒骨折，剛出院，想申請居家照顧，請問需要什麼條件？」',
  array['elder','family'], array['長照','骨折','居家服務'],
  '宜蘭縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '宜蘭縣長期照顧管理中心');


-- ── 花蓮縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-HUA')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '花蓮縣長期照顧管理中心',
  '長照 2.0 評估與資源媒合，花蓮偏鄉也有在地服務團隊。',
  '03-822-7141',
  '可說：「我家在秀林鄉，長輩很難出門，請問有到府評估和居家服務嗎？」',
  array['elder','family'], array['長照','到府評估','偏鄉'],
  '花蓮縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '花蓮縣長期照顧管理中心');


-- ── 台東縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-TTT')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '台東縣長期照顧管理中心',
  '長照 2.0 評估與服務媒合，設有原住民族部落在地服務。',
  '089-340-183',
  '可說：「我家在池上，長輩需要居家服務，請問要怎麼申請評估？」',
  array['elder','family'], array['長照','原住民族','居家服務'],
  '台東縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '台東縣長期照顧管理中心');


-- ── 澎湖縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-PEH')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '澎湖縣長期照顧管理中心',
  '提供澎湖在地長照評估與資源媒合，離島交通接送有特殊安排。',
  '06-927-4400',
  '可說：「我家長輩住望安，身體越來越差，請問怎麼申請長照服務？」',
  array['elder','family'], array['長照','離島','居家服務'],
  '澎湖縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '澎湖縣長期照顧管理中心');


-- ── 金門縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-KIN')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '金門縣長期照顧管理中心',
  '長照 2.0 評估與在地資源媒合，提供金門居民居家服務、日照等。',
  '082-334-234',
  '可說：「我家長輩住金城，想申請居家服務，請問需要評估嗎？要準備什麼？」',
  array['elder','family'], array['長照','離島','居家服務'],
  '金門縣政府社會處', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '金門縣長期照顧管理中心');


-- ── 連江縣 ───────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW-LIE')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'local', reg.id,
  '連江縣長期照顧管理中心',
  '提供馬祖在地長照評估與服務媒合，含離島特殊交通與照顧安排。',
  '0836-22891',
  '可說：「我家長輩住北竿，想了解有哪些長照資源可以使用，請問可以幫我說明嗎？」',
  array['elder','family'], array['長照','馬祖','離島'],
  '連江縣政府社會局', 'active'
from sub, reg
where not exists (select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id and r.name = '連江縣長期照顧管理中心');
