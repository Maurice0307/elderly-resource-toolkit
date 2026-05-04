import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildResourceMessages, buildWelcomeMessage } from "@/lib/line/flex";

const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha256", secret).update(body).digest("base64");
  return hash === signature;
}

async function lineReply(replyToken: string, messages: object[]) {
  await fetch(LINE_REPLY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-line-signature") ?? "";
  const secret = process.env.LINE_CHANNEL_SECRET ?? "";

  if (!secret || !verifySignature(body, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://elderly-resource-toolkit.vercel.app";

  let payload: { events: LineEvent[] };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  for (const event of payload.events ?? []) {
    try {
      if (event.type === "follow") {
        await lineReply(event.replyToken, [buildWelcomeMessage(siteUrl)]);
        continue;
      }
      if (event.type === "message" && event.message.type === "text") {
        await handleTextMessage(event.message.text, event.replyToken, siteUrl);
      }
    } catch (e) {
      console.error("[line/webhook] event error:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleTextMessage(text: string, replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  let keyword = text.trim();
  let regionId: string | null = null;

  // Use Claude to extract keyword + region
  try {
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await claude.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: `從以下用戶訊息中抽取搜尋關鍵字與台灣縣市，回傳 JSON。
訊息：「${text}」
只回傳：{"keyword":"搜尋關鍵字","region":"縣市名或空字串"}`,
        },
      ],
    });
    const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    if (parsed.keyword) keyword = parsed.keyword;

    if (parsed.region) {
      const { data: matchedRegion } = await admin
        .from("regions")
        .select("id")
        .ilike("name", `%${parsed.region}%`)
        .limit(1)
        .single();
      regionId = matchedRegion?.id ?? null;
    }
  } catch {
    // fallback: use raw text
  }

  // Query resources
  let query = admin
    .from("resources")
    .select("id, name, summary, phone, website_url, scope, region_id, regions(name)")
    .eq("status", "active")
    .or(`name.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
    .limit(5);

  if (regionId) {
    query = admin
      .from("resources")
      .select("id, name, summary, phone, website_url, scope, region_id, regions(name)")
      .eq("status", "active")
      .or(`scope.eq.national,region_id.eq.${regionId}`)
      .or(`name.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
      .limit(5);
  }

  const { data: resources } = await query;

  if (!resources || resources.length === 0) {
    await lineReply(replyToken, [
      {
        type: "text",
        text: `抱歉，找不到與「${text}」相關的資源 😔\n\n您可以到平台搜尋更多：\n${siteUrl}/search?q=${encodeURIComponent(text)}`,
      },
    ]);
    return;
  }

  const flexMsg = buildResourceMessages(
    resources.map((r) => ({
      ...r,
      regions: Array.isArray(r.regions) ? r.regions[0] : r.regions,
    })),
    siteUrl
  );

  if (flexMsg) await lineReply(replyToken, [flexMsg]);
}

// LINE event types
type LineEvent =
  | { type: "follow"; replyToken: string }
  | { type: "message"; replyToken: string; message: { type: "text"; text: string } }
  | { type: string; replyToken?: string };
