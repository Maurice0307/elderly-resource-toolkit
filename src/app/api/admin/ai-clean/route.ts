import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  return NextResponse.json({ ok: true, key: !!process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: NextRequest) {
  console.log("[ai-clean] POST called");
  try {
    return await handlePost(req);
  } catch (e) {
    console.error("[ai-clean] unhandled error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `伺服器錯誤：${msg}` }, { status: 500 });
  }
}

async function handlePost(req: NextRequest) {
  // Verify caller is moderator or admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!["moderator", "admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { resourceId } = await req.json();
  if (!resourceId) return NextResponse.json({ error: "Missing resourceId" }, { status: 400 });

  const admin = createAdminClient();
  const { data: resource } = await admin
    .from("resources")
    .select("name, summary, description, phone, address, website_url, tags")
    .eq("id", resourceId)
    .single();

  if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });

  const client = new Anthropic({ apiKey });

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `你是長者服務資源平台的內容編輯。請將以下用戶投稿整理成適合發布的繁體中文格式。

原始投稿：
名稱：${resource.name}
摘要：${resource.summary ?? "（未填）"}
詳細說明：${resource.description ?? "（未填）"}
電話：${resource.phone ?? "（未填）"}
地址：${resource.address ?? "（未填）"}
網站：${resource.website_url ?? "（未填）"}
標籤：${(resource.tags as string[])?.join("、") ?? "（未填）"}

整理原則：
1. 修正錯別字、語法，使用正式繁體中文
2. 摘要改寫為一句話、60字以內，說明服務內容與適用對象
3. 詳細說明整理為3~5句，條理清晰、去除贅字
4. 電話格式統一（例：02-1234-5678、0800-000-000）
5. 標籤保留3~6個，每個2~6字，對齊平台關鍵詞風格
6. 若欄位原本是空的，整理後也保持空字串

只回傳 JSON，不要任何其他文字：
{
  "name": "...",
  "summary": "...",
  "description": "...",
  "phone": "...",
  "address": "...",
  "website_url": "...",
  "tags": ["...", "..."]
}`,
        },
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Anthropic API 錯誤：${msg}` }, { status: 500 });
  }

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  let cleaned: unknown;
  try {
    cleaned = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "AI 回應格式錯誤" }, { status: 500 });
    try {
      cleaned = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "AI 回應無法解析" }, { status: 500 });
    }
  }

  return NextResponse.json({ cleaned });
}
