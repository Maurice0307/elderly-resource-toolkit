import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function escapeCsv(val: unknown): string {
  const s = String(val ?? "").replace(/\r?\n/g, " ");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  // Auth: require moderator or admin via session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? "user";
  if (role !== "moderator" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const statusFilter = searchParams.get("status") ?? "";
  const catFilter    = searchParams.get("cat") ?? "";
  const regFilter    = searchParams.get("reg") ?? "";   // county id
  const distFilter   = searchParams.get("dist") ?? "";  // district id

  const admin = createAdminClient();

  // Resolve category → subcategory IDs
  let subcatFilterIds: string[] | null = null;
  if (catFilter) {
    const { data: catRow } = await admin.from("categories").select("id").eq("slug", catFilter).single();
    if (catRow) {
      const { data: subs } = await admin.from("subcategories").select("id").eq("category_id", catRow.id);
      subcatFilterIds = (subs ?? []).map((s) => s.id);
    }
  }

  // Resolve county → district IDs for cascading filter
  let regionFilterIds: string[] | null = null;
  if (distFilter) {
    regionFilterIds = [distFilter];
  } else if (regFilter) {
    const { data: dists } = await admin.from("regions").select("id").eq("parent_id", regFilter);
    regionFilterIds = [regFilter, ...(dists ?? []).map((d) => d.id)];
  }

  // Main query
  let query = admin
    .from("resources")
    .select("id, name, summary, description, phone, phone_hint, address, website_url, scope, status, identity_tags, tags, source_org, source_url, created_at, subcategory_id, region_id")
    .order("created_at", { ascending: false });

  // 若帶 ids（批次匯出選取的項目），優先用 ids，忽略其他篩選
  const idsParam = (searchParams.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (idsParam.length > 0) {
    query = query.in("id", idsParam);
  } else {
    if (statusFilter) query = query.eq("status", statusFilter);
    if (subcatFilterIds && subcatFilterIds.length > 0) query = query.in("subcategory_id", subcatFilterIds);
    if (regionFilterIds && regionFilterIds.length > 0) query = query.in("region_id", regionFilterIds);
  }

  const { data: resources, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Lookup subcategory + category names
  const subcatIds = [...new Set((resources ?? []).map((r) => r.subcategory_id).filter(Boolean))] as string[];
  const regionIds = [...new Set((resources ?? []).map((r) => r.region_id).filter(Boolean))] as string[];

  const [{ data: subcats }, { data: regions }] = await Promise.all([
    subcatIds.length > 0
      ? admin.from("subcategories").select("id, name, slug, category_id").in("id", subcatIds)
      : Promise.resolve({ data: [] }),
    regionIds.length > 0
      ? admin.from("regions").select("id, name, code, level, parent_id").in("id", regionIds)
      : Promise.resolve({ data: [] }),
  ]);

  const catIds = [...new Set((subcats ?? []).map((s) => s.category_id).filter(Boolean))] as string[];
  const { data: cats } = catIds.length > 0
    ? await admin.from("categories").select("id, name, slug").in("id", catIds)
    : { data: [] };

  const subcatMap = Object.fromEntries((subcats ?? []).map((s) => [s.id, s]));
  const catMap    = Object.fromEntries((cats ?? []).map((c) => [c.id, c]));
  const regionMap = Object.fromEntries((regions ?? []).map((r) => [r.id, r]));

  // Build parent region name for display (county name for district resources)
  const parentIds = [...new Set((regions ?? []).filter(r => r.parent_id).map(r => r.parent_id))] as string[];
  const { data: parentRegions } = parentIds.length > 0
    ? await admin.from("regions").select("id, name").in("id", parentIds)
    : { data: [] };
  const parentMap = Object.fromEntries((parentRegions ?? []).map((r) => [r.id, r.name]));

  // Assemble rows
  const HEADERS = [
    "subcategory_slug", "category_slug", "subcategory_name", "category_name",
    "scope", "region_display", "region_code",
    "name", "summary", "description",
    "phone", "phone_hint", "address", "website_url",
    "identity_tags", "tags", "source_org", "source_url", "status", "id",
  ];

  const rows = (resources ?? []).map((r) => {
    const subcat = subcatMap[r.subcategory_id ?? ""];
    const cat    = subcat ? catMap[subcat.category_id] : null;
    const region = regionMap[r.region_id ?? ""];
    const parentName = region?.parent_id ? (parentMap[region.parent_id] ?? "") : "";
    const regionDisplay = region
      ? (parentName ? `${parentName} ${region.name}` : region.name)
      : "";

    return {
      subcategory_slug: subcat?.slug ?? "",
      category_slug:    cat?.slug ?? "",
      subcategory_name: subcat?.name ?? "",
      category_name:    cat?.name ?? "",
      scope:            r.scope ?? "",
      region_display:   regionDisplay,
      region_code:      region?.code ?? "",
      name:             r.name ?? "",
      summary:          r.summary ?? "",
      description:      r.description ?? "",
      phone:            r.phone ?? "",
      phone_hint:       r.phone_hint ?? "",
      address:          r.address ?? "",
      website_url:      r.website_url ?? "",
      identity_tags:    ((r.identity_tags as string[]) ?? []).join(","),
      tags:             ((r.tags as string[]) ?? []).join(","),
      source_org:       r.source_org ?? "",
      source_url:       r.source_url ?? "",
      status:           r.status ?? "",
      id:               r.id ?? "",
    };
  });

  const csvLines = [
    HEADERS.join(","),
    ...rows.map((row) => HEADERS.map((h) => escapeCsv(row[h as keyof typeof row])).join(",")),
  ];

  // BOM for Excel UTF-8
  const csv = "﻿" + csvLines.join("\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `resources_${dateStr}${statusFilter ? `_${statusFilter}` : ""}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
