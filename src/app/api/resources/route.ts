import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "health";
  const subcat = req.nextUrl.searchParams.get("subcat") ?? ""; // 指定子分類 id（選填）
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

  // 分頁參數
  const PAGE = 100;
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset") ?? "0") || 0);

  // 子分類 id→名稱對照（用來顯示資源的所有標籤）
  const { data: allSubs } = await supabase.from("subcategories").select("id, name");
  const subName: Record<string, string> = {};
  for (const s of allSubs ?? []) subName[s.id] = s.name;

  // Step 3: Get resources（可選：指定子分類 / 地區）。主標籤(subcategory_id)或額外標籤(extra_subcats)命中都算
  let query = supabase
    .from("resources")
    .select(
      "id, name, summary, phone, address, scope, tags, like_count, bookmark_count, region_id, source_org, subcategory_id, extra_subcats",
      { count: "exact" }
    )
    .eq("status", "active");

  // 子分類篩選：有指定且屬於此分類才採用，否則用整個分類（主標籤 OR 額外標籤）
  if (subcat && subcatIds.includes(subcat)) {
    query = query.or(`subcategory_id.eq.${subcat},extra_subcats.ov.{${subcat}}`);
  } else {
    query = query.or(`subcategory_id.in.(${subcatIds.join(",")}),extra_subcats.ov.{${subcatIds.join(",")}}`);
  }

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

  const { data, error, count } = await query
    .order("like_count", { ascending: false, nullsFirst: false })
    .range(offset, offset + PAGE - 1);

  if (error) return NextResponse.json([], { status: 200 });

  // 主標籤 + 額外標籤 → 名稱陣列
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (data ?? []).map((r: any) => {
    const ids: string[] = [r.subcategory_id, ...((r.extra_subcats as string[]) ?? [])].filter(Boolean);
    const names = [...new Set(ids.map((id) => subName[id]).filter(Boolean))];
    const { extra_subcats: _e, ...rest } = r;
    return { ...rest, subcat_name: subName[r.subcategory_id] ?? null, subcat_names: names };
  });

  const res = NextResponse.json(items);
  res.headers.set("X-Total-Count", String(count ?? 0));
  return res;
}
