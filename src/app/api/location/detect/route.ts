import { NextRequest, NextResponse } from "next/server";
import { findNearestRegion } from "@/lib/location/regions";
import { setUserRegionCode } from "@/lib/location/cookies";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude } = await req.json();
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "需要 latitude / longitude 數字" }, { status: 400 });
    }
    const region = await findNearestRegion(latitude, longitude);
    if (!region) {
      return NextResponse.json({ error: "找不到對應的地區" }, { status: 404 });
    }
    await setUserRegionCode(region.code);
    return NextResponse.json({
      region: {
        id: region.id,
        code: region.code,
        name: region.name,
        level: region.level,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `定位失敗：${msg}` }, { status: 500 });
  }
}
