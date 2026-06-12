import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "health";
  // 支援多選地區：regionCodes=a,b,c（相容舊的單一 regionCode）
  const codesParam = req.nextUrl.searchParams.get("regionCodes") ?? req.nextUrl.searchParams.get("regionCode") ?? "";
  const regionCodes = [...new Set(codesParam.split(",").map((s) => s.trim()).filter(Boolean))];
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

  if (regionCodes.length > 0) {
    // 把選取的地區代碼換成 region id；縣市自動含其下行政區
    const { data: regionRows } = await supabase
      .from("regions")
      .select("id")
      .in("code", regionCodes);
    let ids = (regionRows ?? []).map((r: { id: string }) => r.id);
    if (ids.length > 0) {
      const { data: children } = await supabase
        .from("regions")
        .select("id")
        .in("parent_id", ids);
      ids = [...new Set([...ids, ...(children ?? []).map((c: { id: string }) => c.id)])];
      // 顯示全國資源 OR 屬於所選地區（含行政區）的在地資源
      query = query.or(`scope.eq.national,region_id.in.(${ids.join(",")})`);
    }
  }

  const { data, error } = await query
    .order("like_count", { ascending: false, nullsFirst: false })
    .limit(40);

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}
