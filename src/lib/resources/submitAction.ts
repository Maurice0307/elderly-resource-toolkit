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
  const regionId      = (formData.get("region_id") as string) || null;
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
  if (scope === "local" && !regionId) return { error: "在地服務請選擇地區" };

  const { error } = await supabase.from("resources").insert({
    name,
    subcategory_id: subcategoryId,
    scope,
    region_id:    scope === "local" ? regionId : null,
    summary,
    description,
    phone,
    address,
    website_url:  websiteUrl,
    source_org:   sourceOrg,
    tags,
    status:       "pending",
    submitted_by: user.id,
  });

  if (error) return { error: error.message };
  redirect("/submit/thanks");
}
