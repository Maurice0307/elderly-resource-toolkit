// 為缺少封面圖／影片的互動圖卡補上真實 YouTube 教學影片（官方/教學頻道，經 web 搜尋驗證）。
// 設 cover_image_url（縮圖）+ video_url（封面可播放）+ 在核心步驟嵌入影片。
// 執行：node supabase/seed/seed-activity-media.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../../.env.local"), "utf8")
    .split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// slug → YouTube 影片 ID（主題對應，官方/教學影片）
const VIDEO = {
  "interact-cpr": "CKqW5FScAD8",            // 民眾版 CPR+AED 教學
  "interact-aed": "CKqW5FScAD8",            // 同上（含 AED 操作）
  "interact-heimlich": "PGfqy2ndrqc",       // 新北市消防局 哈姆立克
  "interact-fire-safety": "QO5MqwBg31I",    // 新竹市消防局 滅火器使用教學
  "interact-fire-escape": "clE9j_XDnso",    // 火災避難逃生要領
  "interact-earthquake": "2kTHWn6zLMc",     // 地震保命三步驟 趴下掩護穩住
  "interact-earthquake-prep": "2kTHWn6zLMc",
  "interact-fraud-impersonation": "_rW1yR9uZfY", // 165 反詐騙宣導
  "interact-fraud-rumor": "_rW1yR9uZfY",
  "chair-exercise": "blJpXCU3wg4",          // 15 分鐘長者椅上操
  "morning-stretch": "_w50TfdCmKU",         // 高齡者健康操
  "fall-prevention": "NNbgmCysiv0",         // 長者防跌肌力 平衡訓練
  "my-plate": "z7oFn3d9NG4",                // 我的餐盤 銀髮篇
  "interact-recycling-game": "pqprKjRvLDA", // 垃圾分類與資源回收
  "balcony-garden": "bhqv3I8tUig",          // 陽台種菜（種菜箱）
  "line-video-call": "tGXNeFm8Bd0",         // LINE 視訊/會議室 手機版教學
};

const watch = (id) => `https://www.youtube.com/watch?v=${id}`;
const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

async function run() {
  const slugs = Object.keys(VIDEO);
  const { data } = await supabase
    .from("activity_cards").select("slug, steps").in("slug", slugs);
  const stepsBySlug = Object.fromEntries((data ?? []).map((c) => [c.slug, c.steps || []]));

  for (const slug of slugs) {
    const id = VIDEO[slug];
    const steps = stepsBySlug[slug] ?? [];
    // 在核心步驟（中段）嵌入影片，其餘步驟靠卡片封面縮圖呈現
    let newSteps = steps;
    if (steps.length > 0) {
      const idx = Math.floor(steps.length / 2);
      newSteps = steps.map((s, i) => (i === idx ? { ...s, video_url: watch(id) } : s));
    }
    const { error } = await supabase
      .from("activity_cards")
      .update({ video_url: watch(id), cover_image_url: thumb(id), steps: newSteps })
      .eq("slug", slug);
    console.log(error ? `ERR ${slug}: ${error.message}` : `ok  ${slug} → ${id}`);
  }
  process.exit(0);
}
run();
