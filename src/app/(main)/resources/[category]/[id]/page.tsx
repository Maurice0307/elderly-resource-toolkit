import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/config/categories";
import { CallButton } from "@/components/resources/CallButton";
import { MapButton } from "@/components/resources/MapButton";
import { ShareCardButton } from "@/components/resources/ShareCardButton";
import { LikeButton } from "@/components/resources/LikeButton";
import { FeedbackForm } from "@/components/resources/FeedbackForm";
import { LineShareButton } from "@/components/liff/LineShareButton";
import { getResourceById } from "@/lib/resources/queries";
import { createClient } from "@/lib/supabase/server";

type Params = { category: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const resource = await getResourceById(id);
  return { title: resource?.name ?? "資源詳情" };
}

export default async function ResourcePage({ params }: { params: Promise<Params> }) {
  const { category, id } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const resource = await getResourceById(id);
  if (!resource) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialLiked = false;
  if (user) {
    const { data } = await supabase
      .from("resource_likes")
      .select("id")
      .eq("resource_id", resource.id)
      .eq("user_id", user.id)
      .maybeSingle();
    initialLiked = !!data;
  }

  const sub = Array.isArray(resource.subcategory) ? resource.subcategory[0] : resource.subcategory;
  const reg = Array.isArray(resource.region) ? resource.region[0] : resource.region;

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-3xl">

        {/* 返回 */}
        <Link
          href={`/resources/${cat.slug}`}
          className="inline-flex items-center gap-1 text-lg font-medium"
          style={{ color: "var(--cta)" }}
        >
          ← 回到{cat.name}
        </Link>

        {/* 標頭 */}
        <header className="mt-5">
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-4 py-1 text-base font-semibold"
              style={
                resource.scope === "national"
                  ? { background: "var(--bg-accent)", color: "#92400E" }
                  : { background: "var(--success-soft)", color: "#065F46" }
              }
            >
              {resource.scope === "national" ? "全國" : "在地"}
            </span>
            {reg ? (
              <span
                className="rounded-full px-4 py-1 text-base"
                style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
              >
                {reg.name}
              </span>
            ) : null}
            {sub ? (
              <span
                className="rounded-full px-4 py-1 text-base"
                style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
              >
                {sub.name}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-4xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            {resource.name}
          </h1>
          {resource.summary ? (
            <p className="mt-3 text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {resource.summary}
            </p>
          ) : null}
        </header>

        {/* 行動按鈕 */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {resource.phone ? (
            <CallButton
              phone={resource.phone}
              phoneHint={resource.phone_hint}
              resourceName={resource.name}
            />
          ) : null}
          <MapButton
            address={resource.address}
            latitude={resource.latitude}
            longitude={resource.longitude}
            resourceName={resource.name}
          />
          <ShareCardButton
            resource={{
              name: resource.name,
              summary: resource.summary,
              phone: resource.phone,
              address: resource.address,
              website_url: resource.website_url,
            }}
          />
          <LineShareButton
            resourceName={resource.name}
            resourceUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://elderly-resource-toolkit.vercel.app"}/resources/${category}/${id}`}
          />
        </section>

        {/* 詳細說明 */}
        {resource.description ? (
          <section
            className="mt-8 rounded-2xl p-7 text-xl leading-relaxed whitespace-pre-line"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            {resource.description}
          </section>
        ) : null}

        {/* 聯絡資訊 */}
        <section className="mt-6 space-y-4 text-lg" style={{ color: "var(--text-secondary)" }}>
          {resource.address ? (
            <div className="flex gap-2">
              <span className="icon-lg">📍</span>
              <span>{resource.address}</span>
            </div>
          ) : null}
          {resource.website_url ? (
            <div className="flex gap-2">
              <span className="icon-lg">🔗</span>
              <a
                href={resource.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline"
                style={{ color: "var(--cta)" }}
              >
                {resource.website_url}
              </a>
            </div>
          ) : null}
          {resource.source_org ? (
            <p className="text-base" style={{ color: "var(--text-muted)" }}>
              資料來源：{resource.source_org}
            </p>
          ) : null}
        </section>

        {/* 標籤 */}
        {resource.tags && resource.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {(resource.tags as string[]).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-base font-medium"
                style={{ background: "var(--bg-accent)", color: "#92400E" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* 互動：按讚 + 回報 */}
        <div
          className="mt-10 flex flex-wrap gap-4 border-t pt-8"
          style={{ borderColor: "var(--border)" }}
        >
          <LikeButton
            resourceId={resource.id}
            initialCount={resource.like_count}
            initialLiked={initialLiked}
            userId={user?.id ?? null}
          />
          <FeedbackForm
            resourceId={resource.id}
            userId={user?.id ?? null}
          />
        </div>
      </div>
    </main>
  );
}
