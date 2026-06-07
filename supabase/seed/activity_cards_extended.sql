-- =====================================================
-- 互動圖卡補充種子資料（設計稿引用的剩餘 slug）
-- 在 Supabase SQL Editor 執行即可
-- =====================================================

-- ── 手工美勞 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-clay', '黏土捏塑：動物家族',
  '用輕黏土捏出可愛的動物，讓手指動起來、讓創意自由發揮。捏壞了重捏，沒有壓力。',
  30, '🐻', array['elder','family','volunteer'],
  array['手工','黏土','創意','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"準備材料","description":"準備輕黏土（超市或文具店有售）、牙籤（用來刻細節）、保鮮膜（防止黏土乾掉）。選 2-3 種顏色。","tip":"輕黏土比傳統黏土更輕柔，長輩的手比較容易捏塑。"},
    {"order":2,"title":"搓球與條","description":"先練習基本動作：把黏土放掌心，兩手合起來搓圓成球形，或放桌上前後滾成條狀。這兩個動作能做出大部分形狀。","tip":"手掌稍微用點力，動作要均勻，就能搓出漂亮的球。"},
    {"order":3,"title":"捏出身體","description":"搓一個大球當身體，一個小球當頭，用手輕壓頭部讓它和身體連接。可以捏狗、貓、熊、小鳥，形狀不必完美。","tip":"兩塊黏土要連接，在接觸面稍微沾點水再壓合，更牢固。"},
    {"order":4,"title":"加上細節","description":"用小塊黏土做耳朵、四肢、尾巴，再用牙籤刻出眼睛、嘴巴的線條。加白色小圓點當眼白，黑色小點當眼珠。","tip":"眼睛是讓動物「活起來」的關鍵，認真做這一步！"},
    {"order":5,"title":"晾乾收藏","description":"完成後放在乾燥處自然風乾約 1-2 天（不要用吹風機）。乾了之後可以用壓克力顏料上色，更漂亮。","tip":"可以在底部貼一個小標籤寫上製作日期，是珍貴的手作紀念。"}
  ]'::jsonb,
  array['輕黏土（2-3 色）', '牙籤', '保鮮膜', '乾淨的桌面']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-origami-heart', '摺紙愛心',
  '摺一顆紅色愛心，可以當書籤、貼在卡片上，或者放在孫子的便當盒裡，傳遞滿滿的愛。',
  15, '❤️', array['elder','family','volunteer'],
  array['手工','摺紙','創意'],
  'active',
  '[
    {"order":1,"title":"準備正方形紙","description":"準備一張紅色（或粉色）正方形紙，建議 15×15 公分。摺紙前把紙放在平坦的桌面上。","tip":"雙面紅色的摺紙效果最漂亮，一般文具店都有。"},
    {"order":2,"title":"對角摺兩次","description":"把紙對角摺，壓出折痕後打開；再換方向對角摺一次，打開。現在紙上有兩條交叉的折痕，中心點很清楚。","tip":"每次摺的時候，邊角要對齊，折痕要壓實。"},
    {"order":3,"title":"上半部往下摺","description":"把紙翻到正面，將上方兩個角往中心的折痕對齊，摺下來。兩側各摺一次，讓上半部變成一個三角形。","tip":"這步驟決定愛心的頂部弧度，稍微用指腹滑過折痕讓它更圓潤。"},
    {"order":4,"title":"下方兩角往上摺","description":"將下方左右兩個角各往中間對齊往上摺，讓整體形狀開始像愛心。","tip":"此時翻過來看，愛心的形狀應該已經很明顯了。"},
    {"order":5,"title":"調整形狀完成","description":"翻到正面，用手指輕輕調整頂部的弧度，讓兩個圓弧更飽滿。完成！可以在背面寫上小字送給家人。","tip":"也可以在愛心上用白色廣告顏料畫幾個小點點，更可愛。"}
  ]'::jsonb,
  array['紅色或粉色正方形摺紙（15×15 cm）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-origami-carnation', '摺紙康乃馨',
  '母親節快到了？或想送一束不凋謝的花給媽媽或奶奶？用摺紙做一朵康乃馨，親手的最溫暖。',
  25, '🌸', array['elder','family','volunteer'],
  array['手工','摺紙','創意','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"準備材料","description":"準備紅色或粉色正方形摺紙（15×15 cm），以及綠色長條紙（當花莖）。桌面要平整。","tip":"可以同時做多朵，顏色不同，湊成一束更漂亮。"},
    {"order":2,"title":"對摺成三角形","description":"把正方形紙對摺成三角形，再對摺成小三角形。打開一層，讓它成為菱形。兩邊重複，共有四個面。","tip":"這是「鳥基型」的開頭，摺紙裡很常用的基礎形。"},
    {"order":3,"title":"做出花瓣層次","description":"把每一個角往中心線對摺，然後翻面再做同樣動作。讓每層都有折痕，形成花瓣的層次感。","tip":"每一瓣要盡量對稱，這樣花開起來才好看。"},
    {"order":4,"title":"打開花瓣","description":"輕輕把中心點往外撐開，讓花瓣一片一片展開。用手指輕壓每片花瓣的根部，讓它往外彎曲。","tip":"不要太用力，慢慢來，花瓣容易在這步被撕破。"},
    {"order":5,"title":"加上花莖","description":"將綠色長條紙捲成細圓柱狀（用牙籤輔助），插入花朵底部，用少量白膠固定。完成！","tip":"花莖可以稍微彎曲，讓花朵看起來更自然。"}
  ]'::jsonb,
  array['紅色或粉色正方形摺紙', '綠色長條紙', '牙籤', '白膠（少量）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-origami-bear', '摺紙小熊',
  '圓圓的小熊最療癒！這款摺法簡單，完成後可以畫上表情，送給小孫子保證被超喜歡。',
  20, '🐻', array['elder','family','volunteer'],
  array['手工','摺紙','創意'],
  'active',
  '[
    {"order":1,"title":"準備咖啡色正方形紙","description":"準備咖啡色（或棕色）正方形摺紙 15×15 cm，另外準備小片米色紙做肚子。桌面要乾淨平整。","tip":"也可以用一般白紙，完成後塗色也很有趣。"},
    {"order":2,"title":"摺出熊的臉","description":"把紙翻到背面（白面朝上），對摺成三角形，頂角往下摺約 1/3，讓它稍微超出底邊一點（這是下巴）。","tip":"下巴的大小決定臉的比例，試幾次找到你喜歡的位置。"},
    {"order":3,"title":"摺出耳朵","description":"把三角形左右兩個角各往後摺，形成圓耳朵的感覺。翻到正面，耳朵應該微微突出在頭的兩側。","tip":"用手指把耳朵稍微捏圓，熊的感覺更可愛。"},
    {"order":4,"title":"畫上表情","description":"用黑色簽字筆畫兩個圓眼睛、一個小三角形鼻子，再畫一個 W 型的嘴巴。用粉色色鉛筆在臉頰加兩個圓腮紅。","tip":"表情是個性的關鍵！可以畫微笑、驚訝、睡覺各種表情，每一隻都不一樣。"},
    {"order":5,"title":"加上身體（選做）","description":"另外取一片紙摺成長方形，用膠水貼在臉的下面當身體，再用米色小紙片貼肚子。一隻完整的小熊完成！","tip":"可以做一家子，爸爸熊、媽媽熊、小熊，一起擺在桌上很溫馨。"}
  ]'::jsonb,
  array['咖啡色正方形摺紙', '米色小紙片', '黑色簽字筆', '粉色色鉛筆', '膠水']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-origami-bird', '摺紙小鳥（會飛的）',
  '抓住尾巴拉一拉，翅膀就會動！這是很多人小時候都學過的經典摺紙，現在教給孫子孫女。',
  20, '🐦', array['elder','family','volunteer'],
  array['手工','摺紙','創意','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"準備正方形紙","description":"準備正方形紙一張，顏色自選。鳥的身體和翅膀都在同一張紙上，所以建議用雙面色紙，讓翅膀顏色漂亮。","tip":"第一次練習可以用大一點的紙（20×20 cm），比較容易操作。"},
    {"order":2,"title":"摺出鳥基型","description":"紙白面朝上，對角摺兩次打折痕，翻面，水平與垂直對摺各一次。按照折痕把紙收攏成菱形（四個角向上），這就是「鳥基型」。","tip":"這是最重要的一步，摺好了後面都容易。可以先看一次再動手。"},
    {"order":3,"title":"做出脖子和尾巴","description":"把菱形的兩個側邊往中間對摺，翻面重複。接著把上面的三角形往下摺，翻面重複，這創造了脖子和尾巴的位置。","tip":"每一步驟摺完都要確認兩面對稱。"},
    {"order":4,"title":"拉出脖子和尾巴","description":"抓住左右兩個尖端往外輕輕拉，讓脖子和尾巴伸出來，並向後斜壓固定角度。脖子末端往下摺出鳥嘴。","tip":"拉的時候要輕，讓中間的身體自然膨脹起來成立體感。"},
    {"order":5,"title":"讓翅膀飛起來","description":"一手抓住鳥的胸部，另一手輕拉尾巴，翅膀就會上下拍動！可以試著調整鳥的角度讓它更像在飛。","tip":"這隻鳥適合送給小孩，一定會很開心。"}
  ]'::jsonb,
  array['正方形紙（建議雙面色紙）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-leaf-bookmark', '葉脈書籤',
  '去公園撿幾片葉子，用簡單工具做出美麗的書籤。每一片葉子都是獨一無二的天然藝術品。',
  40, '🍃', array['elder','family','volunteer'],
  array['手工','書籤','自然','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"撿葉子","description":"到公園或院子撿 5-10 片葉子，選擇葉脈明顯、形狀完整的葉子（榕樹葉、桂花葉都不錯）。不要用太軟或太乾的葉子。","tip":"雨後的葉子最容易做葉拓，葉脈清晰。"},
    {"order":2,"title":"清洗壓平","description":"把葉子用清水輕輕洗乾淨，夾在厚書中壓平至少 2 小時（或隔夜）。壓平後葉子更容易操作。","tip":"也可以用熨斗在低溫下隔紙熨燙，快速壓平。"},
    {"order":3,"title":"畫出書籤形狀","description":"在厚紙板（舊月曆紙、硬卡紙都行）上裁出書籤大小（約 5×15 cm），這是書籤的底版。","tip":"可以把邊角剪成圓弧形，更好看。"},
    {"order":4,"title":"葉拓上色","description":"在葉子背面（葉脈明顯的那面）刷上一層薄薄的顏料，然後把葉子壓在書籤底版上，用手或硬物輕壓，讓印記清晰。","tip":"顏料要薄，不要太多，才不會糊掉。可以試試不同顏色疊加。"},
    {"order":5,"title":"護貝完成","description":"等顏料完全乾燥後，用透明膠帶（或護貝機）把書籤兩面封起來，保護印記。打一個小孔穿上緞帶，完成！","tip":"可以在書籤上加一句話或名字，更有紀念意義。"}
  ]'::jsonb,
  array['大葉片（公園撿的）', '廣告顏料或水彩', '厚紙板', '剪刀', '透明膠帶', '緞帶']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

-- ── 花草植栽 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-moss-ball', '苔球製作',
  '把植物的根包進濕潤的泥土和青苔裡，做成一顆綠色的球，是日本禪風的療癒擺飾。',
  45, '🌿', array['elder','family','volunteer'],
  array['園藝','苔球','療癒','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"準備材料","description":"水苔（花市有售）、赤玉土或培養土、小型植物（腎蕨、袖珍椰子、常春藤都很適合）、棉線或麻繩、噴霧瓶。","tip":"水苔要先用清水泡軟再使用，泡 10-15 分鐘。"},
    {"order":2,"title":"把土捏成球","description":"將泥土加少量水揉成軟硬適中的球（像捏耳垢那種硬度），大小約拳頭一半。在中間挖一個洞，足夠放植物的根。","tip":"土球要夠緊實，否則外層水苔不容易包住。"},
    {"order":3,"title":"放入植物","description":"把植物從盆子取出，輕輕抖掉多餘泥土，露出根系。將植物的根塞入剛才挖的洞裡，把土球包緊在根的周圍。","tip":"不要傷到根系，輕柔地把土球捏合就好。"},
    {"order":4,"title":"包覆水苔","description":"把浸濕的水苔一把一把鋪在土球外面，用手掌包緊，讓水苔均勻覆蓋整個土球，形成一顆圓球。","tip":"水苔要包得厚一點（約 1-2 公分），這樣苔球的形狀才圓潤持久。"},
    {"order":5,"title":"用線固定","description":"用棉線或麻繩一圈一圈纏繞苔球，方向交叉，讓每個角度都有線固定。綁好後在底部打結，完成！放在淺盤上，每天噴水保濕。","tip":"每週把苔球整個放入水中浸泡 5-10 分鐘補充水分，植物就會長得很好。"}
  ]'::jsonb,
  array['水苔', '赤玉土或培養土', '小型植物（蕨類、常春藤等）', '棉線或麻繩', '噴霧瓶', '淺盤']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-bean-sprout', '種豆芽菜',
  '只需要一把綠豆、一個碗和水，5 天就能看到嫩芽冒出來！種出來的豆芽可以直接炒來吃。',
  15, '🌱', array['elder','family'],
  array['園藝','種植','飲食','療癒'],
  'active',
  '[
    {"order":1,"title":"準備材料","description":"準備一把綠豆（超市有售）、有孔的篩子或深碗、乾淨的布或廚房紙巾、噴霧瓶。黃豆或黑豆也可以種，方法相同。","tip":"選顆粒飽滿、沒有受損的豆子，發芽率更高。"},
    {"order":2,"title":"浸泡豆子","description":"把綠豆放碗裡，加足夠的清水浸泡 8-12 小時（可以睡前泡，早上起來用）。泡好後豆子會膨脹，輕輕沖洗一下。","tip":"浸泡水不要太少，豆子吸水會膨脹很多。"},
    {"order":3,"title":"鋪在容器裡","description":"將泡好的豆子平鋪在篩子或鋪了濕布的容器中，不要堆疊太高（一兩層就好）。上面蓋一層濕廚房紙巾遮光。","tip":"豆芽在黑暗中長得又白又嫩，所以要蓋住。"},
    {"order":4,"title":"每天噴水","description":"每天早晚各噴一次水，保持豆子濕潤（不要積水，有孔的容器讓多餘的水流出去）。放在陰涼通風的地方。","tip":"水不能太多，否則豆子容易發臭。要潮濕但不積水。"},
    {"order":5,"title":"3-5 天後收成","description":"大約 3-5 天，豆芽就長到 3-5 公分，可以吃了！用清水洗淨，炒蛋、炒肉、做湯都好吃，而且是自己種的，特別甜。","tip":"種過一次就會知道訣竅，以後每週可以輪流種，一直有新鮮豆芽吃。"}
  ]'::jsonb,
  array['綠豆一把（約半杯）', '有孔篩子或深碗', '廚房紙巾', '噴霧瓶']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

-- ── 創意繪畫 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-life-story', '我的生命故事書',
  '把自己的故事寫下來、畫下來，留給家人和後代。不需要文筆好，只需要真誠地回憶。',
  60, '📖', array['elder','family','volunteer'],
  array['創意','繪畫','生命回顧','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"選一個主題","description":"今天先聚焦一個主題就好：「我的童年」「我最驕傲的事」「我最喜歡的食物和原因」「我對家人最想說的話」。不要一次想太多。","tip":"可以從最容易說的開始，不用按時間順序。"},
    {"order":2,"title":"寫下或口述","description":"用鉛筆（寫起來更輕鬆）把想到的事情寫下來，文字不用很多，幾行就好。如果寫字不方便，可以先錄音再讓家人幫忙打字。","tip":"不用考慮文法和用字，只要能看得懂就好。你的語氣本身就是這本書最珍貴的地方。"},
    {"order":3,"title":"配上圖畫","description":"旁邊用色鉛筆或水彩隨意畫一幅配圖：一棟老家的房子、一碗滷肉飯、一個人的側影。不需要畫得像，只要畫出感覺。","tip":"圓形、方形、線條組合就能表達很多東西，不用寫實。"},
    {"order":4,"title":"加上老照片（選做）","description":"如果有相關的老照片，可以掃描（或拍下來）印出來，剪貼在故事旁邊，增加真實感。","tip":"即使只是一張小小的黑白照，放在故事旁邊，效果很感動人。"},
    {"order":5,"title":"裝訂成冊","description":"做了幾頁後，可以用長尾夾把頁面夾起來，或請文具店幫忙裝訂成小冊子。在封面寫上你的名字和年份。","tip":"送一本給孩子、留一本自己保存，是最珍貴的家族禮物。"}
  ]'::jsonb,
  array['空白本子或A4紙數張', '鉛筆', '色鉛筆或水彩', '剪刀', '膠水', '（選做）老照片']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-zentangle', '禪繞畫入門',
  '一種不需要畫畫基礎的冥想繪畫法，從一個小格子開始，用線條慢慢填滿。越畫越專注、越平靜。',
  30, '🎨', array['elder','family','volunteer'],
  array['創意','繪畫','放鬆','禪繞'],
  'active',
  '[
    {"order":1,"title":"準備材料","description":"準備白色厚紙（明信片大小最好）、01 號黑色代針筆（或黑色原子筆）、鉛筆。桌上要有足夠的光線。","tip":"代針筆的線條最穩定好看，但普通原子筆也完全可以。"},
    {"order":2,"title":"畫邊框和切割線","description":"用鉛筆在紙上輕輕畫一個正方形邊框，再在框內隨意畫幾條曲線，把正方形切割成幾個不規則的小區塊（3-6 個就好）。","tip":"切割線不用直，彎的、有波浪的都很好看。"},
    {"order":3,"title":"選第一個格子","description":"選一個最小或最喜歡的格子，開始填圖案。最簡單的入門圖案：平行線、交叉方格、螺旋、波浪、圓點。","tip":"禪繞畫沒有對錯，只有你自己的線條，不要評判自己。"},
    {"order":4,"title":"慢慢填滿每個格子","description":"每個格子用不同的圖案，讓整張畫有豐富的變化。可以在同一格用深淺不同的力道，製造陰影效果。","tip":"速度要慢，這本來就是一種冥想。感受每一條線被畫出來的感覺。"},
    {"order":5,"title":"用鉛筆加陰影","description":"全部填完後，用鉛筆在格子與格子的交界處輕輕塗抹，製造陰影和立體感。這個步驟讓整張畫頓時「活起來」。","tip":"陰影只要塗在靠近線條的地方就好，用手指輕輕推開顏色，效果最自然。"}
  ]'::jsonb,
  array['白色厚紙（明信片大小）', '黑色代針筆或黑色原子筆', '鉛筆']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'create', 'interact-memory-puzzle', '記憶拼貼畫',
  '把舊雜誌、照片、糖果紙剪碎，拼貼成一幅畫，每一片都是一段記憶。適合和家人一起做。',
  45, '🖼️', array['elder','family','volunteer'],
  array['創意','拼貼','記憶','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"蒐集素材","description":"翻出舊雜誌、月曆、報紙、糖果紙、包裝紙、用不到的照片（建議用複印本）。顏色越多越好，先不用剪，只是蒐集。","tip":"去年的月曆照片特別好用，有各種風景和顏色。"},
    {"order":2,"title":"選一個主題","description":"決定這幅拼貼畫的主題：可以是「我喜歡的顏色」「家」「季節」「食物」或任何你想到的。主題幫助你在剪貼時做選擇。","tip":"也可以完全不限主題，跟著感覺走。隨機拼貼也有意外的美感。"},
    {"order":3,"title":"剪出形狀","description":"把素材剪成各種大小的形狀：方形、圓形、三角形，或者直接撕出不規則的形狀（撕的邊緣有一種手感的美）。","tip":"剪刀用左手也沒關係。若手力不夠，可以請家人幫忙剪，自己負責選和貼。"},
    {"order":4,"title":"先排列再貼","description":"在底紙上先把剪好的片段擺來擺去，找到喜歡的構圖，不用急著貼。確定位置後才用膠水或白膠固定。","tip":"可以讓不同的顏色、圖案重疊，製造層次感。"},
    {"order":5,"title":"加上文字（選做）","description":"用簽字筆在空白處寫幾個字：一句話、一個日期、一個名字。讓畫不只是視覺，還有文字的溫度。","tip":"完成後可以裝框掛起來，或掃描印出來送給家人。"}
  ]'::jsonb,
  array['舊雜誌、月曆、包裝紙', '剪刀', '白膠或膠水棒', '厚底紙或A4紙', '簽字筆（選做）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

-- ── 動動身體 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'move', 'interact-knee-care', '護膝運動',
  '膝蓋是老化最快的關節。這組運動能強化周圍肌肉，坐著就能做，保護膝蓋、延緩退化。',
  20, '🦵', array['elder','family'],
  array['運動','護膝','關節','防跌'],
  'active',
  '[
    {"order":1,"title":"了解膝蓋需要什麼","description":"膝蓋退化不是靠「休息」改善，而是靠「正確的活動」讓周圍肌肉強壯。大腿前側（股四頭肌）越強，膝蓋的負擔越小。","tip":"若膝蓋已經有疼痛，做動作前先告知醫生，確認適合做這組運動。"},
    {"order":2,"title":"坐姿抬腿（最重要）","description":"坐在椅子上，腰背挺直，慢慢將右腿向前伸直，腳尖朝上，大腿用力夾緊，撐住 5 秒。緩緩放下。左右各 10 次，做 3 組。","tip":"抬腿時感覺大腿前側有一股緊繃感，那就表示肌肉有在用力。"},
    {"order":3,"title":"踮腳尖站立","description":"扶著椅背站立，緩緩踮起腳尖，保持 3 秒，再慢慢放下。重複 15-20 次。這個動作同時強化小腿和改善平衡。","tip":"踮腳時要完全踮起，腳跟完全離地，效果才到位。"},
    {"order":4,"title":"彎曲膝蓋踩水車","description":"坐在椅子上，模仿踩腳踏車的動作，輪流將膝蓋提高再放下，不停交替。持續 1 分鐘。這個動作幫助關節液循環。","tip":"動作要慢，感受膝蓋在舒適的範圍內活動，不要憋氣。"},
    {"order":5,"title":"膝蓋熱身操收尾","description":"雙手放在膝蓋上，輕輕以順時針方向按摩 10 圈，再逆時針 10 圈。幫助促進局部血液循環，緩解不舒服。","tip":"如果膝蓋有腫脹，可以改用冰敷而非熱敷，先詢問醫師較安全。"}
  ]'::jsonb,
  array['穩固的椅子', '（選做）瑜伽墊']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();

-- ── 生活技能 ──────────────────────────────────────

insert into public.activity_cards
  (group_slug, slug, title, summary, duration_min, cover_emoji, identity_tags, tags, status, steps, materials)
values (
  'life', 'interact-recycling-game', '資源回收大挑戰',
  '台灣的回收分類規則很多。用「分類遊戲」的方式學習，家人一起玩、一起學，不容易忘記。',
  20, '♻️', array['elder','family','volunteer'],
  array['生活','環保','回收','陪伴互動'],
  'active',
  '[
    {"order":1,"title":"了解台灣 6 大類回收","description":"台灣的資源回收主要分 6 類：紙類、金屬（鐵鋁罐）、塑膠、玻璃、電子廢棄物、舊衣物。每縣市細節略有不同，但這 6 類是基礎。","tip":"可以打印一張回收分類對照表貼在廚房，全家一起查。"},
    {"order":2,"title":"準備「分類桶」遊戲","description":"在桌上放 4-6 個碗或小盒子，分別貼上「紙」「鐵」「塑膠」「玻璃」「一般垃圾」的標籤。從家裡找出 10-15 個常見的空瓶空罐空盒。","tip":"也可以直接用家裡的包裝廢棄物，這樣更實際。"},
    {"order":3,"title":"開始分類競賽","description":"家人輪流拿起一個物品，說出它屬於哪一類，再放入對應的碗裡。說對了得一分，說錯了討論正確答案再重來。","tip":"塑膠瓶的分類最常搞錯！台灣的塑膠回收看底部的三角形數字（1-7號），大部分都可回收。"},
    {"order":4,"title":"進階：清洗再回收","description":"學習正確的回收前處理：紙類要乾燥平整（不要有油漬）、鐵鋁罐和塑膠瓶要稍微沖洗（不需要洗乾淨，去掉食物殘渣就好）。","tip":"清洗後壓扁，可以讓回收箱裝更多，也減少異味。"},
    {"order":5,"title":"記下你的社區回收車時間","description":"打開手機，Google「你的區+資源回收車時刻表」，或撥打 1999 市民專線詢問，記下家附近的回收時間，貼在冰箱上。","tip":"資源回收車的垃圾費已包含在水費裡，免費！善用每週的回收日。"}
  ]'::jsonb,
  array['（不需要額外材料，家中廢棄包裝即可）']
)
on conflict (slug) do update
  set title=excluded.title, summary=excluded.summary, duration_min=excluded.duration_min,
      steps=excluded.steps, materials=excluded.materials, status=excluded.status, updated_at=now();
