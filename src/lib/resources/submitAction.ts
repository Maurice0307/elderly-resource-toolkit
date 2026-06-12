"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SubmitState = { error: string } | null;

export async function submitResource(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "請先登入才能投稿" };

  const name          = (formData.get("name") as string).trim();
  const subcategoryId = formData.get("subcategory_id") as string;
  const scope         = formData.get("scope") as "national" | "local";
  // 多選地區：每個已選縣市/行政區一個 region_ids；相容舊的單一 region_id
  const regionIds     = [
    ...new Set([
      ...(formData.getAll("region_ids") as string[]),
      ...(formData.get("region_id") ? [formData.get("region_id") as string] : []),
    ].filter(Boolean)),
  ];
  const summary       = (formData.get("summary") as string).trim()     || null;
  const description   = (formData.get("description") as string).trim() || null;
  const phone         = (formData.get("phone") as string).trim()       || null;
  const address       = (formData.get("address") as string).trim()     || null;
  const websiteUrl    = (formData.get("website_url") as string).trim() || null;
  const sourceOrg     = (formData.get("source_org") as string).trim()  || null;
  const tagsRaw       = (formData.get("tags") as string).trim();
  const tags          = tagsRaw ? tagsRaw.split(/[,，\s]+/).filter(Boolean) : [];

  if (!name)          return { error: "請填入機構或服務名稱" };
  if (!subcategoryId) return { error: "請選擇服務類別" };
  if (scope === "local" && regionIds.length === 0) return { error: "在地服務請至少選擇一個縣市" };

  const common = {
    name,
    subcategory_id: subcategoryId,
    scope,
    summary,
    description,
    phone,
    address,
    website_url:  websiteUrl,
    source_org:   sourceOrg,
    tags,
    status:       "pending" as const,
    submitted_by: user.id,
  };

  // 在地：每個選取的地區各建一筆待審資源；全國：一筆（region 為空）
  const rows = scope === "local"
    ? regionIds.map((rid) => ({ ...common, region_id: rid }))
    : [{ ...common, region_id: null }];

  const { error } = await supabase.from("resources").insert(rows);

  if (error) return { error: error.message };
  redirect("/submit/thanks");
}
