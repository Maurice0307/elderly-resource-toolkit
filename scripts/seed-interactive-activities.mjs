// Seed interactive activity cards (志工/家屬陪伴互動圖卡)
// Run: node scripts/seed-interactive-activities.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const cards = [
  // ─── 手工美勞 ────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-clay",
    title: "手工美勞①：捏黏土",
    summary: "與好朋友一起捏出喜歡的動物、水果，留下回憶並做手部訓練。約 15 分鐘。",
    cover_emoji: "🟤",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "手部訓練", "15分鐘"],
    steps: [
      { order: 1, title: "準備材料", description: "在文具店購買不同顏色的輕黏土、竹籤（用來刻花紋或戳洞）、白膠、假眼睛等小裝飾品。準備一張平整桌面與手工美勞活動紀錄表。", tip: "輕黏土比一般黏土柔軟、不易乾，最適合長輩捏。" },
      { order: 2, title: "進行前：聊聊喜好", description: "在開始前，先問問好朋友：「你最喜歡什麼動物或水果？」聊一聊就有靈感，也能讓他更投入。", tip: "如果一時想不到，從家鄉常見的水果切入：芒果、芭樂、香蕉。" },
      { order: 3, title: "捏出基本形狀", description: "從最簡單的球形開始：搓圓→蘋果，搓橢圓→鳥蛋。再用拇指輕輕壓出凹痕做眼窩，或是用兩色黏土混合做出漸層。", tip: "雙手一起搓有助手部肌肉訓練，避免關節僵硬。" },
      { order: 4, title: "加入細節裝飾", description: "用竹籤在表面戳出花紋、刻出葉脈或羽毛紋路。用白膠黏上假眼睛，作品立刻活靈活現。也可用手機搜尋圖片參考。", tip: "活動中可一邊用手機搜尋圖片輔助創作，讓長輩感受 3C 的便利。" },
      { order: 5, title: "完成後：分享展示", description: "完成後，請好朋友說說「為什麼選這個顏色」「想把它放在家裡哪裡」。記錄到活動紀錄表，下次再看會很有成就感。", tip: "拍張照片傳給家人，是很棒的話題。" },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-origami",
    title: "手工美勞②：摺紙",
    summary: "用簡單的色紙，摺出愛心、康乃馨、小熊、小鳥等可愛圖形。約 15 分鐘。",
    cover_emoji: "🦢",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "摺紙", "15分鐘"],
    steps: [
      { order: 1, title: "準備材料", description: "在文具店購買不同花色的色紙。志工或家屬請在家先學會幾種摺法（愛心、康乃馨、小熊、小鳥），這樣現場才能順利帶領。", tip: "可上 YouTube 搜尋「簡單摺紙 教學」找適合長輩的步驟。" },
      { order: 2, title: "進行前：聊聊喜好", description: "問問好朋友：「你最喜歡什麼形狀或動物？」可選擇對方喜歡的款式開始，例如喜歡花就摺康乃馨。", tip: "這也是話匣子的開場：「以前過母親節有沒有收過什麼花？」" },
      { order: 3, title: "示範並一起摺", description: "把步驟拆成 3～5 段，每一段先示範一次再讓好朋友跟著做。手掌不靈活時，可幫忙壓摺線。", tip: "用力壓平摺線是長輩常需要協助的環節。" },
      { order: 4, title: "比較作品", description: "完成後可讓好朋友看看「自己摺的」與「示範的」差別，討論哪邊不一樣。也可以摺多個放在一起。", tip: "活動中可用手機搜尋影片輔助。" },
      { order: 5, title: "完成後：分享布置", description: "和好朋友討論「想布置在家中的哪個角落」？放在窗台、書桌、玄關都很美。", tip: "完成後立刻拍照存檔，下次來看時會更有印象。" },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-leaf-bookmark",
    title: "手工美勞③：葉脈書籤",
    summary: "撿一片葉子，搭配祝福的話，做成書籤送給親朋好友。約 20 分鐘（葉子需前 1 天預處理）。",
    cover_emoji: "🍃",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "祝福", "20分鐘"],
    steps: [
      { order: 1, title: "前一天：撿葉子並預處理", description: "和好朋友散步時撿幾片喜歡的葉子，回家泡在 1:5 比例的小蘇打水中浸泡一天，再用牙刷輕刷掉葉肉，留下葉脈。", tip: "桑葉、菩提葉、葉脈紋路最清楚。" },
      { order: 2, title: "準備材料", description: "白紙、彩色筆或鉛筆、白膠、護貝機（社區據點通常有）、剪刀、打洞器、緞帶。", tip: "沒有護貝機可改用透明膠帶兩面包住。" },
      { order: 3, title: "進行前：聊聊樹木", description: "問問好朋友「不同季節最喜歡什麼樹木？」聊以前住的地方常見哪些樹，連結記憶。", tip: "開啟回憶話題：「你小時候家附近有什麼樹？」" },
      { order: 4, title: "寫下祝福、組合書籤", description: "在白紙上寫祝福或畫小圖案，把葉脈和白紙黏合後護貝。裁切成書籤大小，打洞並掛上緞帶。", tip: "祝福對象可以是孫子、老朋友、自己。" },
      { order: 5, title: "完成後：分享意義", description: "請好朋友說說「這個作品想送給誰」「為什麼想送他」。記錄到活動紀錄表。", tip: "親手寫的祝福比買的禮物更有溫度。" },
    ],
  },
  // ─── 花草植栽 ────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-moss-ball",
    title: "花草植栽①：手作苔球",
    summary: "把現成盆栽改造成可愛苔球，從照顧植物中建立和好朋友的話題。約 20 分鐘。",
    cover_emoji: "🌿",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "花草植栽", "療癒", "20分鐘"],
    steps: [
      { order: 1, title: "準備材料", description: "現成小盆栽（黃金葛、薄荷皆可）、水苔一包（花市有賣）、塑膠袋、繩子、家中可裝水苔的容器、鐵盤、剪刀。", tip: "水苔先泡水 10 分鐘軟化再使用。" },
      { order: 2, title: "進行前：聊聊植物", description: "問問好朋友「你喜歡甚麼植物或花朵？」聊聊以前家裡有種過什麼植物。", tip: "話題切入：「你小時候家裡有種什麼？」連結童年。" },
      { order: 3, title: "包覆水苔成球", description: "把盆栽從原盆取出，在根團外面均勻包覆一層浸濕的水苔，雙手輕輕塑形成圓球。", tip: "水苔要擰乾再用，水分太多會爛根。" },
      { order: 4, title: "綁繩固定", description: "用繩子（細棉繩或麻繩）十字交叉繞，把苔球紮緊，最後打結固定。完成後放在鐵盤上盛接水分。", tip: "活動中可請好朋友確認：「這樣綁夠緊嗎？」讓他參與決策。" },
      { order: 5, title: "完成後：紀錄與觀察", description: "請好朋友畫出苔球的樣貌（紀錄表上），下次見面時再觀察變化、討論「長大了嗎」「葉子顏色變了嗎」。", tip: "每週泡水一次（整個浸入水中 5 分鐘），就是最簡單的照顧法。" },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-bean-sprout",
    title: "花草植栽②：種綠豆芽",
    summary: "看豆子發芽長大的過程，充滿生命力。約 30 分鐘起步，後續每日觀察。",
    cover_emoji: "🌱",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "花草植栽", "觀察", "30分鐘"],
    steps: [
      { order: 1, title: "前一晚：泡豆子", description: "取 1/3 米杯的綠豆或黃豆，倒入清水浸泡一夜（約 8 小時）。", tip: "選顆粒飽滿、無蟲蛀的豆子發芽率最好。" },
      { order: 2, title: "準備設置容器", description: "底部有鑽洞的寬容器、棉布、黑色塑膠袋（避光）、底下盛水的盆子。", tip: "黑塑膠袋可用便當袋取代，遮光是發芽關鍵。" },
      { order: 3, title: "進行前：聊聊豆類食物", description: "問問好朋友「喜歡吃豆腐、豆漿、豆花這些豆製品嗎？」「以前最常吃哪一種？」", tip: "可延伸聊「你以前在家是煮飯的人嗎？」" },
      { order: 4, title: "鋪設與澆水", description: "棉布鋪在容器底部、放豆子、再蓋一層棉布，上面蓋黑塑膠袋避光。每天早晚各澆水一次，水從底部洞流出即可。", tip: "問好朋友：「你猜豆子長大會變甚麼樣子？」" },
      { order: 5, title: "完成後：每日觀察記錄", description: "搭配生長日記每天觀察記錄（紀錄表）。第 3 天會冒小芽，第 5～7 天可採收。煮個豆芽湯一起品嚐！", tip: "煮給好朋友吃，活動有了完整的循環。" },
    ],
  },
  // ─── 創意繪畫 ────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-life-story",
    title: "創意繪畫①：繪製生命故事",
    summary: "打開塵封多年的回憶，以色筆畫出自己的生命故事，記錄並傳承。約 20 分鐘。",
    cover_emoji: "📖",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "創意繪畫", "生命故事", "20分鐘"],
    steps: [
      { order: 1, title: "準備材料", description: "A4 白色粉彩紙、色鉛筆、蠟筆、一把尺。準備一個安靜舒適的環境，可放輕音樂。", tip: "粉彩紙質地厚實，色彩呈現比一般白紙更柔和。" },
      { order: 2, title: "進行前：回憶討論", description: "和好朋友討論並回想一件「美好的回憶」：可能是結婚那天、孩子出生、第一次出國、退休那天。給他 2～3 分鐘慢慢想。", tip: "不要急，沉默有時候是回憶在浮現。" },
      { order: 3, title: "深入問細節", description: "活動中深入問故事細節：「那天天氣怎樣？」「你穿什麼衣服？」「現場有誰？」這些細節能引導畫成圖案。", tip: "細節越具體，畫起來越生動，記憶也會被喚回。" },
      { order: 4, title: "把回憶畫下來", description: "用色鉛筆勾勒輪廓，再用蠟筆塗色。畫得不像沒關係，重點是把腦海中的場景畫出來。可以加上文字說明日期、地點。", tip: "「畫畫沒有對錯」要不斷強調，讓他放心。" },
      { order: 5, title: "完成後：說故事", description: "請好朋友從頭分享畫面上的故事，志工／家屬安靜聆聽。完成後把作品展示在家中顯眼處。", tip: "可以拍照、分享給其他家人，串起家族記憶。" },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-zentangle",
    title: "創意繪畫②：禪繞畫",
    summary: "透過重複線條與圖案，幫助放下思緒和壓力，重新審視內心感覺。約 20 分鐘。",
    cover_emoji: "🖌️",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "創意繪畫", "紓壓", "20分鐘"],
    steps: [
      { order: 1, title: "準備材料", description: "纏繞畫專用紙磚（白紙也可）、0.1 代針筆、0.5 學習筆、2B 鉛筆、推針筆。", tip: "細針筆畫起來最有禪繞畫的味道，文具店都有。" },
      { order: 2, title: "進行前：問內心感覺", description: "問問好朋友「現在內心是什麼感覺？」用形容詞回答，例如：平靜、煩躁、開心、空空的。", tip: "沒標準答案，把感覺說出來就是第一步療癒。" },
      { order: 3, title: "依感覺選線條", description: "活動中討論：「這種感覺會想到什麼線條和圖案？」例如平靜→波浪、煩躁→鋸齒。從紙面任一格開始畫。", tip: "禪繞畫沒有錯，每一筆都是對的。" },
      { order: 4, title: "重複與填滿", description: "用同一種圖案不斷重複填滿一格，再換到下一格用不同圖案。重複的動作有冥想效果。", tip: "畫畫時不需講話，沉浸的安靜也是陪伴。" },
      { order: 5, title: "完成後：分享內心反映", description: "完成後分享自己的作品，說說「畫完現在的感覺有變嗎？」展示在家中提醒自己有過這份平靜。", tip: "這是最簡單的「正念」練習之一。" },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-memory-puzzle",
    title: "創意繪畫③：DIY 記憶拼圖",
    summary: "把美好回憶的照片畫成拼圖，拼湊出當時人事物的場景。約 20 分鐘。",
    cover_emoji: "🧩",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "創意繪畫", "回憶", "20分鐘"],
    steps: [
      { order: 1, title: "準備材料", description: "美好回憶照片一張（請好朋友打開手機或從家中找出）、色鉛筆、蠟筆、厚紙板一張、白膠、剪刀。", tip: "照片可以是孫兒、結婚、出遊、家人合照，越有故事越好。" },
      { order: 2, title: "進行前：找照片", description: "請好朋友打開手機相簿或於家中翻找一張美好回憶的照片。給他時間挑選最有感覺的那張。", tip: "「為什麼選這張？」就是最棒的開場話題。" },
      { order: 3, title: "把人事物畫成空白拼圖", description: "把照片裡的人物、場景、事物用色筆畫到空白拼圖紙中。可以照著畫，也可以加上自己的詮釋。", tip: "畫得不像沒關係，是「記憶版本」不是寫實畫。" },
      { order: 4, title: "黏厚紙板並剪下", description: "畫好後將圖案面朝上黏在厚紙板上，等白膠乾後，用剪刀剪成 6～9 塊不規則的拼圖塊。", tip: "塊數視長者手部靈活度調整，新手 6 塊就夠。" },
      { order: 5, title: "完成後：拼回原圖", description: "把拼圖塊打散再拼回原圖，挑戰一下記憶力！完成後展示在家中，每天看每天回味。", tip: "下次見面可請好朋友再拼一次，是很好的記憶訓練。" },
    ],
  },
  // ─── 動動身體 ────────────────────────────────────────
  {
    group_slug: "move",
    slug: "interact-knee-care",
    title: "動動身體：日常護膝運動",
    summary: "保護膝關節的日常 3+3 動作，跟好朋友一起學，居家簡單做。約 15 分鐘。",
    cover_emoji: "🦵",
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "動動身體", "護膝", "15分鐘"],
    steps: [
      { order: 1, title: "準備工具", description: "手機（觀看示範影片）、一張穩固的椅子、活動紀錄表。確認椅子四腳穩固、地面不滑。", tip: "椅背能扶最好，協助平衡。" },
      { order: 2, title: "進行前：問膝蓋狀況", description: "詢問好朋友「平常膝蓋有沒有不舒服？」「上下樓梯會痠嗎？」根據狀況調整強度。", tip: "如果膝蓋有急性疼痛、紅腫，請先看醫生再運動。" },
      { order: 3, title: "基礎 3 招（坐姿）", description: "坐姿伸腿：右腳緩緩向前伸直、停 5 秒、放下，左右各 8 次。腳踝畫圈：左右各 10 圈。腳尖上下擺：上下各 15 次。", tip: "動作要慢，感受大腿前側肌肉用力。" },
      { order: 4, title: "強化 3 招（站姿）", description: "站姿微蹲：扶椅背，膝蓋微彎成 30 度、停 3 秒、站起，10 次。側抬腿：左右各 10 次。後抬腿：左右各 10 次。", tip: "全程扶穩椅背，避免跌倒。" },
      { order: 5, title: "完成後：感覺與日常應用", description: "問問好朋友「做完感覺如何？」「平常什麼時候在家可以做？」（看電視時、起床後、洗澡前都好）。記錄到活動紀錄表。", tip: "把運動和日常作息綁在一起，最容易養成習慣。" },
    ],
  },
];

let success = 0;
for (const card of cards) {
  const { error } = await admin.from("activity_cards").upsert(card, {
    onConflict: "slug",
  });
  if (error) {
    console.error(`✗ ${card.slug}:`, error.message);
  } else {
    console.log(`✓ ${card.slug}`);
    success++;
  }
}
console.log(`\nDone. ${success}/${cards.length} cards upserted.`);
