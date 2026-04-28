import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StepViewer } from "@/components/activities/StepViewer";
import { YouTubeEmbed } from "@/components/activities/YouTubeEmbed";
import type { ActivityCard } from "@/types/domain";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_cards")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.title ?? "互動圖卡" };
}

const groupLabel: Record<string, string> = {
  move: "動動生活",
  create: "創意生活",
  smart: "智慧生活",
  health: "健康知識",
  life: "生活技能",
};

export default async function ActivityDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_cards")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  const card = data as ActivityCard;

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/activities" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 互動圖卡
        </Link>

        <header className="mt-5">
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-4 py-1 text-base font-semibold"
              style={{ background: "var(--bg-accent)", color: "#92400E" }}
            >
              {groupLabel[card.group_slug] ?? card.group_slug}
            </span>
            <span
              className="rounded-full px-4 py-1 text-base"
              style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
            >
              {card.steps.length} 個步驟
            </span>
            {card.duration_min ? (
              <span
                className="rounded-full px-4 py-1 text-base"
                style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
              >
                ⏱ 約 {card.duration_min} 分鐘
              </span>
            ) : null}
          </div>

          {/* Hero 區：右上角放成品圖（手機改為上方） */}
          <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-7xl">{card.cover_emoji ?? "📋"}</span>
                <h1 className="text-4xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {card.title}
                </h1>
              </div>
              {card.summary ? (
                <p className="mt-3 text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {card.summary}
                </p>
              ) : null}
            </div>

            {card.hero_image_url ? (
              <div
                className="overflow-hidden rounded-2xl shadow-sm sm:w-44"
                style={{ border: "2px solid var(--border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.hero_image_url}
                  alt={`${card.title} — 成品預覽`}
                  className="block h-44 w-full object-cover"
                  loading="lazy"
                />
                <div
                  className="px-3 py-1 text-center text-sm font-medium"
                  style={{ background: "var(--bg-accent)", color: "#92400E" }}
                >
                  成品預覽
                </div>
              </div>
            ) : null}
          </div>
        </header>

        {/* 整體教學影片（若有；步驟內也可有更細的影片） */}
        {card.video_url ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              <span className="icon-lg mr-2">🎬</span>完整教學影片
            </h2>
            <div className="mt-3">
              <YouTubeEmbed url={card.video_url} title={card.title} />
            </div>
          </section>
        ) : null}

        <StepViewer steps={card.steps} cardTitle={card.title} />

        {card.tags.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {card.tags.map((tag) => (
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

        {/* 資料來源 */}
        {card.source_url || card.source_org ? (
          <footer
            className="mt-10 rounded-2xl px-5 py-4"
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border)" }}
          >
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              <span className="icon-lg mr-1">📚</span>資料來源：
              {card.source_url ? (
                <a
                  href={card.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                  style={{ color: "var(--cta)" }}
                >
                  {card.source_org ?? card.source_url}
                </a>
              ) : (
                <span className="font-semibold" style={{ color: "var(--cta)" }}>
                  {card.source_org}
                </span>
              )}
            </p>
          </footer>
        ) : null}
      </div>
    </main>
  );
}
