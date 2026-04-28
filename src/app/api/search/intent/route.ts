import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { categories } from "@/config/categories";
import { keywordIntent } from "@/lib/search/keywordIntent";

export async function POST(req: NextRequest) {
  try {
    return await handle(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[search-intent] unhandled:", e);
    const fallback = keywordIntent(`${(e as Error).message ?? ""}`);
    return NextResponse.json(
      { error: `分析失敗：${msg}`, fallback },
      { status: 500 },
    );
  }
}

async function handle(req: NextRequest) {
  const { query } = await req.json();
  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "需要 query 字串" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: "keyword",
      ...keywordIntent(query),
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const catList = categories
      .map((c) => `- ${c.slug}（${c.name}）：${c.subcategories.map((s) => s.name).join("、")}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `你是長者服務資源平台的搜尋助手。使用者用口語提問，你要判斷他需要什麼類型的資源。

【重要原則】長者的提問常常是「複合情境」，要拆解出多個面向。例如：
- 「想去醫院但行動不便」→ 醫療（看診）＋ 交通（接送服務）
- 「腳痛容易在家跌倒」→ 醫療（就醫）＋ 居住安全（防跌施工）
- 「獨居又最近不舒服」→ 醫療＋居住安全（獨居警報）＋社會資源（心理諮詢）

平台分類：
${catList}

使用者輸入：「${query}」

請輸出 JSON（不要多餘文字）：
{
  "categories": ["最相關的分類 slug，最多4個。如果是複合情境，務必涵蓋所有面向"],
  "subcategories": ["最相關的子分類名稱，最多6個"],
  "keywords": ["拆解出的搜尋關鍵字，最多6個。同義詞與相關詞都要列出"],
  "reasoning": "一句話解釋為什麼匹配這些分類（給長者看，溫暖、白話、說明複合情境的關聯）"
}

範例：輸入「媽媽身體不太舒服想去醫院但行動不便」→ {
  "categories": ["health","transport"],
  "subcategories": ["鄰近醫學中心、診所","復康巴士","長照交通接送","無障礙計程車"],
  "keywords": ["不舒服","就醫","行動不便","接送","復康巴士"],
  "reasoning": "看醫生＋行動不便，同時提供醫療資源與長照交通接送"
}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const parsed = parseJson(text);
    if (!parsed) {
      return NextResponse.json({ source: "keyword", ...keywordIntent(query) });
    }

    const validCats = (parsed.categories ?? []).filter((s: string) =>
      categories.some((c) => c.slug === s),
    );

    return NextResponse.json({
      source: "llm",
      categories: validCats.slice(0, 3),
      subcategories: (parsed.subcategories ?? []).slice(0, 5),
      keywords: (parsed.keywords ?? []).slice(0, 6),
      reasoning: parsed.reasoning ?? "",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[search-intent] LLM failed, fallback to keyword:", msg);
    return NextResponse.json({
      source: "keyword",
      llmError: msg,
      ...keywordIntent(query),
    });
  }
}

function parseJson(text: string): { categories?: string[]; subcategories?: string[]; keywords?: string[]; reasoning?: string } | null {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try { return JSON.parse(m[0]); } catch { return null; }
  }
}
