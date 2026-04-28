import { categories } from "@/config/categories";

type IntentResult = {
  categories: string[];
  subcategories: string[];
  keywords: string[];
  reasoning: string;
};

const CATEGORY_HINTS: Record<string, string[]> = {
  health: [
    "腳痛", "頭痛", "胸痛", "肚子痛", "生病", "看醫生", "診所", "醫院", "醫療",
    "復健", "輔具", "輪椅", "拐杖", "助行器", "助聽", "假牙", "眼鏡",
    "防跌", "跌倒", "失智", "失能", "長照", "1966", "日照",
    "藥", "用藥", "藥物", "急救", "暈倒", "中風", "高血壓", "糖尿病",
    "疫苗", "流感", "施打", "健檢", "健康檢查", "衛教",
  ],
  transport: [
    "交通", "接送", "車", "公車", "計程車", "客運", "敬老卡", "悠遊卡",
    "復康巴士", "幸福小黃", "噗噗", "共乘", "監理", "駕照",
    "行車", "走路", "出門",
  ],
  housing: [
    "家裡", "住", "扶手", "防跌", "浴室", "廁所", "馬桶", "水電", "修繕",
    "獨居", "警報", "居服員", "看護", "看顧",
    "地震", "火災", "消防", "用電", "都更", "都市更新", "社會住宅", "包租", "崔媽媽",
  ],
  finance: [
    "錢", "補助", "津貼", "年金", "重陽禮金", "詐騙", "繼承", "遺囑",
    "財產", "信託", "理財", "投資", "退休金",
  ],
  social: [
    "孤單", "難過", "憂鬱", "心情", "心理", "諮詢", "專線",
    "送餐", "共餐", "長青", "據點",
    "家暴", "受虐", "法律", "法扶", "律師",
    "福利", "社福",
  ],
  leisure: [
    "活動", "運動", "出遊", "旅遊", "志工", "社區", "據點", "共餐",
    "聊天", "打發時間", "休閒",
  ],
  education: [
    "學", "課程", "上課", "樂齡", "社區大學", "二次就業", "工作",
    "手機", "電腦", "3C", "line", "通訊軟體", "視訊",
  ],
};

const SUBCATEGORY_HINTS: Record<string, string[]> = {
  "fall-prevention": ["防跌", "扶手", "跌倒"],
  "nearby-clinic": ["診所", "醫院", "看醫生", "腳痛", "頭痛"],
  "first-aid": ["急救", "暈倒", "中風", "胸痛"],
  "ltc-1966": ["長照", "1966", "失能"],
  "day-care": ["日照", "失智照顧"],
  "meal-delivery": ["送餐", "吃飯"],
  "anti-fraud": ["詐騙"],
  "mental-hotline": ["心理", "難過", "憂鬱", "孤單"],
  "fall-prevention-tip": ["防跌", "跌倒"],
};

export function keywordIntent(query: string): IntentResult {
  const q = query.toLowerCase();
  const categoryScores: Record<string, number> = {};
  for (const [slug, hints] of Object.entries(CATEGORY_HINTS)) {
    for (const h of hints) {
      if (q.includes(h.toLowerCase())) {
        categoryScores[slug] = (categoryScores[slug] ?? 0) + h.length;
      }
    }
  }
  const subcategorySlugs: string[] = [];
  for (const [slug, hints] of Object.entries(SUBCATEGORY_HINTS)) {
    if (hints.some((h) => q.includes(h.toLowerCase()))) {
      subcategorySlugs.push(slug);
    }
  }
  const categorySlugs = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);

  const validCategorySlugs = categorySlugs.filter((s) =>
    categories.some((c) => c.slug === s),
  );

  const keywords = Array.from(
    new Set(
      Object.values(CATEGORY_HINTS)
        .flat()
        .filter((h) => q.includes(h.toLowerCase())),
    ),
  ).slice(0, 6);

  return {
    categories: validCategorySlugs.slice(0, 3),
    subcategories: subcategorySlugs.slice(0, 5),
    keywords: keywords.length > 0 ? keywords : [query.trim()],
    reasoning: validCategorySlugs.length > 0
      ? `根據「${keywords.join("、") || query}」匹配到分類`
      : "未匹配到特定分類，將以全文搜尋呈現結果",
  };
}
