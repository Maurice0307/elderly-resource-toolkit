import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScriptDialog } from "@/components/scripts/ScriptDialog";
import type { CommunicationScript } from "@/types/domain";

type Params = { slug: string };

const audienceLabel: Record<string, string> = {
  volunteer: "志工篇",
  family:    "家屬篇",
  difficult: "困難情境",
};

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("communication_scripts")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.title ?? "溝通錦囊" };
}

export default async function ScriptDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communication_scripts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  const script = data as CommunicationScript;

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/scripts" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 溝通錦囊
        </Link>

        <header className="mt-5">
          <span
            className="rounded-full px-4 py-1 text-base font-semibold"
            style={{ background: "var(--bg-accent)", color: "#92400E" }}
          >
            {audienceLabel[script.audience] ?? script.audience}
          </span>

          <h1 className="mt-4 text-4xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            {script.title}
          </h1>

          {script.context ? (
            <p className="mt-3 text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {script.context}
            </p>
          ) : null}
        </header>

        <ScriptDialog
          okExamples={script.ok_examples}
          ngExamples={script.ng_examples}
          tips={script.tips}
        />

        {script.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {script.tags.map((tag) => (
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
      </div>
    </main>
  );
}
