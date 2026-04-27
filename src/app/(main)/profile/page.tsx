import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/config/categories";
import type { Resource } from "@/types/domain";

export const metadata = { title: "我的帳戶" };

type ResourceWithSub = Resource & {
  subcategory: { slug: string; name: string; categories: { slug: string } } | null;
};

const statusLabel: Record<string, { text: string; bg: string; color: string }> = {
  pending:  { text: "審核中",  bg: "#FEF3C7", color: "#92400E" },
  active:   { text: "已上架",  bg: "#ECFDF5", color: "#065F46" },
  ended:    { text: "已結束",  bg: "#F5F5F4", color: "#78716C" },
  archived: { text: "已封存",  bg: "#F5F5F4", color: "#78716C" },
};

function getCatSlug(row: ResourceWithSub): string {
  const sub = Array.isArray(row.subcategory) ? row.subcategory[0] : row.subcategory;
  return (sub?.categories as { slug: string } | undefined)?.slug ?? "";
}

function ResourceCard({
  r,
  catSlug,
  statusBadge,
}: {
  r: ResourceWithSub;
  catSlug: string;
  statusBadge?: { text: string; bg: string; color: string };
}) {
  const cat = categories.find((c) => c.slug === catSlug);
  return (
    <Link
      href={`/resources/${catSlug}/${r.id}`}
      className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
      style={{ border: "2px solid #E7E5E4" }}
    >
      {statusBadge && (
        <span
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-semibold"
          style={{ background: statusBadge.bg, color: statusBadge.color }}
        >
          {statusBadge.text}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {cat && (
          <span
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{ background: cat.color + "20", color: cat.color }}
          >
            {cat.name}
          </span>
        )}
        <span
          className="rounded-full px-3 py-1 text-sm"
          style={
            r.scope === "national"
              ? { background: "#FEF3C7", color: "#92400E" }
              : { background: "#ECFDF5", color: "#065F46" }
          }
        >
          {r.scope === "national" ? "全國" : "在地"}
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-bold leading-snug" style={{ color: "#1C1917" }}>
        {r.name}
      </h2>
      {r.summary && (
        <p className="mt-2 line-clamp-2 text-lg leading-relaxed" style={{ color: "#57534E" }}>
          {r.summary}
        </p>
      )}
      <span
        className="ml-auto mt-3 text-base font-semibold transition group-hover:translate-x-1"
        style={{ color: "#B45309" }}
      >
        查看 →
      </span>
    </Link>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-4 rounded-2xl p-8 text-center text-xl"
      style={{ background: "#FEF3C7", color: "#92400E", border: "2px dashed #FDE68A" }}
    >
      {children}
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "使用者";
  const initials = displayName.slice(0, 1).toUpperCase();

  const [{ data: likeRows }, { data: submittedData }] = await Promise.all([
    supabase
      .from("resource_likes")
      .select("resource:resources(*, subcategory:subcategories(slug, name, categories(slug)))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("resources")
      .select("*, subcategory:subcategories(slug, name, categories(slug))")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const likedResources = ((likeRows ?? []) as unknown as { resource: ResourceWithSub }[])
    .map((r) => r.resource)
    .filter(Boolean) as ResourceWithSub[];

  const submittedResources = (submittedData ?? []) as ResourceWithSub[];

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "#FFFBF5" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "#B45309" }}>
          ← 回首頁
        </Link>

        {/* 個人資訊 */}
        <div className="mt-6 flex items-center gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ background: "#B45309" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "#1C1917" }}>
              {displayName}
            </p>
            <p className="text-base" style={{ color: "#78716C" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* 我的收藏 */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold" style={{ color: "#1C1917" }}>
            ❤️ 我的收藏
            <span className="ml-2 text-lg font-normal" style={{ color: "#78716C" }}>
              ({likedResources.length})
            </span>
          </h2>
          {likedResources.length === 0 ? (
            <EmptyState>
              還沒有收藏的資源，去{" "}
              <Link href="/" style={{ textDecoration: "underline" }}>
                瀏覽
              </Link>{" "}
              看看吧！
            </EmptyState>
          ) : (
            <ul className="mt-4 space-y-4">
              {likedResources.map((r) => (
                <li key={r.id}>
                  <ResourceCard r={r} catSlug={getCatSlug(r)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 我的投稿 */}
        <section className="mt-12 pb-12">
          <h2 className="text-2xl font-bold" style={{ color: "#1C1917" }}>
            📮 我的投稿
            <span className="ml-2 text-lg font-normal" style={{ color: "#78716C" }}>
              ({submittedResources.length})
            </span>
          </h2>
          {submittedResources.length === 0 ? (
            <EmptyState>
              還沒有投稿過，{" "}
              <Link href="/submit" style={{ textDecoration: "underline" }}>
                立即投稿
              </Link>{" "}
              貢獻好資源！
            </EmptyState>
          ) : (
            <ul className="mt-4 space-y-4">
              {submittedResources.map((r) => (
                <li key={r.id}>
                  <ResourceCard
                    r={r}
                    catSlug={getCatSlug(r)}
                    statusBadge={statusLabel[r.status] ?? statusLabel.pending}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
