import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "health";
  const regionCode = req.nextUrl.searchParams.get("regionCode") ?? null;
  const supabase = await createClient();

  // Step 1: Get category ID by slug
  const { data: catData } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();

  if (!catData) return NextResponse.json([]);

  // Step 2: Get subcategory IDs for this category
  const { data: subcatData } = await supabase
    .from("subcategories")
    .select("id")
    .eq("category_id", catData.id);

  const subcatIds = (subcatData ?? []).map((s: { id: string }) => s.id);
  if (subcatIds.length === 0) return NextResponse.json([]);

  // Step 3: Get resources, optionally filtered by region
  let query = supabase
    .from("resources")
    .select("id, name, summary, phone, address, scope, tags, like_count, region_id")
    .in("subcategory_id", subcatIds)
    .eq("status", "active");

  if (regionCode) {
    // Get region ID for this code
    const { data: regionRow } = await supabase
      .from("regions")
      .select("id")
      .eq("code", regionCode)
      .maybeSingle();

    if (regionRow) {
      // Show national resources OR local resources matching this region
      query = query.or(`scope.eq.national,region_id.eq.${regionRow.id}`);
    }
  }

  const { data, error } = await query
    .order("like_count", { ascending: false, nullsFirst: false })
    .limit(40);

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}
