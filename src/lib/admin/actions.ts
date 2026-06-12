"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "user";
  if (role !== "moderator" && role !== "admin") redirect("/");
  return { userId: user.id, role };
}

// ── Resource moderation ────────────────────────────────────────────────

export async function updateAndApproveResource(
  resourceId: string,
  fields: {
    name: string;
    summary: string;
    description: string;
    phone: string;
    address: string;
    website_url: string;
    tags: string[];
  },
) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin
    .from("resources")
    .update({
      name: fields.name || undefined,
      summary: fields.summary || null,
      description: fields.description || null,
      phone: fields.phone || null,
      address: fields.address || null,
      website_url: fields.website_url || null,
      tags: fields.tags,
      status: "active",
    })
    .eq("id", resourceId);
  revalidatePath("/admin/resources");
}

export async function approveResource(resourceId: string) {
  const { userId } = await assertAdmin();
  const admin = createAdminClient();
  await admin
    .from("resources")
    .update({ status: "active", approved_at: new Date().toISOString(), approved_by: userId })
    .eq("id", resourceId);
  revalidatePath("/admin/resources");
}

export async function rejectResource(resourceId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("resources").update({ status: "archived" }).eq("id", resourceId);
  revalidatePath("/admin/resources");
}

export async function markResourceEnded(resourceId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("resources").update({ status: "ended" }).eq("id", resourceId);
  revalidatePath("/admin/resources");
}

// ── Q&A moderation ─────────────────────────────────────────────────────

export async function hideQuestion(questionId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("questions").update({ status: "hidden" }).eq("id", questionId);
  revalidatePath("/admin/questions");
}

export async function restoreQuestion(questionId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("questions").update({ status: "open" }).eq("id", questionId);
  revalidatePath("/admin/questions");
}

export async function deleteAnswer(answerId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("answers").delete().eq("id", answerId);
  revalidatePath("/admin/questions");
}

// 管理員查證後設定最佳解答（不受發問者本人限制）→ 同時把問題標記為已解決
export async function adminSetBestAnswer(questionId: string, answerId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { data: q } = await admin.from("questions").select("accepted_answer_id").eq("id", questionId).single();
  const prev = (q?.accepted_answer_id as string | null) ?? null;
  if (prev && prev !== answerId) {
    await admin.from("answers").update({ is_accepted: false }).eq("id", prev);
  }
  await admin.from("answers").update({ is_accepted: true }).eq("id", answerId);
  await admin.from("questions").update({ accepted_answer_id: answerId, status: "resolved" }).eq("id", questionId);
  revalidatePath("/admin/questions");
  revalidatePath(`/qa/${questionId}`);
}

// 取消最佳解答 → 問題回到待查證
export async function adminUnsetBestAnswer(questionId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { data: q } = await admin.from("questions").select("accepted_answer_id").eq("id", questionId).single();
  const prev = (q?.accepted_answer_id as string | null) ?? null;
  if (prev) await admin.from("answers").update({ is_accepted: false }).eq("id", prev);
  await admin.from("questions").update({ accepted_answer_id: null, status: "open" }).eq("id", questionId);
  revalidatePath("/admin/questions");
  revalidatePath(`/qa/${questionId}`);
}

// ── News moderation ────────────────────────────────────────────────────

export async function hideNews(newsId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("daily_news").update({ status: "hidden" }).eq("id", newsId);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function restoreNews(newsId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("daily_news").update({ status: "active" }).eq("id", newsId);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function deleteNews(newsId: string) {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");
  const admin = createAdminClient();
  await admin.from("daily_news").delete().eq("id", newsId);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

// ── Resource CRUD (admin full control) ────────────────────────────────────────

export async function deleteResource(resourceId: string) {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");
  const admin = createAdminClient();
  const { error } = await admin.from("resources").delete().eq("id", resourceId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
}

// 批次刪除（超級管理員限定）
export async function deleteResources(ids: string[]) {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");
  if (!ids || ids.length === 0) return;
  const admin = createAdminClient();
  const { error } = await admin.from("resources").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
}

// 批次改狀態（moderator 以上）— 用於批次上架/結束/封存
export async function setResourcesStatus(ids: string[], status: "active" | "ended" | "archived") {
  await assertAdmin();
  if (!ids || ids.length === 0) return;
  const admin = createAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === "active") patch.approved_at = new Date().toISOString();
  const { error } = await admin.from("resources").update(patch).in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
}

export async function createResourceAdmin(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const scope = (formData.get("scope") as string) || "local";
  const identityTags = formData.getAll("identity_tags") as string[];
  const tagsRaw = (formData.get("tags") as string) ?? "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const { error } = await admin.from("resources").insert({
    subcategory_id: formData.get("subcategory_id") as string,
    scope,
    region_id: scope === "local" ? ((formData.get("region_id") as string) || null) : null,
    name: formData.get("name") as string,
    summary: (formData.get("summary") as string) || null,
    description: (formData.get("description") as string) || null,
    phone: (formData.get("phone") as string) || null,
    phone_hint: (formData.get("phone_hint") as string) || null,
    address: (formData.get("address") as string) || null,
    website_url: (formData.get("website_url") as string) || null,
    identity_tags: identityTags,
    tags,
    source_org: (formData.get("source_org") as string) || null,
    status: (formData.get("status") as string) || "active",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  redirect("/admin/resources?status=active");
}

export async function updateResourceAdmin(resourceId: string, formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const scope = (formData.get("scope") as string) || "local";
  const identityTags = formData.getAll("identity_tags") as string[];
  const tagsRaw = (formData.get("tags") as string) ?? "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const { error } = await admin
    .from("resources")
    .update({
      subcategory_id: formData.get("subcategory_id") as string,
      scope,
      region_id: scope === "local" ? ((formData.get("region_id") as string) || null) : null,
      name: formData.get("name") as string,
      summary: (formData.get("summary") as string) || null,
      description: (formData.get("description") as string) || null,
      phone: (formData.get("phone") as string) || null,
      phone_hint: (formData.get("phone_hint") as string) || null,
      address: (formData.get("address") as string) || null,
      website_url: (formData.get("website_url") as string) || null,
      identity_tags: identityTags,
      tags,
      source_org: (formData.get("source_org") as string) || null,
      status: (formData.get("status") as string) || "active",
    })
    .eq("id", resourceId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  redirect("/admin/resources?status=active");
}

// ── CSV 批量匯入（依名稱比對分類與地區） ──────────────────────────────
export type ImportRow = { name: string; type: string; location: string; content: string; phone?: string; website?: string };

const norm = (s: string) => (s ?? "").replace(/台/g, "臺").replace(/\s+/g, "").trim();

export async function importResources(rows: ImportRow[]): Promise<{ inserted: number; errors: string[] }> {
  await assertAdmin();
  const admin = createAdminClient();
  const out = { inserted: 0, errors: [] as string[] };
  if (!rows || rows.length === 0) return out;

  // 比對用：子分類（含母分類名）、母分類→第一個子分類、地區
  const [{ data: subcats }, { data: cats }, { data: regions }] = await Promise.all([
    admin.from("subcategories").select("id, name, category_id"),
    admin.from("categories").select("id, name"),
    admin.from("regions").select("id, name, parent_id"),
  ]);
  const subcatByName: Record<string, string> = {};
  for (const s of subcats ?? []) subcatByName[norm(s.name)] = s.id;
  const catIdByName: Record<string, string> = {};
  for (const c of cats ?? []) catIdByName[norm(c.name)] = c.id;
  const firstSubcatOfCat: Record<string, string> = {};
  for (const s of subcats ?? []) if (!firstSubcatOfCat[s.category_id]) firstSubcatOfCat[s.category_id] = s.id;
  const regionByName: Record<string, string> = {};
  for (const r of regions ?? []) regionByName[norm(r.name)] = r.id;

  const matchSubcat = (type: string): string | null => {
    const t = norm(type);
    if (subcatByName[t]) return subcatByName[t];
    if (catIdByName[t]) return firstSubcatOfCat[catIdByName[t]] ?? null;
    // 包含式比對（例如「醫療」→ 醫療健康）
    const sk = Object.keys(subcatByName).find((k) => k.includes(t) || t.includes(k));
    if (sk) return subcatByName[sk];
    const ck = Object.keys(catIdByName).find((k) => k.includes(t) || t.includes(k));
    if (ck) return firstSubcatOfCat[catIdByName[ck]] ?? null;
    return null;
  };
  const matchRegion = (loc: string): { regionId: string | null; national: boolean } => {
    const l = norm(loc);
    if (!l || /全國|全台|全臺|不限/.test(l)) return { regionId: null, national: true };
    if (regionByName[l]) return { regionId: regionByName[l], national: false };
    // 「桃園市中壢區」→ 取得行政區
    const rk = Object.keys(regionByName).find((k) => l.endsWith(k) || l.includes(k));
    if (rk) return { regionId: regionByName[rk], national: false };
    return { regionId: null, national: false };
  };

  const payloads: Record<string, unknown>[] = [];
  for (const row of rows) {
    const name = (row.name ?? "").trim();
    if (!name) continue;
    const subId = matchSubcat(row.type ?? "");
    if (!subId) { out.errors.push(`找不到對應分類：「${name}」的類型「${row.type}」`); continue; }
    const { regionId, national } = matchRegion(row.location ?? "");
    if (!national && !regionId) { out.errors.push(`找不到對應地區：「${name}」的地點「${row.location}」`); continue; }
    payloads.push({
      subcategory_id: subId,
      scope: national ? "national" : "local",
      region_id: national ? null : regionId,
      name,
      summary: (row.content ?? "").trim().slice(0, 100) || null,
      description: (row.content ?? "").trim() || null,
      phone: (row.phone ?? "").trim() || null,
      website_url: (row.website ?? "").trim() || null,
      status: "active",
      approved_at: new Date().toISOString(),
    });
  }

  if (payloads.length > 0) {
    const { error } = await admin.from("resources").insert(payloads);
    if (error) { out.errors.push(`寫入失敗：${error.message}`); return out; }
    out.inserted = payloads.length;
  }
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return out;
}

// ── User management (admin only) ───────────────────────────────────────

export async function setUserRole(targetUserId: string, role: "user" | "moderator" | "admin") {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");

  const admin = createAdminClient();
  await admin.from("profiles").update({ role }).eq("id", targetUserId);
  revalidatePath("/admin/users");
}

export async function assignModeratorRegion(moderatorId: string, regionId: string, assignedBy: string) {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");

  const admin = createAdminClient();
  await admin
    .from("region_moderators")
    .upsert({ user_id: moderatorId, region_id: regionId, assigned_by: assignedBy });
  revalidatePath("/admin/users");
}

export async function removeModeratorRegion(moderatorId: string, regionId: string) {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");

  const admin = createAdminClient();
  await admin
    .from("region_moderators")
    .delete()
    .eq("user_id", moderatorId)
    .eq("region_id", regionId);
  revalidatePath("/admin/users");
}
