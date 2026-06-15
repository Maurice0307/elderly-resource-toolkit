import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildResourceMessages, buildWelcomeMessage } from "@/lib/line/flex";
import { menuText, buildLinkList, routeIntent, categoryMenu, subcategoryMenu, pickerBubble, detailBubble, CATEGORY_ICON, iconUrl } from "@/lib/line/menu";
import { getLineProfile, logLineMessage } from "@/lib/line/store";
import { matchFaq } from "@/lib/line/faq";

const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
const RM_NEWBIE = "richmenu-e6ed60c63ea87dd965d558c7d2ee4716"; // 新手選單
const RM_FULL = "richmenu-8cb934de51ef15424ae34367c26cdd5b";   // 完整六大功能選單

async function linkRichMenu(uid: string | undefined, menuId: string) {
  if (!uid) return;
  try {
    await fetch(`https://api.line.me/v2/bot/user/${uid}/richmenu/${menuId}`, {
      method: "POST", headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    });
  } catch { /* ignore */ }
}

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
        const puid = event.source?.userId;
        if (data.startsWith("cat="))         await handleSubcatMenu(decodeURIComponent(data.slice(4)), rt);
        else if (data.startsWith("catall="))  await handleCategoryResources(decodeURIComponent(data.slice(7)), rt, siteUrl, puid);
        else if (data.startsWith("sub="))     await handleSubcatResources(data.slice(4), rt, siteUrl, puid);
        else if (data.startsWith("act="))     await handleActivityTheme(data.slice(4), rt, siteUrl);
        else if (data.startsWith("scr="))     await handleScriptAudience(data.slice(4), rt, siteUrl);
        else if (data.startsWith("nd="))      await detailNews(data.slice(3), rt, siteUrl);
        else if (data.startsWith("ad="))      await detailActivity(data.slice(3), rt, siteUrl);
        else if (data.startsWith("qd="))      await detailQa(data.slice(3), rt, siteUrl);
        else if (data.startsWith("sd="))      await detailScript(data.slice(3), rt, siteUrl);
        else if (data.startsWith("rd="))      await detailResource(data.slice(3), rt, siteUrl);
        else if (data === "rchg")             await lineReply(rt, [await countyPickerMsg(createAdminClient())]);
        else if (data.startsWith("rc="))      await lineReply(rt, [await districtPickerMsg(createAdminClient(), data.slice(3))]);
        else if (data.startsWith("rok="))     await confirmRegion(data.slice(4), rt, puid);
        else if (data.startsWith("rset="))    await confirmRegion(data.slice(5), rt, puid);
        else if (data === "fullmenu")         { await linkRichMenu(puid, RM_FULL); await lineReply(rt, [menuText("已為您開啟完整功能選單 👇 點下方大圖示就能用六大功能！")]); }
        continue;
      }
      if (event.type === "follow") {
        await linkRichMenu(event.source?.userId, RM_NEWBIE); // 新手先看新手選單
        await lineReply(event.replyToken, [buildWelcomeMessage(siteUrl), await buildRegionAsk(createAdminClient(), event.source?.userId)]);
        continue;
      }
      if (event.type === "message" && event.message.type === "text") {
        const userId: string | undefined = event.source?.userId;
        if (userId) {
          const name = await getLineProfile(userId);
          await logLineMessage({ userId, direction: "in", text: event.message.text, displayName: name });
        }
        await handleMessage(event.message.text, event.replyToken, siteUrl, userId);
      }
    } catch (e) {
      console.error("[line/webhook] event error:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleMessage(text: string, replyToken: string, siteUrl: string, uid?: string) {
  const intent = routeIntent(text);
  switch (intent) {
    case "menu":
      await lineReply(replyToken, [menuText("您好！想找什麼呢？點下方的選單按鈕，或直接打字告訴我 🙂")]);
      return;
    case "region":
      await lineReply(replyToken, [await buildRegionAsk(createAdminClient(), uid)]);
      return;
    case "resource":
      await handleResourceMenu(replyToken);
      return;
    case "activity":  await handleActivities(replyToken, siteUrl); return;
    case "script":    await handleScripts(replyToken, siteUrl); return;
    case "news":      await handleNews(replyToken, siteUrl); return;
    case "qa":        await handleQa(replyToken, siteUrl); return;
    default:          await handleTextMessage(text, replyToken, siteUrl, uid); return;
  }
}

const RES_COLS = "id, name, summary, phone, website_url, address, scope, region_id, regions(name)";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normRes = (rows: any[]): any[] => (rows ?? []).map((r) => ({ ...r, regions: Array.isArray(r.regions) ? r.regions[0] : r.regions }));
const snip = (s: string | null | undefined, n = 46) => {
  const t = (s ?? "").replace(/[#*>]/g, "").replace(/^[-•\s]+/gm, "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};
const fmtD = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" }) : "");

/* 查不到資源時，用 AI 給長輩友善、個別化的實用回答（取代罐頭「找不到」） */
async function aiAnswer(text: string): Promise<string> {
  try {
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await claude.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 420,
      system: "你是台灣「幸福好厝邊」長者資源 LINE 小幫手。用繁體中文、溫和白話、簡短（3-6 句）回答長輩的問題，給實用又安心的方向。原則：醫療/法律/金錢只給大方向並建議洽詢專業或官方專線（長照 1966、福利諮詢 1957、反詐騙 165、緊急 119/110、安心專線 1925、老人保護 113），絕不編造具體機構名稱、地址或電話。情緒低落要先同理、給安心專線。最後用一句引導：可點下方選單，或打「縣市＋需求」(例如「中壢 長照」) 讓我幫忙找在地資源。",
      messages: [{ role: "user", content: text.slice(0, 500) }],
    });
    return msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  } catch { return ""; }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arr = (x: any): any[] => (Array.isArray(x) ? x : []);

/* 透過 account_links（網站 LINE 登入時已存）查出此 LINE 使用者的居住地 → 用來篩在地資源 */
// 找出此 LINE 使用者要套用的地區：① 他在 LINE 選過的（line_user_prefs）② 否則網站個人資料的居住地
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveUserRegionId(admin: any, lineUserId: string | undefined): Promise<string | null> {
  if (!lineUserId) return null;
  try {
    const { data: pref } = await admin.from("line_user_prefs").select("region_id").eq("line_user_id", lineUserId).maybeSingle();
    if (pref?.region_id) return pref.region_id;
  } catch { /* 表未建立 */ }
  const { data: link } = await admin.from("account_links").select("user_id").eq("provider", "line").eq("provider_key", lineUserId).maybeSingle();
  if (!link) return null;
  const { data: prof } = await admin.from("profiles").select("home_region_id").eq("id", link.user_id).maybeSingle();
  return prof?.home_region_id ?? null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function regionFilterFromId(admin: any, rid: string | null): Promise<{ ids: string[]; name: string } | null> {
  if (!rid) return null;
  const { data: reg } = await admin.from("regions").select("id, name, parent_id").eq("id", rid).maybeSingle();
  if (!reg) return null;
  const { data: children } = await admin.from("regions").select("id").eq("parent_id", rid);
  const ids = [rid, ...arr(children).map((c) => c.id)];
  if (reg.parent_id) ids.push(reg.parent_id);
  return { ids, name: reg.name };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRegionFilter(admin: any, lineUserId: string | undefined) {
  return regionFilterFromId(admin, await resolveUserRegionId(admin, lineUserId));
}
const regionNote = (f: { name: string } | null) =>
  f ? menuText(`🔎 已依您的地區「${f.name}」篩選（全國＋在地）。想看別區可直接打字，例如「台南 長照」`) : null;

// 縣市由北到南
const N2S = ["基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣"];
const countyOrder = (n: string) => { const i = N2S.indexOf((n || "").replace(/台/g, "臺")); return i < 0 ? 99 : i; };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setUserRegion(admin: any, uid: string, regionId: string, name: string) {
  try {
    await admin.from("line_user_prefs").upsert({ line_user_id: uid, region_id: regionId, region_name: name, onboarded: true, updated_at: new Date().toISOString() }, { onConflict: "line_user_id" });
  } catch { /* 表未建立 */ }
}

// 確認地區的卡片
function confirmRegionBubble(name: string, rid: string): LineMsg {
  return {
    type: "flex", altText: "確認您的地區",
    contents: {
      type: "bubble", size: "mega",
      body: { type: "box", layout: "vertical", paddingAll: "22px", contents: [
        { type: "text", text: "請先確認您住在哪裡", size: "sm", color: "#9C8E84" },
        { type: "text", text: name, weight: "bold", size: "xxl", color: "#E0552E", margin: "md", wrap: true },
        { type: "text", text: "確認後，找資源會自動幫您篩「全國＋在地」", size: "sm", color: "#574E47", margin: "md", wrap: true },
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "20px", paddingTop: "0px", contents: [
        { type: "button", style: "primary", color: "#E0552E", height: "md", action: { type: "postback", label: "是，就用這裡", data: `rok=${rid}|${name}`, displayText: `確認：${name}` } },
        { type: "button", style: "secondary", height: "md", action: { type: "postback", label: "想換地區", data: "rchg", displayText: "換地區" } },
      ] },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function countyPickerMsg(admin: any): Promise<LineMsg> {
  const { data } = await admin.from("regions").select("id, name").eq("level", "county");
  const counties = arr(data).slice().sort((a, b) => countyOrder(a.name) - countyOrder(b.name));
  return pickerBubble("您住在哪個縣市？", "選縣市，再選行政區", [], counties.map((c) => ({ label: c.name, data: `rc=${c.id}` })));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function districtPickerMsg(admin: any, countyId: string): Promise<LineMsg> {
  const { data: county } = await admin.from("regions").select("name").eq("id", countyId).maybeSingle();
  const { data: dists } = await admin.from("regions").select("id, name").eq("parent_id", countyId);
  const cname = county?.name ?? "";
  const opts = [{ label: `整個${cname}（全縣市）`, data: `rset=${countyId}|${cname}` }, ...arr(dists).map((d) => ({ label: d.name, data: `rset=${d.id}|${cname} ${d.name}` }))];
  return pickerBubble(cname, "選行政區，或選「全縣市」", [], opts, "#E0552E");
}

// 進入點：有預設就確認、沒有就選縣市
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildRegionAsk(admin: any, uid: string | undefined): Promise<LineMsg> {
  if (uid) {
    const rid = await resolveUserRegionId(admin, uid);
    if (rid) { const f = await regionFilterFromId(admin, rid); return confirmRegionBubble(f?.name ?? "您的地區", rid); }
  }
  return countyPickerMsg(admin);
}

async function confirmRegion(payload: string, rt: string, uid: string | undefined) {
  const idx = payload.indexOf("|");
  const rid = idx >= 0 ? payload.slice(0, idx) : payload;
  const name = idx >= 0 ? payload.slice(idx + 1) : "您的地區";
  if (uid && rid) await setUserRegion(createAdminClient(), uid, rid, name);
  await linkRichMenu(uid, RM_FULL); // 設定好地區 → 切換到完整功能選單
  await lineReply(rt, [menuText(`好的！已記住您在「${name}」🏠\n已為您開啟完整功能選單（下方六大圖示）。\n之後「找資源」會自動幫您篩「全國＋在地」。直接點選單或打字都可以！`)]);
}

async function detailNews(id: string, rt: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data: n } = await admin.from("daily_news").select("title, source_org, summary_md, published_at, source_url").eq("id", id).maybeSingle();
  if (!n) { await lineReply(rt, [menuText("找不到這則新知 🙂")]); return; }
  const lines = (n.summary_md || "").split(/\n+/).map((s: string) => s.replace(/^[-•\s]+/, "• ").replace(/[#*>]/g, "").trim()).filter(Boolean).slice(0, 12);
  const links: { label: string; uri: string }[] = [];
  if (n.source_url) links.push({ label: "前往原始來源 ›", uri: n.source_url });
  links.push({ label: "在網站看完整版", uri: `${siteUrl}/news/${id}` });
  await lineReply(rt, [detailBubble({ headerLabel: "今日新知", color: "#C2410C", icon: iconUrl(siteUrl, "news"), title: n.title, meta: `${n.source_org || ""}${n.published_at ? " · " + fmtD(n.published_at) : ""}`, lines, links })]);
}

async function detailActivity(slug: string, rt: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data: a } = await admin.from("activity_cards").select("title, summary, steps").eq("slug", slug).maybeSingle();
  if (!a) { await lineReply(rt, [menuText("找不到這個活動 🙂")]); return; }
  const steps = arr(a.steps);
  const lines = [a.summary || "", ...steps.map((s, i) => `${i + 1}. ${s.title || ""}${s.description ? "：" + s.description : ""}`)].filter(Boolean).slice(0, 12);
  await lineReply(rt, [detailBubble({ headerLabel: "活動圖卡", color: "#2E7D52", icon: iconUrl(siteUrl, "grid"), title: a.title, meta: `約 ${Math.max(5, steps.length * 3)} 分鐘・${steps.length} 個步驟`, lines, links: [{ label: "在網站一步步做 ›", uri: `${siteUrl}/activities/${slug}` }] })]);
}

async function detailQa(id: string, rt: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data: q } = await admin.from("questions").select("title, body, answer_count, updated_at").eq("id", id).maybeSingle();
  if (!q) { await lineReply(rt, [menuText("找不到這個問題 🙂")]); return; }
  const { data: ans } = await admin.from("answers").select("body, vote_count, is_accepted").eq("question_id", id).order("is_accepted", { ascending: false }).order("vote_count", { ascending: false }).limit(3);
  const lines = [q.body || "", arr(ans).length ? "—— 大家的回答 ——" : "", ...arr(ans).map((x) => `${x.is_accepted ? "★ " : "• "}${snip(x.body, 90)}`)].filter(Boolean);
  await lineReply(rt, [detailBubble({ headerLabel: "互助問答", color: "#B23F1E", icon: iconUrl(siteUrl, "qa"), title: q.title, meta: `${q.answer_count ?? 0} 則回答${q.updated_at ? " · 最後討論 " + fmtD(q.updated_at) : ""}`, lines, links: [{ label: "看完整討論／我要回答 ›", uri: `${siteUrl}/qa/${id}` }] })]);
}

async function detailScript(slug: string, rt: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data: s } = await admin.from("communication_scripts").select("title, context, ok_examples, tips").eq("slug", slug).maybeSingle();
  if (!s) { await lineReply(rt, [menuText("找不到這個錦囊 🙂")]); return; }
  const ok = arr(s.ok_examples);
  const lines = [s.context || "", ok.length ? "✅ 可以這樣說：" : "", ...ok.map((e) => `「${e.text || e}」`), arr(s.tips).length ? "💡 " + arr(s.tips).join("；") : ""].filter(Boolean).slice(0, 12);
  await lineReply(rt, [detailBubble({ headerLabel: "溝通錦囊", color: "#2952B3", icon: iconUrl(siteUrl, "chat"), title: s.title, lines, links: [{ label: "在網站看完整 ›", uri: `${siteUrl}/scripts/${slug}` }] })]);
}

async function detailResource(id: string, rt: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data: r } = await admin.from("resources").select("name, summary, description, phone, address, website_url, scope, regions(name)").eq("id", id).maybeSingle();
  if (!r) { await lineReply(rt, [menuText("找不到這個資源 🙂")]); return; }
  const region = Array.isArray(r.regions) ? r.regions[0] : r.regions;
  const lines = [r.summary || "", r.description || "", r.address ? "📍 地址：" + r.address : "", r.phone ? "📞 電話：" + r.phone : ""].filter(Boolean);
  const links: { label: string; uri: string }[] = [];
  if (r.phone) links.push({ label: "撥打電話", uri: `tel:${r.phone.replace(/[^\d+]/g, "")}` });
  if (r.website_url) links.push({ label: "前往官網 ›", uri: r.website_url });
  await lineReply(rt, [detailBubble({ headerLabel: r.scope === "national" ? "全國服務" : (region?.name || "在地服務"), color: "#E0552E", icon: iconUrl(siteUrl, "pin"), title: r.name, lines, links })]);
}

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

// 「全部 X」→ 整個分類的資源（依使用者地區篩選）
async function handleCategoryResources(catName: string, replyToken: string, siteUrl: string, uid?: string) {
  siteUrl = siteUrl || "https://elderly-resource-toolkit.vercel.app";
  const admin = createAdminClient();
  const { data: cat } = await admin.from("categories").select("id").eq("name", catName).maybeSingle();
  if (!cat) { await handleTextMessage(catName, replyToken, siteUrl, uid); return; }
  const { data: subs } = await admin.from("subcategories").select("id").eq("category_id", cat.id);
  const subIds = (subs ?? []).map((s) => s.id);
  const filter = await getRegionFilter(admin, uid);
  let data: unknown[] = [];
  if (subIds.length) {
    let q = admin.from("resources").select(RES_COLS).in("subcategory_id", subIds).eq("status", "active");
    if (filter) q = q.or(`scope.eq.national,region_id.in.(${filter.ids.join(",")})`);
    ({ data } = await q.order("like_count", { ascending: false, nullsFirst: false }).limit(8));
  }
  await replyResources(replyToken, data, siteUrl, CATEGORY_ICON[catName] ?? "pin", filter, `「${catName}」目前還沒有資源，換個分類或直接打關鍵字試試 👇`);
}

// 點細分類 → 該細分類的資源（依使用者地區篩選）
async function handleSubcatResources(subId: string, replyToken: string, siteUrl: string, uid?: string) {
  const admin = createAdminClient();
  const { data: sub } = await admin.from("subcategories").select("name, category_id").eq("id", subId).maybeSingle();
  const filter = await getRegionFilter(admin, uid);
  let q = admin.from("resources").select(RES_COLS).eq("subcategory_id", subId).eq("status", "active");
  if (filter) q = q.or(`scope.eq.national,region_id.in.(${filter.ids.join(",")})`);
  const { data } = await q.order("like_count", { ascending: false, nullsFirst: false }).limit(8);
  let iconName = "pin";
  if (sub?.category_id) {
    const { data: cat } = await admin.from("categories").select("name").eq("id", sub.category_id).maybeSingle();
    if (cat?.name) iconName = CATEGORY_ICON[cat.name] ?? "pin";
  }
  await replyResources(replyToken, data ?? [], siteUrl, iconName, filter, `「${sub?.name ?? "這一項"}」目前還沒有資源，換一項或直接打關鍵字試試 👇`);
}

async function replyResources(replyToken: string, data: unknown[], siteUrl: string, icon: string, filter: { name: string } | null, emptyMsg: string) {
  const flex = buildResourceMessages(normRes(data as never[]), siteUrl, icon);
  if (!flex) { await lineReply(replyToken, [menuText(emptyMsg)]); return; }
  const note = regionNote(filter);
  await lineReply(replyToken, note ? [note, flex] : [flex]);
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
        btn: "看活動內容",
        detail: `ad=${a.slug}`,
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
      detail: `sd=${s.slug}`,
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
      meta: `${n.source_org ?? ""}${n.published_at || n.fetched_at ? " · " + fmtD(n.published_at || n.fetched_at) : ""}`,
      desc: n.summary_md ? snip(n.summary_md, 60) : undefined,
      uri: `${siteUrl}/news/${n.id}`,
      btn: "看內容",
      detail: `nd=${n.id}`,
      image: (n.image_url && /^https:\/\//.test(n.image_url)) ? n.image_url : null,
    })),
  })]);
}

async function handleQa(replyToken: string, siteUrl: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("questions")
    .select("id, title, body, answer_count, updated_at")
    .in("status", ["open", "resolved"])
    .order("updated_at", { ascending: false })
    .limit(7);
  const items = (data ?? []).map((q) => ({
    title: q.title,
    meta: `${q.answer_count ?? 0} 則回答${q.updated_at ? " · 最後討論 " + fmtD(q.updated_at) : ""}`,
    desc: q.body ? snip(q.body, 56) : undefined,
    uri: `${siteUrl}/qa/${q.id}`,
    btn: "看討論",
    detail: `qd=${q.id}`,
  }));
  items.push({ title: "我要提問", meta: undefined, desc: "找不到答案？直接問，在地志工幫您解答", uri: `${siteUrl}/qa/ask`, btn: "我要提問", detail: undefined });
  await lineReply(replyToken, [buildLinkList({
    altText: "互助問答",
    headerColor: "#B23F1E",
    headerLabel: "互助問答",
    icon: iconUrl(siteUrl, "qa"),
    emptyText: "目前還沒有問答，您可以到網站發問 🙂",
    items,
  })]);
}

async function handleTextMessage(text: string, replyToken: string, siteUrl: string, uid?: string) {
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

  // 沒指定縣市時，先看是不是常見問題（FAQ 自動導引）；命中就回導引，不用再硬搜
  if (!regionId) {
    const faq = matchFaq(text);
    if (faq) { await lineReply(replyToken, [menuText(faq)]); return; }
  }

  // 使用者沒指定縣市時，套用「我的地區」篩選（已登入網站者）
  const homeFilter = regionId ? null : await getRegionFilter(admin, uid);

  // Query resources
  let query = admin
    .from("resources")
    .select(RES_COLS)
    .eq("status", "active")
    .or(`name.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
    .limit(5);

  if (regionId) {
    query = query.or(`scope.eq.national,region_id.eq.${regionId}`);
  } else if (homeFilter) {
    query = query.or(`scope.eq.national,region_id.in.(${homeFilter.ids.join(",")})`);
  }

  const { data: resources } = await query;

  if (!resources || resources.length === 0) {
    // 查無在地資源 → 用 AI 給個別化回答（不再每次都回同一句）
    const ai = await aiAnswer(text);
    if (ai) { await lineReply(replyToken, [menuText(ai)]); return; }
    await lineReply(replyToken, [
      menuText(`這個問題我先幫您記著了 😊 您可以到網站找更多：\n${siteUrl}/search?q=${encodeURIComponent(text)}\n或點下方選單、打「縣市＋需求」(例如「中壢 長照」) 讓我幫您找 👇`),
    ]);
    return;
  }

  const flexMsg = buildResourceMessages(normRes(resources), siteUrl, "search");
  if (flexMsg) {
    const note = regionNote(homeFilter);
    await lineReply(replyToken, note ? [note, flexMsg] : [flexMsg]);
  }
}

// LINE event types
type LineEvent =
  | { type: "follow"; replyToken: string; source?: { userId?: string } }
  | { type: "message"; replyToken: string; message: { type: "text"; text: string }; source?: { userId?: string } }
  | { type: "postback"; replyToken: string; postback?: { data?: string }; source?: { userId?: string } }
  | { type: string; replyToken?: string; postback?: { data?: string }; source?: { userId?: string } };
