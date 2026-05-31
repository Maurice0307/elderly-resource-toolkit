import Link from "next/link";
import { categories } from "@/config/categories";
import { getUserRegionCode } from "@/lib/location/cookies";
import { getRegionByCode } from "@/lib/location/regions";
import { RegionPicker } from "@/components/location/RegionPicker";

export const metadata = { title: "生活資源" };

export default async function ResourcesIndexPage() {
  const regionCode = await getUserRegionCode();
  const regionInfo = regionCode ? await getRegionByCode(regionCode) : null;

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-lg font-medium"
          style={{ color: "var(--cta)" }}
          aria-label="回到首頁"
        >
          ← 回首頁
        </Link>

        <h1 className="mt-4 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          7 大生活資源
        </h1>

        {/* ── 地區選擇區塊 ──────────────────────────────────────────── */}
        {regionInfo ? (
          /* 已設定地區：顯示當前地區 + 換地區 */
          <div
            className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl px-6 py-4"
            style={{ background: "#ECFDF5", border: "2px solid #6EE7B7" }}
          >
            <span className="text-2xl">📍</span>
            <div className="flex-1">
              <p className="text-lg font-bold" style={{ color: "#065F46" }}>
                你的地區：{regionInfo.name}
              </p>
              <p className="text-base" style={{ color: "#065F46", opacity: 0.8 }}>
                以下分類將優先顯示此地區的在地資源
              </p>
            </div>
            <RegionPicker currentCode={regionInfo.code} currentName={regionInfo.name} />
          </div>
        ) : (
          /* 未設定地區：邀請設定 */
          <div
            className="mt-5 rounded-2xl px-6 py-5"
            style={{ background: "var(--bg-accent)", border: "2px dashed #FDE68A" }}
          >
            <p className="text-2xl font-bold" style={{ color: "#92400E" }}>
              📍 你在哪裡？
            </p>
            <p className="mt-1 text-xl" style={{ color: "#92400E", opacity: 0.85 }}>
              設定地區後，可以看到你附近的在地服務資源
            </p>
            <div className="mt-4">
              <RegionPicker currentCode={null} currentName={null} />
            </div>
          </div>
        )}

        {/* ── 分類卡片 ──────────────────────────────────────────────── */}
        <p className="mt-8 text-xl" style={{ color: "var(--text-secondary)" }}>
          選擇你需要的服務類型：
        </p>

        <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="text-2xl font-bold" style={{ color: cat.color }}>
                    {cat.name}
                  </div>
                  <div className="mt-1 text-base" style={{ color: "var(--text-muted)" }}>
                    {cat.subcategories.length} 項服務
                  </div>
                  {regionInfo && (
                    <div
                      className="mt-1 rounded-full px-2 py-0.5 text-sm font-medium inline-block"
                      style={{ background: "#ECFDF5", color: "#065F46" }}
                    >
                      含 {regionInfo.name} 在地資源
                    </div>
                  )}
                </div>
                <span
                  className="text-3xl transition group-hover:translate-x-1"
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
    </main>
  );
}
