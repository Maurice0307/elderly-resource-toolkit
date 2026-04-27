import Link from "next/link";
import { categories } from "@/config/categories";

export const metadata = { title: "生活資源" };

export default function ResourcesIndexPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-base text-blue-700 hover:underline"
          aria-label="回到首頁"
        >
          ← 回首頁
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">7 大生活資源</h1>
        <p className="mt-2 text-lg text-slate-600">
          選擇下方分類，查看全國與在地服務。
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/resources/${cat.slug}`}
                className="block rounded-2xl border-2 border-slate-200 bg-white p-6 transition hover:border-blue-500 hover:shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-300"
                style={{ borderLeftColor: cat.color, borderLeftWidth: 8 }}
              >
                <div className="text-2xl font-bold text-slate-900">
                  {cat.name}
                </div>
                <div className="mt-2 text-base text-slate-600">
                  {cat.subcategories.length} 項服務
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
