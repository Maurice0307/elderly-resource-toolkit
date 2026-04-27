"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Post question ─────────────────────────────────────────────────────

export async function postQuestion(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const body = (formData.get("body") as string | null)?.trim() ?? "";
  const regionId = (formData.get("region_id") as string | null) || null;
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";
  const tags = tagsRaw
    ? tagsRaw.split(/[,\s]+/).map((t) => t.replace(/^#/, "").trim()).filter(Boolean)
    : [];

  if (!title) return { error: "請填寫問題標題" };

  const { data, error } = await supabase
    .from("questions")
    .insert({ user_id: user.id, title, body: body || null, region_id: regionId, tags })
    .select("id")
    .single();

  if (error) return { error: "發問失敗，請稍後再試" };
  redirect(`/qa/${data.id}`);
}

// ── Post answer ───────────────────────────────────────────────────────

export async function postAnswer(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const questionId = formData.get("question_id") as string;
  const body = (formData.get("body") as string | null)?.trim() ?? "";

  if (!body) return { error: "請填寫回答內容" };

  const { error } = await supabase
    .from("answers")
    .insert({ question_id: questionId, user_id: user.id, body });

  if (error) return { error: "回答失敗，請稍後再試" };
  revalidatePath(`/qa/${questionId}`);
  return { error: "" };
}

// ── Toggle upvote ─────────────────────────────────────────────────────

export async function toggleVote(answerId: string, questionId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("answer_votes")
    .select("answer_id")
    .eq("answer_id", answerId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("answer_votes")
      .delete()
      .eq("answer_id", answerId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("answer_votes").insert({ answer_id: answerId, user_id: user.id });
  }
  revalidatePath(`/qa/${questionId}`);
}

// ── Accept answer ─────────────────────────────────────────────────────

export async function acceptAnswer(
  answerId: string,
  questionId: string,
  currentAccepted: string | null,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify current user owns the question
  const { data: q } = await supabase
    .from("questions")
    .select("user_id")
    .eq("id", questionId)
    .single();
  if (q?.user_id !== user.id) return;

  const isTogglingOff = currentAccepted === answerId;

  if (!isTogglingOff && currentAccepted) {
    // un-accept previous
    await supabase.from("answers").update({ is_accepted: false }).eq("id", currentAccepted);
  }

  await supabase
    .from("answers")
    .update({ is_accepted: !isTogglingOff })
    .eq("id", answerId);

  await supabase
    .from("questions")
    .update({
      accepted_answer_id: isTogglingOff ? null : answerId,
      status: isTogglingOff ? "open" : "resolved",
    })
    .eq("id", questionId);

  revalidatePath(`/qa/${questionId}`);
}
