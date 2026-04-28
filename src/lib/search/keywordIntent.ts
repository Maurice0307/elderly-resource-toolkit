import { categories } from "@/config/categories";

type IntentResult = {
  categories: string[];
  subcategories: string[];
  keywords: string[];
  reasoning: string;
};

const CATEGORY_HINTS: Record<string, string[]> = {
  health: [
    "腳痛", "頭痛", "胸痛", "肚子痛", "背痛", "腰痛", "牙痛", "受傷", "扭到",
    "生病", "不舒服", "身體不適", "不適", "病", "感冒", "發燒", "咳嗽",
    "看醫生", "看病", "回診", "就醫", "診所", "醫院", "醫療", "醫學中心",
    "復健", "輔具", "輪椅", "拐杖", "助行器", "助聽", "假牙", "眼鏡", "老花",
    "防跌", "跌倒", "失智", "失能", "長照", "1966", "日照", "日間照顧",
    "藥", "用藥", "藥物", "急救", "暈倒", "中風", "高血壓", "糖尿病", "心臟",
    "疫苗", "流感", "施打", "健檢", "健康檢查", "衛教", "預立醫療",
  ],
  transport: [
    "交通", "接送", "載", "公車", "計程車", "客運", "敬老卡", "悠遊卡",
    "復康巴士", "幸福小黃", "噗噗", "共乘", "監理", "駕照",
    "行車", "走路", "出門", "去不了", "搭不了", "搭車",
    "行動不便", "不便行動", "走不動", "無法走", "沒辦法走", "腿不方便",
    "輪椅", "需要接送", "沒人載", "沒車", "出門困難", "無障礙",
  ],
  housing: [
    "家裡", "在家", "住", "扶手", "浴室", "廁所", "馬桶", "水電", "修繕",
    "獨居", "一個人住", "警報", "居服員", "看護", "看顧", "家事",
    "地震", "火災", "消防", "用電", "都更", "都市更新", "社會住宅", "包租", "崔媽媽",
    "防跌施工",
  ],
  finance: [
    "錢", "沒錢", "缺錢", "補助", "津貼", "年金", "重陽禮金", "詐騙",
    "繼承", "遺囑", "財產", "信託", "理財", "投資", "退休金", "經濟",
    "申請補助",
  ],
  social: [
    "孤單", "寂寞", "難過", "憂鬱", "心情不好", "心情", "心理", "諮詢", "專線",
    "送餐", "共餐", "長青", "據點", "陪伴", "找人聊天", "沒人陪",
    "家暴", "受虐", "被打", "法律", "法扶", "律師",
    "福利", "社福",
  ],
  leisure: [
    "活動", "運動", "出遊", "旅遊", "志工", "社區活動",
    "聊天", "打發時間", "休閒", "無聊", "銀髮旅遊",
  ],
  education: [
    "學", "課程", "上課", "樂齡", "社區大學", "二次就業", "找工作",
    "手機", "電腦", "3C", "line", "通訊軟體", "視訊", "教學",
  ],
};

const SUBCATEGORY_HINTS: Record<string, string[]> = {
  "fall-prevention": ["防跌", "扶手", "跌倒"],
  "nearby-clinic": ["診所", "醫院", "看醫生", "看病", "腳痛", "頭痛", "回診"],
  "first-aid": ["急救", "暈倒", "中風", "胸痛", "倒地"],
  "ltc-1966": ["長照", "1966", "失能", "失智照顧"],
  "day-care": ["日照", "日間照顧"],
  "meal-delivery": ["送餐", "吃飯", "三餐"],
  "anti-fraud": ["詐騙", "受騙"],
  "mental-hotline": ["心理", "難過", "憂鬱", "孤單", "心情不好"],
  "rehab-bus": ["復康巴士", "行動不便", "輪椅"],
  "rehab-bus-booking": ["復康巴士", "預約", "輪椅"],
  "accessible-taxi": ["無障礙", "計程車", "輪椅", "行動不便"],
  "ltc-transport": ["長照", "接送", "復健", "回診"],
  "happy-bus": ["幸福小黃", "幸福巴士", "偏鄉"],
  "elder-card": ["敬老卡", "悠遊卡"],
  "assistive-device": ["輔具", "輪椅", "拐杖", "助行器"],
  "home-care-worker": ["居服員", "居家服務", "看護"],
  "solo-elder-alarm": ["獨居", "警報", "緊急"],
  "domestic-violence": ["家暴", "受虐", "被打"],
};

/**
 * Compound rules: when query mentions BOTH a "trigger" group AND a "context" group,
 * force-include extra categories. Captures situations like:
 *   "想去醫院但行動不便" → health (醫院) + transport (行動不便)
 */
const COMPOUND_RULES: Array<{
  trigger: string[];
  context: string[];
  add: string[];
  reason: string;
}> = [
  {
    trigger: ["醫院", "看醫生", "看病", "診所", "回診", "復健", "就醫"],
    context: ["行動不便", "走不動", "沒辦法走", "輪椅", "腿不方便", "沒人載", "沒車", "搭不了車", "出門困難"],
    add: ["health", "transport"],
    reason: "看病同時行動不便 → 同時提供醫療資訊與交通接送",
  },
  {
    trigger: ["腳痛", "膝蓋", "走路痛", "跌倒"],
    context: ["家", "家裡", "在家", "浴室", "廁所"],
    add: ["health", "housing"],
    reason: "在家容易跌倒 → 同時提供醫療與防跌施工",
  },
  {
    trigger: ["獨居", "一個人住", "沒人陪"],
    context: ["不舒服", "生病", "跌倒", "緊急"],
    add: ["health", "housing", "social"],
    reason: "獨居 + 健康風險 → 同時提供醫療、獨居警報、心理諮詢",
  },
  {
    trigger: ["失智", "失能", "中風", "長照"],
    context: [],
    add: ["health", "transport", "social"],
    reason: "失智失能照顧通常需多元資源",
  },
  {
    trigger: ["送餐", "吃飯"],
    context: ["獨居", "一個人", "沒胃口"],
    add: ["social", "health"],
    reason: "送餐＋獨居 → 同時提供共餐據點與心理支持",
  },
  {
    trigger: ["詐騙", "被騙", "受騙"],
    context: [],
    add: ["finance", "social"],
    reason: "詐騙 → 提供防詐資訊與法律諮詢",
  },
  {
    trigger: ["憂鬱", "難過", "心情不好", "孤單", "寂寞"],
    context: [],
    add: ["social", "leisure"],
    reason: "心情低落 → 同時提供心理諮詢與社區活動",
  },
];

const NEGATIONS = ["不要", "別", "不需要", "沒興趣"];

export function keywordIntent(query: string): IntentResult {
  const q = query.toLowerCase();

  // Score categories
  const categoryScores: Record<string, number> = {};
  const matchedKeywords = new Set<string>();
  for (const [slug, hints] of Object.entries(CATEGORY_HINTS)) {
    for (const h of hints) {
      const hl = h.toLowerCase();
      if (q.includes(hl)) {
        // skip if appears right after a negation (rough check)
        const idx = q.indexOf(hl);
        const prefix = q.slice(Math.max(0, idx - 4), idx);
        if (NEGATIONS.some((n) => prefix.includes(n))) continue;
        categoryScores[slug] = (categoryScores[slug] ?? 0) + h.length;
        matchedKeywords.add(h);
      }
    }
  }

  // Apply compound rules
  const compoundReasons: string[] = [];
  for (const rule of COMPOUND_RULES) {
    const triggerHit = rule.trigger.some((t) => q.includes(t.toLowerCase()));
    if (!triggerHit) continue;
    const contextHit =
      rule.context.length === 0 ||
      rule.context.some((c) => q.includes(c.toLowerCase()));
    if (!contextHit) continue;
    for (const slug of rule.add) {
      categoryScores[slug] = (categoryScores[slug] ?? 0) + 10;
    }
    compoundReasons.push(rule.reason);
  }

  // Subcategories
  const subcategorySlugs: string[] = [];
  for (const [slug, hints] of Object.entries(SUBCATEGORY_HINTS)) {
    if (hints.some((h) => q.includes(h.toLowerCase()))) {
      subcategorySlugs.push(slug);
    }
  }

  const orderedCats = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s)
    .filter((s) => categories.some((c) => c.slug === s));

  const keywords = Array.from(matchedKeywords).slice(0, 8);
  const finalKeywords = keywords.length > 0 ? keywords : [query.trim()];

  // Reasoning
  let reasoning: string;
  if (orderedCats.length === 0) {
    reasoning = "未匹配到特定分類，將以全文搜尋呈現結果";
  } else if (compoundReasons.length > 0) {
    reasoning = compoundReasons.join("；");
  } else {
    const catNames = orderedCats
      .slice(0, 3)
      .map((s) => categories.find((c) => c.slug === s)?.name ?? s)
      .join("、");
    reasoning = `根據「${keywords.slice(0, 3).join("、") || query}」匹配到：${catNames}`;
  }

  return {
    categories: orderedCats.slice(0, 4),
    subcategories: subcategorySlugs.slice(0, 6),
    keywords: finalKeywords,
    reasoning,
  };
}
