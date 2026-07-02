import { categories } from "@/config/categories";
import { createClient } from "@/lib/supabase/server";
import { ResourcesClient } from "./ResourcesClient";

export const metadata = { title: "資源查找" };

export default async function ResourcesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const validCat = categories.find((c) => c.slug === cat)?.slug ?? null;

  // 從 DB 撈真實子分類（名稱與設定檔不同步，篩選要用實際資料）
  const supabase = await createClient();
  const [{ data: catRows }, { data: subRows }] = await Promise.all([
    supabase.from("categories").select("id, slug"),
    supabase.from("subcategories").select("id, name, category_id"),
  ]);
  const slugById: Record<string, string> = {};
  for (const c of catRows ?? []) slugById[c.id] = c.slug;
  const subcatsByCat: Record<string, { id: string; name: string }[]> = {};
  for (const s of subRows ?? []) {
    const slug = slugById[s.category_id];
    if (!slug) continue;
    (subcatsByCat[slug] ??= []).push({ id: s.id, name: s.name });
  }

  return (
    <div className="wv-fade">
      <div className="wv-desktop-only" style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD" }}>
        <div className="wv-wrap" style={{ padding: "34px 28px 30px" }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#241F1B", letterSpacing: -0.5 }}>資源查找</h1>
          <p style={{ margin: "8px 0 0", fontSize: 17, color: "#574E47" }}>
            選分類，或直接打關鍵字。每筆都附「能打的電話」與「撥打前可以這樣說」。
          </p>
        </div>
      </div>
      <ResourcesClient categories={categories} subcatsByCat={subcatsByCat} initialCat={validCat} />
    </div>
  );
}
