import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function verifyToken(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_API_TOKEN;
  return !!expected && token === expected;
}

type RowInput = {
  id?: string;
  subcategory_slug: string;
  category_slug: string;
  scope: string;
  region_code?: string;
  name: string;
  summary?: string;
  description?: string;
  phone?: string;
  phone_hint?: string;
  address?: string;
  website_url?: string;
  identity_tags?: string;
  tags?: string;
  source_org?: string;
  status?: string;
};

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rows: RowInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { rows } = body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Build lookup maps for subcategories and regions
  const [{ data: subcats }, { data: regions }] = await Promise.all([
    admin
      .from("subcategories")
      .select("id, slug, category_id, categories(slug)"),
    admin.from("regions").select("id, code"),
  ]);

  const subcatMap: Record<string, string> = {};
  for (const s of subcats ?? []) {
    const cat = s.categories as { slug: string } | null;
    if (cat?.slug) subcatMap[`${cat.slug}:${s.slug}`] = s.id;
  }
  const regionMap: Record<string, string> = {};
  for (const r of regions ?? []) regionMap[r.code] = r.id;

  const results = { inserted: 0, updated: 0, errors: [] as string[] };

  for (const row of rows) {
    if (!row.name?.trim()) continue;

    const subcatId = subcatMap[`${row.category_slug}:${row.subcategory_slug}`];
    if (!subcatId) {
      results.errors.push(`找不到子分類：${row.category_slug}/${row.subcategory_slug}（${row.name}）`);
      continue;
    }

    const scope = row.scope === "national" ? "national" : "local";
    const regionId = row.region_code ? (regionMap[row.region_code] ?? null) : null;
    if (scope === "local" && !regionId) {
      results.errors.push(`在地資源缺少有效地區代碼：${row.name}（${row.region_code}）`);
      continue;
    }

    const payload = {
      subcategory_id: subcatId,
      scope,
      region_id: scope === "local" ? regionId : null,
      name: row.name.trim(),
      summary: row.summary?.trim() || null,
      description: row.description?.trim() || null,
      phone: row.phone?.trim() || null,
      phone_hint: row.phone_hint?.trim() || null,
      address: row.address?.trim() || null,
      website_url: row.website_url?.trim() || null,
      identity_tags: row.identity_tags
        ? row.identity_tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      tags: row.tags
        ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      source_org: row.source_org?.trim() || null,
      status: row.status || "active",
    };

    if (row.id) {
      const { error } = await admin
        .from("resources")
        .update(payload)
        .eq("id", row.id);
      if (error) results.errors.push(`更新失敗「${row.name}」：${error.message}`);
      else results.updated++;
    } else {
      const { error } = await admin.from("resources").insert(payload);
      if (error) results.errors.push(`新增失敗「${row.name}」：${error.message}`);
      else results.inserted++;
    }
  }

  revalidatePath("/admin/resources");
  revalidatePath("/resources");

  return NextResponse.json({ ok: true, ...results });
}
