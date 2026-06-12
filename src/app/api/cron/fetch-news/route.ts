import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { NEWS_SOURCES, discoverArticleLinks, ingestArticle } from "@/lib/news/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* 定時爬蟲：每天由 Vercel Cron 觸發，內建「44 小時內已更新就跳過」≈ 每兩天爬一次。
   也可手動：/api/cron/fetch-news?key=<CRON_SECRET>&force=1 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const key = req.nextUrl.searchParams.get("key");
  const force = req.nextUrl.searchParams.get("force") === "1";
  if (secret && auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const fcKey = process.env.FIRECRAWL_API_KEY;
  if (!fcKey) return NextResponse.json({ error: "未設定 FIRECRAWL_API_KEY" }, { status: 500 });

  const admin = createAdminClient();

  // 每兩天：44 小時內已有新文章就跳過（force=1 可強制）
  if (!force) {
    const since = new Date(Date.now() - 44 * 3600 * 1000).toISOString();
    const { count } = await admin.from("daily_news").select("id", { count: "exact", head: true }).gte("published_at", since);
    if ((count ?? 0) > 0) {
      return NextResponse.json({ skipped: true, reason: "44 小時內已更新，這次跳過" });
    }
  }

  // 每個來源平行處理；每站最多嘗試 2 個連結、成功插入 1 篇就停（控時間與成本）
  const sources = await Promise.all(NEWS_SOURCES.map(async (src) => {
    const links = await discoverArticleLinks(src.listing, fcKey, 4);
    const tried: { link: string; status: string; title?: string }[] = [];
    let inserted = 0;
    for (const link of links.slice(0, 2)) {
      const r = await ingestArticle(link, src.org);
      tried.push({ link, status: r.status, title: r.title });
      if (r.status === "inserted") { inserted++; break; }
    }
    return { org: src.org, found: links.length, inserted, tried };
  }));

  const inserted = sources.reduce((s, r) => s + r.inserted, 0);
  if (inserted > 0) {
    revalidatePath("/news");
    revalidatePath("/");
  }
  return NextResponse.json({ ok: true, inserted, sources });
}
