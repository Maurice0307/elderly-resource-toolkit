import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildResourceMessages, buildWelcomeMessage } from "@/lib/line/flex";
import { withMenu, menuText, buildLinkList, routeIntent } from "@/lib/line/menu";
import { getLineProfile, logLineMessage } from "@/lib/line/store";

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
        await lineReply(event.replyToken, [withMenu(buildWelcomeMessage(siteUrl)), menuText("👇 點下方選單，或直接打字告訴我你想找什麼")]);
        continue;
      }
      if (event.type === "message" && event.message.type === "text") {
        const userId: string | undefined = event.source?.userId;
        if (userId) {
          const name = await getLineProfile(userId);
          await logLineMessage({ userId, direction: "in", text: event.message.text, displayName: name });
        }
        await handleMessage(event.message.text, event.replyToken, siteUrl);
      }
    } catch (e) {
      console.error("[line/webhook] event error:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleMessage(text: string, replyToken: string, siteUrl: string) {
  const intent = routeIntent(text);
  switch (intent) {
    case "menu":
      await lineReply(replyToken, [menuText("您好！想找什麼呢？點下方的選單按鈕，或直接打字告訴我 🙂")]);
      return;
    case "resource":
      await lineReply(replyToken, [menuText("請告訴我您想找的資源，例如「中壢 量血壓」或「桃園 長照」🔍")]);
      return;
    case "activity":  await handleActivities(replyToken, siteUrl); return;
    case "script":    await handleScripts(replyToken, siteUrl); return;
    case "news":      await handleNews(replyToken, siteUrl); return;
    case "qa":        await handleQa(replyToken, siteUrl); return;
    default:          await handleTextMessage(text, replyToken, siteUrl); return;
  }
}

async function handleActivities(replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("activity_cards")
    .select("slug, title, steps")
    .eq("status", "active")
    .limit(8);
  await lineReply(replyToken, [buildLinkList({
    altText: "活動圖卡",
    headerColor: "#2E7D52",
    headerLabel: "🎴 活動圖卡",
    emptyText: "目前還沒有活動圖卡，稍後再來看看 🙂",
    items: (data ?? []).map((a) => ({
      title: a.title,
      sub: Array.isArray(a.steps) ? `${a.steps.length} 個步驟` : undefined,
      uri: `${siteUrl}/activities/${a.slug}`,
      btn: "開始活動",
    })),
  })]);
}

async function handleScripts(replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("communication_scripts")
    .select("slug, title, context")
    .limit(8);
  await lineReply(replyToken, [buildLinkList({
    altText: "溝通錦囊",
    headerColor: "#2952B3",
    headerLabel: "💬 溝通錦囊",
    emptyText: "目前還沒有溝通錦囊，稍後再來看看 🙂",
    items: (data ?? []).map((s) => ({
      title: s.title,
      sub: s.context ?? undefined,
      uri: `${siteUrl}/scripts/${s.slug}`,
      btn: "看怎麼說",
    })),
  })]);
}

async function handleNews(replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("daily_news")
    .select("id, title, source_org, published_at, fetched_at")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(8);
  await lineReply(replyToken, [buildLinkList({
    altText: "今日新知",
    headerColor: "#C2410C",
    headerLabel: "📰 今日新知",
    emptyText: "今天還沒有新消息，稍後再來看看 🙂",
    items: (data ?? []).map((n) => ({
      title: n.title,
      sub: n.source_org ?? undefined,
      uri: `${siteUrl}/news/${n.id}`,
      btn: "閱讀",
    })),
  })]);
}

async function handleQa(replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("questions")
    .select("id, title, answer_count")
    .in("status", ["open", "resolved"])
    .order("created_at", { ascending: false })
    .limit(7);
  const items = (data ?? []).map((q) => ({
    title: q.title,
    sub: `${q.answer_count ?? 0} 則回答`,
    uri: `${siteUrl}/qa/${q.id}`,
    btn: "看討論",
  }));
  items.push({ title: "我要提問", sub: "找不到答案？直接問，在地志工幫您解答", uri: `${siteUrl}/qa/ask`, btn: "我要提問" });
  await lineReply(replyToken, [buildLinkList({
    altText: "互助問答",
    headerColor: "#B23F1E",
    headerLabel: "🙋 互助問答",
    emptyText: "目前還沒有問答，您可以到網站發問 🙂",
    items,
  })]);
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
      menuText(`抱歉，找不到與「${text}」相關的資源 😔\n\n您可以到平台搜尋更多：\n${siteUrl}/search?q=${encodeURIComponent(text)}\n\n或點下方選單試試其他功能 👇`),
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

  if (flexMsg) await lineReply(replyToken, [withMenu(flexMsg)]);
}

// LINE event types
type LineEvent =
  | { type: "follow"; replyToken: string; source?: { userId?: string } }
  | { type: "message"; replyToken: string; message: { type: "text"; text: string }; source?: { userId?: string } }
  | { type: string; replyToken?: string; source?: { userId?: string } };
