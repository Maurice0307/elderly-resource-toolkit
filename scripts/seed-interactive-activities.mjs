// Seed interactive activity cards (志工/家屬陪伴互動圖卡)
// Run: node scripts/seed-interactive-activities.mjs
//
// Schema fields used (see migrations 0004 + 0007):
//   slug, title, summary, group_slug, cover_emoji, identity_tags, tags,
//   cover_image_url, hero_image_url, video_url, video_provider,
//   source_url, source_org, duration_min,
//   steps: [{order, title, description, tip?, image_url?, video_url?, video_start?}]
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

// Helper: build YouTube poster URL from a watch URL
function ytPoster(watchUrl) {
  const m = watchUrl.match(/[?&]v=([^&]+)/) || watchUrl.match(/youtu\.be\/([^?]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` : null;
}

const cards = [
  // ─── a. 捏黏土 ─────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-clay",
    title: "捏黏土",
    summary: "用輕黏土捏出喜歡的動物或水果，留下回憶並做手部訓練。約 15 分鐘。",
    cover_emoji: "🟤",
    duration_min: 15,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "手部訓練", "15分鐘"],
    video_url: "https://www.youtube.com/watch?v=K4i85Lg5H4Y",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=K4i85Lg5H4Y"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=K4i85Lg5H4Y"),
    source_org: "YouTube 教學頻道",
    steps: [
      {
        order: 1,
        title: "準備材料",
        description: "在文具店購買不同顏色的輕黏土、竹籤（用來刻花紋或戳洞）、白膠、假眼睛等小裝飾品。準備一張平整桌面。",
        tip: "輕黏土比一般黏土柔軟、不易乾，最適合長輩捏。",
      },
      {
        order: 2,
        title: "聊聊喜好、決定主題",
        description: "在開始前，先問問好朋友：「你最喜歡什麼動物或水果？」聊一聊就有靈感，也能讓他更投入。",
        tip: "如果一時想不到，從家鄉常見的水果切入：芒果、芭樂、香蕉。",
      },
      {
        order: 3,
        title: "捏動物（看影片跟著做）",
        description: "影片示範了如何捏出小狗、小豬、小兔等基本動物造型。關鍵是先搓圓做身體，再加上四肢、耳朵、尾巴。",
        video_url: "https://www.youtube.com/watch?v=K4i85Lg5H4Y",
        tip: "雙手一起搓有助手部肌肉訓練，避免關節僵硬。",
      },
      {
        order: 4,
        title: "捏水果（換影片跟著做）",
        description: "如果好朋友更喜歡水果，可改照水果教學：從球形（蘋果）、橢圓（芒果）、彎月形（香蕉）開始。",
        video_url: "https://www.youtube.com/watch?v=ePMnx19FSyI",
        tip: "兩色黏土混合可做出漸層，蘋果尤其漂亮。",
      },
      {
        order: 5,
        title: "加裝飾、完成展示",
        description: "用竹籤在表面戳出花紋。用白膠黏上假眼睛。完成後請好朋友說說「為什麼選這個顏色」「想放在家裡哪裡」。",
        tip: "拍張照片傳給家人，是很棒的話題。",
      },
    ],
  },

  // ─── b. 摺紙 — 拆 4 張卡（一種類型一張）──────────────────
  {
    group_slug: "create",
    slug: "interact-origami-heart",
    title: "摺紙：愛心",
    summary: "最簡單入門的摺紙，幾分鐘就能完成一個愛心，送禮自用兩相宜。約 10 分鐘。",
    cover_emoji: "❤️",
    duration_min: 10,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "摺紙", "新手友善", "10分鐘"],
    video_url: "https://www.youtube.com/watch?v=fVpG6pIaxyY",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=fVpG6pIaxyY"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=fVpG6pIaxyY"),
    source_org: "YouTube 教學頻道",
    steps: [
      {
        order: 1,
        title: "準備色紙",
        description: "準備 1～2 張正方形色紙，紅色或粉色最有愛心感。",
        tip: "新手用 15×15 公分的尺寸最容易上手。",
      },
      {
        order: 2,
        title: "跟著影片摺出愛心",
        description: "影片從頭示範了愛心的摺法。每一個摺線都用手指刮平、再壓緊，完成後就是一個立體愛心。",
        video_url: "https://www.youtube.com/watch?v=fVpG6pIaxyY",
        tip: "壓摺線是長輩常需要協助的環節，可代為施力。",
      },
      {
        order: 3,
        title: "完成、寫祝福",
        description: "在愛心背面寫上想對家人或好朋友說的話，或當作小卡片夾在書中。",
        tip: "親手摺的比買的更有溫度。",
      },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-origami-carnation",
    title: "摺紙：康乃馨",
    summary: "一朵紙康乃馨送長輩，最適合母親節、父親節、感恩節。約 15 分鐘。",
    cover_emoji: "🌸",
    duration_min: 15,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "摺紙", "送禮", "15分鐘"],
    video_url: "https://www.youtube.com/watch?v=EIOCmogDyew",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=EIOCmogDyew"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=EIOCmogDyew"),
    source_org: "YouTube 教學頻道",
    steps: [
      {
        order: 1,
        title: "準備材料",
        description: "粉紅或紅色色紙 1～2 張、綠色色紙做花莖、剪刀、雙面膠或膠水。",
        tip: "皺紋紙效果更立體，但一般色紙也完全沒問題。",
      },
      {
        order: 2,
        title: "跟著影片摺花瓣",
        description: "影片示範如何把方形紙摺成扇形、再剪出花瓣的鋸齒邊緣。",
        video_url: "https://www.youtube.com/watch?v=EIOCmogDyew",
        tip: "剪鋸齒時不要剪太深，否則花瓣會散開。",
      },
      {
        order: 3,
        title: "捲起花朵、貼上花莖",
        description: "把摺好的花瓣捲起來、底部用膠帶或膠水固定，再黏上綠色花莖。",
        tip: "花莖可用綠色色紙捲成細長條代替。",
      },
      {
        order: 4,
        title: "送出祝福",
        description: "完成後請好朋友想想「想送給誰」「為什麼想送他」。一朵小花就能讓對方感受到心意。",
      },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-origami-bear",
    title: "摺紙：小熊",
    summary: "可愛小熊摺紙，孩子和孫子都會喜歡，是最好的祖孫互動。約 15 分鐘。",
    cover_emoji: "🐻",
    duration_min: 15,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "摺紙", "親子", "15分鐘"],
    video_url: "https://www.youtube.com/watch?v=FMhmHWQIStE",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=FMhmHWQIStE"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=FMhmHWQIStE"),
    source_org: "YouTube 教學頻道",
    steps: [
      {
        order: 1,
        title: "準備色紙",
        description: "棕色或咖啡色正方形色紙 1 張。可再準備一支黑色細筆畫眼睛和鼻子。",
        tip: "色紙若太小，五官會難畫，建議至少 15×15 公分。",
      },
      {
        order: 2,
        title: "跟著影片摺",
        description: "影片完整示範如何摺出小熊的圓臉、耳朵、與身體輪廓。",
        video_url: "https://www.youtube.com/watch?v=FMhmHWQIStE",
        tip: "耳朵的小三角是難點，可以多看幾次影片再動手。",
      },
      {
        order: 3,
        title: "畫上五官",
        description: "用黑色筆點上眼睛、畫上鼻子，小熊立刻有表情。可以畫笑臉、撲克臉、害羞臉。",
        tip: "讓好朋友自己畫表情，作品才有他的個性。",
      },
    ],
  },
  {
    group_slug: "create",
    slug: "interact-origami-bird",
    title: "摺紙：小鳥",
    summary: "最有挑戰的一款，完成後會很有成就感。約 20 分鐘。",
    cover_emoji: "🐦",
    duration_min: 20,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "摺紙", "進階挑戰", "20分鐘"],
    video_url: "https://www.youtube.com/watch?v=YEB_71IceM0",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=YEB_71IceM0"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=YEB_71IceM0"),
    source_org: "YouTube 教學頻道",
    steps: [
      {
        order: 1,
        title: "準備材料",
        description: "黃色、藍色、白色等鮮豔色紙皆可，1 張正方形。",
        tip: "建議先摺過愛心或小熊再挑戰小鳥，會比較順手。",
      },
      {
        order: 2,
        title: "跟著影片摺",
        description: "小鳥的翅膀和尾巴需要多次反摺，請放慢節奏跟著影片做。",
        video_url: "https://www.youtube.com/watch?v=YEB_71IceM0",
        tip: "卡住時就暫停影片重新看一次，沒關係。",
      },
      {
        order: 3,
        title: "立體成形、放窗台",
        description: "完成後輕輕拉開翅膀，讓小鳥立體呈現。可以擺在窗台或書架，每天看每天好心情。",
      },
    ],
  },

  // ─── c. 葉脈書籤 ────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-leaf-bookmark",
    title: "葉脈書籤",
    summary: "撿一片葉子做成書籤，搭配祝福的話送給親朋好友。約 20 分鐘（葉子需提前 1 天預處理）。",
    cover_emoji: "🍃",
    duration_min: 20,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "手工美勞", "祝福", "20分鐘"],
    video_url: "https://www.youtube.com/watch?v=FO3ncP3OVTs",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=FO3ncP3OVTs"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=FO3ncP3OVTs"),
    source_url: "https://docs.google.com/document/d/173VGvRgtuipOlpn5olFPDMUVRIeBPC38E_wOfRroJ88/edit",
    source_org: "葉脈書籤 DIY 詳細步驟",
    steps: [
      {
        order: 1,
        title: "撿葉子（前 1 天）",
        description: "和好朋友散步時撿幾片葉子。桑葉、菩提葉、橡膠樹葉的葉脈紋路最清楚，做出來最美。",
        tip: "選葉脈粗、葉肉厚的葉子最好。",
      },
      {
        order: 2,
        title: "預處理葉子（看影片）",
        description: "把葉子泡在 1:5 的小蘇打水中浸泡一天（或用熱水煮 30 分鐘加快），再用牙刷輕刷掉葉肉，留下完整葉脈。這步驟比較花時間，影片有完整示範。",
        video_url: "https://www.youtube.com/watch?v=BVD94AUWHt8",
        tip: "刷的時候要輕，不然會把葉脈也刷斷。",
      },
      {
        order: 3,
        title: "聊聊樹木與童年",
        description: "做書籤的同時，可以問好朋友「不同季節最喜歡什麼樹木？」「你小時候家附近有什麼樹？」連結記憶。",
        tip: "開場話題：「以前住的地方常見哪些樹？」",
      },
      {
        order: 4,
        title: "做書籤（看影片）",
        description: "把葉脈染色或保留原色都可以，黏在白紙上，寫祝福、護貝、剪成書籤大小、打洞掛緞帶。完整流程跟著影片做最清楚。",
        video_url: "https://www.youtube.com/watch?v=FO3ncP3OVTs",
        tip: "沒有護貝機可改用透明膠帶兩面包住。",
      },
      {
        order: 5,
        title: "分享意義",
        description: "請好朋友說說「這個書籤想送給誰」「為什麼想送他」。親手寫的祝福比買的禮物更有溫度。",
      },
    ],
  },

  // ─── d. 手作苔球 ────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-moss-ball",
    title: "手作苔球",
    summary: "把現成盆栽改造成可愛苔球，從照顧植物中建立和好朋友的話題。約 20 分鐘。",
    cover_emoji: "🌿",
    duration_min: 20,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "花草植栽", "療癒", "20分鐘"],
    video_url: "https://www.youtube.com/watch?v=iG2b0qYoomc",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=iG2b0qYoomc"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=iG2b0qYoomc"),
    source_org: "YouTube 教學頻道",
    steps: [
      {
        order: 1,
        title: "準備材料",
        description: "現成小盆栽（黃金葛、薄荷皆可）、水苔一包（花市有賣）、繩子、家中可裝水苔的容器、鐵盤、剪刀。水苔先泡水 10 分鐘軟化再使用。",
        tip: "水苔要擰乾再用，水分太多會爛根。",
      },
      {
        order: 2,
        title: "聊聊植物",
        description: "問問好朋友「你喜歡甚麼植物或花朵？」聊聊以前家裡有種過什麼。",
        tip: "話題切入：「你小時候家裡有種什麼？」連結童年。",
      },
      {
        order: 3,
        title: "跟著影片包苔球",
        description: "把盆栽從原盆取出，在根團外面均勻包覆一層浸濕的水苔，雙手輕輕塑形成圓球。影片有完整示範。",
        video_url: "https://www.youtube.com/watch?v=iG2b0qYoomc",
        tip: "請好朋友確認：「這樣綁夠緊嗎？」讓他參與決策。",
      },
      {
        order: 4,
        title: "綁繩固定",
        description: "用細棉繩或麻繩十字交叉繞，把苔球紮緊，最後打結固定。完成後放在鐵盤上盛接水分。",
      },
      {
        order: 5,
        title: "後續照顧",
        description: "每週泡水一次（整個浸入水中 5 分鐘），就是最簡單的照顧法。下次見面時觀察「長大了嗎」「葉子顏色變了嗎」。",
        tip: "可以拍張照當紀念，下次比較變化。",
      },
    ],
  },

  // ─── e. 種綠豆芽 ────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-bean-sprout",
    title: "種綠豆芽",
    summary: "看豆子發芽長大的過程，充滿生命力。約 30 分鐘起步，後續每日觀察。",
    cover_emoji: "🌱",
    duration_min: 30,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "花草植栽", "觀察", "30分鐘"],
    video_url: "https://www.youtube.com/watch?v=abK-t_UyjRk",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=abK-t_UyjRk"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=abK-t_UyjRk"),
    source_org: "YouTube 教學頻道",
    steps: [
      {
        order: 1,
        title: "前一晚泡豆子",
        description: "取 1/3 米杯的綠豆或黃豆，倒入清水浸泡一夜（約 8 小時）。",
        tip: "選顆粒飽滿、無蟲蛀的豆子發芽率最好。",
      },
      {
        order: 2,
        title: "準備容器",
        description: "底部有鑽洞的寬容器、棉布、黑色塑膠袋（避光）、底下盛水的盆子。",
        tip: "黑塑膠袋可用便當袋取代，遮光是發芽關鍵。",
      },
      {
        order: 3,
        title: "聊聊豆類食物",
        description: "問問好朋友「喜歡吃豆腐、豆漿、豆花這些豆製品嗎？」「以前最常吃哪一種？」",
        tip: "可延伸聊「你以前在家是煮飯的人嗎？」",
      },
      {
        order: 4,
        title: "鋪設與澆水（看影片）",
        description: "棉布鋪在容器底部、放豆子、再蓋一層棉布，上面蓋黑塑膠袋避光。每天早晚各澆水一次，水從底部洞流出即可。完整流程影片示範。",
        video_url: "https://www.youtube.com/watch?v=abK-t_UyjRk",
        tip: "問好朋友：「你猜豆子長大會變甚麼樣子？」",
      },
      {
        order: 5,
        title: "每日觀察與品嚐",
        description: "第 3 天會冒小芽，第 5～7 天可採收。煮一鍋豆芽湯一起品嚐，活動有了完整的循環。",
        tip: "煮給好朋友吃，是很有意義的收尾。",
      },
    ],
  },

  // ─── f. 陽台小花圃入門（重新組織步驟與圖片）──────────────
  {
    group_slug: "create",
    slug: "balcony-garden",
    title: "陽台小花圃入門",
    summary: "在家陽台種一盆好照顧的香草或花，每天澆水時就能伸展與曬太陽。約 30 分鐘。",
    cover_emoji: "🪴",
    duration_min: 30,
    identity_tags: ["volunteer", "family", "elder"],
    tags: ["花草植栽", "陽台", "新手友善", "30分鐘"],
    source_org: "綜合園藝入門指南",
    steps: [
      {
        order: 1,
        title: "選對植物（新手必看）",
        description: "推薦三種：① 薄荷 — 喜歡水、耐陰、剪一片就能煮茶。② 九層塔 — 太陽多時長最快，做菜直接用。③ 黃金葛 — 幾乎不會死，半天陽光就能活。",
        tip: "第一次種，先選一種就好，不要一次買 5 盆。",
      },
      {
        order: 2,
        title: "準備工具",
        description: "深 15 公分以上的盆器（要有排水孔）、培養土一包、小鏟子、噴霧瓶、現成幼苗（花市最便宜，比種子快很多）。",
        tip: "瓶罐切兩半也能當盆，但記得在底部戳幾個洞排水。",
      },
      {
        order: 3,
        title: "種下幼苗",
        description: "盆底鋪 2 公分培養土 → 把幼苗連根團放入 → 四周再填土到離盆口 2 公分 → 用手輕壓固定 → 立刻澆水到底部流出。",
        tip: "壓土不要太用力，根需要空氣。",
      },
      {
        order: 4,
        title: "建立澆水習慣",
        description: "用手指插入土裡 2 公分，乾了才澆水（不要每天澆）。早晨澆水最好，避開正中午太陽。把澆水跟「早餐後」「散步前」綁在一起最容易養成習慣。",
        tip: "薄荷例外：可以稍微多水一點。",
      },
      {
        order: 5,
        title: "觀察、紀錄、分享",
        description: "每週拍一張照記錄變化。香草長大可以剪下來送鄰居或好朋友，植物有了「分享」就更有意義。",
        tip: "黃金葛長太長還可以剪一段插水裡再生根，越分越多盆。",
      },
    ],
  },

  // ─── g. 繪製生命故事 ────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-life-story",
    title: "繪製生命故事",
    summary: "打開塵封多年的回憶，以色筆畫出自己的生命故事，記錄並傳承。約 20 分鐘。",
    cover_emoji: "📖",
    duration_min: 20,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "創意繪畫", "生命故事", "20分鐘"],
    video_url: "https://www.youtube.com/watch?v=WqLsqphwbZY",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=WqLsqphwbZY"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=WqLsqphwbZY"),
    source_org: "自製繪本步驟教學",
    steps: [
      {
        order: 1,
        title: "準備材料",
        description: "A4 白色粉彩紙、色鉛筆、蠟筆、一把尺。準備一個安靜舒適的環境，可放輕音樂。",
        tip: "粉彩紙質地厚實，色彩呈現比一般白紙更柔和。",
      },
      {
        order: 2,
        title: "回憶討論",
        description: "和好朋友討論並回想一件「美好的回憶」：可能是結婚那天、孩子出生、第一次出國、退休那天。給他 2～3 分鐘慢慢想。",
        tip: "不要急，沉默有時候是回憶在浮現。",
      },
      {
        order: 3,
        title: "深入問細節",
        description: "深入問故事細節：「那天天氣怎樣？」「你穿什麼衣服？」「現場有誰？」這些細節能引導畫成圖案。",
        tip: "細節越具體，畫起來越生動，記憶也會被喚回。",
      },
      {
        order: 4,
        title: "把回憶畫下來（看影片）",
        description: "用色鉛筆勾勒輪廓，再用蠟筆塗色。畫得不像沒關係。可加上文字說明日期、地點。影片示範了如何把故事變成自製繪本。",
        video_url: "https://www.youtube.com/watch?v=WqLsqphwbZY",
        tip: "「畫畫沒有對錯」要不斷強調，讓他放心。",
      },
      {
        order: 5,
        title: "說故事、串起家族記憶",
        description: "請好朋友從頭分享畫面上的故事，安靜聆聽。完成後拍照分享給其他家人，串起家族記憶。",
      },
    ],
  },

  // ─── h. 禪繞畫 ──────────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-zentangle",
    title: "禪繞畫",
    summary: "透過重複線條與圖案，幫助放下思緒和壓力，重新審視內心感覺。約 20 分鐘。",
    cover_emoji: "🖌️",
    duration_min: 20,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "創意繪畫", "紓壓", "正念", "20分鐘"],
    video_url: "https://www.youtube.com/watch?v=lPRdHv57cj0",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=lPRdHv57cj0"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=lPRdHv57cj0"),
    source_org: "禪繞畫教學",
    steps: [
      {
        order: 1,
        title: "準備材料",
        description: "禪繞畫專用紙磚（白紙也可）、0.1 代針筆、0.5 學習筆、2B 鉛筆。",
        tip: "細針筆畫起來最有禪繞畫的味道，文具店都有。",
      },
      {
        order: 2,
        title: "問內心感覺",
        description: "問問好朋友「現在內心是什麼感覺？」用形容詞回答，例如：平靜、煩躁、開心、空空的。",
        tip: "沒標準答案，把感覺說出來就是第一步療癒。",
      },
      {
        order: 3,
        title: "依感覺選線條（看影片）",
        description: "影片示範了基本禪繞畫圖樣：波浪、鋸齒、圓點、格子。可以討論「這種感覺會想到什麼線條？」例如平靜→波浪、煩躁→鋸齒。",
        video_url: "https://www.youtube.com/watch?v=lPRdHv57cj0",
        tip: "禪繞畫沒有錯，每一筆都是對的。",
      },
      {
        order: 4,
        title: "重複與填滿",
        description: "用同一種圖案不斷重複填滿一格，再換到下一格用不同圖案。重複的動作有冥想效果。",
        tip: "畫畫時不需講話，沉浸的安靜也是陪伴。",
      },
      {
        order: 5,
        title: "分享內心反映",
        description: "完成後分享自己的作品，說說「畫完現在的感覺有變嗎？」展示在家中提醒自己有過這份平靜。",
        tip: "這是最簡單的「正念」練習之一。",
      },
    ],
  },

  // ─── i. DIY 記憶拼圖 ────────────────────────────────────
  {
    group_slug: "create",
    slug: "interact-memory-puzzle",
    title: "DIY 記憶拼圖",
    summary: "把美好回憶的照片畫成拼圖，拼湊出當時人事物的場景。約 20 分鐘。",
    cover_emoji: "🧩",
    duration_min: 20,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "創意繪畫", "回憶", "20分鐘"],
    video_url: "https://www.youtube.com/watch?v=WwiECSZOoG8",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=WwiECSZOoG8"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=WwiECSZOoG8"),
    source_url: "https://drive.google.com/file/d/1koriUN3AcZgKkwLPs-Ix4yfmU9OrUsrU/view",
    source_org: "記憶拼圖教學",
    steps: [
      {
        order: 1,
        title: "準備材料",
        description: "美好回憶的照片一張、色鉛筆或蠟筆、厚紙板（牛奶盒、餅乾盒拆開都可以）、白膠、剪刀。",
        tip: "照片可以是孫兒、結婚、出遊、家人合照，越有故事越好。",
      },
      {
        order: 2,
        title: "找照片、聊故事",
        description: "請好朋友打開手機相簿或翻出實體相簿，挑一張最有感覺的。給他時間。「為什麼選這張？」就是最棒的開場話題。",
      },
      {
        order: 3,
        title: "畫出場景（看影片）",
        description: "把照片裡的人物、場景、事物用色筆畫到厚紙板上。可以照著畫，也可以加上自己的詮釋。影片有完整示範。",
        video_url: "https://www.youtube.com/watch?v=WwiECSZOoG8",
        tip: "不會畫？可下載空白拼圖紙照著畫（步驟 4 連結）。畫得不像沒關係，是「記憶版本」不是寫實畫。",
      },
      {
        order: 4,
        title: "可選：用空白拼圖紙當模板",
        description: "如果不想自己徒手畫切割線，可以下載空白拼圖紙，照著上面的虛線畫出拼圖塊形狀，最簡單也最方便。",
        tip: "空白拼圖紙下載：見本卡下方「資料來源」連結。",
      },
      {
        order: 5,
        title: "剪下、打散、拼回",
        description: "等白膠乾後，沿線剪成 6～9 塊不規則拼圖塊。塊數視長者手部靈活度調整，新手 6 塊就夠。打散後再拼回，挑戰一下記憶力！",
        tip: "下次見面可請好朋友再拼一次，是很好的記憶訓練。",
      },
    ],
  },

  // ─── j. 日常護膝運動（3+3 重點）─────────────────────────
  {
    group_slug: "move",
    slug: "interact-knee-care",
    title: "日常護膝運動 3+3",
    summary: "智慧護膝 3+3：保護膝關節、預防磨損、舒緩疼痛的 6 個日常動作。約 15 分鐘。",
    cover_emoji: "🦵",
    duration_min: 15,
    identity_tags: ["volunteer", "family", "elder"],
    tags: ["陪伴互動", "動動身體", "護膝", "上下樓梯", "15分鐘"],
    video_url: "https://www.youtube.com/watch?v=LxM90E28eqk",
    video_provider: "youtube",
    hero_image_url: ytPoster("https://www.youtube.com/watch?v=LxM90E28eqk"),
    cover_image_url: ytPoster("https://www.youtube.com/watch?v=LxM90E28eqk"),
    source_url: "https://www.youtube.com/watch?v=LxM90E28eqk",
    source_org: "智慧護膝 3+3 正確上下樓梯方式",
    steps: [
      {
        order: 1,
        title: "先看完整示範影片",
        description: "影片完整介紹了「3 個正確姿勢 + 3 個強化動作」，預防膝蓋磨損、舒緩疼痛。先看一次再開始練，會更清楚。",
        video_url: "https://www.youtube.com/watch?v=LxM90E28eqk",
        tip: "如果膝蓋有急性疼痛、紅腫，請先看醫生再運動。",
      },
      {
        order: 2,
        title: "正確 3 招：上下樓梯姿勢",
        description: "① 上樓梯：好腳先上、患側腳跟上，手扶扶手分擔重量。② 下樓梯：患側腳先下、好腳跟下（與上樓相反）。③ 不要鎖死膝蓋：上下時膝蓋微彎，不要打直承受全身重量。",
        tip: "口訣「好上壞下」 — 好腳上樓先、壞腳下樓先。",
      },
      {
        order: 3,
        title: "強化 3 招（一）：坐姿伸腿",
        description: "坐在椅子上，背挺直。右腳緩緩向前伸直、停 5 秒、放下。左右各 8 次。重點是慢慢來，感受大腿前側肌肉用力。",
        tip: "大腿前側肌肉強化是護膝關鍵。",
      },
      {
        order: 4,
        title: "強化 3 招（二）：側抬腿",
        description: "扶椅背站穩，右腳向右側抬起 30 度、停 3 秒、放下。左右各 10 次。鍛鍊膝蓋外側支撐力。",
        tip: "全程扶穩椅背，避免跌倒。",
      },
      {
        order: 5,
        title: "強化 3 招（三）：站姿微蹲",
        description: "扶椅背，雙腳與肩同寬，膝蓋微彎成 30 度（不超過腳尖）、停 3 秒、站起。10 次為一組。",
        tip: "膝蓋千萬不要超過腳尖，否則反而傷膝。",
      },
      {
        order: 6,
        title: "養成日常習慣",
        description: "問問好朋友「平常什麼時候在家可以做？」（看電視時、起床後、洗澡前都好）。把運動和日常作息綁在一起，最容易養成習慣。",
        tip: "三天打魚兩天曬網沒關係，能持續最重要。",
      },
    ],
  },

  // ─── 新增：資源回收我最行（你提供的草稿）─────────────────
  {
    group_slug: "life",
    slug: "interact-recycling-game",
    title: "資源回收我最行",
    summary: "用套圈圈遊戲帶長者建立資源回收知識，從簡易版（3 種分類）玩到進階版（5 種分類）。約 20 分鐘。",
    cover_emoji: "♻️",
    duration_min: 20,
    identity_tags: ["volunteer", "family"],
    tags: ["陪伴互動", "生活技能", "環保", "遊戲", "20分鐘"],
    source_url: "https://www.yzu.edu.tw/admin/eo/files/%E6%9C%80%E6%96%B0%E6%B6%88%E6%81%AF/%E5%9E%83%E5%9C%BE%E5%88%86%E9%A1%9E%E8%88%87%E8%B3%87%E6%BA%90%E5%9B%9E%E6%94%B6%E5%AE%A3%E5%B0%8E%E7%B0%A1%E4%BB%8B.pdf",
    source_org: "垃圾分類與資源回收宣導（元智大學版）",
    steps: [
      {
        order: 1,
        title: "事前準備",
        description: "套圈圈玩具 5 個（沒有可用塑膠手環、橡皮筋、紙圈代替）；紙條與筆。一起到家裡尋找 10 樣物品（如保特瓶、報紙、果皮、紙便當盒、玻璃罐等），擺在客廳空曠的地方。",
        tip: "找物品的過程本身就是和好朋友的互動。",
      },
      {
        order: 2,
        title: "簡易版：3 種分類",
        description: "三張紙條分別寫下「一般垃圾」「資源垃圾」「廚餘」。讓好朋友抽紙條，把套圈圈套到對應的物品上。每套對一個就和好朋友聊「為什麼這個是廚餘？」「家裡平時怎麼處理？」",
        tip: "不要急著糾正錯誤，先聽他原本的想法。",
      },
      {
        order: 3,
        title: "進階版：5 種分類",
        description: "改寫六張紙條：「塑膠類」「鐵鋁罐」「紙類」「紙容器」「玻璃類」「不可回收」。再玩一次套圈圈。「紙容器」（如紙便當、紙杯）和「紙類」（報紙、影印紙）是最容易搞混的。",
        tip: "提醒：紙容器內側有膜，要和一般紙類分開回收。",
      },
      {
        order: 4,
        title: "聊聊家中回收經驗",
        description: "和好朋友分享套到的項目：「以前有沒有遇過不知道怎麼分類的東西？」「社區資源回收的時間是什麼時候？」「附近的回收車路線？」",
        tip: "這些在地資訊長者其實都很懂，志工反而能向他學習。",
      },
      {
        order: 5,
        title: "進一步：最常分錯的 3 樣",
        description: "強調 3 樣最常分錯的：① 紙便當盒 → 紙容器（不是紙類）。② 鋁箔包 → 紙容器（不是鋁罐）。③ 破玻璃 → 一般垃圾，要包好（不能當資源垃圾，會割傷清潔員）。",
        tip: "這 3 樣記住，分類功力立刻升級。",
      },
    ],
  },
];

// ─── 執行 upsert ─────────────────────────────────────────
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

// ─── 刪除已被取代的舊卡 ────────────────────────────────
// 舊「interact-origami」綜合卡 → 改為 4 張獨立卡（heart/carnation/bear/bird）
const obsoleteSlugs = ["paper-folding", "interact-origami"];
for (const slug of obsoleteSlugs) {
  const { error: delErr } = await admin
    .from("activity_cards")
    .delete()
    .eq("slug", slug);
  if (delErr) {
    console.error(`✗ delete ${slug}:`, delErr.message);
  } else {
    console.log(`✓ deleted ${slug} (replaced)`);
  }
}

console.log(`\nDone. ${success}/${cards.length} cards upserted.`);
