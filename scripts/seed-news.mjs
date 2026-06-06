// One-time seed script — run with: node scripts/seed-news.mjs
const SUPABASE_URL = "https://iyrwxpcpgjqkqplkjiqe.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cnd4cGNwZ2pxa3FwbGtqaXFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI5NjgyOCwiZXhwIjoyMDkyODcyODI4fQ.kbk1boCJvymaAE-6fmt7vjuDWQmb9yY4CNB9FRnzVYs";

const articles = [
  {
    source_org: "照護線上",
    source_url: "https://www.careonline.com.tw/2025/10/atrial-fibrillation-251030.html",
    title: "心房顫動恐致中風、心衰竭，外科治療方式醫師解析",
    image_url: "https://www.careonline.com.tw/wp-content/uploads/2025/10/Background-cover.jpg",
    tags: ["心臟", "健康"],
    published_at: "2025-10-30T00:00:00+08:00",
    summary_md: `- **心房顫動**是最常見的心律不整，症狀包括呼吸急促、胸悶、心悸、全身無力
- 兩大嚴重併發症：**心臟衰竭**（心跳過快使心臟無效收縮）與**缺血性中風**（心房血栓打出造成）
- 大多數患者以藥物治療為主，包括心律控制與抗凝血劑，也可選擇導管或外科手術治療
- **心房顫動患者有九成的血栓來自左心耳**，手術時同步閉合左心耳可顯著降低中風風險
- 新型微創胸腔鏡左心耳閉合術不需開胸、心臟無需停止，恢復期短、風險低
- 老年人若心房顫動已超過20年、抗凝血劑副作用過多，可考慮手術關閉左心耳取代長期服藥`,
  },
  {
    source_org: "照護線上",
    source_url: "https://www.careonline.com.tw/2025/02/low-salt-lower-bp-250217.html",
    title: "低鈉飲食真的有效？研究揭示：七天內見效，快速降血壓！",
    image_url: "https://www.careonline.com.tw/wp-content/uploads/2025/02/low-salt-lower-BP-1.jpg",
    tags: ["飲食", "健康"],
    published_at: "2025-02-19T00:00:00+08:00",
    summary_md: `- 美國醫學雜誌（JAMA）研究顯示：**只要一週低鹽飲食，75% 的人血壓就能下降**，收縮壓平均降約 8 毫米汞柱
- 不論有無高血壓、有無服藥，減少鹽分攝取都能有效控制血壓
- 台灣人每日鈉攝取量約 3500–4000 毫克，**是世衛建議上限（2000 毫克）的近兩倍**
- 一碗拉麵鈉含量約 5000 毫克，超過每日建議量的兩倍，外食要格外注意
- 實用降鈉方法：**多選新鮮食材、用薑蒜檸檬增味取代鹽、養成看食品標籤習慣、減少外食**
- 改變口味習慣是長期關鍵，飲食調整與藥物治療同等重要`,
  },
  {
    source_org: "照護線上",
    source_url: "https://www.careonline.com.tw/2025/02/compression-fracture-250124.html",
    title: "嚴重背痛不能忍！面對脊椎壓迫性骨折的四大面向",
    image_url: "https://www.careonline.com.tw/wp-content/uploads/2025/01/compression-fracture-1.jpg",
    tags: ["健康", "安全"],
    published_at: "2025-02-10T00:00:00+08:00",
    summary_md: `- **脊椎壓迫性骨折最常見原因是骨質疏鬆**，停經後女性風險最高；日常彎腰、咳嗽都可能造成骨折
- 骨質疏鬆導致的骨折不一定劇烈疼痛，長期累積會讓人**逐漸變矮、駝背**，需提早警覺
- 治療重點是控制疼痛、穩定脊椎、預防再骨折，**真正需要手術的患者是少數**
- 急性期後應盡早恢復活動，長期臥床反而不利復原；**核心肌力與步態訓練**非常重要
- 預防再次骨折：改善居家採光、清除地面障礙物、積極治療骨質疏鬆、強化肌力以防跌倒
- 若疼痛頑固或椎體高度塌陷超過一半，可考慮「骨水泥椎體成型術」補強脊椎強度`,
  },
  {
    source_org: "照護線上",
    source_url: "https://www.careonline.com.tw/2023/12/stroke-2.html",
    title: "小中風是中風前兆！即使症狀消失，也必須積極治療",
    image_url: "https://www.careonline.com.tw/wp-content/uploads/2024/stroke201.jpg",
    tags: ["健康", "安全"],
    published_at: "2023-12-27T00:00:00+08:00",
    summary_md: `- **「小中風」（短暫性腦缺血）**會出現單側肢體無力、口齒不清等症狀，24小時內消失，但絕不能輕忽
- 小中風後**48小時內**發生中風的風險最高，1週內復發機率高達 10%，須立即就醫
- 牢記「**FAST口訣**」：F 臉部不對稱、A 手臂無力、S 說話含糊、T 把握時間立即送醫
- 危險因子包括高血壓、糖尿病、心房顫動、抽菸，**日常需積極控制**
- 發生後需使用雙重抗血小板藥物治療至少 21 天，**即使症狀已消失也不可自行停藥**
- 長期預防：少油少鹽飲食、維持理想體重、規律運動、戒菸、避免過度飲酒`,
  },
  {
    source_org: "照護線上",
    source_url: "https://www.careonline.com.tw/2025/11/heart-failure-251127.html",
    title: "搶救急性心臟衰竭！葉克膜與心室輔助器，醫師解說關鍵救治",
    image_url: "https://www.careonline.com.tw/wp-content/uploads/2025/11/Background-cover-2.jpg",
    tags: ["心臟", "健康"],
    published_at: "2025-11-27T00:00:00+08:00",
    summary_md: `- 急性心臟衰竭常見原因：**急性心肌梗塞後心因性休克**、慢性心衰竭急性惡化、猛爆性心肌炎
- **「葉克膜」**是體外膜氧合機器，可暫時替代心肺功能，為病人爭取治療時間
- 葉克膜優點：可快速置放、甚至可在床邊緊急執行；缺點：使用時間有限（數天至數週）
- 葉克膜可能的副作用：出血（腦出血、傷口出血）和下肢缺血，需密切監控
- 若心臟功能無法恢復，可改用**「心室輔助器」**，提供更長時間支持，作為過渡到心臟移植的橋樑
- 急性心臟衰竭能否存活，關鍵在於原始病因是否被有效治療，葉克膜只是爭取時間的工具`,
  },
];

async function insertArticle(article) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/daily_news`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...article,
      status: "active",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (err.includes("duplicate") || err.includes("unique")) {
      console.log(`⏭  跳過（已存在）：${article.title}`);
    } else {
      console.error(`✗  失敗：${article.title}\n   ${err}`);
    }
    return;
  }

  const data = await res.json();
  console.log(`✓  已寫入：${article.title} (id: ${data[0]?.id})`);
}

console.log("開始匯入新聞...\n");
for (const article of articles) {
  await insertArticle(article);
}
console.log("\n完成！");
