-- ============================================================
-- 全台 22 縣市 + 主要行政區完整種子資料
-- 重跑安全：全部使用 ON CONFLICT (code) DO NOTHING
-- ============================================================

-- ── 22 縣市（全部） ──────────────────────────────────────────
with tw as (select id from public.regions where code = 'TW')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'county', tw.id, d.name, d.code, d.lat, d.lon
from tw, (values
  ('台北市',  'TW-TPE', 25.0330, 121.5654),
  ('新北市',  'TW-NTP', 25.0169, 121.4627),
  -- 桃園市 TW-TYC 已存在，略過
  ('台中市',  'TW-TXG', 24.1477, 120.6736),
  ('台南市',  'TW-TNN', 22.9999, 120.2269),
  ('高雄市',  'TW-KHH', 22.6273, 120.3014),
  ('基隆市',  'TW-KEL', 25.1283, 121.7419),
  ('新竹市',  'TW-HSZ', 24.8036, 120.9686),
  ('嘉義市',  'TW-CYI', 23.4801, 120.4491),
  ('新竹縣',  'TW-HSQ', 24.8387, 121.0177),
  ('苗栗縣',  'TW-MIA', 24.5602, 120.8214),
  ('彰化縣',  'TW-CHA', 24.0517, 120.5161),
  ('南投縣',  'TW-NAN', 23.9609, 120.9718),
  ('雲林縣',  'TW-YUN', 23.7090, 120.4313),
  ('嘉義縣',  'TW-CHY', 23.4518, 120.2554),
  ('屏東縣',  'TW-PIF', 22.6761, 120.4882),
  ('宜蘭縣',  'TW-ILA', 24.6974, 121.7382),
  ('花蓮縣',  'TW-HUA', 23.9871, 121.6015),
  ('台東縣',  'TW-TTT', 22.7583, 121.1444),
  ('澎湖縣',  'TW-PEH', 23.5711, 119.5793),
  ('金門縣',  'TW-KIN', 24.4493, 118.3765),
  ('連江縣',  'TW-LIE', 26.1505, 119.9497)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 台北市 12 區 ─────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-TPE')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('中正區', 'TW-TPE-ZZ', 25.0429, 121.5196),
  ('大同區', 'TW-TPE-DT', 25.0636, 121.5136),
  ('中山區', 'TW-TPE-ZS', 25.0697, 121.5365),
  ('松山區', 'TW-TPE-SS', 25.0494, 121.5779),
  ('大安區', 'TW-TPE-DA', 25.0268, 121.5449),
  ('萬華區', 'TW-TPE-WH', 25.0330, 121.4997),
  ('信義區', 'TW-TPE-XY', 25.0277, 121.5740),
  ('士林區', 'TW-TPE-SL', 25.0932, 121.5229),
  ('北投區', 'TW-TPE-BT', 25.1323, 121.4989),
  ('內湖區', 'TW-TPE-NH', 25.0832, 121.5867),
  ('南港區', 'TW-TPE-NG', 25.0549, 121.6078),
  ('文山區', 'TW-TPE-WS', 24.9981, 121.5713)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 新北市 29 區 ─────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-NTP')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('板橋區', 'TW-NTP-BQ',  25.0070, 121.4547),
  ('三重區', 'TW-NTP-SC',  25.0652, 121.4876),
  ('中和區', 'TW-NTP-ZH',  24.9983, 121.4957),
  ('永和區', 'TW-NTP-YH',  25.0127, 121.5173),
  ('新莊區', 'TW-NTP-XZ',  25.0437, 121.4402),
  ('新店區', 'TW-NTP-XD',  24.9681, 121.5384),
  ('土城區', 'TW-NTP-TC',  24.9728, 121.4369),
  ('蘆洲區', 'TW-NTP-LZ',  25.0862, 121.4713),
  ('樹林區', 'TW-NTP-SL',  24.9886, 121.4155),
  ('鶯歌區', 'TW-NTP-YG',  24.9577, 121.3425),
  ('三峽區', 'TW-NTP-SX',  24.9344, 121.3680),
  ('淡水區', 'TW-NTP-DS',  25.1681, 121.4416),
  ('汐止區', 'TW-NTP-XZH', 25.0665, 121.6578),
  ('瑞芳區', 'TW-NTP-RF',  25.1063, 121.8023),
  ('五股區', 'TW-NTP-WG',  25.0862, 121.4384),
  ('泰山區', 'TW-NTP-TS',  25.0578, 121.4267),
  ('林口區', 'TW-NTP-LK',  25.0777, 121.3744),
  ('深坑區', 'TW-NTP-SK',  25.0012, 121.6103),
  ('石碇區', 'TW-NTP-SD',  24.9732, 121.6564),
  ('坪林區', 'TW-NTP-PL',  24.9303, 121.7083),
  ('三芝區', 'TW-NTP-SZ',  25.2280, 121.4946),
  ('石門區', 'TW-NTP-SM',  25.2844, 121.5677),
  ('八里區', 'TW-NTP-BL',  25.1494, 121.3977),
  ('平溪區', 'TW-NTP-PX',  25.0274, 121.7407),
  ('雙溪區', 'TW-NTP-SXI', 25.0384, 121.8703),
  ('貢寮區', 'TW-NTP-GL',  25.0196, 121.9200),
  ('金山區', 'TW-NTP-JS',  25.2214, 121.6397),
  ('萬里區', 'TW-NTP-WL',  25.1793, 121.6867),
  ('烏來區', 'TW-NTP-WLL', 24.8677, 121.5461)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 桃園市 12 區（中壢 TW-TYC-ZL 已存在） ────────────────────
with p as (select id from public.regions where code = 'TW-TYC')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('桃園區', 'TW-TYC-TY', 24.9936, 121.3010),
  ('大溪區', 'TW-TYC-DX', 24.8816, 121.2878),
  ('楊梅區', 'TW-TYC-YM', 24.9119, 121.1444),
  ('蘆竹區', 'TW-TYC-LZ', 25.0714, 121.2760),
  ('大園區', 'TW-TYC-DY', 25.0557, 121.2242),
  ('龜山區', 'TW-TYC-GS', 25.0388, 121.3450),
  ('八德區', 'TW-TYC-BD', 24.9478, 121.3017),
  ('龍潭區', 'TW-TYC-LT', 24.8656, 121.2194),
  ('平鎮區', 'TW-TYC-PZ', 24.9412, 121.2183),
  ('新屋區', 'TW-TYC-XW', 24.9747, 121.0823),
  ('觀音區', 'TW-TYC-GY', 25.0208, 121.1275),
  ('復興區', 'TW-TYC-FX', 24.8023, 121.3744)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 台中市 29 區 ─────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-TXG')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('中區',   'TW-TXG-ZQ',  24.1477, 120.6736),
  ('東區',   'TW-TXG-DQ',  24.1417, 120.6929),
  ('南區',   'TW-TXG-NQ',  24.1284, 120.6796),
  ('西區',   'TW-TXG-XQ',  24.1526, 120.6609),
  ('北區',   'TW-TXG-BQ',  24.1616, 120.6769),
  ('北屯區', 'TW-TXG-BTN', 24.1895, 120.7094),
  ('西屯區', 'TW-TXG-XTN', 24.1627, 120.6370),
  ('南屯區', 'TW-TXG-NTN', 24.1189, 120.6436),
  ('太平區', 'TW-TXG-TP',  24.1271, 120.7342),
  ('大里區', 'TW-TXG-DL',  24.0993, 120.6876),
  ('霧峰區', 'TW-TXG-WF',  24.0618, 120.7201),
  ('烏日區', 'TW-TXG-WR',  24.0803, 120.6530),
  ('豐原區', 'TW-TXG-FY',  24.2381, 120.7215),
  ('后里區', 'TW-TXG-HL',  24.3038, 120.7074),
  ('石岡區', 'TW-TXG-SG',  24.2780, 120.7717),
  ('東勢區', 'TW-TXG-DS',  24.2573, 120.8250),
  ('和平區', 'TW-TXG-HP',  24.3612, 121.1729),
  ('新社區', 'TW-TXG-XS',  24.2281, 120.8113),
  ('潭子區', 'TW-TXG-TZ',  24.2102, 120.7198),
  ('大雅區', 'TW-TXG-DY',  24.2259, 120.6643),
  ('神岡區', 'TW-TXG-SKG', 24.2599, 120.6640),
  ('大肚區', 'TW-TXG-DD',  24.1512, 120.5685),
  ('沙鹿區', 'TW-TXG-SLU', 24.2005, 120.5707),
  ('龍井區', 'TW-TXG-LJ',  24.1710, 120.5619),
  ('梧棲區', 'TW-TXG-WQ',  24.2505, 120.5333),
  ('清水區', 'TW-TXG-QS',  24.2669, 120.5692),
  ('大甲區', 'TW-TXG-DJ',  24.3448, 120.6153),
  ('外埔區', 'TW-TXG-WP',  24.3230, 120.6479),
  ('大安區', 'TW-TXG-DA',  24.4022, 120.6439)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 台南市 37 區 ─────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-TNN')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('中西區', 'TW-TNN-ZX',  23.0017, 120.2069),
  ('東區',   'TW-TNN-DQ',  23.0088, 120.2267),
  ('南區',   'TW-TNN-NQ',  22.9880, 120.2104),
  ('北區',   'TW-TNN-BQ',  23.0204, 120.2139),
  ('安平區', 'TW-TNN-AP',  23.0107, 120.1632),
  ('安南區', 'TW-TNN-AN',  23.0600, 120.1843),
  ('永康區', 'TW-TNN-YK',  23.0469, 120.2625),
  ('歸仁區', 'TW-TNN-GR',  23.0039, 120.2999),
  ('新化區', 'TW-TNN-XH',  23.0379, 120.3117),
  ('左鎮區', 'TW-TNN-ZZ',  23.0189, 120.3712),
  ('玉井區', 'TW-TNN-YJ',  23.1219, 120.4544),
  ('楠西區', 'TW-TNN-NX',  23.1893, 120.5018),
  ('南化區', 'TW-TNN-NH',  23.1507, 120.4774),
  ('仁德區', 'TW-TNN-RD',  22.9652, 120.2394),
  ('關廟區', 'TW-TNN-GM',  22.9716, 120.3241),
  ('龍崎區', 'TW-TNN-LQ',  22.9546, 120.3750),
  ('官田區', 'TW-TNN-GT',  23.1043, 120.3064),
  ('麻豆區', 'TW-TNN-MD',  23.1832, 120.2571),
  ('佳里區', 'TW-TNN-JL',  23.1668, 120.1785),
  ('西港區', 'TW-TNN-XG',  23.1131, 120.2024),
  ('七股區', 'TW-TNN-QG',  23.1478, 120.1197),
  ('將軍區', 'TW-TNN-JJ',  23.1934, 120.0820),
  ('學甲區', 'TW-TNN-XJ',  23.2249, 120.1358),
  ('北門區', 'TW-TNN-BM',  23.2645, 120.1119),
  ('新營區', 'TW-TNN-XY',  23.3046, 120.3162),
  ('後壁區', 'TW-TNN-HB',  23.3822, 120.3479),
  ('白河區', 'TW-TNN-BH',  23.3565, 120.4310),
  ('東山區', 'TW-TNN-TSH', 23.3100, 120.4480),
  ('六甲區', 'TW-TNN-LJA', 23.2281, 120.3769),
  ('下營區', 'TW-TNN-XN',  23.2266, 120.2508),
  ('柳營區', 'TW-TNN-LN',  23.2623, 120.3424),
  ('鹽水區', 'TW-TNN-YS',  23.3190, 120.2737),
  ('善化區', 'TW-TNN-SH',  23.1361, 120.2971),
  ('大內區', 'TW-TNN-DN',  23.0986, 120.3768),
  ('山上區', 'TW-TNN-SS',  23.0719, 120.3450),
  ('新市區', 'TW-TNN-XM',  23.0749, 120.2929),
  ('安定區', 'TW-TNN-AD',  23.0596, 120.2434)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 高雄市 38 區 ─────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-KHH')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('楠梓區', 'TW-KHH-NZ',  22.7350, 120.3368),
  ('左營區', 'TW-KHH-ZY',  22.6865, 120.3004),
  ('鼓山區', 'TW-KHH-GS',  22.6583, 120.2888),
  ('三民區', 'TW-KHH-SM',  22.6477, 120.3170),
  ('鹽埕區', 'TW-KHH-YC',  22.6249, 120.2863),
  ('前金區', 'TW-KHH-QJ',  22.6309, 120.3006),
  ('新興區', 'TW-KHH-XX',  22.6368, 120.3055),
  ('前鎮區', 'TW-KHH-QZ',  22.5968, 120.3225),
  ('苓雅區', 'TW-KHH-LA',  22.6196, 120.3277),
  ('小港區', 'TW-KHH-XP',  22.5673, 120.3478),
  ('鳳山區', 'TW-KHH-FS',  22.6270, 120.3571),
  ('林園區', 'TW-KHH-LY',  22.5024, 120.4024),
  ('大寮區', 'TW-KHH-DL',  22.5921, 120.3988),
  ('大樹區', 'TW-KHH-DS',  22.6868, 120.4369),
  ('大社區', 'TW-KHH-DSH', 22.7241, 120.3598),
  ('仁武區', 'TW-KHH-RW',  22.7024, 120.3473),
  ('鳥松區', 'TW-KHH-WS',  22.6605, 120.3849),
  ('岡山區', 'TW-KHH-GSD', 22.7968, 120.2952),
  ('橋頭區', 'TW-KHH-QT',  22.7528, 120.3126),
  ('燕巢區', 'TW-KHH-YQ',  22.7891, 120.3673),
  ('田寮區', 'TW-KHH-TL',  22.8732, 120.3880),
  ('阿蓮區', 'TW-KHH-AL',  22.8727, 120.2936),
  ('路竹區', 'TW-KHH-LZ',  22.8571, 120.2601),
  ('湖內區', 'TW-KHH-HN',  22.9042, 120.2191),
  ('茄萣區', 'TW-KHH-QD',  22.9254, 120.1855),
  ('永安區', 'TW-KHH-YA',  22.8351, 120.2276),
  ('彌陀區', 'TW-KHH-MT',  22.8685, 120.2479),
  ('梓官區', 'TW-KHH-ZG',  22.8175, 120.2645),
  ('旗山區', 'TW-KHH-QSH', 22.8892, 120.4803),
  ('美濃區', 'TW-KHH-MN',  22.8984, 120.5439),
  ('六龜區', 'TW-KHH-LG',  23.0002, 120.6286),
  ('甲仙區', 'TW-KHH-JX',  23.0766, 120.5835),
  ('杉林區', 'TW-KHH-SL',  22.9707, 120.5384),
  ('內門區', 'TW-KHH-NM',  22.9479, 120.4605),
  ('茂林區', 'TW-KHH-ML',  22.9117, 120.6601),
  ('桃源區', 'TW-KHH-TY',  23.1625, 120.8133),
  ('那瑪夏區','TW-KHH-NMX', 23.2532, 120.7022),
  ('旗津區', 'TW-KHH-QJN', 22.5951, 120.2824)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 基隆市 7 區 ──────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-KEL')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('仁愛區', 'TW-KEL-RA', 25.1278, 121.7395),
  ('信義區', 'TW-KEL-XY', 25.1340, 121.7667),
  ('中正區', 'TW-KEL-ZZ', 25.1170, 121.7321),
  ('中山區', 'TW-KEL-ZS', 25.1378, 121.7482),
  ('安樂區', 'TW-KEL-AL', 25.1444, 121.7157),
  ('暖暖區', 'TW-KEL-NN', 25.1020, 121.7622),
  ('七堵區', 'TW-KEL-QD', 25.0979, 121.7336)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 新竹市 3 區 ──────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-HSZ')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('東區', 'TW-HSZ-DQ', 24.8036, 120.9686),
  ('北區', 'TW-HSZ-BQ', 24.8226, 120.9713),
  ('香山區','TW-HSZ-XS', 24.7742, 120.9394)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 嘉義市 2 區 ──────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-CYI')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('東區', 'TW-CYI-DQ', 23.4801, 120.4491),
  ('西區', 'TW-CYI-XQ', 23.4755, 120.4387)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 新竹縣 13 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-HSQ')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('竹北市', 'TW-HSQ-ZB', 24.8387, 121.0177),
  ('湖口鄉', 'TW-HSQ-HK', 24.9020, 121.0537),
  ('新豐鄉', 'TW-HSQ-XF', 24.9298, 121.0285),
  ('新埔鎮', 'TW-HSQ-XP', 24.8363, 121.0826),
  ('關西鎮', 'TW-HSQ-GX', 24.7919, 121.1713),
  ('芎林鄉', 'TW-HSQ-QL', 24.8019, 121.0673),
  ('竹東鎮', 'TW-HSQ-ZD', 24.7370, 121.0931),
  ('寶山鄉', 'TW-HSQ-BS', 24.7700, 120.9971),
  ('橫山鄉', 'TW-HSQ-HS', 24.7201, 121.1217),
  ('北埔鄉', 'TW-HSQ-BP', 24.6959, 121.0599),
  ('峨眉鄉', 'TW-HSQ-EM', 24.6700, 121.0197),
  ('尖石鄉', 'TW-HSQ-JS', 24.6439, 121.2022),
  ('五峰鄉', 'TW-HSQ-WF', 24.6378, 121.0100)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 苗栗縣 18 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-MIA')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('苗栗市', 'TW-MIA-ML',  24.5602, 120.8214),
  ('竹南鎮', 'TW-MIA-ZN',  24.6840, 120.8680),
  ('頭份市', 'TW-MIA-TF',  24.6956, 120.8978),
  ('三灣鄉', 'TW-MIA-SW',  24.6535, 120.9360),
  ('南庄鄉', 'TW-MIA-NZ',  24.6169, 120.9940),
  ('獅潭鄉', 'TW-MIA-ST',  24.5888, 120.9768),
  ('後龍鎮', 'TW-MIA-HL',  24.6134, 120.7894),
  ('通霄鎮', 'TW-MIA-TX',  24.4984, 120.6944),
  ('苑裡鎮', 'TW-MIA-YL',  24.4372, 120.6507),
  ('造橋鄉', 'TW-MIA-ZQ',  24.5968, 120.8524),
  ('頭屋鄉', 'TW-MIA-TW',  24.5578, 120.8623),
  ('公館鄉', 'TW-MIA-GG',  24.5041, 120.8283),
  ('大湖鄉', 'TW-MIA-DH',  24.4237, 120.8778),
  ('泰安鄉', 'TW-MIA-TA',  24.4305, 121.0002),
  ('銅鑼鄉', 'TW-MIA-TL',  24.4752, 120.7988),
  ('三義鄉', 'TW-MIA-SY',  24.3877, 120.7585),
  ('西湖鄉', 'TW-MIA-XH',  24.4574, 120.7438),
  ('卓蘭鎮', 'TW-MIA-ZL',  24.3313, 120.8356)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 彰化縣 26 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-CHA')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('彰化市', 'TW-CHA-ZH',  24.0517, 120.5161),
  ('員林市', 'TW-CHA-YL',  23.9584, 120.5710),
  ('和美鎮', 'TW-CHA-HM',  24.0927, 120.5021),
  ('鹿港鎮', 'TW-CHA-LG',  24.0539, 120.4374),
  ('溪湖鎮', 'TW-CHA-XH',  23.9626, 120.4847),
  ('田中鎮', 'TW-CHA-TZ',  23.8731, 120.5877),
  ('北斗鎮', 'TW-CHA-BD',  23.8709, 120.5284),
  ('二林鎮', 'TW-CHA-EL',  23.9084, 120.3952),
  ('線西鄉', 'TW-CHA-XX',  24.1184, 120.4711),
  ('伸港鄉', 'TW-CHA-SG',  24.1225, 120.5109),
  ('福興鄉', 'TW-CHA-FX',  24.0393, 120.4596),
  ('秀水鄉', 'TW-CHA-XS',  24.0309, 120.5108),
  ('花壇鄉', 'TW-CHA-HT',  24.0168, 120.5337),
  ('芬園鄉', 'TW-CHA-FY',  24.0106, 120.5729),
  ('大村鄉', 'TW-CHA-DC',  24.0013, 120.5423),
  ('埔鹽鄉', 'TW-CHA-PY',  23.9750, 120.4815),
  ('埔心鄉', 'TW-CHA-PX',  23.9547, 120.5226),
  ('永靖鄉', 'TW-CHA-YJ',  23.9270, 120.5310),
  ('社頭鄉', 'TW-CHA-ST',  23.9176, 120.5537),
  ('二水鄉', 'TW-CHA-ES',  23.8170, 120.6037),
  ('田尾鄉', 'TW-CHA-TW',  23.9004, 120.5237),
  ('埤頭鄉', 'TW-CHA-PT',  23.8780, 120.4814),
  ('芳苑鄉', 'TW-CHA-FYA', 23.9537, 120.3596),
  ('大城鄉', 'TW-CHA-DC2', 23.8871, 120.3552),
  ('竹塘鄉', 'TW-CHA-ZT',  23.9165, 120.4260),
  ('溪州鄉', 'TW-CHA-XZ',  23.8498, 120.5122)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 南投縣 13 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-NAN')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('南投市', 'TW-NAN-NT', 23.9193, 120.6850),
  ('埔里鎮', 'TW-NAN-PL', 23.9609, 120.9718),
  ('草屯鎮', 'TW-NAN-CT', 23.9735, 120.6853),
  ('竹山鎮', 'TW-NAN-ZS', 23.7571, 120.6699),
  ('集集鎮', 'TW-NAN-JJ', 23.8316, 120.7806),
  ('名間鄉', 'TW-NAN-MJ', 23.8636, 120.6969),
  ('鹿谷鄉', 'TW-NAN-LG', 23.7526, 120.7595),
  ('中寮鄉', 'TW-NAN-ZL', 23.8869, 120.7372),
  ('魚池鄉', 'TW-NAN-YC', 23.9127, 120.9282),
  ('國姓鄉', 'TW-NAN-GX', 24.0341, 120.8622),
  ('水里鄉', 'TW-NAN-SL', 23.8118, 120.8556),
  ('信義鄉', 'TW-NAN-XY', 23.6956, 120.8620),
  ('仁愛鄉', 'TW-NAN-RA', 24.0731, 121.1640)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 雲林縣 20 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-YUN')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('斗六市', 'TW-YUN-DL',  23.7090, 120.5443),
  ('斗南鎮', 'TW-YUN-DN',  23.6775, 120.4789),
  ('虎尾鎮', 'TW-YUN-HW',  23.7076, 120.4294),
  ('西螺鎮', 'TW-YUN-XL',  23.7017, 120.4660),
  ('土庫鎮', 'TW-YUN-TK',  23.6707, 120.3836),
  ('北港鎮', 'TW-YUN-BG',  23.5718, 120.3010),
  ('古坑鄉', 'TW-YUN-GK',  23.6562, 120.5897),
  ('大埤鄉', 'TW-YUN-DP',  23.6393, 120.4647),
  ('莿桐鄉', 'TW-YUN-CT',  23.7365, 120.5096),
  ('林內鄉', 'TW-YUN-LN',  23.7606, 120.6098),
  ('二崙鄉', 'TW-YUN-EL',  23.7120, 120.4013),
  ('崙背鄉', 'TW-YUN-LB',  23.7539, 120.3556),
  ('麥寮鄉', 'TW-YUN-ML',  23.7540, 120.2571),
  ('東勢鄉', 'TW-YUN-DS',  23.6787, 120.2985),
  ('褒忠鄉', 'TW-YUN-BZ',  23.6914, 120.3319),
  ('台西鄉', 'TW-YUN-TX',  23.7019, 120.1993),
  ('元長鄉', 'TW-YUN-YZ',  23.6396, 120.3218),
  ('四湖鄉', 'TW-YUN-SH',  23.6358, 120.2366),
  ('口湖鄉', 'TW-YUN-KH',  23.5718, 120.1801),
  ('水林鄉', 'TW-YUN-SL',  23.5693, 120.2435)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 嘉義縣 18 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-CHY')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('太保市', 'TW-CHY-TB',  23.4518, 120.3363),
  ('朴子市', 'TW-CHY-PZ',  23.4624, 120.2456),
  ('布袋鎮', 'TW-CHY-BD',  23.3816, 120.1748),
  ('大林鎮', 'TW-CHY-DL',  23.5977, 120.4692),
  ('民雄鄉', 'TW-CHY-MX',  23.5462, 120.4333),
  ('溪口鄉', 'TW-CHY-XK',  23.5734, 120.3984),
  ('新港鄉', 'TW-CHY-XG',  23.5564, 120.3358),
  ('六腳鄉', 'TW-CHY-LJ',  23.4941, 120.2814),
  ('東石鄉', 'TW-CHY-DS',  23.4538, 120.1575),
  ('義竹鄉', 'TW-CHY-YZ',  23.4165, 120.2393),
  ('鹿草鄉', 'TW-CHY-LC',  23.4284, 120.2991),
  ('水上鄉', 'TW-CHY-SS',  23.4481, 120.3923),
  ('中埔鄉', 'TW-CHY-ZP',  23.3854, 120.4581),
  ('竹崎鄉', 'TW-CHY-ZQ',  23.5181, 120.5162),
  ('梅山鄉', 'TW-CHY-MS',  23.5697, 120.5614),
  ('番路鄉', 'TW-CHY-FL',  23.4694, 120.4934),
  ('大埔鄉', 'TW-CHY-DP',  23.2951, 120.5817),
  ('阿里山鄉','TW-CHY-ALS', 23.5138, 120.6838)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 屏東縣 33 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-PIF')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('屏東市', 'TW-PIF-PD',  22.6761, 120.4882),
  ('潮州鎮', 'TW-PIF-CZ',  22.5489, 120.5387),
  ('東港鎮', 'TW-PIF-DG',  22.4677, 120.4528),
  ('恆春鎮', 'TW-PIF-HC',  22.0031, 120.7442),
  ('萬丹鄉', 'TW-PIF-WD',  22.5963, 120.4863),
  ('長治鄉', 'TW-PIF-CZH', 22.6838, 120.5242),
  ('麟洛鄉', 'TW-PIF-LL',  22.6617, 120.5283),
  ('九如鄉', 'TW-PIF-JR',  22.7150, 120.5032),
  ('里港鄉', 'TW-PIF-LG',  22.7604, 120.5145),
  ('鹽埔鄉', 'TW-PIF-YP',  22.7330, 120.5583),
  ('高樹鄉', 'TW-PIF-GS',  22.7800, 120.5988),
  ('萬巒鄉', 'TW-PIF-WL',  22.6219, 120.5368),
  ('內埔鄉', 'TW-PIF-NP',  22.6103, 120.5686),
  ('竹田鄉', 'TW-PIF-ZT',  22.5876, 120.5397),
  ('新埤鄉', 'TW-PIF-XP',  22.5429, 120.5726),
  ('枋寮鄉', 'TW-PIF-FL',  22.3674, 120.5878),
  ('新園鄉', 'TW-PIF-XY',  22.5379, 120.4440),
  ('崁頂鄉', 'TW-PIF-KD',  22.5611, 120.4597),
  ('林邊鄉', 'TW-PIF-LB',  22.4360, 120.5072),
  ('南州鄉', 'TW-PIF-NZ',  22.4994, 120.5290),
  ('佳冬鄉', 'TW-PIF-JD',  22.4299, 120.5476),
  ('琉球鄉', 'TW-PIF-LQ',  22.3469, 120.3734),
  ('車城鄉', 'TW-PIF-CC',  22.0779, 120.6906),
  ('滿州鄉', 'TW-PIF-MZ',  22.0428, 120.7559),
  ('枋山鄉', 'TW-PIF-FS',  22.2610, 120.6259),
  ('三地門鄉','TW-PIF-SDM', 22.7006, 120.6257),
  ('霧台鄉', 'TW-PIF-WT',  22.6921, 120.7004),
  ('瑪家鄉', 'TW-PIF-MJ',  22.6562, 120.6310),
  ('泰武鄉', 'TW-PIF-TW',  22.5972, 120.6419),
  ('來義鄉', 'TW-PIF-LY',  22.5350, 120.6436),
  ('春日鄉', 'TW-PIF-CR',  22.3678, 120.6327),
  ('獅子鄉', 'TW-PIF-SZ',  22.2137, 120.6811),
  ('牡丹鄉', 'TW-PIF-MD',  22.0864, 120.7618)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 宜蘭縣 12 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-ILA')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('宜蘭市', 'TW-ILA-YL',  24.7565, 121.7536),
  ('羅東鎮', 'TW-ILA-LD',  24.6756, 121.7670),
  ('蘇澳鎮', 'TW-ILA-SA',  24.5985, 121.8483),
  ('頭城鎮', 'TW-ILA-TC',  24.8576, 121.8226),
  ('礁溪鄉', 'TW-ILA-JX',  24.8200, 121.7757),
  ('壯圍鄉', 'TW-ILA-ZW',  24.7586, 121.8083),
  ('員山鄉', 'TW-ILA-YS',  24.7378, 121.6891),
  ('冬山鄉', 'TW-ILA-DS',  24.6399, 121.7800),
  ('五結鄉', 'TW-ILA-WJ',  24.6841, 121.8046),
  ('三星鄉', 'TW-ILA-SX',  24.6671, 121.6508),
  ('大同鄉', 'TW-ILA-DT',  24.6974, 121.5467),
  ('南澳鄉', 'TW-ILA-NA',  24.4963, 121.7818)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 花蓮縣 13 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-HUA')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('花蓮市', 'TW-HUA-HL',  23.9871, 121.6015),
  ('鳳林鎮', 'TW-HUA-FL',  23.7519, 121.4726),
  ('玉里鎮', 'TW-HUA-YL',  23.3378, 121.3063),
  ('新城鄉', 'TW-HUA-XC',  24.1287, 121.6583),
  ('吉安鄉', 'TW-HUA-JA',  23.9691, 121.5703),
  ('壽豐鄉', 'TW-HUA-SF',  23.8741, 121.5199),
  ('光復鄉', 'TW-HUA-GF',  23.6702, 121.4327),
  ('豐濱鄉', 'TW-HUA-FB',  23.5387, 121.4952),
  ('瑞穗鄉', 'TW-HUA-RS',  23.4946, 121.3693),
  ('富里鄉', 'TW-HUA-FL2', 23.2047, 121.2641),
  ('秀林鄉', 'TW-HUA-XL',  24.1513, 121.5048),
  ('萬榮鄉', 'TW-HUA-WR',  23.7082, 121.3619),
  ('卓溪鄉', 'TW-HUA-ZX',  23.3878, 121.2832)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 台東縣 16 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-TTT')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('台東市', 'TW-TTT-TD',  22.7583, 121.1444),
  ('成功鎮', 'TW-TTT-CG',  23.0999, 121.3723),
  ('關山鎮', 'TW-TTT-GS',  23.0481, 121.1646),
  ('卑南鄉', 'TW-TTT-BN',  22.7126, 121.1143),
  ('鹿野鄉', 'TW-TTT-LY',  22.9128, 121.1480),
  ('池上鄉', 'TW-TTT-CS',  23.1109, 121.2237),
  ('東河鄉', 'TW-TTT-DH',  22.9666, 121.3181),
  ('長濱鄉', 'TW-TTT-CB',  23.3209, 121.4525),
  ('太麻里鄉','TW-TTT-TML', 22.6118, 121.0169),
  ('金峰鄉', 'TW-TTT-JF',  22.5400, 120.9576),
  ('大武鄉', 'TW-TTT-DW',  22.3516, 120.8921),
  ('達仁鄉', 'TW-TTT-DR',  22.4400, 120.9321),
  ('綠島鄉', 'TW-TTT-LD',  22.6727, 121.4868),
  ('蘭嶼鄉', 'TW-TTT-LY2', 22.0465, 121.5487),
  ('延平鄉', 'TW-TTT-YP',  23.1259, 121.0635),
  ('海端鄉', 'TW-TTT-HD',  23.1866, 121.0880)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 澎湖縣 6 鄉鎮市 ─────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-PEH')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('馬公市', 'TW-PEH-MG',  23.5711, 119.5793),
  ('湖西鄉', 'TW-PEH-HX',  23.6035, 119.6495),
  ('白沙鄉', 'TW-PEH-BS',  23.6758, 119.5990),
  ('西嶼鄉', 'TW-PEH-XY',  23.6219, 119.4978),
  ('望安鄉', 'TW-PEH-WA',  23.3681, 119.5044),
  ('七美鄉', 'TW-PEH-QM',  23.2121, 119.4225)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 金門縣 6 鄉鎮 ────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-KIN')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('金城鎮', 'TW-KIN-JC',  24.4326, 118.3168),
  ('金湖鎮', 'TW-KIN-JH',  24.4493, 118.4155),
  ('金沙鎮', 'TW-KIN-JS',  24.4935, 118.3991),
  ('金寧鄉', 'TW-KIN-JN',  24.4667, 118.2979),
  ('烈嶼鄉', 'TW-KIN-LY',  24.4349, 118.2266),
  ('烏坵鄉', 'TW-KIN-WQ',  24.9889, 119.4554)
) as d(name, code, lat, lon)
on conflict (code) do nothing;


-- ── 連江縣 4 鄉 ──────────────────────────────────────────────
with p as (select id from public.regions where code = 'TW-LIE')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', p.id, d.name, d.code, d.lat, d.lon
from p, (values
  ('南竿鄉', 'TW-LIE-NJ', 26.1505, 119.9497),
  ('北竿鄉', 'TW-LIE-BJ', 26.2335, 120.0017),
  ('莒光鄉', 'TW-LIE-JG', 25.9616, 119.9135),
  ('東引鄉', 'TW-LIE-DY', 26.3663, 120.4957)
) as d(name, code, lat, lon)
on conflict (code) do nothing;
