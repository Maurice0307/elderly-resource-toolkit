import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildResourceMessages, buildWelcomeMessage } from "@/lib/line/flex";
import { menuText, buildLinkList, routeIntent, categoryMenu, subcategoryMenu, pickerBubble, CATEGORY_ICON, iconUrl } from "@/lib/line/menu";
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
      if (event.type === "postback") {
        const data: string = event.postback?.data ?? "";
        const rt = event.replyToken!;
        if (data.startsWith("cat="))         await handleSubcatMenu(decodeURIComponent(data.slice(4)), rt);
        else if (data.startsWith("catall="))  await handleCategoryResources(decodeURIComponent(data.slice(7)), rt, siteUrl);
        else if (data.startsWith("sub="))     await handleSubcatResources(data.slice(4), rt, siteUrl);
        else if (data.startsWith("act="))     await handleActivityTheme(data.slice(4), rt, siteUrl);
        else if (data.startsWith("scr="))     await handleScriptAudience(data.slice(4), rt, siteUrl);
        continue;
      }
      if (event.type === "follow") {
        await lineReply(event.replyToken, [buildWelcomeMessage(siteUrl), menuText("👇 點下方「功能選單」的大圖示，或直接打字告訴我你想找什麼")]);
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
      await handleResourceMenu(replyToken);
      return;
    case "activity":  await handleActivities(replyToken, siteUrl); return;
    case "script":    await handleScripts(replyToken, siteUrl); return;
    case "news":      await handleNews(replyToken, siteUrl); return;
    case "qa":        await handleQa(replyToken, siteUrl); return;
    default:          await handleTextMessage(text, replyToken, siteUrl); return;
  }
}

const RES_COLS = "id, name, summary, phone, website_url, address, scope, region_id, regions(name)";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normRes = (rows: any[]): any[] => (rows ?? []).map((r) => ({ ...r, regions: Array.isArray(r.regions) ? r.regions[0] : r.regions }));
const snip = (s: string | null | undefined, n = 46) => {
  const t = (s ?? "").replace(/[#*>]/g, "").replace(/^[-•\s]+/gm, "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};

async function handleResourceMenu(replyToken: string) {
  const admin = createAdminClient();
  const { data: cats } = await admin.from("categories").select("name").order("sort_order");
  await lineReply(replyToken, [categoryMenu(cats ?? [])]);
}

// 點分類 → 顯示細分類按鈕
async function handleSubcatMenu(catName: string, replyToken: string) {
  const admin = createAdminClient();
  const { data: cat } = await admin.from("categories").select("id").eq("name", catName).maybeSingle();
  if (!cat) { await lineReply(replyToken, [menuText("找不到這個分類，直接打關鍵字也可以喔 🙂")]); return; }
  const { data: subs } = await admin.from("subcategories").select("id, name").eq("category_id", cat.id).order("sort_order");
  if (!subs || subs.length === 0) { await handleCategoryResources(catName, replyToken, ""); return; }
  await lineReply(replyToken, [subcategoryMenu(catName, subs)]);
}

// 「全部 X」→ 整個分類的資源
async function handleCategoryResources(catName: string, replyToken: string, siteUrl: string) {
  siteUrl = siteUrl || "https://elderly-resource-toolkit.vercel.app";
  const admin = createAdminClient();
  const { data: cat } = await admin.from("categories").select("id").eq("name", catName).maybeSingle();
  if (!cat) { await handleTextMessage(catName, replyToken, siteUrl); return; }
  const { data: subs } = await admin.from("subcategories").select("id").eq("category_id", cat.id);
  const subIds = (subs ?? []).map((s) => s.id);
  const { data } = subIds.length
    ? await admin.from("resources").select(RES_COLS).in("subcategory_id", subIds).eq("status", "active").order("like_count", { ascending: false, nullsFirst: false }).limit(8)
    : { data: [] };
  const flex = buildResourceMessages(normRes(data ?? []), siteUrl, CATEGORY_ICON[catName] ?? "pin");
  if (flex) await lineReply(replyToken, [flex]);
  else await lineReply(replyToken, [menuText(`「${catName}」目前還沒有資源，換個分類或直接打關鍵字試試 👇`)]);
}

// 點細分類 → 該細分類的資源
async function handleSubcatResources(subId: string, replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data: sub } = await admin.from("subcategories").select("name, category_id").eq("id", subId).maybeSingle();
  const { data } = await admin.from("resources").select(RES_COLS).eq("subcategory_id", subId).eq("status", "active").order("like_count", { ascending: false, nullsFirst: false }).limit(8);
  let iconName = "pin";
  if (sub?.category_id) {
    const { data: cat } = await admin.from("categories").select("name").eq("id", sub.category_id).maybeSingle();
    if (cat?.name) iconName = CATEGORY_ICON[cat.name] ?? "pin";
  }
  const flex = buildResourceMessages(normRes(data ?? []), siteUrl, iconName);
  if (flex) await lineReply(replyToken, [flex]);
  else await lineReply(replyToken, [menuText(`「${sub?.name ?? "這一項"}」目前還沒有資源，換一項或直接打關鍵字試試 👇`)]);
}

// 活動分類（對齊網站 activities 頁的 CARD_CATS / themeKeyFor）
const ACT_THEMES = [
  { key: "life", name: "生活技能" }, { key: "body", name: "動動身體" }, { key: "smart", name: "智慧生活" },
  { key: "craft", name: "手工美勞" }, { key: "plant", name: "花草植栽" }, { key: "draw", name: "創意繪畫" },
  { key: "fraud", name: "防詐・假訊息" },
];
const ACT_THEME_BY_SLUG: Record<string, string> = {
  "interact-clay": "craft", "interact-origami-heart": "craft", "interact-origami-carnation": "craft", "interact-origami-bear": "craft", "interact-origami-bird": "craft", "interact-leaf-bookmark": "craft",
  "interact-moss-ball": "plant", "interact-bean-sprout": "plant", "balcony-garden": "plant",
  "interact-life-story": "draw", "interact-zentangle": "draw", "interact-memory-puzzle": "draw",
  "interact-knee-care": "body", "chair-exercise": "body", "fall-prevention": "body", "morning-stretch": "body",
  "my-plate": "smart", "line-video-call": "smart",
  "interact-recycling-game": "life", "interact-cpr": "life", "interact-aed": "life", "interact-heimlich": "life", "interact-fire-safety": "life", "interact-fire-escape": "life", "interact-earthquake": "life", "interact-earthquake-prep": "life",
  "interact-fraud-impersonation": "fraud", "interact-fraud-rumor": "fraud",
};
function actThemeKey(card: { slug: string; tags?: string[]; group_slug?: string }): string {
  if (ACT_THEME_BY_SLUG[card.slug]) return ACT_THEME_BY_SLUG[card.slug];
  if ((card.tags ?? []).some((t) => t.includes("防詐") || t.includes("詐騙"))) return "fraud";
  switch (card.group_slug) { case "smart": return "smart"; case "move": return "body"; case "life": return "life"; case "health": return "body"; default: return "craft"; }
}

// 點「活動圖卡」→ 活動分類選單
async function handleActivities(replyToken: string, _siteUrl: string) {
  await lineReply(replyToken, [pickerBubble("想做哪一種活動？", "選一種，我列出可以動手做的圖卡", [],
    ACT_THEMES.map((t) => ({ label: t.name, data: `act=${t.key}` })), "#2E7D52")]);
}

// 點活動分類 → 該類活動清單
async function handleActivityTheme(key: string, replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("activity_cards").select("slug, title, summary, tags, group_slug, steps").eq("status", "active");
  const list = (data ?? []).filter((a) => actThemeKey(a) === key);
  const themeName = ACT_THEMES.find((t) => t.key === key)?.name ?? "活動";
  await lineReply(replyToken, [buildLinkList({
    altText: themeName,
    headerColor: "#2E7D52",
    headerLabel: themeName,
    icon: iconUrl(siteUrl, "grid"),
    emptyText: `「${themeName}」目前還沒有活動，換一種試試 🙂`,
    items: list.slice(0, 10).map((a) => {
      const steps = Array.isArray(a.steps) ? a.steps.length : 0;
      const mins = Math.max(5, steps * 3);
      return {
        title: a.title,
        meta: `約 ${mins} 分鐘・${steps} 個步驟`,
        desc: a.summary ? snip(a.summary, 56) : undefined,
        uri: `${siteUrl}/activities/${a.slug}`,
        btn: "開始活動",
      };
    }),
  })]);
}

const SCRIPT_AUD: Record<string, string> = { family: "給家人", volunteer: "給志工", difficult: "難溝通情境" };

// 點「溝通錦囊」→ 對象選單
async function handleScripts(replyToken: string, _siteUrl: string) {
  await lineReply(replyToken, [pickerBubble("想找哪種溝通情境？", "選對象，我給你可以照著說的話", [],
    [{ label: "給長輩・家人", data: "scr=family" }, { label: "志工服務時", data: "scr=volunteer" }, { label: "難溝通的情況", data: "scr=difficult" }], "#2952B3")]);
}

// 點對象 → 該類錦囊清單
async function handleScriptAudience(aud: string, replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("communication_scripts").select("slug, title, context").eq("audience", aud).limit(10);
  const label = SCRIPT_AUD[aud] ?? "溝通錦囊";
  await lineReply(replyToken, [buildLinkList({
    altText: "溝通錦囊",
    headerColor: "#2952B3",
    headerLabel: "溝通錦囊",
    icon: iconUrl(siteUrl, "chat"),
    emptyText: `「${label}」目前還沒有錦囊，換一個試試 🙂`,
    items: (data ?? []).map((s) => ({
      title: s.title,
      meta: label,
      desc: s.context ? snip(s.context, 56) : undefined,
      uri: `${siteUrl}/scripts/${s.slug}`,
      btn: "看怎麼說",
    })),
  })]);
}

async function handleNews(replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("daily_news")
    .select("id, title, source_org, summary_md, image_url, published_at, fetched_at")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(8);
  await lineReply(replyToken, [buildLinkList({
    altText: "今日新知",
    headerColor: "#C2410C",
    headerLabel: "今日新知",
    icon: iconUrl(siteUrl, "news"),
    emptyText: "今天還沒有新消息，稍後再來看看 🙂",
    items: (data ?? []).map((n) => ({
      title: n.title,
      meta: n.source_org ?? undefined,
      desc: n.summary_md ? snip(n.summary_md, 60) : undefined,
      uri: `${siteUrl}/news/${n.id}`,
      btn: "閱讀",
      image: (n.image_url && /^https:\/\//.test(n.image_url)) ? n.image_url : null,
    })),
  })]);
}

async function handleQa(replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("questions")
    .select("id, title, body, answer_count")
    .in("status", ["open", "resolved"])
    .order("created_at", { ascending: false })
    .limit(7);
  const items = (data ?? []).map((q) => ({
    title: q.title,
    meta: `${q.answer_count ?? 0} 則回答`,
    desc: q.body ? snip(q.body, 56) : undefined,
    uri: `${siteUrl}/qa/${q.id}`,
    btn: "看討論",
  }));
  items.push({ title: "我要提問", meta: undefined, desc: "找不到答案？直接問，在地志工幫您解答", uri: `${siteUrl}/qa/ask`, btn: "我要提問" });
  await lineReply(replyToken, [buildLinkList({
    altText: "互助問答",
    headerColor: "#B23F1E",
    headerLabel: "互助問答",
    icon: iconUrl(siteUrl, "qa"),
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
    .select(RES_COLS)
    .eq("status", "active")
    .or(`name.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
    .limit(5);

  if (regionId) {
    query = admin
      .from("resources")
      .select(RES_COLS)
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

  const flexMsg = buildResourceMessages(normRes(resources), siteUrl, "search");

  if (flexMsg) await lineReply(replyToken, [flexMsg]);
}

// LINE event types
type LineEvent =
  | { type: "follow"; replyToken: string; source?: { userId?: string } }
  | { type: "message"; replyToken: string; message: { type: "text"; text: string }; source?: { userId?: string } }
  | { type: "postback"; replyToken: string; postback?: { data?: string }; source?: { userId?: string } }
  | { type: string; replyToken?: string; postback?: { data?: string }; source?: { userId?: string } };
