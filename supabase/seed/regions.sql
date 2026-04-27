-- 地區種子（MVP：先放全國 + 桃園市 + 中壢區，之後再補齊全台縣市鄉鎮）
insert into public.regions (level, parent_id, name, code) values
  ('national', null, '全國', 'TW')
on conflict (code) do nothing;

with tw as (select id from public.regions where code = 'TW')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'county', tw.id, '桃園市', 'TW-TYC', 24.9936, 121.3010 from tw
on conflict (code) do nothing;

with tyc as (select id from public.regions where code = 'TW-TYC')
insert into public.regions (level, parent_id, name, code, latitude, longitude)
select 'district', tyc.id, '中壢區', 'TW-TYC-ZL', 24.9533, 121.2253 from tyc
on conflict (code) do nothing;
