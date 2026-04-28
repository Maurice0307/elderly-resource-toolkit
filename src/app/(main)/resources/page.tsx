import Link from "next/link";
import { categories } from "@/config/categories";

export const metadata = { title: "生活資源" };

export default function ResourcesIndexPage() {
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
        <p className="mt-2 text-xl" style={{ color: "var(--text-secondary)" }}>
          選擇下方分類，查看全國與在地服務。
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
                <div className="flex-1">
                  <div className="text-2xl font-bold" style={{ color: cat.color }}>
                    {cat.name}
                  </div>
                  <div className="mt-1 text-base" style={{ color: "var(--text-muted)" }}>
                    {cat.subcategories.length} 項服務
                  </div>
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
