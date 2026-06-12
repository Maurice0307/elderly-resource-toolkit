import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";

/* 今日新知自動爬蟲：來源清單 + 文章發掘 + 單篇抓取改寫寫入 */

export const NEWS_SOURCES = [
  { org: "康健雜誌",       listing: "https://www.commonhealth.com.tw/" },
  { org: "Uho 悠活健康",    listing: "https://www.uho.com.tw/" },
  { org: "天下・銀天下",     listing: "https://www.cw.com.tw/aging" },
  { org: "50+",            listing: "https://www.fiftyplus.com.tw/" },
  { org: "聯合報橘世代",     listing: "https://orange.udn.com/orange/index" },
  { org: "安可人生",        listing: "https://ankemedia.com/category/learning/learningresource" },
  { org: "今周刊幸福熟齡",   listing: "https://thebetteraging.businesstoday.com.tw/" },
];

const TAG_KEYWORDS: Record<string, string[]> = {
  "健康": ["健康", "醫療", "養生", "保健", "疾病", "藥", "治療", "診所", "醫院"],
  "飲食": ["飲食", "營養", "食物", "吃", "飲品", "料理", "食療"],
  "運動": ["運動", "活動", "體能", "伸展", "健身", "走路"],
  "安全": ["安全", "防詐", "詐騙", "防跌", "跌倒", "危險"],
  "社福": ["補助", "社福", "福利", "申請", "津貼", "長照"],
  "科技": ["手機", "網路", "智慧", "數位", "Line", "APP", "平板"],
  "心理": ["憂鬱", "情緒", "心理", "孤單", "陪伴", "失眠", "壓力"],
};

const ARTICLE_HINT = /\/(article|articles|story|post|posts|news|hotnews|content)\//i;
const DENY = /(category|tag|author|about|login|sign|subscribe|member|search|video|podcast|event|shop|store|\.(jpg|png|pdf)$|#)/i;

/* 從清單頁找出候選文章連結（同網域、像文章的路徑） */
export async function discoverArticleLinks(listing: string, fcKey: string, limit = 5): Promise<string[]> {
  let links: string[] = [];
  try {
    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: listing, formats: ["links"] }),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    links = (data.data?.links ?? data.links ?? []) as string[];
  } catch { return []; }

  const host = (() => { try { return new URL(listing).host.replace(/^www\./, ""); } catch { return ""; } })();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of links) {
    if (typeof raw !== "string") continue;
    let u: URL;
    try { u = new URL(raw, listing); } catch { continue; }
    const h = u.host.replace(/^www\./, "");
    if (!h.includes(host.split(".").slice(-2).join(".")) && !host.includes(h.split(".").slice(-2).join("."))) continue;
    if (DENY.test(u.pathname)) continue;
    const segs = u.pathname.split("/").filter(Boolean);
    const looksArticle = ARTICLE_HINT.test(u.pathname) || /\d{3,}/.test(u.pathname) || segs.length >= 2;
    if (!looksArticle) continue;
    const key = u.origin + u.pathname;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= limit) break;
  }
  return out;
}

export type IngestResult = { status: "inserted" | "duplicate" | "skipped" | "error"; title?: string; error?: string };

/* 抓單篇 → AI 改寫 → 寫入 daily_news（source_url 唯一，重複會 duplicate） */
export async function ingestArticle(url: string, sourceOrg: string): Promise<IngestResult> {
  const fcKey = process.env.FIRECRAWL_API_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!fcKey || !apiKey) return { status: "error", error: "缺少 API 金鑰" };

  let article = "", ogTitle = "", ogImage = "";
  try {
    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!resp.ok) return { status: "error", error: `firecrawl ${resp.status}` };
    const d = await resp.json();
    article = d.data?.markdown ?? "";
    ogTitle = d.data?.metadata?.ogTitle ?? d.data?.metadata?.title ?? "";
    ogImage = d.data?.metadata?.ogImage ?? "";
  } catch (e) { return { status: "error", error: String(e) }; }
  if (article.trim().length < 200) return { status: "skipped", error: "內容過短" };

  let summaryMd = "";
  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `你是一位為長輩整理新聞的志工。請將以下文章改寫成長輩友善的重點摘要。
要求：繁體中文、語氣溫和白話；輸出 5-8 個重點，每點以「- 」開頭；第一點說明「這篇在講什麼」；保留數字日期地點；有建議行動就列出；不要加標題。

文章內容：
${article.slice(0, 3500)}`,
      }],
    });
    summaryMd = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  } catch (e) { return { status: "error", error: String(e) }; }
  if (!summaryMd) return { status: "error", error: "AI 未回傳" };

  const combined = (ogTitle + " " + article).slice(0, 2000);
  const tags = Object.entries(TAG_KEYWORDS).filter(([, kws]) => kws.some((k) => combined.includes(k))).map(([t]) => t);

  const admin = createAdminClient();
  const { error } = await admin.from("daily_news").insert({
    source_org: sourceOrg,
    source_url: url,
    title: ogTitle || "（無標題）",
    summary_md: summaryMd,
    image_url: ogImage || null,
    tags,
    published_at: new Date().toISOString(),
    status: "active",
  });
  if (error) {
    if (error.code === "23505") return { status: "duplicate", title: ogTitle };
    return { status: "error", error: error.message };
  }
  return { status: "inserted", title: ogTitle };
}
