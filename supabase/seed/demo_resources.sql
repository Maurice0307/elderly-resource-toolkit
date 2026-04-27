-- Demo 資源（桃園 / 中壢實際公開資料，可上線後再用爬蟲補完）
-- 重跑安全：用 (subcategory_id, name, region_id) 當去重鍵

-- 醫療健康 ----------------------------------------------------
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, description,
   phone, phone_hint, website_url, identity_tags, tags, source_org, status)
select
  sub.id, 'national', reg.id,
  '1966 長照服務專線',
  '免付費撥打，由衛福部統一窗口協助申請居家服務、日照、輔具租借等長照 2.0 資源。',
  '撥打後會由專業人員評估需求，依據評估結果連結合適服務（居家服務、日照中心、家庭托顧、輔具與無障礙環境改善等）。',
  '1966',
  '可以說：「我家長輩需要長照服務，請問下一步怎麼進行？」',
  'https://1966.gov.tw',
  array['elder','family','volunteer'],
  array['長照','居家服務','輔具','日照'],
  '衛生福利部',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '1966 長照服務專線' and r.region_id = reg.id
);

with sub as (select id from public.subcategories
             where slug = 'rehab-bus' and category_id = (select id from public.categories where slug = 'health')),
     reg as (select id from public.regions where code = 'TW-TYC')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, website_url, address, latitude, longitude,
   identity_tags, tags, source_org, status)
select
  sub.id, 'local', reg.id,
  '桃園市復康巴士預約中心',
  '提供身障者及行動不便長者就醫、復健、洽公等接送服務，需提前預約。',
  '03-3326789',
  '請說：「我想預約 X 月 X 日從中壢區到 OO 醫院的復康巴士。」',
  'https://rb.tycg.gov.tw',
  '桃園市桃園區縣府路1號',
  24.9936, 121.3010,
  array['elder','family'],
  array['身障','接送','就醫'],
  '桃園市政府社會局',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '桃園市復康巴士預約中心' and r.region_id = reg.id
);

with sub as (select id from public.subcategories where slug = 'first-aid'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, description,
   phone, phone_hint, identity_tags, tags, source_org, status)
select
  sub.id, 'national', reg.id,
  '119 緊急救護',
  '遇到突發的胸痛、跌倒、燙傷、噎到、無意識等緊急狀況，立即撥打 119。',
  '報案時請說清楚「人在哪裡、發生什麼事、人意識清楚嗎」三件事。',
  '119',
  '請說：「這裡是 OO 路 XX 號，有人胸痛冒冷汗，意識還清楚。」',
  array['elder','family','volunteer'],
  array['急救','119','緊急'],
  '內政部消防署',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '119 緊急救護' and r.region_id = reg.id
);

-- 交通接駁 ----------------------------------------------------
with sub as (select id from public.subcategories
             where slug = 'happy-bus' and category_id = (select id from public.categories where slug = 'transport')),
     reg as (select id from public.regions where code = 'TW-TYC')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, website_url, identity_tags, tags, source_org, status)
select
  sub.id, 'local', reg.id,
  '桃園市幸福巴士／幸福小黃',
  '偏遠地區與長者醫療接送專車，部分路線免費或銅板價。',
  '03-3322101',
  '請說：「我想了解中壢區的幸福小黃路線與搭乘方式。」',
  'https://traffic.tycg.gov.tw',
  array['elder','family'],
  array['公車','接送','偏鄉'],
  '桃園市政府交通局',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '桃園市幸福巴士／幸福小黃' and r.region_id = reg.id
);

with sub as (select id from public.subcategories
             where slug = 'license-renewal' and category_id = (select id from public.categories where slug = 'transport')),
     reg as (select id from public.regions where code = 'TW-TYC-ZL')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, address, latitude, longitude,
   identity_tags, tags, source_org, status)
select
  sub.id, 'local', reg.id,
  '中壢監理站',
  '辦理駕照換發、體檢、75 歲以上駕照認知測驗。建議先電話預約。',
  '03-4361226',
  '請說：「我想預約 75 歲駕照換發的認知測驗時間。」',
  '桃園市中壢區普義路2號',
  24.9533, 121.2253,
  array['elder','family'],
  array['駕照','監理','長者'],
  '交通部公路局',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '中壢監理站' and r.region_id = reg.id
);

-- 居住安全 ----------------------------------------------------
with sub as (select id from public.subcategories where slug = 'fall-prevention'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, website_url, identity_tags, tags, source_org, status)
select
  sub.id, 'national', reg.id,
  '居家無障礙環境改善補助',
  '長照 2.0 提供扶手、防滑地墊、可調整高度床等補助，最高補助新台幣 10 萬元（含失能等級條件）。',
  '1966',
  '請說：「我想申請扶手安裝補助，下一步怎麼做？」',
  'https://1966.gov.tw',
  array['elder','family'],
  array['防跌','扶手','補助'],
  '衛福部長照司',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '居家無障礙環境改善補助' and r.region_id = reg.id
);

-- 經濟財務 ----------------------------------------------------
with sub as (select id from public.subcategories where slug = 'anti-fraud'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, website_url, identity_tags, tags, source_org, status)
select
  sub.id, 'national', reg.id,
  '165 反詐騙諮詢專線',
  '懷疑被詐騙、或想查證投資／網購／中獎訊息真偽，立刻撥 165。',
  '165',
  '請說：「有人打電話自稱檢警／銀行客服，要我操作 ATM／告訴他驗證碼，這是詐騙嗎？」',
  'https://165.npa.gov.tw',
  array['elder','family','volunteer'],
  array['詐騙','反詐','金融安全'],
  '內政部警政署',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '165 反詐騙諮詢專線' and r.region_id = reg.id
);

-- 社會資源 ----------------------------------------------------
with sub as (select id from public.subcategories where slug = 'mental-hotline'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, website_url, identity_tags, tags, source_org, status)
select
  sub.id, 'national', reg.id,
  '1925 安心專線',
  '24 小時免付費心理諮詢與自殺防治專線，由衛福部委辦。',
  '1925',
  '可以說：「我最近睡不好、心情很低落，想找人聊一聊。」',
  'https://dep.mohw.gov.tw',
  array['elder','family','volunteer'],
  array['心理','諮詢','自殺防治'],
  '衛生福利部',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '1925 安心專線' and r.region_id = reg.id
);

with sub as (select id from public.subcategories
             where slug = 'meal-delivery' and category_id = (select id from public.categories where slug = 'social')),
     reg as (select id from public.regions where code = 'TW-TYC')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, identity_tags, tags, source_org, status)
select
  sub.id, 'local', reg.id,
  '桃園市長者送餐服務',
  '提供獨居、行動不便或弱勢長者每日午晚餐配送，依資格部分或全額補助。',
  '03-3322101',
  '請說：「我想替我家長輩申請送餐服務，請問有哪些資格條件？」',
  array['elder','family'],
  array['送餐','獨居','補助'],
  '桃園市政府社會局',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '桃園市長者送餐服務' and r.region_id = reg.id
);

-- 休閒活動 ----------------------------------------------------
with sub as (select id from public.subcategories where slug = 'community-station'),
     reg as (select id from public.regions where code = 'TW-TYC-ZL')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, address, latitude, longitude,
   identity_tags, tags, source_org, status)
select
  sub.id, 'local', reg.id,
  '中壢區社區照顧關懷據點',
  '提供長者共餐、健康促進活動、健康量測與電話問安，多數據點上午開放。',
  '03-4264153',
  '請說：「我想了解中壢區附近的關懷據點與活動時段。」',
  '桃園市中壢區（多個據點）',
  24.9533, 121.2253,
  array['elder','family','volunteer'],
  array['據點','共餐','活動'],
  '桃園市政府社會局',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '中壢區社區照顧關懷據點' and r.region_id = reg.id
);

-- 教育進修 ----------------------------------------------------
with sub as (select id from public.subcategories where slug = 'elder-university'),
     reg as (select id from public.regions where code = 'TW-TYC-ZL')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary,
   phone, phone_hint, website_url, identity_tags, tags, source_org, status)
select
  sub.id, 'local', reg.id,
  '中壢樂齡學習中心',
  '針對 55 歲以上長者開設免費或低價課程，含手機教學、語言、藝文、健康促進。',
  '03-4257352',
  '請說：「我想了解中壢樂齡中心這學期的課程與報名方式。」',
  'https://moe.senioredu.moe.gov.tw',
  array['elder','family'],
  array['樂齡','課程','終身學習'],
  '教育部終身教育司',
  'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.name = '中壢樂齡學習中心' and r.region_id = reg.id
);
