-- 補上各資源的 latitude / longitude，讓地圖 iframe 可顯示
-- 在 Supabase SQL Editor 直接執行即可

-- 桃園市復康巴士預約中心（桃園市桃園區縣府路1號）
update public.resources set latitude = 24.9936, longitude = 121.3010
where name = '桃園市復康巴士預約中心' and latitude is null;

-- 中壢監理站（桃園市中壢區普義路2號）
update public.resources set latitude = 24.9533, longitude = 121.2253
where name = '中壢監理站' and latitude is null;

-- 中壢區社區照顧關懷據點（中壢區公所）
update public.resources set latitude = 24.9620, longitude = 121.2256
where name = '中壢區社區照顧關懷據點' and latitude is null;

-- 桃園市政府衛生局（桃園市桃園區縣府路55號）
update public.resources set latitude = 24.9936, longitude = 121.3048, address = '桃園市桃園區縣府路55號'
where name = '桃園市政府衛生局 — 預防接種專線' and latitude is null;

-- 基隆市衛生局（信義區信二路266號）
update public.resources set latitude = 25.1321, longitude = 121.7368, address = '基隆市信義區信二路266號'
where name = '基隆市衛生局 — 預防接種專線' and latitude is null;

-- 臺北市政府衛生局（信義區市府路1號）
update public.resources set latitude = 25.0408, longitude = 121.5654, address = '臺北市信義區市府路1號'
where name = '臺北市政府衛生局 — 預防接種專線' and latitude is null;

-- 新北市政府衛生局（板橋區英士路192之1號）
update public.resources set latitude = 25.0136, longitude = 121.4590, address = '新北市板橋區英士路192之1號'
where name = '新北市政府衛生局 — 預防接種專線' and latitude is null;

-- 中壢樂齡學習中心（中壢區中央西路一段155號）
update public.resources set latitude = 24.9640, longitude = 121.2240, address = '桃園市中壢區中央西路一段155號'
where name = '中壢樂齡學習中心' and latitude is null;
