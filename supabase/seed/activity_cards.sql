-- =====================================================
-- 互動圖卡種子資料
-- =====================================================

-- ── 動動生活 ──────────────────────────────────────
insert into public.activity_cards
  (group_slug, slug, title, summary, cover_emoji, identity_tags, tags, steps)
values (
  'move',
  'chair-exercise',
  '椅子運動 10 分鐘',
  '坐著就能做！強化下肢、改善循環，每天早上 10 分鐘就夠。',
  '🪑',
  array['elder','family'],
  array['運動','下肢','循環'],
  '[
    {"order":1,"title":"熱身：腳踝繞圈","description":"坐穩在椅子上，雙腳平放地面。先抬起右腳，腳踝順時針繞圈 10 次，再換逆時針 10 次。換左腳重複。","tip":"動作要慢，感受腳踝的轉動。"},
    {"order":2,"title":"抬膝運動","description":"雙手輕放大腿，輪流將左右膝蓋抬起，讓大腿離開椅面約 10 公分，停留 3 秒後放下。左右各重複 10 次。","tip":"腰背挺直，不要向前彎腰。"},
    {"order":3,"title":"踢腳伸展","description":"坐在椅子前 1/3 處，右腳緩緩向前伸直，腳尖朝上，停留 5 秒，感覺大腿後側拉伸。換左腳。左右各 8 次。","tip":"若膝蓋不舒服，只伸到舒適角度即可。"},
    {"order":4,"title":"肩頸放鬆","description":"雙手放膝蓋，緩緩將頭向右傾，停留 5 秒，感覺左側頸部拉伸。回正，再向左傾。重複 5 次。","tip":"不要聳肩，讓肩膀放鬆下沉。"},
    {"order":5,"title":"深呼吸收操","description":"雙手放腹部，用鼻子慢慢吸氣 4 秒（感覺腹部鼓起），再用嘴巴緩緩吐氣 6 秒。重複 5 次。","tip":"讓心跳慢慢平穩，感受呼吸帶來的放鬆。"}
  ]'::jsonb
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, steps=excluded.steps, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, cover_emoji, identity_tags, tags, steps)
values (
  'move',
  'fall-prevention',
  '居家防跌 5 招',
  '台灣長者跌倒七成發生在家中。這 5 招能有效降低風險，家屬也可以一起做。',
  '🛡️',
  array['elder','family','volunteer'],
  array['防跌','安全','居家'],
  '[
    {"order":1,"title":"確認鞋子合腳","description":"穿包覆性好的室內鞋或防滑拖鞋，避免只穿襪子或光腳走動。鞋底要有止滑紋路，鞋跟不超過 2 公分。","tip":"每週檢查鞋底磨損狀況。"},
    {"order":2,"title":"整理危險地毯","description":"將浴室、走道、床邊的小地毯固定或移除，捲起的地毯邊緣是最常見的絆倒原因。","tip":"可用雙面膠帶固定地毯四角。"},
    {"order":3,"title":"增加夜間照明","description":"在床旁、走廊、浴室入口加裝感應式夜燈，讓夜間起床不需要摸黑找開關。","tip":"插電式感應夜燈約 100-200 元，在超市即可購買。"},
    {"order":4,"title":"浴室加裝扶手","description":"蓮蓬頭旁、馬桶旁各安裝一支扶手，起身時可借力。扶手要固定在牆壁骨架上，不能只打在磁磚縫。","tip":"可申請長照 2.0 無障礙環境改善補助，最高補助 10 萬元，撥打 1966 詢問。"},
    {"order":5,"title":"每天做平衡訓練","description":"扶著牆壁或穩固的椅背，單腳站立 10 秒，換腳。每天練習 3 組，可有效增強平衡感。","tip":"從 5 秒開始，循序漸進增加時間。"}
  ]'::jsonb
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, steps=excluded.steps, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, cover_emoji, identity_tags, tags, steps)
values (
  'move',
  'morning-stretch',
  '起床前伸展操',
  '不要一醒來就跳下床！床上做這 4 個動作，讓身體慢慢甦醒，預防起身頭暈。',
  '🌅',
  array['elder','family'],
  array['伸展','早晨','頭暈預防'],
  '[
    {"order":1,"title":"醒來先別急著起身","description":"睜眼後，先保持平躺 1 分鐘，讓血壓慢慢調整。深呼吸 3 次，感覺身體甦醒。","tip":"特別是血壓偏高或有頭暈困擾的長輩，這一步非常重要。"},
    {"order":2,"title":"腳踝與腳趾活動","description":"腳尖朝上用力翹起，再向下壓，重複 10 次。接著腳踝畫圓 10 圈。促進下肢血液回流。","tip":"這個動作能減少起身時的頭暈感。"},
    {"order":3,"title":"膝蓋抱胸","description":"輪流將左右膝蓋彎曲，雙手環抱小腿輕輕拉向胸口，停留 10 秒，感受腰背的舒展。","tip":"若腰部有不適，只做到感覺舒服的位置就好。"},
    {"order":4,"title":"側臥慢起身","description":"先翻身成側躺姿勢，用手肘撐起上半身，再慢慢坐到床沿，坐穩 30 秒，確認沒有頭暈再站起來。","tip":"這是正確的起床方式，避免直接從仰臥彈起。"}
  ]'::jsonb
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, steps=excluded.steps, updated_at=now();

-- ── 創意生活 ──────────────────────────────────────
insert into public.activity_cards
  (group_slug, slug, title, summary, cover_emoji, identity_tags, tags, steps)
values (
  'create',
  'paper-folding',
  '簡單摺紙：幸運星',
  '只需要一張紙條，就能摺出小巧可愛的幸運星，可以送給孫子孫女，也可以裝在玻璃瓶裡。',
  '⭐',
  array['elder','family','volunteer'],
  array['手工','摺紙','創意'],
  '[
    {"order":1,"title":"準備紙條","description":"將 A4 紙剪成約 1.5 公分寬的長條（也可用包裝紙或月曆紙）。準備剪刀和平整的桌面。","tip":"紙條越長，幸運星越大。長度約 35-40 公分最剛好。"},
    {"order":2,"title":"打一個結","description":"拿起紙條，在距離一端約 5 公分處，輕輕打一個平結（就像綁鞋帶的第一步）。整理成五邊形，將多出的短端折入五邊形內。","tip":"動作要輕，紙條容易在此步驟折斷。"},
    {"order":3,"title":"繞圈纏繞","description":"用長的那端沿著五邊形的每個邊，一圈一圈地整齊纏繞，方向要一致。","tip":"每繞一圈，輕輕壓平，讓形狀保持規整。"},
    {"order":4,"title":"收尾","description":"當紙條剩下約 2 公分時，將多餘部分折入縫隙中藏好。此時應該有一個五邊形的扁平形狀。","tip":"用指甲輕輕壓住接縫處，讓它固定。"},
    {"order":5,"title":"捏出立體星形","description":"用食指和拇指，輕輕捏住五邊形的每一個角，讓它慢慢鼓起來，變成立體的五角星！","tip":"力道要輕，太用力會讓星星變形。"}
  ]'::jsonb
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, steps=excluded.steps, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, cover_emoji, identity_tags, tags, steps)
values (
  'create',
  'balcony-garden',
  '陽台小花圃入門',
  '不需要大院子，用幾個盆子就能種出充滿生命力的小角落。適合從未種過植物的新手。',
  '🌱',
  array['elder','family'],
  array['園藝','盆栽','療癒'],
  '[
    {"order":1,"title":"選對入門植物","description":"推薦新手從「九層塔、薄荷、蔥」開始，生命力強、好種、還能拿來料理。或選擇「長壽花、文竹」，好看又好養。","tip":"避免選玫瑰等需要細心照料的植物。"},
    {"order":2,"title":"準備材料","description":"花盆（有排水孔）、培養土（超市或花市都有）、小鏟子。花盆不用太大，直徑 15-20 公分就夠。","tip":"舊的保鮮盒、牛奶盒底部打洞也能當花盆，環保又省錢。"},
    {"order":3,"title":"種下植物","description":"在花盆底部先鋪一層小石子幫助排水，再填入七分滿的培養土，挖一個小洞，放入幼苗後輕輕壓實土壤。","tip":"種好後馬上澆一次水，讓根部與土壤密合。"},
    {"order":4,"title":"每天照料","description":"放在陽台有陽光的地方，每天早上澆水一次，用手指插入土中 1 公分，若感覺乾燥才需要澆水。","tip":"過度澆水是新手最常犯的錯，爛根比乾枯更難救。"},
    {"order":5,"title":"觀察與記錄","description":"每天花 5 分鐘觀察植物的變化，看葉子、聞味道，可以用手機拍照記錄生長過程，累積成就感。","tip":"若葉子變黃，通常是澆水過多或陽光不足。"}
  ]'::jsonb
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, steps=excluded.steps, updated_at=now();

-- ── 智慧生活 ──────────────────────────────────────
insert into public.activity_cards
  (group_slug, slug, title, summary, cover_emoji, identity_tags, tags, steps)
values (
  'smart',
  'my-plate',
  '我的餐盤：每天吃對比例',
  '衛福部推薦的「我的餐盤」原則，6 個口訣讓每餐營養均衡，預防肌少症與慢性病。',
  '🍽️',
  array['elder','family','volunteer'],
  array['營養','飲食','健康'],
  '[
    {"order":1,"title":"每天吃 1.5 碗飯（全穀雜糧）","description":"主食選擇糙米、燕麥、地瓜等全穀類，比白米飯含有更多纖維與維生素 B 群，幫助穩定血糖。","tip":"若牙口不好，可將糙米與白米混煮，比例從 1:4 開始漸漸增加。"},
    {"order":2,"title":"每天吃 3 份蔬菜","description":"一份蔬菜約半碗（煮熟），選擇各種顏色的蔬菜（深綠、橘紅、白色各一種），攝取不同營養素。","tip":"深色蔬菜（菠菜、空心菜）的鐵質與葉酸更豐富。"},
    {"order":3,"title":"每天吃 2 份水果","description":"一份水果約一個拳頭大小，選擇當季新鮮水果，避免喝果汁（缺少纖維）。","tip":"香蕉、木瓜、芭樂都是台灣長者補充鉀與維生素 C 的好選擇。"},
    {"order":4,"title":"每天吃 1.5 掌心豆魚蛋肉","description":"優先選擇豆腐、魚、蛋，再考慮雞肉、豬肉，紅肉適量即可。豆製品是植物蛋白的好來源。","tip":"每週至少吃 2 次魚，omega-3 脂肪酸對心血管有益。"},
    {"order":5,"title":"每天喝 1.5 杯牛奶","description":"牛奶（或無糖豆漿、優格）補充鈣質與維生素 D，是預防骨質疏鬆的關鍵。","tip":"若喝牛奶腹脹，可換優格或加熱豆漿，乳糖不耐症者較容易消化。"},
    {"order":6,"title":"每天喝足夠的水","description":"每天喝 6-8 杯白開水（約 1500-2000 ml），不要等口渴才喝。老年人口渴感降低，容易不知不覺脫水。","tip":"可在水壺上貼時間貼紙，提醒自己固定時間喝水。"}
  ]'::jsonb
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, steps=excluded.steps, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, cover_emoji, identity_tags, tags, steps)
values (
  'smart',
  'line-video-call',
  'LINE 視訊教學',
  '手把手教您用 LINE 跟家人視訊通話，讓相距再遠也能看到彼此的臉。',
  '📱',
  array['elder','family','volunteer'],
  array['LINE','視訊','數位'],
  '[
    {"order":1,"title":"確認 LINE 已安裝","description":"在手機桌面找到綠色的 LINE 圖示（一個白色說話框）。如果找不到，請家人幫忙從 App Store 或 Google Play 安裝。","tip":"LINE 是免費的，不需要付費。"},
    {"order":2,"title":"打開 LINE 找到聯絡人","description":"點開 LINE → 點下方「聊天」→ 找到您要通話的家人名字（通常會顯示他們的大頭貼）。","tip":"可以請家人先傳一則訊息給您，這樣他的名字就會出現在最上面。"},
    {"order":3,"title":"發起視訊通話","description":"進入聊天室後，點右上角的電話圖示，選擇「視訊通話」。螢幕上會出現您自己的臉，等對方接聽。","tip":"如果對方沒接，不要擔心，等一下再試，或傳訊息問他方便嗎。"},
    {"order":4,"title":"通話中的操作","description":"通話中可以看到對方的臉出現在畫面上。若聲音太小，按手機側邊的音量鍵調高。通話結束後點紅色電話圖示掛斷。","tip":"把手機放在桌上，用支架固定會比手持更穩更舒服。"},
    {"order":5,"title":"練習看看！","description":"現在就試著打給一位家人或朋友，告訴他「我剛學會用 LINE 視訊！」視訊的感覺和電話不一樣，可以看到對方的表情。","tip":"第一次可能覺得緊張，多練習幾次就習慣了。"}
  ]'::jsonb
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, steps=excluded.steps, updated_at=now();
