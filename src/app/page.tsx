import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { categories } from "@/config/categories";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">

      {/* ── Hero ── */}
      <section
        style={{ background: "linear-gradient(135deg, #92400E 0%, #B45309 60%, #D97706 100%)" }}
        className="px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-lg font-semibold tracking-widest"
            style={{ color: "#FDE68A" }}
          >
            {siteConfig.shortName}
          </p>
          <h1
            className="mt-4 text-4xl font-bold leading-tight sm:text-5xl"
            style={{ color: "#FFFBEB" }}
          >
            {siteConfig.name}
          </h1>
          <p
            className="mt-4 text-xl leading-relaxed"
            style={{ color: "#FDE68A" }}
          >
            中高齡者、家屬與志工的<br />全方位資源導航平台
          </p>

          {/* 語音搜尋 */}
          <button
            type="button"
            disabled
            aria-label="語音搜尋（開發中）"
            className="mt-10 inline-flex items-center justify-center gap-3 rounded-full px-12 py-6 text-2xl font-bold shadow-xl transition"
            style={{
              background: "#FFFBEB",
              color: "#92400E",
              cursor: "not-allowed",
              opacity: 0.95,
            }}
          >
            🎙&nbsp;按住說話
          </button>
          <p className="mt-4 text-base" style={{ color: "#FDE68A" }}>
            語音搜尋功能即將推出
          </p>

          <Link
            href="/submit"
            className="mt-6 inline-block rounded-full px-8 py-3 text-lg font-semibold transition"
            style={{ background: "rgba(255,255,255,0.15)", color: "#FDE68A", border: "1.5px solid rgba(253,230,138,0.5)" }}
          >
            📮 知道好資源？點此投稿
          </Link>
        </div>
      </section>

      {/* ── 7 大分類 ── */}
      <section className="px-6 py-14" style={{ background: "#FFFBF5" }}>
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-center text-3xl font-bold"
            style={{ color: "#1C1917" }}
          >
            我需要什麼幫助？
          </h2>
          <p
            className="mt-2 text-center text-lg"
            style={{ color: "#57534E" }}
          >
            點選下方分類，找到適合的資源
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/resources/${cat.slug}`}
                  className="group flex items-center gap-5 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                  style={{
                    border: `2px solid #E7E5E4`,
                    borderLeftWidth: 6,
                    borderLeftColor: cat.color,
                  }}
                >
                  <div className="flex-1">
                    <div
                      className="text-2xl font-bold leading-snug"
                      style={{ color: cat.color }}
                    >
                      {cat.name}
                    </div>
                    <div
                      className="mt-1 text-base font-medium"
                      style={{ color: "#78716C" }}
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
      <section className="px-6 py-14" style={{ background: "#F5F0E8" }}>
        <div className="mx-auto max-w-5xl">
          <h2
            className="text-center text-3xl font-bold"
            style={{ color: "#1C1917" }}
          >
            志工與家屬工具箱
          </h2>
          <p
            className="mt-2 text-center text-lg"
            style={{ color: "#57534E" }}
          >
            陪伴長輩的實用指南，隨時帶著走
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* 互動圖卡 */}
            <Link
              href="/activities"
              className="group flex flex-col rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-md"
              style={{ border: "2px solid #E7E5E4", borderLeftWidth: 6, borderLeftColor: "#15803D" }}
            >
              <span className="text-5xl">🃏</span>
              <h3
                className="mt-4 text-2xl font-bold"
                style={{ color: "#15803D" }}
              >
                互動圖卡
              </h3>
              <p
                className="mt-2 text-lg leading-relaxed"
                style={{ color: "#57534E" }}
              >
                步驟式大圖卡，帶領長輩做運動、手工藝、學數位工具
              </p>
              <span
                className="mt-4 text-lg font-semibold transition group-hover:translate-x-1"
                style={{ color: "#15803D" }}
              >
                查看圖卡 →
              </span>
            </Link>

            {/* 溝通錦囊 */}
            <Link
              href="/scripts"
              className="group flex flex-col rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-md"
              style={{ border: "2px solid #E7E5E4", borderLeftWidth: 6, borderLeftColor: "#B45309" }}
            >
              <span className="text-5xl">💬</span>
              <h3
                className="mt-4 text-2xl font-bold"
                style={{ color: "#B45309" }}
              >
                溝通錦囊
              </h3>
              <p
                className="mt-2 text-lg leading-relaxed"
                style={{ color: "#57534E" }}
              >
                真實對話示範，讓每一次互動都更有溫度，化解困難情境
              </p>
              <span
                className="mt-4 text-lg font-semibold transition group-hover:translate-x-1"
                style={{ color: "#B45309" }}
              >
                查看錦囊 →
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* ── 底部說明 ── */}
      <footer
        className="mt-auto px-6 py-8 text-center text-base"
        style={{ background: "#F5F0E8", color: "#78716C", borderTop: "1px solid #E7E5E4" }}
      >
        由&nbsp;
        <span style={{ color: "#92400E", fontWeight: 600 }}>
          {siteConfig.contact.maintainer}
        </span>
        &nbsp;整理維護 · 資料如有錯誤歡迎回報
      </footer>
    </main>
  );
}
