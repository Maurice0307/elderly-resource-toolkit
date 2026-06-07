-- =====================================================
-- 互動圖卡補充種子資料（以設計稿 data-cards.jsx 為準）
-- 包含標題、材料、步驟、小撇步、YouTube 影片
-- 在 Supabase SQL Editor 執行（先跑 0008 migration 加 materials 欄位）
-- =====================================================

-- ── 手工美勞 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-clay', '捏黏土',
  '用輕黏土捏出喜歡的動物或水果，留下回憶並做手部訓練。輕黏土柔軟不易乾，最適合長輩捏。',
  15, '🧱', array['elder','family','volunteer'],
  array['手工','黏土','創意','陪伴互動'],
  'active',
  'https://www.youtube.com/watch?v=K4i85Lg5H4Y',
  '[
    {"order":1,"title":"準備材料","description":"在文具店購買不同顏色的輕黏土、竹籤（刻花紋或戳洞）、白膠、假眼睛等小裝飾品，準備平整桌面。","tip":"輕黏土比一般黏土柔軟、不易乾，最適合長輩。"},
    {"order":2,"title":"聊喜好、決定主題","description":"開始前先問：「你最喜歡什麼動物或水果？」聊一聊就有靈感，也讓他更投入。","tip":"想不到就從家鄉常見水果切入：芒果、芭樂、香蕉。"},
    {"order":3,"title":"捏動物","description":"先搓圓做身體，再加上四肢、耳朵、尾巴，捏出小狗、小豬、小兔等造型。","tip":"雙手一起搓有助手部肌肉訓練，避免關節僵硬。","video_url":"https://www.youtube.com/watch?v=K4i85Lg5H4Y"},
    {"order":4,"title":"捏水果","description":"從球形（蘋果）、橢圓（芒果）、彎月形（香蕉）開始塑形。","tip":"兩色黏土混合可做出漸層，蘋果尤其漂亮。","video_url":"https://www.youtube.com/watch?v=ePMnx19FSyI"},
    {"order":5,"title":"加裝飾、完成展示","description":"用竹籤戳花紋、白膠黏上眼睛。請好朋友說說「為什麼選這個顏色」「想放在家裡哪裡」。","tip":"拍張照片傳給家人，是很棒的話題。"}
  ]'::jsonb,
  array['輕黏土（多色）', '竹籤', '白膠', '假眼睛裝飾']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-origami-heart', '愛心摺紙',
  '最簡單入門的摺紙，幾分鐘就能完成一個立體愛心，送禮自用兩相宜。',
  10, '❤️', array['elder','family','volunteer'],
  array['手工','摺紙','創意'],
  'active',
  'https://www.youtube.com/watch?v=fVpG6pIaxyY',
  '[
    {"order":1,"title":"準備色紙","description":"準備 1～2 張正方形色紙，紅色或粉色最有愛心感。","tip":"新手用 15×15 公分最容易上手。"},
    {"order":2,"title":"跟著摺出愛心","description":"每一個摺線都用手指刮平、再壓緊，完成後就是一個立體愛心。","tip":"壓摺線是長輩常需要協助的環節，可代為施力。","video_url":"https://www.youtube.com/watch?v=fVpG6pIaxyY"},
    {"order":3,"title":"完成、寫祝福","description":"在愛心背面寫上想對家人說的話，或當小卡片夾在書中。","tip":"親手摺的比買的更有溫度。"}
  ]'::jsonb,
  array['正方形色紙 1–2 張（紅／粉）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-origami-carnation', '康乃馨',
  '一朵紙康乃馨送長輩，最適合母親節、父親節、感恩節。',
  15, '🌸', array['elder','family','volunteer'],
  array['手工','摺紙','創意','陪伴互動'],
  'active',
  'https://www.youtube.com/watch?v=EIOCmogDyew',
  '[
    {"order":1,"title":"準備材料","description":"粉紅或紅色色紙 1～2 張、綠色色紙做花莖、剪刀、膠水。","tip":"皺紋紙效果更立體，一般色紙也沒問題。"},
    {"order":2,"title":"摺花瓣","description":"把方形紙摺成扇形，再剪出花瓣的鋸齒邊緣。","tip":"剪鋸齒不要太深，否則花瓣會散開。","video_url":"https://www.youtube.com/watch?v=EIOCmogDyew"},
    {"order":3,"title":"捲花朵、貼花莖","description":"把摺好的花瓣捲起、底部固定，再黏上綠色花莖。","tip":"花莖可用綠色色紙捲成細長條代替。"},
    {"order":4,"title":"送出祝福","description":"請好朋友想想「想送給誰」「為什麼想送他」，一朵小花就能傳達心意。"}
  ]'::jsonb,
  array['粉／紅色紙', '綠色色紙（花莖）', '剪刀', '雙面膠']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-origami-bear', '小熊摺紙',
  '可愛小熊摺紙，孩子和孫子都會喜歡，是最好的祖孫互動。',
  15, '🐻', array['elder','family','volunteer'],
  array['手工','摺紙','創意'],
  'active',
  'https://www.youtube.com/watch?v=FMhmHWQIStE',
  '[
    {"order":1,"title":"準備色紙","description":"棕色或咖啡色正方形色紙 1 張，黑色細筆畫眼睛和鼻子。","tip":"色紙至少 15×15 公分，五官才好畫。"},
    {"order":2,"title":"摺出輪廓","description":"跟著摺出小熊的圓臉、耳朵與身體輪廓。","tip":"耳朵的小三角是難點，可多看幾次再動手。","video_url":"https://www.youtube.com/watch?v=FMhmHWQIStE"},
    {"order":3,"title":"畫上五官","description":"用黑筆點上眼睛、畫上鼻子，小熊立刻有表情。","tip":"讓好朋友自己畫表情，作品才有個性。"}
  ]'::jsonb,
  array['棕色正方形色紙', '黑色細筆']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-origami-bird', '小鳥摺紙',
  '最有挑戰的一款摺紙，翅膀和尾巴需要多次反摺，完成後很有成就感。',
  20, '🐦', array['elder','family','volunteer'],
  array['手工','摺紙','創意'],
  'active',
  'https://www.youtube.com/watch?v=YEB_71IceM0',
  '[
    {"order":1,"title":"準備材料","description":"黃色、藍色、白色等鮮豔色紙皆可，1 張正方形。","tip":"建議先摺過愛心或小熊再挑戰。"},
    {"order":2,"title":"反摺翅膀尾巴","description":"小鳥的翅膀和尾巴需要多次反摺，請放慢節奏跟著做。","tip":"卡住時就暫停重新看一次，沒關係。","video_url":"https://www.youtube.com/watch?v=YEB_71IceM0"},
    {"order":3,"title":"立體成形、放窗台","description":"完成後輕輕拉開翅膀讓小鳥立體呈現，擺在窗台或書架。"}
  ]'::jsonb,
  array['鮮豔正方形色紙 1 張']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-leaf-bookmark', '葉脈書籤',
  '撿一片葉子做成透光書籤，搭配祝福的話送給親朋好友。葉子需提前 1 天預處理。',
  20, '🍃', array['elder','family','volunteer'],
  array['手工','書籤','自然','陪伴互動'],
  'active',
  'https://www.youtube.com/watch?v=FO3ncP3OVTs',
  '[
    {"order":1,"title":"撿葉子（前 1 天）","description":"散步時撿幾片葉子，桑葉、菩提葉、橡膠樹葉的葉脈紋路最清楚。","tip":"選葉脈粗、葉肉厚的最好。"},
    {"order":2,"title":"預處理葉子","description":"泡在 1:5 小蘇打水中一天（或熱水煮 30 分鐘），再用牙刷輕刷掉葉肉，留下完整葉脈。","tip":"刷的時候要輕，不然會把葉脈刷斷。","video_url":"https://www.youtube.com/watch?v=BVD94AUWHt8"},
    {"order":3,"title":"聊樹木與童年","description":"一邊做一邊問「不同季節最喜歡什麼樹？」「小時候家附近有什麼樹？」連結記憶。"},
    {"order":4,"title":"做書籤","description":"葉脈黏在白紙上，寫祝福、護貝、剪成書籤大小、打洞掛緞帶。","tip":"沒有護貝機可用透明膠帶兩面包住。","video_url":"https://www.youtube.com/watch?v=FO3ncP3OVTs"},
    {"order":5,"title":"分享意義","description":"請好朋友說說「想送給誰」「為什麼」。親手寫的祝福比買的更有溫度。"}
  ]'::jsonb,
  array['葉脈清楚的葉子', '小蘇打', '牙刷', '護貝膜或膠帶', '緞帶']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

-- ── 花草植栽 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-moss-ball', '手作苔球',
  '把現成盆栽改造成可愛苔球，從照顧植物中建立和好朋友的話題。',
  20, '🌿', array['elder','family','volunteer'],
  array['園藝','苔球','療癒','陪伴互動'],
  'active',
  'https://www.youtube.com/watch?v=iG2b0qYoomc',
  '[
    {"order":1,"title":"準備材料","description":"現成小盆栽、水苔（先泡水 10 分鐘軟化）、繩子、鐵盤、剪刀。","tip":"水苔要擰乾再用，水分太多會爛根。"},
    {"order":2,"title":"聊聊植物","description":"問問好朋友「喜歡什麼植物或花朵？」聊聊以前家裡種過什麼。","tip":"話題切入童年：「你小時候家裡有種什麼？」"},
    {"order":3,"title":"包苔球","description":"把盆栽從原盆取出，在根團外均勻包覆一層浸濕水苔，雙手輕輕塑形成圓球。","tip":"請好朋友確認：「這樣綁夠緊嗎？」讓他參與決策。","video_url":"https://www.youtube.com/watch?v=iG2b0qYoomc"},
    {"order":4,"title":"綁繩固定","description":"用棉繩十字交叉繞，把苔球紮緊打結，放在鐵盤上盛接水分。"},
    {"order":5,"title":"後續照顧","description":"每週泡水一次（浸入水中 5 分鐘）。下次見面觀察「長大了嗎」「葉色變了嗎」。","tip":"拍張照當紀念，下次比較變化。"}
  ]'::jsonb,
  array['小盆栽（黃金葛／薄荷）', '水苔一包', '棉繩／麻繩', '鐵盤', '剪刀']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-bean-sprout', '種綠豆芽',
  '看豆子發芽長大的過程，充滿生命力。前一晚先泡豆，後續每日觀察。',
  30, '🌱', array['elder','family'],
  array['園藝','種植','飲食','療癒'],
  'active',
  'https://www.youtube.com/watch?v=abK-t_UyjRk',
  '[
    {"order":1,"title":"前一晚泡豆子","description":"取 1/3 米杯綠豆或黃豆，倒入清水浸泡一夜（約 8 小時）。","tip":"選顆粒飽滿、無蟲蛀的豆子發芽率最好。"},
    {"order":2,"title":"準備容器","description":"底部鑽洞的寬容器、棉布、黑塑膠袋（避光）、底下盛水的盆子。","tip":"黑塑膠袋可用便當袋取代，遮光是發芽關鍵。"},
    {"order":3,"title":"聊聊豆類食物","description":"問問好朋友「喜歡吃豆腐、豆漿、豆花嗎？」「以前最常吃哪一種？」"},
    {"order":4,"title":"鋪設與澆水","description":"棉布鋪底、放豆子、再蓋一層棉布，上面蓋黑塑膠袋避光。每天早晚各澆水一次。","tip":"問好朋友：「你猜豆子長大會變什麼樣子？」","video_url":"https://www.youtube.com/watch?v=abK-t_UyjRk"},
    {"order":5,"title":"觀察與品嚐","description":"第 3 天冒小芽，第 5～7 天可採收。煮一鍋豆芽湯一起品嚐，活動有完整循環。"}
  ]'::jsonb,
  array['綠豆／黃豆 1/3 杯', '底部鑽洞容器', '棉布', '黑塑膠袋（避光）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

-- 更新 balcony-garden（原本 seed 內容，用設計稿版本覆蓋）
update public.activity_cards set
  title = '陽台小花園入門',
  summary = '在家陽台種一盆好照顧的香草或花，每天澆水時就能伸展與曬太陽。',
  duration_min = 30,
  materials = array['深 15cm 以上盆器（有排水孔）', '培養土', '小鏟子', '噴霧瓶', '現成幼苗'],
  steps = '[
    {"order":1,"title":"選對植物","description":"推薦三種：薄荷（耐陰、剪一片就能煮茶）、九層塔（長最快、做菜用）、黃金葛（幾乎不會死）。","tip":"第一次先選一種就好，不要一次買 5 盆。"},
    {"order":2,"title":"準備工具","description":"深 15 公分以上盆器（要有排水孔）、培養土、小鏟子、現成幼苗（比種子快很多）。","tip":"瓶罐切兩半也能當盆，記得底部戳洞排水。"},
    {"order":3,"title":"種下幼苗","description":"盆底鋪 2 公分土 → 放入幼苗 → 四周填土到離盆口 2 公分 → 輕壓固定 → 立刻澆水到底部流出。","tip":"壓土不要太用力，根需要空氣。"},
    {"order":4,"title":"建立澆水習慣","description":"手指插入土裡 2 公分，乾了才澆水。早晨澆水最好，把澆水跟「早餐後」綁在一起。","tip":"薄荷例外，可以稍微多水一點。"},
    {"order":5,"title":"觀察、紀錄、分享","description":"每週拍一張照記錄變化。香草長大可剪下來送鄰居或好朋友。","tip":"黃金葛剪一段插水裡能再生根，越分越多盆。"}
  ]'::jsonb,
  updated_at = now()
where slug = 'balcony-garden';

-- ── 創意繪畫 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-life-story', '繪製生命故事',
  '打開塵封多年的回憶，以色筆畫出自己的生命故事，記錄並傳承。',
  20, '📖', array['elder','family','volunteer'],
  array['創意','繪畫','生命回顧','陪伴互動'],
  'active',
  'https://www.youtube.com/watch?v=WqLsqphwbZY',
  '[
    {"order":1,"title":"準備材料","description":"A4 白色粉彩紙、色鉛筆、蠟筆、尺。準備安靜舒適的環境，可放輕音樂。","tip":"粉彩紙色彩呈現比白紙更柔和。"},
    {"order":2,"title":"回憶討論","description":"一起回想一件「美好的回憶」：結婚那天、孩子出生、第一次出國、退休那天。給他 2～3 分鐘慢慢想。","tip":"不要急，沉默有時候是回憶在浮現。"},
    {"order":3,"title":"深入問細節","description":"深入問：「那天天氣怎樣？」「你穿什麼衣服？」「現場有誰？」細節能引導畫成圖案。","tip":"細節越具體，畫起來越生動。"},
    {"order":4,"title":"把回憶畫下來","description":"用色鉛筆勾輪廓、蠟筆塗色。畫得不像沒關係，可加上日期、地點。","tip":"「畫畫沒有對錯」要不斷強調，讓他放心。","video_url":"https://www.youtube.com/watch?v=WqLsqphwbZY"},
    {"order":5,"title":"說故事、串記憶","description":"請好朋友從頭分享畫面上的故事，安靜聆聽。完成後拍照分享給其他家人。"}
  ]'::jsonb,
  array['A4 粉彩紙', '色鉛筆', '蠟筆', '尺']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-zentangle', '禪繞畫',
  '透過重複線條與圖案，幫助放下思緒和壓力，重新審視內心感覺。',
  20, '🎨', array['elder','family','volunteer'],
  array['創意','繪畫','放鬆','禪繞'],
  'active',
  'https://www.youtube.com/watch?v=lPRdHv57cj0',
  '[
    {"order":1,"title":"準備材料","description":"禪繞畫專用紙磚（白紙也可）、0.1 代針筆、學習筆、2B 鉛筆。","tip":"細針筆畫起來最有禪繞畫味道。"},
    {"order":2,"title":"問內心感覺","description":"問問好朋友「現在內心是什麼感覺？」用形容詞回答：平靜、煩躁、開心、空空的。","tip":"沒標準答案，把感覺說出來就是第一步療癒。"},
    {"order":3,"title":"依感覺選線條","description":"基本圖樣：波浪、鋸齒、圓點、格子。討論「平靜→波浪、煩躁→鋸齒」。","tip":"禪繞畫沒有錯，每一筆都是對的。","video_url":"https://www.youtube.com/watch?v=lPRdHv57cj0"},
    {"order":4,"title":"重複與填滿","description":"用同一種圖案不斷重複填滿一格，再換下一格用不同圖案。重複動作有冥想效果。","tip":"畫畫時不需講話，安靜也是陪伴。"},
    {"order":5,"title":"分享內心反映","description":"完成後分享作品，說說「畫完現在的感覺有變嗎？」展示在家中提醒自己的平靜。"}
  ]'::jsonb,
  array['紙磚或白紙', '0.1 代針筆', '2B 鉛筆']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'create', 'interact-memory-puzzle', 'DIY 記憶拼圖',
  '把美好回憶的照片畫成拼圖，拼湊出當時人事物的場景。',
  20, '🖼️', array['elder','family','volunteer'],
  array['創意','拼貼','記憶','陪伴互動'],
  'active',
  'https://www.youtube.com/watch?v=WwiECSZOoG8',
  '[
    {"order":1,"title":"準備材料","description":"回憶照片、色鉛筆、厚紙板（牛奶盒、餅乾盒拆開都可）、白膠、剪刀。","tip":"照片越有故事越好：孫兒、結婚、出遊、合照。"},
    {"order":2,"title":"找照片、聊故事","description":"請好朋友翻相簿挑一張最有感覺的。「為什麼選這張？」就是最棒的開場。"},
    {"order":3,"title":"畫出場景","description":"把照片裡的人物、場景畫到厚紙板上，可照著畫也可加上自己的詮釋。","tip":"畫得不像沒關係，是「記憶版本」不是寫實畫。","video_url":"https://www.youtube.com/watch?v=WwiECSZOoG8"},
    {"order":4,"title":"剪下、打散","description":"白膠乾後沿線剪成 6～9 塊不規則拼圖。新手 6 塊就夠。","tip":"塊數視手部靈活度調整。"},
    {"order":5,"title":"拼回、訓練記憶","description":"打散後再拼回，挑戰一下記憶力！下次見面可請好朋友再拼一次。"}
  ]'::jsonb,
  array['回憶照片一張', '色鉛筆／蠟筆', '厚紙板', '白膠', '剪刀']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

-- ── 動動身體 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   video_url, steps, materials)
values (
  'move', 'interact-knee-care', '日常護膝運動 3+3',
  '智慧護膝 3+3：保護膝關節、預防磨損、舒緩疼痛的 6 個日常動作。',
  15, '🦵', array['elder','family'],
  array['運動','護膝','關節','防跌'],
  'active',
  'https://www.youtube.com/watch?v=LxM90E28eqk',
  '[
    {"order":1,"title":"先看完整示範","description":"介紹「3 個正確姿勢 + 3 個強化動作」，預防膝蓋磨損。","tip":"若膝蓋有急性紅腫疼痛，請先看醫生再運動。","video_url":"https://www.youtube.com/watch?v=LxM90E28eqk"},
    {"order":2,"title":"正確姿勢：上下樓梯","description":"上樓「好腳先上」、下樓「患側先下」，手扶扶手；膝蓋微彎不鎖死。","tip":"口訣「好上壞下」。"},
    {"order":3,"title":"強化一：坐姿伸腿","description":"坐椅子背挺直，右腳向前伸直、停 5 秒、放下。左右各 8 次。","tip":"大腿前側肌肉強化是護膝關鍵。"},
    {"order":4,"title":"強化二：側抬腿","description":"扶椅背站穩，右腳向右側抬 30 度、停 3 秒、放下。左右各 10 次。","tip":"全程扶穩椅背，避免跌倒。"},
    {"order":5,"title":"強化三：站姿微蹲","description":"扶椅背雙腳與肩同寬，膝蓋微彎 30 度（不超過腳尖）、停 3 秒、站起。10 次。","tip":"膝蓋千萬不要超過腳尖。"},
    {"order":6,"title":"養成日常習慣","description":"問「平常什麼時候在家可以做？」把運動和日常作息綁在一起最容易養成。","tip":"能持續最重要，偶爾中斷沒關係。"}
  ]'::jsonb,
  array['一張穩固的椅子']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      video_url=excluded.video_url, steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

-- 更新既有的 body 圖卡（材料欄 + 精簡版設計稿內容）
update public.activity_cards set
  materials = array['防滑室內鞋', '感應夜燈', '雙面膠'],
  updated_at = now()
where slug = 'fall-prevention';

update public.activity_cards set
  materials = array['不需道具，躺床上即可'],
  updated_at = now()
where slug = 'morning-stretch';

update public.activity_cards set
  materials = array['一張穩固的椅子'],
  updated_at = now()
where slug = 'chair-exercise';

-- 更新 smart 圖卡（材料欄）
update public.activity_cards set
  title = 'LINE 視訊教學',
  summary = '手把手教您用 LINE 跟家人視訊通話，讓相距再遠也能看到彼此的臉。',
  duration_min = 15,
  materials = array['一支已安裝 LINE 的智慧型手機'],
  updated_at = now()
where slug = 'line-video-call';

update public.activity_cards set
  title = '每天吃對比例',
  summary = '衛福部「我的餐盤」原則，6 個口訣讓每餐營養均衡，預防肌少症與慢性病。',
  duration_min = 10,
  materials = array['不需道具，照著比例吃'],
  updated_at = now()
where slug = 'my-plate';

-- ── 生活技能（救命技能 + 環保）────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-recycling-game', '資源回收我最行',
  '用套圈圈遊戲帶長者建立資源回收知識，從簡易版（3 分類）玩到進階版（5 分類）。',
  20, '♻️', array['elder','family','volunteer'],
  array['生活','環保','回收','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"事前準備","description":"準備套圈圈（或手環、紙圈），和好朋友找 10 樣物品（保特瓶、報紙、果皮、紙便當、玻璃罐）擺客廳。","tip":"找物品的過程本身就是互動。"},
    {"order":2,"title":"簡易版：3 分類","description":"紙條寫「一般垃圾／資源垃圾／廚餘」，抽紙條把圈套到對應物品上。","tip":"不要急著糾正，先聽他原本的想法。"},
    {"order":3,"title":"進階版：5 分類","description":"改寫「塑膠／鐵鋁罐／紙類／紙容器／玻璃／不可回收」再玩一次。","tip":"紙容器與紙類最容易搞混。"},
    {"order":4,"title":"聊家中回收經驗","description":"「以前有沒有不知道怎麼分的東西？」「社區回收車的時間與路線？」","tip":"在地資訊長者很懂，志工反而能學習。"},
    {"order":5,"title":"最常分錯的 3 樣","description":"紙便當盒→紙容器；鋁箔包→紙容器；破玻璃→一般垃圾要包好（避免割傷清潔員）。","tip":"記住這 3 樣，分類功力立刻升級。"}
  ]'::jsonb,
  array['套圈圈玩具 5 個', '紙條與筆', '家中 10 樣回收物']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-cpr', 'CPR 心肺復甦術',
  '「叫叫 CABD」口訣，關鍵時刻幫家人爭取黃金時間。先確認現場安全。',
  15, '❤️', array['elder','family','volunteer'],
  array['救命技能','急救','CPR'],
  'active',
  '[
    {"order":1,"title":"叫 — 確認意識","description":"輕拍患者雙肩、在耳邊大聲呼叫，確認有無反應與呼吸。"},
    {"order":2,"title":"叫 — 求救","description":"請人撥打 119、並取得 AED。現場只有自己時先撥 119 開擴音。","tip":"指定特定的人去打電話與拿 AED。"},
    {"order":3,"title":"C — 胸部按壓","description":"兩手交疊壓胸骨下半段，用力深度約 5-6 公分、每分鐘 100-120 下。","tip":"口訣可跟著「歌曲節奏」按壓。"},
    {"order":4,"title":"A·B — 暢通呼吸道","description":"受過訓練者可壓額抬下巴打開呼吸道，給予人工呼吸；不熟練則持續按壓不中斷。"},
    {"order":5,"title":"D — 使用 AED","description":"AED 一到立即開機，依語音貼上電擊貼片並照指示操作，直到救護人員到達。"}
  ]'::jsonb,
  array['可先報名社區 CPR 體驗課實際練習']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-aed', 'AED 怎麼使用',
  '公共場所的救命神器，跟著語音四步驟操作，不用怕按錯。',
  10, '⚡', array['elder','family','volunteer'],
  array['救命技能','急救','AED'],
  'active',
  '[
    {"order":1,"title":"開機","description":"打開 AED 電源，機器會用語音一步步引導你操作。","tip":"照著語音做就對了，不用緊張。"},
    {"order":2,"title":"貼上電擊片","description":"依圖示把兩片電擊貼片貼在患者裸露的胸口（右上胸、左側肋下）。"},
    {"order":3,"title":"分析心律","description":"機器分析時「不要碰觸患者」，等待語音指示。"},
    {"order":4,"title":"電擊與按壓","description":"若機器建議電擊，確認無人接觸後按下電擊鈕，接著立即繼續 CPR 胸部按壓。"}
  ]'::jsonb,
  array['認識住家附近哪裡有 AED']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-heimlich', '哈姆立克法',
  '噎到、嗆到時的急救動作，大人小孩都要會。先判斷是否完全堵塞。',
  8, '🫁', array['elder','family','volunteer'],
  array['救命技能','急救','噎食'],
  'active',
  '[
    {"order":1,"title":"判斷與求救","description":"患者無法說話、咳嗽、呼吸並雙手抓喉，代表完全堵塞，立即請人打 119。"},
    {"order":2,"title":"站到背後","description":"站在患者背後，雙手環抱其腰部，一腳在前穩住重心。"},
    {"order":3,"title":"定位拳頭","description":"一手握拳，拇指側頂在肚臍上方、胸骨下方的腹部位置，另一手包住。"},
    {"order":4,"title":"快速向內上推","description":"快速向內、向上推擠，像要把卡住的東西「擠出來」，重複直到異物排出或患者恢復。","tip":"孕婦或肥胖者改做胸部按壓。"}
  ]'::jsonb,
  array['不需道具，學會動作要領']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-fire-safety', '居家防火 5 招',
  '火災多從廚房、電器、菸蒂引起。長者居家做好這 5 招，把火災擋在發生前。',
  10, '🔥', array['elder','family'],
  array['生活','安全','防火','居家'],
  'active',
  '[
    {"order":1,"title":"裝住宅用火災警報器","description":"在臥室、廚房、走道天花板裝「住警器」，起火冒煙就會大聲示警，睡夢中也能及時逃。","tip":"部分縣市消防局提供弱勢長者免費安裝，可洽當地消防局。"},
    {"order":2,"title":"廚房不離人","description":"開火煮東西人不要離開，尤其油炸、燉湯；穿合身衣服別讓袖口靠近爐火。","tip":"臨時離開一定要先關火。"},
    {"order":3,"title":"電器與插座安全","description":"同一插座不要多個高耗電電器（電暖器、電磁爐）一起插，電線老舊、發燙、外皮破損要更換。","tip":"插頭定期擦灰塵，避免積污導電起火。"},
    {"order":4,"title":"遠離火源易燃物","description":"香爐、蠟燭、電暖器周圍淨空，棉被、衣物、紙張、噴霧罐都要保持距離。","tip":"拜拜的香燭點完確認熄滅再離開。"},
    {"order":5,"title":"備滅火器並會用","description":"家中放一支滅火器或滅火毯，記住口訣「拉、瞄、壓、掃」：拉插銷、瞄火源根部、壓把手、左右掃。","tip":"小火才自行滅火，火勢大就立刻逃並打 119。"}
  ]'::jsonb,
  array['住宅用火災警報器', '滅火器或滅火毯', '延長線（有過載保護）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-fire-escape', '火災逃生要領',
  '失火當下黃金幾分鐘，正確的逃生動作能保命。記住「小火快逃、濃煙關門」。',
  10, '🚨', array['elder','family'],
  array['生活','安全','逃生','居家'],
  'active',
  '[
    {"order":1,"title":"發現火警先示警","description":"大喊「失火了」讓家人知道，按下警報並撥 119，說清楚地址、樓層與是否有人受困。","tip":"別為了搶救財物耽誤逃生。"},
    {"order":2,"title":"低姿沿牆前進","description":"濃煙會往上飄，把身體放低、用濕毛巾摀口鼻，沿著牆壁摸索往出口移動。","tip":"濃煙中能見度差，沿牆才不會迷路。"},
    {"order":3,"title":"開門前先摸門","description":"用手背輕觸門板或門把，如果是燙的代表外面有火，不要開門，改走其他出口。","tip":"貿然開門可能引火爆燃。"},
    {"order":4,"title":"絕不搭電梯","description":"一律走樓梯逃生，火災可能停電讓電梯受困。逃生時把門帶上可延緩火勢蔓延。","tip":"逃生方向永遠往樓下、往戶外。"},
    {"order":5,"title":"逃不出去就關門求救","description":"若被濃煙困住，退回房間關門、用濕毛巾或衣物塞門縫，到窗邊揮舞鮮豔衣物並打 119 報位置。","tip":"待在通風、易被看到的地方等待救援。"}
  ]'::jsonb,
  array['濕毛巾', '手電筒', '熟記逃生路線']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-earthquake', '地震當下保命三步',
  '地震搖晃時，記住「趴下、掩護、穩住」三步驟，保護頭頸不被掉落物砸傷。',
  10, '🏠', array['elder','family'],
  array['救命技能','急救','地震','安全'],
  'active',
  '[
    {"order":1,"title":"趴下 DROP","description":"感覺搖晃立刻壓低身體、雙膝跪地，降低重心避免被甩倒。","tip":"行動不便者可坐穩椅子、護住頭頸。"},
    {"order":2,"title":"掩護 COVER","description":"躲到堅固桌子下，雙手護住頭、後頸；附近沒有桌子就靠在堅固牆角、遠離窗戶。","tip":"遠離吊燈、書櫃、玻璃與會倒的家具。"},
    {"order":3,"title":"穩住 HOLD ON","description":"抓住桌腳隨桌子移動，直到搖晃完全停止再起身。","tip":"搖晃中不要急著往外跑，最容易被掉落物砸傷。"},
    {"order":4,"title":"搖完先關火、防餘震","description":"搖晃停止後關閉瓦斯、電源，開門窗保持逃生路徑暢通，穿鞋避免踩到碎玻璃。","tip":"聞到瓦斯味不要開關電器，先開窗、到戶外。"},
    {"order":5,"title":"往空曠處避難","description":"確認安全後循樓梯往戶外空曠處，遠離建築外牆、招牌、電線桿，注意餘震。","tip":"行動不便長者請家人協助，別搭電梯。"}
  ]'::jsonb,
  array['不需道具，記住動作']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-earthquake-prep', '地震前的居家防範',
  '地震無法預測，但平時把家裡準備好，就能大幅降低受傷風險。和家人一起做。',
  12, '🏗️', array['elder','family'],
  array['生活','安全','地震','居家'],
  'active',
  '[
    {"order":1,"title":"固定高大家具","description":"衣櫃、書櫃、電視櫃用 L 型鐵片或固定器鎖在牆上，避免地震倒下壓傷人或擋住出口。","tip":"床頭、沙發旁盡量不要擺高大家具。"},
    {"order":2,"title":"收好重物與玻璃","description":"重物、玻璃器皿放低處，櫃門加扣防止彈開；床上方不要掛相框或重物。","tip":"熱水瓶、刀具放穩固不易滑落的位置。"},
    {"order":3,"title":"準備避難包","description":"備一個隨手可拿的避難包：水、常備藥、慢性病用藥清單、手電筒、哨子、備用眼鏡、少量現金、保暖衣。","tip":"放在大門邊、全家人都知道的位置。"},
    {"order":4,"title":"記住關閉開關位置","description":"認清瓦斯、總電源、自來水的關閉位置與方法，地震後可快速切斷以防火災漏氣。","tip":"寫張小卡貼在開關旁提醒。"},
    {"order":5,"title":"和家人約定","description":"約好地震後的集合地點與聯絡方式（可指定外地親友當共同聯絡人），平時演練逃生路線一次。","tip":"把緊急聯絡電話貼在冰箱、存進手機。"}
  ]'::jsonb,
  array['家具固定器／L 型鐵片', '防滑墊', '避難包', '手電筒、收音機']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

-- ── 防詐・假訊息 ──────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-fraud-impersonation', '識破假冒親友',
  '「我換新號碼、急用錢」是常見詐騙開場。三步驗證再行動，別急著匯款。',
  8, '🛡️', array['elder','family','volunteer'],
  array['防詐','詐騙','安全'],
  'active',
  '[
    {"order":1,"title":"收到就先冷靜","description":"陌生號碼自稱是子女、孫子「換了新號碼」並急著要錢，先深呼吸、不要馬上回應。","tip":"詐騙最愛製造「急」。"},
    {"order":2,"title":"用舊號碼回撥","description":"掛掉訊息，改用你手機裡原本存的家人電話直接打回去確認。","tip":"不要回撥對方給的新號碼。"},
    {"order":3,"title":"問只有你們知道的事","description":"問一個只有真正家人才知道答案的問題（小名、往事），假冒者答不出來。"},
    {"order":4,"title":"不轉帳、找人商量","description":"任何「先匯款」要求一律暫停，打 165 或找其他家人商量再決定。","tip":"真的家人不會逼你立刻轉帳。"}
  ]'::jsonb,
  array['把家人電話設成聯絡人']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status,
   steps, materials)
values (
  'life', 'interact-fraud-rumor', '群組謠言退散',
  '家族群組常見養生與災難假消息，學會冷靜回應，不轉傳、不恐慌。',
  8, '💬', array['elder','family','volunteer'],
  array['防詐','假訊息','LINE'],
  'active',
  '[
    {"order":1,"title":"看到聳動先暫停","description":"「快轉給家人」「醫生不告訴你」這類字眼，通常是假消息的特徵。","tip":"越要你「立刻轉傳」的越可疑。"},
    {"order":2,"title":"查證來源","description":"看有沒有可信的出處（衛福部、新聞媒體），沒有來源的多半不可信。"},
    {"order":3,"title":"用查核網站","description":"可上「MyGoPen」「台灣事實查核中心」搜尋關鍵字，看是否已被闢謠。"},
    {"order":4,"title":"溫和回應群組","description":"不指責長輩，貼上查證連結並說「這則好像是假的喔，提醒大家」。","tip":"保留面子，長輩比較聽得進去。"}
  ]'::jsonb,
  array['手機 LINE 群組']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials,
      status=excluded.status, updated_at=now();
