import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "user";
  return role === "admin" ? user : null;
}

const TAG_KEYWORDS: Record<string, string[]> = {
  "健康": ["健康", "醫療", "養生", "保健", "疾病", "藥", "治療", "診所", "醫院"],
  "飲食": ["飲食", "營養", "食物", "吃", "飲品", "料理", "食療"],
  "運動": ["運動", "活動", "體能", "伸展", "健身", "走路"],
  "安全": ["安全", "防詐", "詐騙", "防跌", "跌倒", "危險"],
  "社福": ["補助", "社福", "福利", "申請", "津貼", "長照"],
  "科技": ["手機", "網路", "智慧", "數位", "Line", "APP", "平板"],
  "心理": ["憂鬱", "情緒", "心理", "孤單", "陪伴", "失眠", "壓力"],
};

export async function POST(req: NextRequest) {
  const user = await assertAdmin();
  if (!user) {
    return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
  }

  let body: { url?: string; source_org?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });
  }

  const { url, source_org } = body;
  if (!url || !source_org) {
    return NextResponse.json({ error: "需要 url 和 source_org" }, { status: 400 });
  }

  // ── 1. Firecrawl 抓取文章 ───────────────────────────────────────────
  const fcKey = process.env.FIRECRAWL_API_KEY;
  if (!fcKey) {
    return NextResponse.json({ error: "未設定 FIRECRAWL_API_KEY" }, { status: 500 });
  }

  let article = "";
  let ogTitle = "";
  let ogImage = "";

  try {
    const fcResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fcKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!fcResp.ok) {
      const err = await fcResp.text();
      return NextResponse.json({ error: `Firecrawl 回應錯誤: ${err}` }, { status: 502 });
    }

    const fcData = await fcResp.json();
    article = fcData.data?.markdown ?? "";
    ogTitle =
      fcData.data?.metadata?.ogTitle ??
      fcData.data?.metadata?.title ??
      "";
    ogImage = fcData.data?.metadata?.ogImage ?? "";
  } catch (e) {
    return NextResponse.json({ error: `Firecrawl 失敗: ${String(e)}` }, { status: 502 });
  }

  if (!article.trim()) {
    return NextResponse.json({ error: "無法取得文章內容，請確認網址是否正確" }, { status: 422 });
  }

  // ── 2. Claude 改寫為長輩友善摘要 ────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "未設定 ANTHROPIC_API_KEY" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  let summaryMd = "";
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `你是一位為長輩整理新聞的志工。請將以下文章改寫成長輩友善的重點摘要。

要求：
- 使用繁體中文，語氣溫和、白話易懂
- 輸出 5 到 8 個重點，每點以「- 」開頭
- 第一點簡單說明「這篇在講什麼」
- 重點具體實用，避免艱深術語
- 數字、日期、地點要保留
- 若有注意事項或建議行動，請列出
- 不要加標題，直接輸出重點列表

文章內容：
${article.slice(0, 3500)}`,
        },
      ],
    });

    summaryMd =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
  } catch (e) {
    return NextResponse.json({ error: `Claude 改寫失敗: ${String(e)}` }, { status: 502 });
  }

  if (!summaryMd) {
    return NextResponse.json({ error: "Claude 未回傳內容" }, { status: 502 });
  }

  // ── 3. 自動標記 tags ────────────────────────────────────────────────
  const combined = (ogTitle + " " + article).slice(0, 2000);
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      tags.push(tag);
    }
  }

  // ── 4. 寫入資料庫 ────────────────────────────────────────────────────
  const admin = createAdminClient();
  const { data: inserted, error: dbError } = await admin
    .from("daily_news")
    .insert({
      source_org,
      source_url: url,
      title: ogTitle || "（無標題）",
      summary_md: summaryMd,
      image_url: ogImage || null,
      tags,
      published_at: new Date().toISOString(),
      status: "active",
    })
    .select("id")
    .single();

  if (dbError) {
    if (dbError.code === "23505") {
      return NextResponse.json({ error: "此文章已經新增過了（重複網址）" }, { status: 409 });
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id: inserted?.id, title: ogTitle, tags });
}
