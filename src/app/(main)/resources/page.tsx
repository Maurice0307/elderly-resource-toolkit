import { categories } from "@/config/categories";
import { ResourcesClient } from "./ResourcesClient";

export const metadata = { title: "資源查找" };

export default async function ResourcesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const validCat = categories.find((c) => c.slug === cat)?.slug ?? null;

  return (
    <div className="wv-fade">
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD" }}>
        <div className="wv-wrap" style={{ padding: "34px 28px 30px" }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#241F1B", letterSpacing: -0.5 }}>資源查找</h1>
          <p style={{ margin: "8px 0 0", fontSize: 17, color: "#574E47" }}>
            選分類，或直接打關鍵字。每筆都附「能打的電話」與「撥打前可以這樣說」。
          </p>
        </div>
      </div>
      <ResourcesClient categories={categories} initialCat={validCat} />
    </div>
  );
}
