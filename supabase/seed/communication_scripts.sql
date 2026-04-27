-- =====================================================
-- 溝通錦囊種子資料
-- =====================================================

-- ── 志工篇 ────────────────────────────────────────
insert into public.communication_scripts
  (audience, slug, title, context, ok_examples, ng_examples, tips, tags)
values (
  'volunteer',
  'first-knock',
  '第一次敲門怎麼說',
  '第一次到獨居長者家探訪，長者可能戒心較高，不知道你是誰、有什麼目的。這幾句話能幫你建立第一印象。',
  '[
    {"role":"志工","text":"阿嬤您好！我是社區的志工小李，里長請我來關心一下您最近的狀況，方便讓我進來坐個 5 分鐘嗎？"},
    {"role":"長輩","text":"哦，是里長叫你來的？"},
    {"role":"志工","text":"對！我每個月都會來附近幾戶走走，今天只是想問問您身體好不好，有沒有需要幫忙的地方。我這裡有志工證，您可以看一下。"}
  ]'::jsonb,
  '[
    {"role":"志工","text":"你好，我來關心你！","reason":"太突然，沒說明身份來源，長輩會感到不安。"},
    {"role":"志工","text":"大家好嗎？今天來拜訪一下！","reason":"語氣太隨便，缺乏尊重，長輩可能覺得不受重視。"}
  ]'::jsonb,
  array['敲門前先電話通知（若有電話）','拿出志工識別證主動出示','說明是誰介紹你來的，建立信任感','第一次拜訪不要待太久，10-15 分鐘即可'],
  array['志工','探訪','第一印象']
)
on conflict (slug) do update
  set title=excluded.title, context=excluded.context, ok_examples=excluded.ok_examples,
      ng_examples=excluded.ng_examples, tips=excluded.tips, updated_at=now();

insert into public.communication_scripts
  (audience, slug, title, context, ok_examples, ng_examples, tips, tags)
values (
  'volunteer',
  'break-ice',
  '如何讓長輩打開話匣子',
  '有些長輩個性內向，或因為生活圈縮小而不習慣跟陌生人說話。這幾個話題容易引起共鳴，讓對話自然展開。',
  '[
    {"role":"志工","text":"阿公，我看您家門口種了茉莉花，好香喔！請問您種很久了嗎？"},
    {"role":"長輩","text":"哎呀，那個我種二十幾年了，以前院子更多…"},
    {"role":"志工","text":"哇，那您一定很會種！可以教我嗎？我一直種不活…"},
    {"role":"長輩","text":"哈哈，這個不難，我來跟你說…"}
  ]'::jsonb,
  '[
    {"role":"志工","text":"阿公，你今天吃飯了嗎？身體好嗎？","reason":"太像例行公事，長輩覺得你只是走流程，不是真的關心。"},
    {"role":"志工","text":"你最近有沒有什麼問題需要幫忙的？","reason":"開門見山問「有什麼問題」，讓長輩感覺自己是「需要被幫助的人」，有些人會因此防禦。"}
  ]'::jsonb,
  array['觀察環境找話題（照片、植物、獎狀、電視節目）','問長輩年輕時的故事，他們最喜歡分享過去','給真誠的讚美，不要誇張','讓長輩多說話，自己少說'],
  array['志工','聊天','破冰']
)
on conflict (slug) do update
  set title=excluded.title, context=excluded.context, ok_examples=excluded.ok_examples,
      ng_examples=excluded.ng_examples, tips=excluded.tips, updated_at=now();

-- ── 家屬篇 ────────────────────────────────────────
insert into public.communication_scripts
  (audience, slug, title, context, ok_examples, ng_examples, tips, tags)
values (
  'family',
  'beyond-did-you-eat',
  '不只問「吃飯沒」的開場白',
  '許多家屬和父母通電話，說了三句就沒話說了，最後只剩下「吃飯沒」「早點睡」。這裡提供幾個真正能讓對話熱起來的話題。',
  '[
    {"role":"家屬","text":"媽，我今天在便利商店看到一個新口味的布丁，你之前說你喜歡布丁，下次我帶給你嚐嚐。"},
    {"role":"長輩","text":"哎唷，不用花那個錢啦，你顧好自己就好…"},
    {"role":"家屬","text":"不貴啦，才幾十塊。對了，你最近有沒有去社區活動？上次你說那個老師教太極很好玩。"},
    {"role":"長輩","text":"有啊！上禮拜我還…"}
  ]'::jsonb,
  '[
    {"role":"家屬","text":"媽，你吃飯了沒？身體好嗎？","reason":"雖然是關心，但這種問法太制式，長輩可能只是應付地說「好好好」。"},
    {"role":"家屬","text":"你要記得按時吃藥，不要讓我擔心。","reason":"帶有責備感，長輩會有壓力，反而不想講電話。"}
  ]'::jsonb,
  array['提一件今天發生的小事分享給父母','問父母最近在看什麼電視節目','說「上次你提到…」顯示你有在記得他說的事','偶爾傳一張自拍或食物照片，讓他感覺參與你的生活'],
  array['家屬','溝通','日常關心']
)
on conflict (slug) do update
  set title=excluded.title, context=excluded.context, ok_examples=excluded.ok_examples,
      ng_examples=excluded.ng_examples, tips=excluded.tips, updated_at=now();

insert into public.communication_scripts
  (audience, slug, title, context, ok_examples, ng_examples, tips, tags)
values (
  'family',
  'emotional-empathy',
  '情緒同理練習',
  '當父母訴說身體不舒服或抱怨時，家屬常常急著「解決問題」，反而讓長輩覺得不被理解。先同理，再解決。',
  '[
    {"role":"長輩","text":"最近腳一直在痛，晚上睡不著，真的很煩…"},
    {"role":"家屬","text":"聽起來你最近真的很不舒服，睡不著又腳痛，很辛苦。"},
    {"role":"長輩","text":"對啊，就是很不舒服…"},
    {"role":"家屬","text":"你這樣說了有多久了？我們下週帶你去看個醫生，讓醫生確認一下，你覺得好嗎？"}
  ]'::jsonb,
  '[
    {"role":"長輩","text":"最近腳一直在痛，晚上睡不著…"},
    {"role":"家屬","text":"你要多走走、多運動才不會痛。","reason":"急著給建議，讓長輩覺得「你根本沒在聽我說話」。"},
    {"role":"家屬","text":"老人家哪個沒有在痛，忍一下就好啦。","reason":"輕描淡寫長輩的感受，讓他覺得自己不被重視。"}
  ]'::jsonb,
  array['先重複長輩說的話（「你說你腳在痛…」），讓他感覺被聽見','不要急著給解決方案，先說「聽起來真的很辛苦」','避免說「老人家都這樣」、「沒事啦」','同理後再提建議，效果更好'],
  array['家屬','情緒','同理心']
)
on conflict (slug) do update
  set title=excluded.title, context=excluded.context, ok_examples=excluded.ok_examples,
      ng_examples=excluded.ng_examples, tips=excluded.tips, updated_at=now();

-- ── 困難情境篇 ────────────────────────────────────
insert into public.communication_scripts
  (audience, slug, title, context, ok_examples, ng_examples, tips, tags)
values (
  'difficult',
  'persuade-doctor',
  '勸導長輩就醫',
  '許多長輩諱疾忌醫，覺得「去看醫生就是病很嚴重」或「浪費錢」。這個情況需要耐心和技巧，硬逼反而適得其反。',
  '[
    {"role":"家屬","text":"媽，我知道你不喜歡去醫院，我也不是說你有什麼大病。"},
    {"role":"長輩","text":"對啊，我沒事的，不要浪費錢…"},
    {"role":"家屬","text":"但你這個咳嗽已經兩個禮拜了，我心裡會擔心。你看，只是去讓醫生聽一下，如果沒事我們馬上回來，就當帶你出去走走好嗎？"},
    {"role":"長輩","text":"就你多事…"},
    {"role":"家屬","text":"我是因為在乎你才多事。這樣，我禮拜六陪你去，我也剛好要拿藥，我們一起去。"}
  ]'::jsonb,
  '[
    {"role":"家屬","text":"你再不去看醫生，後果很嚴重！","reason":"恐嚇方式讓長輩更抗拒，也容易引起情緒衝突。"},
    {"role":"家屬","text":"你不去我沒辦法管你！","reason":"放棄的語氣讓長輩覺得你不在乎，失去溝通機會。"}
  ]'::jsonb,
  array['用「我擔心」代替「你應該」，把焦點放在自己的感受','把就醫包裝成「順道」或「一起去」，降低抗拒感','找長輩信任的人（鄰居、老朋友）一起勸說效果更好','不要一次達成，分多次溝通也沒關係'],
  array['就醫','勸導','困難溝通']
)
on conflict (slug) do update
  set title=excluded.title, context=excluded.context, ok_examples=excluded.ok_examples,
      ng_examples=excluded.ng_examples, tips=excluded.tips, updated_at=now();

insert into public.communication_scripts
  (audience, slug, title, context, ok_examples, ng_examples, tips, tags)
values (
  'difficult',
  'anti-fraud-talk',
  '和長輩談防詐騙',
  '許多長輩覺得「詐騙是別人的事」或「我又不笨，不會上當」。如何讓他們真正提高警覺，而不是當場點頭、轉頭就忘？',
  '[
    {"role":"家屬","text":"爸，我最近看到一個新聞，有個退休老師被騙走了 200 萬，他說他也沒想到自己會被騙。"},
    {"role":"長輩","text":"我才不會，我又不貪心。"},
    {"role":"家屬","text":"那個老師也不貪心，只是對方偽裝成警察，說他的帳戶涉及洗錢案，要他配合轉帳。現在詐騙方法很厲害的。"},
    {"role":"長輩","text":"真的假的，警察也會詐騙？"},
    {"role":"家屬","text":"所以我們家有一個規定：不管是誰打電話來，說要轉帳或給驗證碼，你就掛電話，直接打 165 確認。我把 165 存在你手機裡了。"}
  ]'::jsonb,
  '[
    {"role":"家屬","text":"你要小心，現在詐騙很多！不要接陌生電話！","reason":"太籠統，長輩聽完不知道具體該怎麼做。"},
    {"role":"家屬","text":"你上次差點被騙，真的要更小心。","reason":"帶有責備意味，長輩會感到難堪而防禦，效果適得其反。"}
  ]'::jsonb,
  array['用真實案例（新聞故事）代替說教','建立一個簡單的家庭規則（轉帳前先打電話問我）','把 165 存進長輩手機聯絡人','定期（每個月）複習一次，不是說一次就夠了'],
  array['防詐','困難溝通','金融安全']
)
on conflict (slug) do update
  set title=excluded.title, context=excluded.context, ok_examples=excluded.ok_examples,
      ng_examples=excluded.ng_examples, tips=excluded.tips, updated_at=now();
