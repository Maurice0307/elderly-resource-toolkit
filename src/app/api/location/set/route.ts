import { NextRequest, NextResponse } from "next/server";
import { setUserRegionCode, clearUserRegionCode } from "@/lib/location/cookies";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (code === null || code === "") {
      await clearUserRegionCode();
      return NextResponse.json({ ok: true });
    }
    if (typeof code !== "string") {
      return NextResponse.json({ error: "需要 code 字串" }, { status: 400 });
    }
    await setUserRegionCode(code);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
