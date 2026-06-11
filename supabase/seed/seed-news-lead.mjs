// 一次性 seed：為每篇新知補上「導言（內文說明）」，接在重點整理條列前。
// 以標題關鍵字對應設計稿 data-news.jsx 的 lead。可重複執行（idempotent）。
// 執行：node supabase/seed/seed-news-lead.mjs
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

// 標題關鍵字 → 導言（取自設計稿 data-news.jsx；牙齦萎縮為自撰）
const LEADS = [
  ["頻繁小睡", "《美國醫學會雜誌》研究顯示：每增加 1 小時小睡，死亡風險上升 13%；早上就開始小睡者風險更高。長輩白天頻繁打瞌睡，不一定只是「年紀大」，背後可能藏著健康警訊。"],
  ["吞藥丸", "台灣 65 歲以上長者每 10 人就有 1 人面臨咀嚼吞嚥障礙，喉嚨肌肉其實從 30 歲起就開始老化。吞東西卡卡、容易嗆到，是值得提早保養的警訊。"],
  ["阿茲海默", "研究發現，60 至 80 歲長者若改變生活方式，短短數週內海馬迴體積就能增加 1 至 3%，大腦不是只能走下坡。掌握幾個關鍵，就能為記憶力打底。"],
  ["飯後飽睏", "血糖失控往往在確診糖尿病前 10 年就已悄悄開始，身體早有警訊卻常被忽略。飯後特別想睡，可能就是其中一個訊號。"],
  ["固執", "日本精神科醫師指出，思維固執的人大腦老化更快，凡事非對即錯的態度會加速認知退化。保持心靈彈性，比單純養生更重要。"],
  ["金馬號", "70 歲的丁惠華從金馬號車掌小姐到葉藝教師，累計開課 240 場、學員近 2000 人，證明第二人生不必從零開始。"],
  ["牙齦萎縮", "牙齦萎縮會讓牙根外露、牙縫變大，笑起來顯老，也容易蛀牙與牙齒敏感。了解原因、及早保養，就能延緩惡化。"],
  ["葉克膜", "急性心臟衰竭常見原因包括急性心肌梗塞後心因性休克、慢性心衰竭急性惡化、猛爆性心肌炎，是與時間賽跑的急重症。"],
  ["心房顫動", "心房顫動是最常見的心律不整，症狀包括呼吸急促、胸悶、心悸、全身無力，兩大嚴重併發症是心臟衰竭與缺血性中風。"],
  ["低鈉飲食", "美國醫學雜誌（JAMA）研究顯示：只要一週低鹽飲食，75% 的人血壓就能下降，收縮壓平均降約 8 毫米汞柱，效果比想像中快。"],
  ["脊椎壓迫", "脊椎壓迫性骨折最常見原因是骨質疏鬆，停經後女性風險最高；日常彎腰、甚至咳嗽都可能造成骨折，背痛別硬忍。"],
  ["小中風", "「小中風」（短暫性腦缺血）會出現單側肢體無力、口齒不清等症狀，雖然常在 24 小時內消失，但絕不能輕忽，它是中風的前兆。"],
];

function leadFor(title) {
  for (const [kw, lead] of LEADS) if (title.includes(kw)) return lead;
  return null;
}

async function run() {
  const { data } = await supabase
    .from("daily_news").select("id, title, summary_md").eq("status", "active");
  for (const row of data) {
    const lead = leadFor(row.title);
    if (!lead) { console.log("skip(no lead):", row.title.slice(0, 16)); continue; }
    // 保留原本的條列，重建 = 導言 + 空行 + 條列
    const bullets = (row.summary_md || "")
      .split("\n").map((l) => l.trim()).filter((l) => /^[-*]\s/.test(l));
    const newMd = `${lead}\n\n${bullets.join("\n")}`;
    const { error } = await supabase
      .from("daily_news").update({ summary_md: newMd }).eq("id", row.id);
    console.log(error ? `ERR ${row.title.slice(0, 12)}: ${error.message}` : `ok  ${row.title.slice(0, 16)}`);
  }
  process.exit(0);
}
run();
