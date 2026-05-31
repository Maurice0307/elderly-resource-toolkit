import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { categories } from "@/config/categories";
import { VoiceSearchHero } from "@/components/search/VoiceSearchHero";
import { LocationBadge } from "@/components/location/LocationBadge";
import { getUserRegionCode } from "@/lib/location/cookies";
import { getRegionByCode } from "@/lib/location/regions";
import { createClient } from "@/lib/supabase/server";

async function NewsSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_news")
    .select("id, title, source_org, tags, image_url, published_at, fetched_at")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(4);

  if (!data || data.length === 0) return null;

  const [featured, ...rest] = data;

  return (
    <section className="px-6 py-14" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              📰 今日新聞
            </h2>
            <p className="mt-2 text-lg" style={{ color: "var(--text-secondary)" }}>
              長輩友善資訊，重點整理一目了然
            </p>
          </div>
          <Link
            href="/news"
            className="rounded-full px-5 py-3 text-base font-semibold transition hover:opacity-80"
            style={{ background: "var(--bg-soft)", color: "var(--cta)", border: "1.5px solid var(--border)" }}
          >
            看全部 →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* 主要大卡 */}
          <Link
            href={`/news/${featured.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md lg:col-span-3"
            style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
          >
            {featured.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.image_url}
                alt=""
                className="w-full object-cover"
                style={{ height: 200 }}
              />
            )}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  {featured.source_org}
                </span>
                {(featured.tags ?? []).slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ background: "var(--bg-accent)", color: "#92400E" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                {featured.title}
              </p>
              <span
                className="mt-auto pt-4 text-base font-semibold transition group-hover:translate-x-1"
                style={{ color: "#EA580C" }}
              >
                閱讀重點 →
              </span>
            </div>
          </Link>

          {/* 右側小卡 */}
          <ul className="flex flex-col gap-4 lg:col-span-2">
            {rest.map((item) => (
              <li key={item.id} className="flex-1">
                <Link
                  href={`/news/${item.id}`}
                  className="group flex h-full items-center gap-3 overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
                  style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
                >
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt=""
                      className="shrink-0 object-cover"
                      style={{ width: 80, height: "100%", minHeight: 80 }}
                    />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col py-3 pr-4" style={{ paddingLeft: item.image_url ? 0 : "1rem" }}>
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      {item.source_org}
                    </span>
                    <p className="mt-1 line-clamp-2 text-base font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                      {item.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const code = await getUserRegionCode();
  const region = code ? await getRegionByCode(code) : null;

  return (
    <main className="flex flex-1 flex-col">

      {/* ── Hero ── */}
      <section
        style={{ background: "linear-gradient(135deg, #6D4C41 0%, #8D6E63 60%, #A1887F 100%)" }}
        className="px-6 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-lg font-semibold tracking-widest"
            style={{ color: "#F5EFE7" }}
          >
            {siteConfig.shortName}
          </p>
          <h1
            className="mt-3 text-4xl font-bold leading-tight sm:text-5xl"
            style={{ color: "#FFFFFF" }}
          >
            {siteConfig.name}
          </h1>
          <p
            className="mt-4 text-xl leading-relaxed"
            style={{ color: "#F5EFE7" }}
          >
            中高齡者、家屬與志工的<br />全方位資源導航平台
          </p>

          {/* 語音 + 文字搜尋 */}
          <VoiceSearchHero />

          {/* 在地化定位 */}
          <div className="mt-6">
            <LocationBadge
              currentName={region?.name ?? null}
              currentCode={region?.code ?? null}
            />
          </div>

          <Link
            href="/submit"
            className="mt-8 inline-flex items-center justify-center rounded-full px-8 py-3 text-lg font-semibold transition hover:bg-white/25"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#FFFFFF",
              border: "1.5px solid rgba(255,255,255,0.5)",
              minHeight: "var(--hit)",
            }}
          >
            <span className="icon-lg mr-2">📮</span>
            知道好資源？點此投稿
          </Link>
        </div>
      </section>

      {/* ── 7 大分類 ── */}
      <section className="px-6 py-14" style={{ background: "var(--bg-page)" }}>
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-center text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            我需要什麼幫助？
          </h2>
          <p
            className="mt-2 text-center text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            點選下方分類，找到適合的資源
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/resources/${cat.slug}`}
                  className="group flex items-center gap-4 rounded-2xl p-6 shadow-sm transition hover:shadow-md"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "2px solid var(--border)",
                    borderLeftWidth: 6,
                    borderLeftColor: cat.color,
                    minHeight: "var(--hit)",
                  }}
                >
                  <span className="shrink-0 text-5xl" aria-hidden>{cat.emoji}</span>
                  <div className="flex-1">
                    <div
                      className="text-2xl font-bold leading-snug"
                      style={{ color: cat.color }}
                    >
                      {cat.name}
                    </div>
                    <div
                      className="mt-1 text-base font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {cat.subcategories.length} 項服務
                    </div>
                  </div>
                  <span
                    className="text-3xl font-light transition group-hover:translate-x-1"
                    style={{ color: cat.color }}
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 工具箱 ── */}
      <section className="px-6 py-14" style={{ background: "var(--bg-soft)" }}>
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-center text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            志工與家屬工具箱
          </h2>
          <p
            className="mt-2 text-center text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            陪伴長輩的實用指南，隨時帶著走
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* 互動圖卡 */}
            <Link
              href="/activities"
              className="group flex flex-col rounded-2xl p-8 shadow-sm transition hover:shadow-md"
              style={{
                background: "var(--bg-elevated)",
                border: "2px solid var(--border)",
                borderLeftWidth: 6,
                borderLeftColor: "var(--success)",
              }}
            >
              <span className="text-7xl">🃏</span>
              <h3
                className="mt-4 text-2xl font-bold"
                style={{ color: "var(--success)" }}
              >
                互動圖卡
              </h3>
              <p
                className="mt-2 text-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                步驟式大圖卡，帶領長輩做運動、手工藝、學數位工具
              </p>
              <span
                className="mt-4 text-lg font-semibold transition group-hover:translate-x-1"
                style={{ color: "var(--success)" }}
              >
                查看圖卡 →
              </span>
            </Link>

            {/* 溝通錦囊 */}
            <Link
              href="/scripts"
              className="group flex flex-col rounded-2xl p-8 shadow-sm transition hover:shadow-md"
              style={{
                background: "var(--bg-elevated)",
                border: "2px solid var(--border)",
                borderLeftWidth: 6,
                borderLeftColor: "var(--cta)",
              }}
            >
              <span className="text-7xl">💬</span>
              <h3
                className="mt-4 text-2xl font-bold"
                style={{ color: "var(--cta)" }}
              >
                溝通錦囊
              </h3>
              <p
                className="mt-2 text-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                真實對話示範，讓每一次互動都更有溫度，化解困難情境
              </p>
              <span
                className="mt-4 text-lg font-semibold transition group-hover:translate-x-1"
                style={{ color: "var(--cta)" }}
              >
                查看錦囊 →
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* ── 互助問答 ── */}
      <section className="px-6 py-14" style={{ background: "var(--bg-page)" }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            互助問答
          </h2>
          <p className="mt-2 text-center text-lg" style={{ color: "var(--text-secondary)" }}>
            有問題就發問，在地志工來解答
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Link
              href="/qa"
              className="group flex flex-col rounded-2xl p-8 shadow-sm transition hover:shadow-md"
              style={{
                background: "var(--bg-elevated)",
                border: "2px solid var(--border)",
                borderLeftWidth: 6,
                borderLeftColor: "#0369A1",
              }}
            >
              <span className="text-7xl">💬</span>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: "#0369A1" }}>
                瀏覽問答
              </h3>
              <p className="mt-2 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                看看其他人問過什麼，或搜尋在地資訊
              </p>
              <span
                className="mt-4 text-lg font-semibold transition group-hover:translate-x-1"
                style={{ color: "#0369A1" }}
              >
                進入問答 →
              </span>
            </Link>

            <Link
              href="/qa/ask"
              className="group flex flex-col rounded-2xl p-8 shadow-sm transition hover:shadow-md"
              style={{
                background: "var(--bg-elevated)",
                border: "2px solid var(--border)",
                borderLeftWidth: 6,
                borderLeftColor: "#7E22CE",
              }}
            >
              <span className="text-7xl">✋</span>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: "#7E22CE" }}>
                我要發問
              </h3>
              <p className="mt-2 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                「中壢哪裡有免費量血壓？」在地志工來回答
              </p>
              <span
                className="mt-4 text-lg font-semibold transition group-hover:translate-x-1"
                style={{ color: "#7E22CE" }}
              >
                立即發問 →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 今日新聞 ── */}
      <NewsSection />

      {/* ── 底部說明 ── */}
      <footer
        className="mt-auto px-6 py-8 text-center text-base"
        style={{ background: "var(--bg-soft)", color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}
      >
        由&nbsp;
        <span style={{ color: "var(--cta)", fontWeight: 600 }}>
          {siteConfig.contact.maintainer}
        </span>
        &nbsp;整理維護 · 資料如有錯誤歡迎回報
      </footer>
    </main>
  );
}
