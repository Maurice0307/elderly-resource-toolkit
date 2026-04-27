import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StepViewer } from "@/components/activities/StepViewer";
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

  const groupLabel: Record<string, string> = {
    move: "動動生活",
    create: "創意生活",
    smart: "智慧生活",
  };

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "#FFFBF5" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/activities" className="text-lg font-medium" style={{ color: "#B45309" }}>
          ← 互動圖卡
        </Link>

        <header className="mt-5">
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-4 py-1 text-base font-semibold"
              style={{ background: "#FEF3C7", color: "#92400E" }}
            >
              {groupLabel[card.group_slug] ?? card.group_slug}
            </span>
            <span
              className="rounded-full px-4 py-1 text-base"
              style={{ background: "#F5F0E8", color: "#57534E" }}
            >
              {card.steps.length} 個步驟
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-6xl">{card.cover_emoji ?? "📋"}</span>
            <h1 className="text-4xl font-bold leading-tight" style={{ color: "#1C1917" }}>
              {card.title}
            </h1>
          </div>

          {card.summary ? (
            <p className="mt-3 text-xl leading-relaxed" style={{ color: "#44403C" }}>
              {card.summary}
            </p>
          ) : null}
        </header>

        <StepViewer steps={card.steps} cardTitle={card.title} />

        {card.tags.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-base font-medium"
                style={{ background: "#FEF3C7", color: "#92400E" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
