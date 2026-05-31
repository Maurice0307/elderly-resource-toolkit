import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type RegionDistrict = { id: string; code: string; name: string };
export type RegionCounty = { id: string; code: string; name: string; districts: RegionDistrict[] };

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data: counties, error: ce } = await admin
      .from("regions")
      .select("id, code, name")
      .eq("level", "county")
      .order("name");
    if (ce) throw ce;

    const { data: districts, error: de } = await admin
      .from("regions")
      .select("id, code, name, parent_id")
      .eq("level", "district")
      .order("name");
    if (de) throw de;

    const grouped: RegionCounty[] = (counties ?? []).map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      districts: (districts ?? [])
        .filter((d) => d.parent_id === c.id)
        .map((d) => ({ id: d.id, code: d.code, name: d.name })),
    }));

    return NextResponse.json(grouped);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
