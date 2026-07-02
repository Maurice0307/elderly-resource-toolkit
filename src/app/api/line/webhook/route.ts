import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildResourceMessages, buildWelcomeMessage } from "@/lib/line/flex";
import { menuText, buildLinkList, routeIntent, categoryMenu, subcategoryMenu, pickerBubble, detailBubble, CATEGORY_ICON, iconUrl } from "@/lib/line/menu";
import { getLineProfileFull, logLineMessage } from "@/lib/line/store";
import { matchFaq } from "@/lib/line/faq";
import { parseLocation, regionConflict, searchTokensOf, expandRegionIds, REGION_GROUPS, nz, type RegionRow } from "@/lib/region/locationParse";
import { expandKeyword } from "@/lib/search/keywordExpand";
import { rankResources } from "@/lib/search/rank";

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


// 地區 quick reply：每次（有 uid 的）回覆底部帶「目前地區：XX」「換地區」
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function regionQuickReply(uid?: string): Promise<any | undefined> {
  if (!uid) return undefined;
  try {
    const admin = createAdminClient();
    const rid = await resolveUserRegionId(admin, uid);
    let nm = "全台灣";
    if (rid) {
      const { data: r } = await admin.from("regions").select("name, parent_id").eq("id", rid).maybeSingle();
      if (r) {
        nm = r.name;
        if (r.parent_id) {
          const { data: p } = await admin.from("regions").select("name").eq("id", r.parent_id).maybeSingle();
          if (p?.name) nm = `${p.name}${r.name}`;
        }
      }
    }
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elderly-resource-toolkit.vercel.app";
    const pin = iconUrl(site, "pin");
    return { items: [
      // 目前地區：純顯示，點了不動作（noop）
      { type: "action", imageUrl: pin, action: { type: "postback", label: `目前地區：${nm}`.slice(0, 20), data: "noop" } },
      // 換地區：固定在底部、不隨訊息滾動（前面不放 icon）
      { type: "action", action: { type: "postback", label: "換地區", data: "rchg", displayText: "換地區" } },
    ] };
  } catch { return undefined; }
}

async function lineReply(replyToken: string, messages: object[], logUserId?: string) {
  // 有 uid → 在最後一則訊息附上「目前地區 / 換地區」quick reply（固定在底部、不隨訊息滾動）
  if (logUserId && messages.length > 0) {
    const qr = await regionQuickReply(logUserId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (qr) (messages[messages.length - 1] as any).quickReply = qr;
  }
  await fetch(LINE_REPLY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  // 把 bot 自動回覆記進對話紀錄（後台聊天可見）
  if (logUserId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const summary = (messages as any[]).map((m) => m?.type === "text" ? m.text : (m?.altText || (m?.type === "flex" ? "[資源卡]" : "[訊息]"))).join("\n").slice(0, 400);
      if (summary) await logLineMessage({ userId: logUserId, direction: "out", text: summary, byAdmin: false });
    } catch { /* ignore */ }
  }
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
        else if (data === "noop")             { /* 「目前地區」只是顯示用，點了不做事 */ }
        else if (data.startsWith("rsearch=")) { const bar = data.indexOf("|"); const rid = data.slice(8, bar); const kw = decodeURIComponent(data.slice(bar + 1)); await searchByRegionId(rid, kw, rt, siteUrl, puid); }
        else if (data.startsWith("rgroup="))  { const bar = data.indexOf("|"); const lab = decodeURIComponent(data.slice(7, bar)); const kw = decodeURIComponent(data.slice(bar + 1)); await searchByGroup(lab, kw, rt, siteUrl, puid); }
        else if (data === "rcancel")          await lineReply(rt, [menuText("好的 😊 您可以再輸入其他問題。不含地區時，我會用您設定的地區幫您找。")], puid);
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
          const prof = await getLineProfileFull(userId);
          await logLineMessage({ userId, direction: "in", text: event.message.text, displayName: prof.name, avatarUrl: prof.picture });
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

const RES_COLS = "id, name, summary, phone, website_url, address, scope, region_id, regions(name), subcategory_id, extra_subcats, tags, bookmark_count, like_count";
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

// 地區清單快取（warm lambda 共用，省去每次查詢）
let _regionsCache: RegionRow[] | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadRegions(admin: any): Promise<RegionRow[]> {
  if (_regionsCache) return _regionsCache;
  const { data } = await admin.from("regions").select("id, name, level, parent_id");
  _regionsCache = (data ?? []) as RegionRow[];
  return _regionsCache;
}

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
    let q = admin.from("resources").select(RES_COLS).or(`subcategory_id.in.(${subIds.join(",")}),extra_subcats.ov.{${subIds.join(",")}}`).eq("status", "active");
    if (filter) q = q.or(`scope.eq.national,region_id.in.(${filter.ids.join(",")})`);
    ({ data } = await q.order("like_count", { ascending: false, nullsFirst: false }).limit(8));
  }
  await replyResources(replyToken, data, siteUrl, CATEGORY_ICON[catName] ?? "pin", filter, `「${catName}」目前還沒有資源，換個分類或直接打關鍵字試試 👇`, undefined, uid);
}

// 點細分類 → 該細分類的資源（依使用者地區篩選）
async function handleSubcatResources(subId: string, replyToken: string, siteUrl: string, uid?: string) {
  const admin = createAdminClient();
  const { data: sub } = await admin.from("subcategories").select("name, category_id").eq("id", subId).maybeSingle();
  const filter = await getRegionFilter(admin, uid);
  let q = admin.from("resources").select(RES_COLS).or(`subcategory_id.eq.${subId},extra_subcats.ov.{${subId}}`).eq("status", "active");
  if (filter) q = q.or(`scope.eq.national,region_id.in.(${filter.ids.join(",")})`);
  const { data } = await q.order("like_count", { ascending: false, nullsFirst: false }).limit(8);
  let iconName = "pin";
  if (sub?.category_id) {
    const { data: cat } = await admin.from("categories").select("name").eq("id", sub.category_id).maybeSingle();
    if (cat?.name) iconName = CATEGORY_ICON[cat.name] ?? "pin";
  }
  const pin = pinnedBySub(sub?.name);
  await replyResources(replyToken, data ?? [], siteUrl, iconName, filter, `「${sub?.name ?? "這一項"}」目前還沒有資源，換一項或直接打關鍵字試試 👇`, pin ? toolBubble(pin) : undefined, uid);
}

/* 官方查詢工具（對應網站置頂工具卡）：依子分類名或關鍵字觸發 */
type PinTool = { sub: string; trig: RegExp; title: string; tag: string; url?: string; links?: { label: string; url: string }[] };
const LINE_PINNED: PinTool[] = [
  { sub: "鄰近醫學中心、診所", trig: /看診|診所|醫院|開診|門診|急診|假日.*醫|連假.*醫|過年.*醫/, title: "假日／連假開診院所查詢", url: "https://info.nhi.gov.tw/INAE1000/INAE1002S01", tag: "健保署" },
  { sub: "1966 長照服務", trig: /長照|1966|居家照顧|日照|喘息|照顧服務/, title: "長照 2.0 服務與在地據點查詢", url: "https://1966.gov.tw/", tag: "衛福部" },
  { sub: "輔具申請", trig: /輔具|輪椅|助行器|氣墊床|拐杖|助聽器/, title: "政府輔具資源服務與補助查詢", url: "https://newrepat.sfaa.gov.tw/home/gov-repat-service", tag: "社家署" },
  { sub: "疫苗資訊", trig: /疫苗|流感|肺炎鏈球菌|接種/, title: "流感疫苗接種計畫與疫苗地圖", tag: "疾管署", links: [
    { label: "公費流感接種計畫", url: "https://www.cdc.gov.tw/Category/QAPage/T93ZfoLyyuCaZvKf7v9eww" },
    { label: "疫苗及流感藥劑地圖", url: "https://vaxmap.cdc.gov.tw" },
  ] },
];
const pinnedBySub = (name?: string | null) => LINE_PINNED.find((p) => p.sub === name) ?? null;
const pinnedByText = (s: string) => LINE_PINNED.find((p) => p.trig.test(s)) ?? null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toolBubble(t: PinTool): any {
  const links = t.links ?? (t.url ? [{ label: "立即查詢", url: t.url }] : []);
  return {
    type: "flex", altText: `${t.tag} 官方查詢：${t.title}`,
    contents: {
      type: "bubble", size: "kilo",
      body: { type: "box", layout: "vertical", spacing: "sm", contents: [
        { type: "text", text: `🔍 ${t.tag}．官方查詢`, size: "xs", weight: "bold", color: "#B23F1E" },
        { type: "text", text: t.title, weight: "bold", size: "md", wrap: true, color: "#241F1B" },
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents:
        links.map((lk) => ({ type: "button", style: "primary", color: "#E0552E", height: "sm",
          action: { type: "uri", label: lk.label, uri: lk.url } })) },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function replyResources(replyToken: string, data: unknown[], siteUrl: string, icon: string, filter: { name: string } | null, emptyMsg: string, pinned?: any, uid?: string) {
  const flex = buildResourceMessages(normRes(data as never[]), siteUrl, icon);
  const note = regionNote(filter);
  const msgs = [pinned, note, flex || (data.length ? null : menuText(emptyMsg))].filter(Boolean);
  if (msgs.length === 0) { await lineReply(replyToken, [menuText(emptyMsg)], uid); return; }
  await lineReply(replyToken, msgs, uid);
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

// 換地區確認卡（搜尋字提到的地區 ≠ 已設定地區時）
// postbackData：是 → 執行搜尋（rsearch=.. 或 rgroup=..）；否 → rcancel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function switchConfirmBubble(name: string, postbackData: string, keyword: string): any {
  const kw = keyword || "這個";
  return {
    type: "flex", altText: `要切換到${name}搜尋嗎？`,
    contents: {
      type: "bubble",
      body: { type: "box", layout: "vertical", spacing: "md", contents: [
        { type: "text", text: "要換個地區搜尋嗎？", weight: "bold", size: "lg", color: "#241F1B" },
        { type: "text", text: `您搜尋「${kw}」並提到「${name}」，但目前設定的地區不是這裡。要改看「${name}」的在地資源嗎？`, size: "sm", color: "#574E47", wrap: true },
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
        { type: "button", style: "primary", color: "#E0552E", action: { type: "postback", label: `是，看${name}`.slice(0, 20), data: postbackData, displayText: `看${name}的資源` } },
        { type: "button", style: "secondary", action: { type: "postback", label: "否，維持原本", data: "rcancel", displayText: "維持原本地區" } },
      ] },
    },
  };
}

// 同名地區消歧卡（大安、信義、中正…）：列出候選讓使用者點選
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ambiguityBubble(base: string, kw: string, candidates: { label: string; regionId: string }[]): any {
  const kwLabel = kw || "這個";
  return {
    type: "flex", altText: `「${base}」有好幾個，請選一個`,
    contents: {
      type: "bubble",
      body: { type: "box", layout: "vertical", spacing: "md", contents: [
        { type: "text", text: `「${base}」有好幾個地方`, weight: "bold", size: "lg", color: "#241F1B" },
        { type: "text", text: `您要找「${kwLabel}」，請問是哪一個「${base}」呢？`, size: "sm", color: "#574E47", wrap: true },
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", contents: [
        ...candidates.slice(0, 4).map((c) => ({
          type: "button", style: "primary", color: "#E0552E", height: "md" as const,
          action: { type: "postback", label: c.label.slice(0, 20), data: `rsearch=${c.regionId}|${encodeURIComponent(kw)}`, displayText: `看${c.label}` },
        })),
        { type: "button", style: "secondary", height: "md" as const, action: { type: "postback", label: "都不是", data: "rcancel", displayText: "取消" } },
      ] },
    },
  };
}

// 搜尋情境：要套用的地區 id 集合 + 排序用縣市/區
type SearchCtx = { ids: string[]; countyIds: string[]; districtId: string | null } | null;

// 由地區 id 推出搜尋情境（自己 + 子區 + 父縣市，並標出縣市/區層級）
function ctxFromRegionId(regions: RegionRow[], id: string): SearchCtx {
  const self = regions.find((r) => r.id === id);
  if (!self) return null;
  const ids = expandRegionIds(regions, id);
  if (self.level === "county") return { ids, countyIds: [id], districtId: null };
  return { ids, countyIds: self.parent_id ? [self.parent_id] : [], districtId: id };
}

// 主入口：解析地區 → 衝突才跳確認；否則直接搜
async function handleTextMessage(text: string, replyToken: string, siteUrl: string, uid?: string) {
  const admin = createAdminClient();

  // 安全分流（急症、中風、輕生、受虐…，p≥8）→ 最優先直接回，
  // 不進地區判斷、不跳換地區卡，確保緊急狀況不被流程耽誤。
  // 一般直接答案 FAQ（健保卡、119 等）不在此短路，留待後面流程處理，
  // 才不會擋到像「民間救護車」這種其實要查資源的需求。
  const safetyFaq = matchFaq(text);
  if (safetyFaq && safetyFaq.prio >= 8) { await lineReply(replyToken, [menuText(safetyFaq.a)], uid); return; }

  const regions = await loadRegions(admin);
  const parsed = parseLocation(text, regions);
  const curId = await resolveUserRegionId(admin, uid);

  // (1) 沒偵測到地區 → 用使用者預設地區（沒設定就全台）
  if (parsed.region.type === "none") {
    const ctx = curId ? ctxFromRegionId(regions, curId) : null;
    const home = curId ? regions.find((r) => r.id === curId) ?? null : null;
    // 提到不認得的在地地名（民生社區、xx新村…）→ 先說明，再用設定地區推薦
    let noteMsg = ctx ? regionNote(home ? { name: home.name } : null) : null;
    if (parsed.unknownPlace) {
      noteMsg = menuText(home
        ? `我不太確定「${parsed.unknownPlace}」在哪裡 🙂 先用您設定的地區「${home.name}」為您推薦：`
        : `我不太確定「${parsed.unknownPlace}」在哪裡 🙂 您可以打「縣市＋需求」(例如「桃園 送餐」)，或先點下方「換地區」設定您的所在地。`);
    }
    await searchAndReply({ admin, regions, keyword: parsed.keyword, origText: text, replyToken, siteUrl, uid, ctx, noteMsg });
    return;
  }

  // (2) 需要消歧 / 偏鄉
  if (parsed.region.type === "choice") {
    const conf = regionConflict(parsed, curId, regions);
    if (conf.autoChoice) {
      // 候選正好落在目前縣市 → 直接採用、不打擾
      const c = conf.autoChoice;
      await searchAndReply({ admin, regions, keyword: parsed.keyword, origText: text, replyToken, siteUrl, uid, ctx: { ids: c.ids, countyIds: c.countyId ? [c.countyId] : [], districtId: c.districtId }, noteMsg: localeNote(c.label) });
      return;
    }
    if (parsed.region.reason === "rural") {
      await lineReply(replyToken, [menuText("偏鄉的長輩資源每個縣市都有 🙂 您想找哪個縣市的偏鄉呢？\n可以打「縣市＋偏鄉＋需求」，例如「屏東 偏鄉 送餐」或「南投 偏鄉 共餐」。")], uid);
      return;
    }
    // 同名地區 → 候選卡
    const cands = parsed.region.candidates.map((c) => ({ label: c.label, regionId: (c.districtId ?? c.countyId) as string }));
    await lineReply(replyToken, [ambiguityBubble(parsed.region.label, parsed.keyword, cands)], uid);
    return;
  }

  // (3) 已解析出明確地區（或群組）
  const r = parsed.region;
  const conf = regionConflict(parsed, curId, regions);
  if (conf.needPrompt) {
    const data = r.isGroup
      ? `rgroup=${encodeURIComponent(r.label)}|${encodeURIComponent(parsed.keyword)}`
      : `rsearch=${(r.districtId ?? r.countyId) as string}|${encodeURIComponent(parsed.keyword)}`;
    await lineReply(replyToken, [switchConfirmBubble(r.label, data, parsed.keyword)], uid);
    return;
  }
  // 不衝突（與目前地區一致，或沒設定地區）→ 直接搜
  const countyIds = r.isGroup ? r.ids : (r.countyId ? [r.countyId] : []);
  await searchAndReply({ admin, regions, keyword: parsed.keyword, origText: text, replyToken, siteUrl, uid, ctx: { ids: r.ids, countyIds, districtId: r.districtId }, noteMsg: localeNote(r.label) });
}

const localeNote = (label: string) => menuText(`📍 已為您看「${label}」的資源（全國優先，再依縣市、行政區排序）🙂`);

// 共用搜尋 + 回覆（LINE）：依關鍵字找資源、依 全國→縣市→區 排序、附上地區提示
async function searchAndReply(o: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any; regions: RegionRow[]; keyword: string; origText: string;
  replyToken: string; siteUrl: string; uid?: string; ctx: SearchCtx;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  noteMsg: any | null;
}) {
  const { admin, keyword, origText, replyToken, siteUrl, uid, ctx, noteMsg } = o;

  // FAQ：直接答案(專線/安全)永遠回；導引型只有在不知道地區時才回
  const faq = matchFaq(origText);
  if (faq && (!faq.route || !ctx)) { await lineReply(replyToken, [menuText(faq.a)], uid); return; }

  // 關鍵字斷詞（含黏在一起的中文 bigram，提高召回）
  const searchTokens = searchTokensOf(keyword);
  const toks = searchTokens.length ? searchTokens : [keyword || origText.trim()];

  // 口語 → 細標籤對照（精準）：把「救護車」對到「民間救護車」等
  const exp = expandKeyword(keyword);
  const ilikeTerms = [...new Set([...toks, ...exp.terms])];

  const subIds = new Set<string>();
  // (1) 口語對照命中的細標籤 → 精準取 id
  if (exp.subcatNames.length) {
    try {
      const { data } = await admin.from("subcategories").select("id").in("name", exp.subcatNames);
      for (const s of data ?? []) subIds.add(s.id);
    } catch { /* ignore */ }
  }
  // (2) 斷詞與分類名比對（補強）
  for (const tok of toks) {
    try {
      const { data: subM } = await admin.from("subcategories").select("id").ilike("name", `%${tok}%`);
      for (const s of subM ?? []) subIds.add(s.id);
      const { data: catM } = await admin.from("categories").select("id").ilike("name", `%${tok}%`);
      if (catM && catM.length) {
        const { data: catSubs } = await admin.from("subcategories").select("id").in("category_id", catM.map((c: { id: string }) => c.id));
        for (const s of catSubs ?? []) subIds.add(s.id);
      }
    } catch { /* ignore */ }
  }
  const orParts: string[] = [];
  if (subIds.size) {
    orParts.push(`subcategory_id.in.(${[...subIds].join(",")})`);
    orParts.push(`extra_subcats.ov.{${[...subIds].join(",")}}`);
  }
  for (const tok of ilikeTerms) {
    orParts.push(`name.ilike.%${tok}%`);
    orParts.push(`summary.ilike.%${tok}%`);
  }

  let query = admin.from("resources").select(RES_COLS).eq("status", "active").or(orParts.join(",")).limit(12);
  if (ctx) query = query.or(`scope.eq.national,region_id.in.(${ctx.ids.join(",")})`);
  const { data: resources } = await query;

  const pin = pinnedByText(`${origText} ${keyword}`);
  const pinMsg = pin ? toolBubble(pin) : null;

  if (!resources || resources.length === 0) {
    const ai = await aiAnswer(origText);
    if (ai) { await lineReply(replyToken, [pinMsg, menuText(ai)].filter(Boolean), uid); return; }
    await lineReply(replyToken, [pinMsg,
      menuText(`這個問題我先幫您記著了 😊 您可以到網站找更多：\n${siteUrl}/search?q=${encodeURIComponent(origText)}\n或點下方選單、打「縣市＋需求」(例如「中壢 長照」) 讓我幫您找 👇`),
    ].filter(Boolean), uid);
    return;
  }

  // 相關度排序（細標籤 > 名稱 > 標籤 > 摘要；同分再 全國→縣市→區 + 收藏數）
  const strongTerms = [...keyword.split(/[\s,，、]+/).map((t) => t.trim()).filter((t) => t.length >= 2), ...exp.terms];
  const ranked = rankResources(normRes(resources), {
    subIds,
    terms: strongTerms,
    countyIds: ctx?.countyIds ?? [],
    districtId: ctx?.districtId ?? null,
  });
  const flexMsg = buildResourceMessages(ranked, siteUrl, "search");
  if (flexMsg) {
    await lineReply(replyToken, [pinMsg, noteMsg, flexMsg].filter(Boolean), uid);
  }
}

// 由 postback 觸發的搜尋（使用者已選好地區 / 候選 / 群組）→ 不再確認，直接搜
async function searchByRegionId(regionId: string, keyword: string, replyToken: string, siteUrl: string, uid?: string) {
  const admin = createAdminClient();
  const regions = await loadRegions(admin);
  const ctx = ctxFromRegionId(regions, regionId);
  const label = regions.find((r) => r.id === regionId)?.name ?? "您選的地區";
  await searchAndReply({ admin, regions, keyword, origText: keyword, replyToken, siteUrl, uid, ctx, noteMsg: localeNote(label) });
}

async function searchByGroup(groupLabel: string, keyword: string, replyToken: string, siteUrl: string, uid?: string) {
  const admin = createAdminClient();
  const regions = await loadRegions(admin);
  const g = REGION_GROUPS.find((x) => x.label === groupLabel);
  if (!g) { await searchAndReply({ admin, regions, keyword, origText: keyword, replyToken, siteUrl, uid, ctx: null, noteMsg: null }); return; }
  const countyIds = g.counties.map((cn) => regions.find((r) => r.level === "county" && nz(r.name) === nz(cn))?.id).filter(Boolean) as string[];
  await searchAndReply({ admin, regions, keyword, origText: keyword, replyToken, siteUrl, uid, ctx: { ids: countyIds, countyIds, districtId: null }, noteMsg: localeNote(groupLabel) });
}

// LINE event types
type LineEvent =
  | { type: "follow"; replyToken: string; source?: { userId?: string } }
  | { type: "message"; replyToken: string; message: { type: "text"; text: string }; source?: { userId?: string } }
  | { type: "postback"; replyToken: string; postback?: { data?: string }; source?: { userId?: string } }
  | { type: string; replyToken?: string; postback?: { data?: string }; source?: { userId?: string } };
