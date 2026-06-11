// 一次性 seed：補足溝通錦囊內容 + 對齊設計稿情境標籤
// 執行：node supabase/seed/seed-comm.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../../.env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// 既有 6 則：把設計稿的「情境標籤」放到 tags[0]（給清單篩選用）
const TAG_FIX = {
  "persuade-doctor": ["困難溝通", "就醫", "勸導"],
  "anti-fraud-talk": ["防詐溝通", "防詐", "金融安全"],
  "emotional-empathy": ["情感支持", "家屬", "同理心"],
  "beyond-did-you-eat": ["日常關心", "家屬", "溝通"],
  "first-knock": ["志工探訪", "探訪", "第一印象"],
  "break-ice": ["志工破冰", "聊天", "破冰"],
};

// 新增 2 則：照顧者主題
const NEW_SCRIPTS = [
  {
    audience: "family",
    slug: "self-burnout",
    title: "照顧到快撐不住，怎麼跟自己說",
    context:
      "長期照顧家人的您，常把所有責任扛在身上，累到喘不過氣，又因為「想休息」而自責。這些話是說給辛苦的自己聽的。",
    ok_examples: [
      { role: "對自己說", text: "我已經做得很多了，會累是正常的，不是我不夠好。" },
      { role: "對自己說", text: "我先把自己照顧好，才有力氣照顧他。喘息一下不是偷懶。" },
      { role: "對自己說", text: "我可以打 0800-507-272 照顧者專線，找人聊聊、問問喘息服務。" },
    ],
    ng_examples: [
      { role: "別這樣想", text: "我是他的家人，再累也應該自己撐。", reason: "把責任全扛在身上，容易燃燒殆盡，對被照顧者也不好。" },
      { role: "別這樣想", text: "我請別人幫忙，是我不孝、沒用。", reason: "把求助當成失敗，會讓你錯過喘息服務等正當資源。" },
    ],
    tips: [
      "允許自己有情緒，累、煩、想哭都正常",
      "求助與喘息是正當權利，不是不孝",
      "把照顧者喘息專線 0800-507-272 存進手機",
      "每天留 10 分鐘做一件純粹讓自己開心的小事",
    ],
    tags: ["照顧者自我對話", "照顧者", "喘息"],
  },
  {
    audience: "family",
    slug: "caregiver-family",
    title: "手足不幫忙照顧，怎麼開口",
    context:
      "照顧父母常落在一個人身上，其他手足卻像局外人。憋著怨氣或情緒爆發都傷感情，這裡是把話說開的方式。",
    ok_examples: [
      { role: "你可以說", text: "媽最近狀況比較多，我一個人有點吃力，想跟大家商量一下分工。" },
      { role: "你可以說", text: "你平日忙，那週末能不能固定回來一天，讓我也喘口氣？或是分擔一些醫藥費也好。" },
    ],
    ng_examples: [
      { role: "別這樣說", text: "都是我在顧，你們都不管！", reason: "指責性語氣會讓對方防禦、反駁，問題沒解決還傷感情。" },
      { role: "別這樣說", text: "算了，反正講了也沒用。", reason: "壓抑只會累積怨氣，最後一次爆發更難收拾。" },
    ],
    tips: [
      "用「我需要幫忙」代替「你都不幫忙」",
      "把任務拆成具體小事（出錢、出力、跑一趟）",
      "開家庭會議，讓每個人認領能做的部分",
      "接受別人的方式不一定跟你一樣，重點是有參與",
    ],
    tags: ["照顧者溝通", "照顧者", "手足分工"],
  },
];

async function run() {
  for (const [slug, tags] of Object.entries(TAG_FIX)) {
    const { error } = await supabase
      .from("communication_scripts")
      .update({ tags })
      .eq("slug", slug);
    console.log(`tag ${slug}:`, error ? error.message : "ok");
  }
  for (const s of NEW_SCRIPTS) {
    const { error } = await supabase
      .from("communication_scripts")
      .upsert({ ...s, status: "active" }, { onConflict: "slug" });
    console.log(`new ${s.slug}:`, error ? error.message : "ok");
  }
  const { count } = await supabase
    .from("communication_scripts")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  console.log("total active:", count);
}

run().then(() => process.exit(0));
