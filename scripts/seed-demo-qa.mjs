import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const USER = "498291d5-e2cb-40e0-bb1a-a0b39daacea0"; // itchiang2025 (admin)
const R = {
  taoyuan: "9dbec14f-a1a8-4484-b385-5f8bc0940bba",
  zhongli: "d4ad89d6-a29d-466d-9c8a-183e2777ee34",
  pingzhen: "d19ad034-df3e-4f12-b36d-a880cdde3cf3",
};

const QUESTIONS = [
  {
    title: "中壢哪裡可以免費量血壓？",
    body: "想固定幫家裡長輩量血壓，但每次都要跑診所。請問中壢區有沒有免費、走路就能到的量血壓站點？",
    region_id: R.zhongli, status: "resolved", tags: ["量血壓", "醫療"],
    answers: [
      { body: "中壢仁海宮旁邊的衛生所、還有好幾間社區藥局都有免費量血壓，藥局通常營業時間都可以直接進去量，不用預約。", accepted: true },
      { body: "另外像屈臣氏、康是美這種連鎖藥妝店也常設有量血壓機，可以順便買東西時量一下。" },
      { body: "如果長輩行動不便，可以打 1966 長照專線問問看居家服務，有些方案護理師到府也會幫忙量。" },
    ],
  },
  {
    title: "請問復康巴士要怎麼預約？需要提前幾天？",
    body: "爸爸坐輪椅，要帶他去醫院復健，聽說有復康巴士可以坐。請問桃園的復康巴士怎麼申請、要提前多久預約？",
    region_id: R.taoyuan, status: "resolved", tags: ["復康巴士", "交通"],
    answers: [
      { body: "桃園市復康巴士要先申請「身心障礙者乘車資格」，核可後再用電話或網路訂車。建議至少提前 3 個工作天預約，熱門時段（早上看診）更要提早。", accepted: true },
      { body: "補充一下，第一次申請需要身心障礙證明，可以請里長或區公所社會課協助辦理，流程會順很多。" },
      { body: "如果臨時叫不到車，也可以問問看「愛心計程車」，一樣有補助、彈性比較大。" },
    ],
  },
  {
    title: "長輩想學用 LINE 視訊，附近有教學的地方嗎？",
    body: "媽媽想跟在國外的孫子視訊，但不太會用 LINE。中壢附近有沒有免費教長輩用手機的課程或據點？",
    region_id: R.zhongli, status: "open", tags: ["智慧生活", "LINE"],
    answers: [
      { body: "很多社區照顧關懷據點、樂齡學習中心都有開「手機教學」課，可以打去區公所問最近的據點。我們站上「互動學習」也有一張 LINE 視訊的圖卡，一步一步教，可以先在家練習。" },
    ],
  },
  {
    title: "低收入戶的假牙補助怎麼申請？",
    body: "外婆是低收入戶，牙齒掉了好幾顆，吃東西很辛苦。聽說做假牙有補助，請問要怎麼申請、補助多少？",
    region_id: R.taoyuan, status: "resolved", tags: ["補助", "假牙"],
    answers: [
      { body: "桃園市有「長者假牙補助」，65 歲以上、設籍滿一定時間就可申請，低收入戶補助金額更高（全口最高補助數萬元）。要先到健保特約牙醫評估，再帶診斷證明到區公所社會課申請。", accepted: true },
      { body: "記得備齊：身分證、低收入戶證明、牙醫評估表。承辦人員都會協助，不用擔心流程複雜。" },
    ],
  },
  {
    title: "失智長輩容易走失，有什麼預防的工具或服務？",
    body: "爺爺有輕度失智，有幾次自己出門找不到路回家。請問有沒有防走失的工具、或是走失了能快速協尋的服務？",
    region_id: R.pingzhen, status: "open", tags: ["失智", "安全"],
    answers: [
      { body: "可以申請「愛心手鍊」（失智症協會或各縣市衛生局），手鍊上有編號，警察或路人撿到能馬上查到家屬聯絡方式。另外也有 GPS 定位鞋墊、定位器可以放在長輩身上。" },
    ],
  },
];

async function main() {
  const { count } = await s.from("questions").select("id", { count: "exact", head: true });
  if (count && count > 0) {
    console.log(`⚠️  questions 已有 ${count} 筆，為避免重複，略過 seed。`);
    return;
  }

  for (const q of QUESTIONS) {
    const { data: qRow, error: qErr } = await s.from("questions").insert({
      user_id: USER, region_id: q.region_id, title: q.title, body: q.body,
      tags: q.tags, status: q.status, // answer_count 由 trg_bump_answer_count 觸發器自動維護
    }).select("id").single();
    if (qErr) { console.error("❌ question:", q.title, qErr.message); continue; }

    let acceptedId = null;
    for (const a of q.answers) {
      const { data: aRow, error: aErr } = await s.from("answers").insert({
        question_id: qRow.id, user_id: USER, body: a.body,
        is_accepted: !!a.accepted, vote_count: a.accepted ? 3 : 1,
      }).select("id").single();
      if (aErr) { console.error("  ❌ answer:", aErr.message); continue; }
      if (a.accepted) acceptedId = aRow.id;
    }
    if (acceptedId) {
      await s.from("questions").update({ accepted_answer_id: acceptedId }).eq("id", qRow.id);
    }
    console.log(`✅ ${q.title}（${q.answers.length} 則回答${acceptedId ? "，已採納" : ""}）`);
  }
  console.log("\n完成。");
}

main().catch(console.error);
