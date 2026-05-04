import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function verifyToken(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  const expected = process.env.ADMIN_API_TOKEN;
  return !!expected && token === expected;
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: resources, error } = await admin
    .from("resources")
    .select(
      "id, name, summary, description, phone, phone_hint, address, website_url, scope, status, identity_tags, tags, source_org, subcategory_id, region_id"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const subcatIds = [
    ...new Set((resources ?? []).map((r) => r.subcategory_id).filter(Boolean)),
  ] as string[];
  const regionIds = [
    ...new Set((resources ?? []).map((r) => r.region_id).filter(Boolean)),
  ] as string[];

  const [{ data: subcats }, { data: regions }] = await Promise.all([
    admin.from("subcategories").select("id, name, slug, category_id").in("id", subcatIds),
    admin.from("regions").select("id, name, code").in("id", regionIds),
  ]);

  const catIds = [
    ...new Set((subcats ?? []).map((s) => s.category_id).filter(Boolean)),
  ] as string[];
  const { data: cats } = await admin
    .from("categories")
    .select("id, name, slug")
    .in("id", catIds);

  const subcatMap = Object.fromEntries((subcats ?? []).map((s) => [s.id, s]));
  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c]));
  const regionMap = Object.fromEntries((regions ?? []).map((r) => [r.id, r]));

  const data = (resources ?? []).map((r) => {
    const subcat = subcatMap[r.subcategory_id ?? ""];
    const cat = subcat ? catMap[subcat.category_id] : null;
    const region = regionMap[r.region_id ?? ""];
    return {
      id: r.id,
      category: cat?.name ?? "",
      category_slug: cat?.slug ?? "",
      subcategory: subcat?.name ?? "",
      subcategory_slug: subcat?.slug ?? "",
      scope: r.scope,
      region: region?.name ?? "",
      region_code: region?.code ?? "",
      name: r.name,
      summary: r.summary ?? "",
      description: r.description ?? "",
      phone: r.phone ?? "",
      phone_hint: r.phone_hint ?? "",
      address: r.address ?? "",
      website_url: r.website_url ?? "",
      identity_tags: ((r.identity_tags as string[]) ?? []).join(","),
      tags: ((r.tags as string[]) ?? []).join(","),
      source_org: r.source_org ?? "",
      status: r.status,
    };
  });

  return NextResponse.json({ ok: true, count: data.length, data });
}
