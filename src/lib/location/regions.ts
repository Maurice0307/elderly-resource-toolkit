import { createAdminClient } from "@/lib/supabase/admin";

export type Region = {
  id: string;
  level: "national" | "county" | "district";
  parent_id: string | null;
  name: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function findNearestRegion(lat: number, lng: number): Promise<Region | null> {
  const admin = createAdminClient();
  const { data: districts } = await admin
    .from("regions")
    .select("id, level, parent_id, name, code, latitude, longitude")
    .eq("level", "district")
    .not("latitude", "is", null);

  if (!districts || districts.length === 0) {
    const { data: counties } = await admin
      .from("regions")
      .select("id, level, parent_id, name, code, latitude, longitude")
      .eq("level", "county")
      .not("latitude", "is", null);
    if (!counties || counties.length === 0) return null;
    return pickNearest(counties as Region[], lat, lng);
  }
  return pickNearest(districts as Region[], lat, lng);
}

function pickNearest(rows: Region[], lat: number, lng: number): Region | null {
  let best: Region | null = null;
  let bestKm = Infinity;
  for (const r of rows) {
    if (r.latitude == null || r.longitude == null) continue;
    const km = haversineKm(lat, lng, Number(r.latitude), Number(r.longitude));
    if (km < bestKm) {
      bestKm = km;
      best = r;
    }
  }
  return best;
}

export async function getRegionByCode(code: string): Promise<Region | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("regions")
    .select("id, level, parent_id, name, code, latitude, longitude")
    .eq("code", code)
    .single();
  return (data as Region) ?? null;
}

export async function getRegionAndParentIds(code: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data: region } = await admin
    .from("regions")
    .select("id, parent_id")
    .eq("code", code)
    .single();
  if (!region) return [];
  const ids: string[] = [region.id];
  if (region.parent_id) ids.push(region.parent_id);
  return ids;
}

export async function getRegionAncestors(regionId: string): Promise<Region[]> {
  const admin = createAdminClient();
  const chain: Region[] = [];
  let currentId: string | null = regionId;
  while (currentId) {
    const { data }: { data: Region | null } = await admin
      .from("regions")
      .select("id, level, parent_id, name, code, latitude, longitude")
      .eq("id", currentId)
      .single();
    if (!data) break;
    chain.push(data);
    currentId = data.parent_id;
  }
  return chain;
}
