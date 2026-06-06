-- ============================================================
-- 全國性資源種子資料（7 大類別完整版）
-- 資料來源：中華民國老人福利推動聯盟工具包截圖、各部會官網公開電話
-- 重跑安全：使用 WHERE NOT EXISTS 去重
-- 更新日期：2026-05
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 醫療健康 ▸ 無障礙計程車
-- ────────────────────────────────────────────────────────────
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'accessible-taxi' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '台灣大車隊 — 無障礙計程車',
  '24 小時全國調度，提供輪椅可上車的無障礙計程車，適合行動不便長者就醫出行。',
  '0800-055-850',
  '撥通後按「3」即可預約無障礙計程車。可說：「我需要一台可放輪椅的計程車，明天上午到 OO 醫院。」',
  array['elder','family'], array['無障礙','計程車','就醫接送'],
  '台灣大車隊', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '台灣大車隊 — 無障礙計程車'
);

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'accessible-taxi' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '大都會車隊 — 無障礙計程車',
  '手機直撥 55178 快速叫無障礙車，或撥市話，提供輪椅可搭乘的車輛服務。',
  '(02)4499-178',
  '手機直撥 55178 或撥 (02)4499-178，說：「我需要無障礙計程車，從 OO 到 XX，預計幾點出發。」',
  array['elder','family'], array['無障礙','計程車','就醫接送'],
  '大都會車隊', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '大都會車隊 — 無障礙計程車'
);

-- ────────────────────────────────────────────────────────────
-- 醫療健康 ▸ 復康巴士
-- ────────────────────────────────────────────────────────────
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'rehab-bus' and c.slug = 'health'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '復康巴士全國服務專線',
  '由交通部統籌，提供身障及行動不便者就醫、復健、洽公等預約接送；撥打後可查詢所在縣市承辦單位。',
  '0800-231-161',
  '可說：「我住 OO 縣市，想了解復康巴士的申請資格和預約方式。」社會局電話可於工具包各縣市頁面查詢。',
  array['elder','family'], array['復康巴士','身障','就醫接送'],
  '交通部', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '復康巴士全國服務專線'
);

-- ────────────────────────────────────────────────────────────
-- 醫療健康 ▸ 藥物送到家
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'drug-delivery'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '呼叫藥師 — 慢性藥物到家服務',
  '由藥師提供慢性病處方藥居家配送，省去往返藥局的不便，適合行動不便或獨居長者。',
  '(02)6605-0896',
  '可說：「我有高血壓長期用藥，想申請藥物送到家服務，請問怎麼辦理？」',
  array['elder','family'], array['送藥','慢性病','居家服務'],
  '呼叫藥師', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '呼叫藥師 — 慢性藥物到家服務'
);

-- ────────────────────────────────────────────────────────────
-- 醫療健康 ▸ 預立醫療決定書
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'advance-decision'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '預立醫療決定書 — 衛福部官方系統',
  '依《病人自主權利法》，民眾可事先以書面表達醫療意願；至衛福部系統下載表單，填寫後至合作醫院公證存檔。',
  NULL,
  '進入網站下載「預立醫療決定書」表格，填妥後至合作醫療機構進行預立醫療照護諮商（ACP），完成後即受法律保障。',
  'https://hpcod.mohw.gov.tw',
  array['elder','family'], array['預立醫療','安寧','自主'],
  '衛生福利部', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '預立醫療決定書 — 衛福部官方系統'
);

-- ────────────────────────────────────────────────────────────
-- 醫療健康 ▸ 輔具申請
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'assistive-device'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '衛福部社家署 — 輔具申請專線',
  '提供拐杖、輪椅、助行器、電動床等輔具的補助評估，電話詢問申請資格與流程。',
  '(02)2720-8889',
  '撥通後轉分機 1549，可說：「我家長輩行動不便，想申請輔具補助，請問需要哪些條件？」',
  'https://newrepat.sfaa.gov.tw',
  array['elder','family'], array['輔具','補助','行動不便'],
  '衛生福利部社會及家庭署', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '衛福部社家署 — 輔具申請專線'
);

with sub as (select id from public.subcategories where slug = 'assistive-device'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '慈濟環保輔具平台',
  '提供二手輔具（輪椅、拐杖、助行器等）免費或低價借用，可加 LINE 官方帳號洽詢。',
  NULL,
  '搜尋 LINE 官方帳號「慈濟環保輔具」加入好友，即可查詢借用資訊與申請程序。',
  'https://www.tzuchi.org.tw',
  array['elder','family'], array['輔具','二手','免費借用'],
  '慈濟基金會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '慈濟環保輔具平台'
);

-- ────────────────────────────────────────────────────────────
-- 醫療健康 ▸ 疫苗資訊
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '衛福部疾管署 — 防疫諮詢',
  '提供流感、新冠等疫苗接種時程、優先族群資訊、傳染病防治衛教；電話詢問接種相關問題。',
  '(02)2395-9825',
  '可說：「請問今年流感疫苗何時開始接種？我家長輩是否屬於優先接種族群？」',
  'https://www.cdc.gov.tw',
  array['elder','family'], array['疫苗','流感','防疫'],
  '衛生福利部疾病管制署', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '衛福部疾管署 — 防疫諮詢'
);

with sub as (select id from public.subcategories where slug = 'vaccine-info'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '1922 疫情通報與防疫諮詢專線',
  '24 小時免費防疫專線，可詢問傳染病症狀、隔離規定、疫苗接種地點等防疫相關問題。',
  '1922',
  '也可撥 0800-001-922（免付費）。可說：「我家長輩最近發燒、咳嗽，請問是否需要就醫或隔離？」',
  array['elder','family','volunteer'], array['防疫','隔離','1922'],
  '衛生福利部疾病管制署', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '1922 疫情通報與防疫諮詢專線'
);

-- ────────────────────────────────────────────────────────────
-- 醫療健康 ▸ 長照 1966（全國統一窗口）
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'ltc-1966'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, description,
   phone, phone_hint, website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '1966 長照服務申請專線',
  '免付費撥打，由衛福部統一窗口協助申請居家服務、日照、輔具租借等長照 2.0 資源。',
  '撥打後由專業人員評估需求，依評估結果連結合適服務（居家服務、日照中心、家庭托顧、輔具與無障礙環境改善等）。也可撥 (02)8590-6666 洽詢。',
  '1966',
  '可說：「我家長輩最近走路不穩，想申請居家服務，請問下一步怎麼進行？」',
  'https://1966.gov.tw',
  array['elder','family','volunteer'],
  array['長照','居家服務','日照','1966'],
  '衛生福利部長期照顧司', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '1966 長照服務申請專線'
);

-- ────────────────────────────────────────────────────────────
-- 交通接駁 ▸ 幸福小黃／幸福巴士
-- ────────────────────────────────────────────────────────────
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'happy-bus' and c.slug = 'transport'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '幸福小黃／幸福巴士 全國諮詢',
  '公路局補助偏鄉地區預約接送服務，提供長者與行動不便者就醫、購物等接送，費用低廉或免費。',
  '0800-231-035',
  '可說：「我住 OO 鄉（鎮），想查詢幸福小黃的服務路線和預約方式。」',
  'https://www.thb.gov.tw',
  array['elder','family'], array['偏鄉','接送','幸福小黃','幸福巴士'],
  '交通部公路局', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '幸福小黃／幸福巴士 全國諮詢'
);

-- ────────────────────────────────────────────────────────────
-- 交通接駁 ▸ 噗噗共乘
-- ────────────────────────────────────────────────────────────
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'pupu-rideshare' and c.slug = 'transport'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '嗶嗶共乘 — 偏鄉共乘預約',
  '提供偏鄉地區居民預約共乘服務，透過手機定位配對乘客，適合無車長者外出就醫或購物。',
  '0800-005-978',
  '可說：「我想預約嗶嗶共乘，從 OO 到 XX，預計幾點出發。」',
  array['elder','family'], array['共乘','偏鄉','預約接送'],
  '嗶嗶共乘', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '嗶嗶共乘 — 偏鄉共乘預約'
);

-- ────────────────────────────────────────────────────────────
-- 交通接駁 ▸ 長照交通接送
-- ────────────────────────────────────────────────────────────
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'ltc-transport' and c.slug = 'transport'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '長照 2.0 — 交通接送服務',
  '長照 2.0 提供失能長者就醫、復健交通接送補助，透過 1966 或長照管理中心申請評估後使用。',
  '1966',
  '也可撥 (02)8590-6666，說：「我家長輩需要到醫院復健，想申請長照交通接送，請問怎麼辦？」',
  'https://1966.gov.tw',
  array['elder','family'], array['長照','交通接送','就醫復健'],
  '衛生福利部長期照顧司', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '長照 2.0 — 交通接送服務'
);

-- 交通接駁 ▸ 無障礙計程車（交通類）
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'accessible-taxi' and c.slug = 'transport'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '台灣大車隊 — 無障礙計程車（日常出行）',
  '24 小時全國調度，輪椅可上車，適合長者日常外出、就醫、訪友等各種需求。',
  '0800-055-850',
  '撥通後按「3」，說：「我需要一台無障礙計程車，明天從 OO 出發。」',
  array['elder','family'], array['無障礙','計程車','外出'],
  '台灣大車隊', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '台灣大車隊 — 無障礙計程車（日常出行）'
);

with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'accessible-taxi' and c.slug = 'transport'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '大都會車隊 — 無障礙計程車（日常出行）',
  '手機直撥 55178 快速叫無障礙車，提供輪椅可搭乘的計程車，適合各種日常出行。',
  '(02)4499-178',
  '手機直撥 55178 或撥 (02)4499-178，說：「我需要一台無障礙計程車，出發地是...」',
  array['elder','family'], array['無障礙','計程車','外出'],
  '大都會車隊', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '大都會車隊 — 無障礙計程車（日常出行）'
);

-- 交通接駁 ▸ 復康巴士預約
with sub as (
  select sc.id from public.subcategories sc
  join public.categories c on sc.category_id = c.id
  where sc.slug = 'rehab-bus-booking' and c.slug = 'transport'
), reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '復康巴士全國預約諮詢',
  '復康巴士由各縣市政府社會局（處）辦理，提供身障及行動不便者就醫、復健接送，撥打可查詢各地預約方式。',
  '0800-231-161',
  '可說：「我住 OO 縣市，想申請復康巴士服務，請問需要哪些資格及如何預約？」',
  array['elder','family'], array['復康巴士','身障','預約'],
  '交通部', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '復康巴士全國預約諮詢'
);

-- ────────────────────────────────────────────────────────────
-- 居住安全 ▸ 修繕補助
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'repair-subsidy'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '內政部 — 住宅修繕補助諮詢',
  '提供低收入、中低收入、老人、身障等弱勢住宅修繕費用補助；電話可詢問申請資格及流程。',
  '(02)7729-8003',
  '可說：「我家浴室需要修繕，我是老人，請問有補助可以申請嗎？需要準備什麼文件？」',
  'https://pip.moi.gov.tw',
  array['elder','family'], array['修繕','補助','住宅'],
  '內政部不動產資訊平台', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '內政部 — 住宅修繕補助諮詢'
);

-- 居住安全 ▸ 附近水電行
with sub as (select id from public.subcategories where slug = 'nearby-utility'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '588 水電裝修網 — 師傅媒合平台',
  '全台水電師傅媒合平台，提供水管、電路、瓦斯、冷氣等修繕服務，可按縣市搜尋附近師傅聯絡方式。',
  NULL,
  '進入網站後選擇所在縣市，即可查詢附近水電師傅的電話。',
  'https://www.588.com.tw',
  array['elder','family'], array['水電','修繕','師傅媒合'],
  '588水電裝修網', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '588 水電裝修網 — 師傅媒合平台'
);

-- 居住安全 ▸ 用電安全
with sub as (select id from public.subcategories where slug = 'electric-safety'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '經濟部能源署 — 用電安全服務',
  '提供電線電器老舊安全檢測資訊，可查詢合格電器承裝檢驗維護廠商，避免家中電氣危險。',
  '(02)2755-2467',
  '可說：「我家電線已經很老舊，想找人來檢查是否安全，請問怎麼找到合格的廠商？」',
  'https://www.moeaea.gov.tw',
  array['elder','family'], array['電器','用電安全','老舊電線'],
  '經濟部能源署', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '經濟部能源署 — 用電安全服務'
);

-- 居住安全 ▸ 防跌施工（長照補助）
with sub as (select id from public.subcategories where slug = 'fall-prevention'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '長照 2.0 — 居家無障礙環境改善補助',
  '提供扶手、防滑地墊、可調式床等居家改善補助，最高 10 萬元（需符合失能等級），透過 1966 申請評估。',
  '1966',
  '可說：「我想申請浴室裝扶手、防滑墊的補助，下一步怎麼做？」',
  'https://1966.gov.tw',
  array['elder','family'], array['防跌','扶手','無障礙補助'],
  '衛福部長照司', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '長照 2.0 — 居家無障礙環境改善補助'
);

-- 居住安全 ▸ 社會住宅
with sub as (select id from public.subcategories where slug = 'social-housing'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '內政部不動產資訊平台 — 社會住宅',
  '提供老人、身障、低收入等弱勢族群申請社會住宅的資訊，可透過平台查詢各地可申請的社宅名額。',
  '(02)5574-0089',
  '可說：「我是 65 歲老人，想申請社會住宅，請問哪裡查詢資格與空缺？」',
  'https://pip.moi.gov.tw',
  array['elder','family'], array['社會住宅','居住','補貼'],
  '內政部', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '內政部不動產資訊平台 — 社會住宅'
);

-- 居住安全 ▸ 包租代管
with sub as (select id from public.subcategories where slug = 'rent-agency'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '內政部 — 社會住宅包租代管',
  '政府推動「社會住宅包租代管」，媒合房東出租給弱勢族群，租金有政府補貼，老人可優先申請。',
  '(02)5574-0089',
  '可說：「我是老人，想租房子，請問社會住宅包租代管怎麼申請？」',
  'https://pip.moi.gov.tw',
  array['elder','family'], array['租屋','包租代管','租金補貼'],
  '內政部', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '內政部 — 社會住宅包租代管'
);

-- 居住安全 ▸ 崔媽媽基金會
with sub as (select id from public.subcategories where slug = 'tsuei-mama'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '崔媽媽基金會',
  '民間租屋協助機構，提供租屋資訊、看房陪同、租屋糾紛諮詢及居住政策倡議服務。',
  '(02)2365-8140',
  '可說：「我需要找租屋，或者房東跟我有糾紛，想請崔媽媽協助。」',
  'https://www.tmm.org.tw',
  array['elder','family'], array['租屋','糾紛','居住諮詢'],
  '崔媽媽基金會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '崔媽媽基金會'
);

-- 居住安全 ▸ 居服員申請（長照）
with sub as (select id from public.subcategories where slug = 'home-care-worker'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '長照 2.0 — 居服員到府服務',
  '透過長照 2.0 申請居家服務員定期到府，協助洗澡、備餐、協助行動、打掃等日常生活照護。',
  '1966',
  '也可撥 (02)8590-6666，說：「我想申請居服員到家幫我家長輩洗澡、備餐，請問怎麼辦？」',
  'https://1966.gov.tw',
  array['elder','family'], array['居服員','居家照護','長照'],
  '衛生福利部長期照顧司', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '長照 2.0 — 居服員到府服務'
);

-- ────────────────────────────────────────────────────────────
-- 經濟財務 ▸ 防詐騙
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'anti-fraud'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '110 報案專線 — 詐騙案件',
  '懷疑遭到詐騙時，立即撥打 110 向警察局報案，說明情況可獲即時協助。',
  '110',
  '可說：「有人打電話自稱是 OO 機構，要我轉帳或操作 ATM，我懷疑是詐騙，請問怎麼辦？」',
  'https://www.npa.gov.tw',
  array['elder','family','volunteer'], array['詐騙','報案','緊急'],
  '內政部警政署', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '110 報案專線 — 詐騙案件'
);

-- 經濟財務 ▸ 財產繼承
with sub as (select id from public.subcategories where slug = 'inheritance'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '中華民國法律諮詢協會 — 財產繼承諮詢',
  '提供財產繼承相關免費電話法律諮詢，協助了解遺產分配、繼承程序、遺囑效力等問題。',
  '0800-555-355',
  '可說：「我想了解我過世後財產如何分配給子女，請問預立遺囑和法定繼承有什麼差異？」',
  array['elder','family'], array['繼承','遺產','法律諮詢'],
  '中華民國法律諮詢協會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '中華民國法律諮詢協會 — 財產繼承諮詢'
);

-- 經濟財務 ▸ 預立遺囑
with sub as (select id from public.subcategories where slug = 'will-prep'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '中華民國法律諮詢協會 — 預立遺囑諮詢',
  '提供預立遺囑相關法律諮詢，協助長者依法完成遺囑書寫，確保個人意願受到法律保障。',
  '0800-555-355',
  '可說：「我想預立遺囑，請問自書遺囑要怎麼寫才具有法律效力？需要公證嗎？」',
  array['elder','family'], array['遺囑','法律諮詢','財產規劃'],
  '中華民國法律諮詢協會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '中華民國法律諮詢協會 — 預立遺囑諮詢'
);

-- 經濟財務 ▸ 安養信託
with sub as (select id from public.subcategories where slug = 'elder-trust'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '中華民國信託業商業同業公會 — 安養信託',
  '提供「安養信託」制度介紹，協助長者透過信託方式保障晚年生活費用安全管理，可電話查詢合作銀行。',
  '(02)2351-5299',
  '可說：「我想了解安養信託怎麼設立，對我老年後的財產保障有什麼好處？」',
  'https://www.trust.org.tw',
  array['elder','family'], array['信託','安養','財產保障'],
  '中華民國信託業商業同業公會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '中華民國信託業商業同業公會 — 安養信託'
);

-- 經濟財務 ▸ 財產管理
with sub as (select id from public.subcategories where slug = 'asset-management'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '中華民國老人福利推動聯盟 — 財務管理資源',
  '提供老人福利相關資訊，含財務管理介紹、安養信託說明、理財課程引導，可電話諮詢。',
  '(02)2592-7999',
  '可說：「我想了解老年後如何妥善管理自己的財產，有哪些推薦的做法？」',
  'https://www.oldpeople.org.tw',
  array['elder','family'], array['財務管理','老人福利','規劃'],
  '中華民國老人福利推動聯盟', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '中華民國老人福利推動聯盟 — 財務管理資源'
);

-- ────────────────────────────────────────────────────────────
-- 社會資源 ▸ 社會福利諮詢
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'welfare-consult'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '中華民國老人福利推動聯盟',
  '提供老人福利資訊諮詢，協助長者了解各項政府補助、長照服務、社會資源的申請管道。',
  '(02)2592-7999',
  '可說：「請問我家長輩可以申請哪些政府補助或社會福利資源？」',
  'https://www.oldpeople.org.tw',
  array['elder','family','volunteer'], array['福利諮詢','老人福利','資源媒合'],
  '中華民國老人福利推動聯盟', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '中華民國老人福利推動聯盟'
);

-- 社會資源 ▸ 心理諮詢（男性關懷）
with sub as (select id from public.subcategories where slug = 'mental-hotline'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '男性關懷專線',
  '提供男性情緒抒發管道，含壓力調適、家庭關係、自殺防治等心理諮詢服務，免費撥打。',
  '0800-013-999',
  '可說：「我最近壓力很大、情緒不好，想找人聊聊。」',
  array['elder','family','volunteer'], array['心理','男性','情緒抒發'],
  '衛生福利部', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '男性關懷專線'
);

-- 社會資源 ▸ 家暴專線
with sub as (select id from public.subcategories where slug = 'domestic-violence'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '113 保護專線 — 家庭暴力、性侵、兒虐',
  '24 小時家庭暴力、性侵害及兒童虐待保護專線，任何人可代為通報，並提供心理支持與安置資源。',
  '113',
  '遇到家暴立刻撥 113。可說：「我（或我認識的人）受到家人暴力對待，請問怎麼處理？」',
  array['elder','family','volunteer'], array['家暴','保護','緊急通報'],
  '衛生福利部保護服務司', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '113 保護專線 — 家庭暴力、性侵、兒虐'
);

-- 社會資源 ▸ 法律諮詢
with sub as (select id from public.subcategories where slug = 'legal-consult'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '中華民國法律諮詢協會',
  '提供免費電話法律諮詢，涵蓋財產、租屋、離婚、老人保護等各類民事問題，服務時間請來電確認。',
  '0800-555-355',
  '可說：「我想諮詢 OO 法律問題，請問現在方便說明嗎？」',
  array['elder','family','volunteer'], array['法律','免費諮詢','民事'],
  '中華民國法律諮詢協會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '中華民國法律諮詢協會'
);

-- 社會資源 ▸ 法扶基金會
with sub as (select id from public.subcategories where slug = 'laf'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '財團法人法律扶助基金會',
  '為經濟困難者提供免費或低費法律扶助，含法律諮詢、訴訟代理、調解等服務，老人可優先申請。',
  '(02)412-8518',
  '可說：「我家境困難，現在面臨法律糾紛，請問可以申請法律扶助嗎？條件是什麼？」',
  'https://www.laf.org.tw',
  array['elder','family','volunteer'], array['法扶','訴訟援助','免費法律'],
  '財團法人法律扶助基金會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '財團法人法律扶助基金會'
);

-- ────────────────────────────────────────────────────────────
-- 教育進修 ▸ 二次就業
-- ────────────────────────────────────────────────────────────
with sub as (select id from public.subcategories where slug = 'second-career'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '45+ 就業資源網（銀髮資源網）',
  '勞動部建置，專為 45 歲以上中高齡者提供就業媒合、技能培訓、創業輔導等資源，並可查詢附近就業服務站。',
  NULL,
  '進入網站搜尋符合自身條件的工作機會或職訓課程。若需面對面協助，可查詢附近的就業服務站電話預約。',
  'https://www.wda.gov.tw/senior',
  array['elder'], array['就業','銀髮','再就業','職訓'],
  '勞動部', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '45+ 就業資源網（銀髮資源網）'
);

-- 教育進修 ▸ 樂齡大學 / 社區大學
with sub as (select id from public.subcategories where slug = 'elder-university'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '教育部樂齡學習網',
  '提供全國樂齡學習中心課程資訊，55 歲以上長者可就近報名手機、語言、藝文、健康等免費或低費課程。',
  NULL,
  '進入網站後搜尋縣市，找到所在地樂齡中心後查詢課程時間與報名方式，或直接致電中心詢問。',
  'https://moe.senioredu.moe.gov.tw',
  array['elder'], array['樂齡','課程','終身學習'],
  '教育部終身教育司', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '教育部樂齡學習網'
);

with sub as (select id from public.subcategories where slug = 'elder-university'),
     reg as (select id from public.regions where code = 'TW')
insert into public.resources
  (subcategory_id, scope, region_id, name, summary, phone, phone_hint,
   website_url, identity_tags, tags, source_org, status)
select sub.id, 'national', reg.id,
  '全國社區大學教育資訊網',
  '提供全台社區大學開課資訊，長者可依興趣選修人文、藝術、生活技能等多元課程，費用低廉。',
  NULL,
  '進入網站後依縣市查詢附近的社區大學，選擇課程報名，也可直接致電社區大學詢問。',
  'https://www.ccda.org.tw',
  array['elder'], array['社區大學','課程','學習'],
  '全國社區大學促進會', 'active'
from sub, reg
where not exists (
  select 1 from public.resources r
  where r.subcategory_id = sub.id and r.region_id = reg.id
    and r.name = '全國社區大學教育資訊網'
);
