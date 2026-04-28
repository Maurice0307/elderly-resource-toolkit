"use server";
import { cookies } from "next/headers";

const COOKIE_NAME = "user_region_code";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setUserRegionCode(code: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, code, {
    maxAge: ONE_YEAR,
    sameSite: "lax",
    path: "/",
  });
}

export async function getUserRegionCode(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value ?? null;
}

export async function clearUserRegionCode() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
