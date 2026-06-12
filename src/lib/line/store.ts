import { createAdminClient } from "@/lib/supabase/admin";

/* LINE 對話紀錄 + Profile + 主動推播（表未建立時靜默略過，不影響 bot） */

export async function getLineProfile(userId: string): Promise<string | null> {
  try {
    const r = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.displayName ?? null;
  } catch { return null; }
}

export async function logLineMessage(opts: {
  userId: string; direction: "in" | "out"; text: string; displayName?: string | null; byAdmin?: boolean;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("line_messages").insert({
      line_user_id: opts.userId,
      display_name: opts.displayName ?? null,
      direction: opts.direction,
      text: opts.text.slice(0, 2000),
      by_admin: opts.byAdmin ?? false,
    });
  } catch { /* 表尚未建立 */ }
}

export async function pushLineText(userId: string, text: string): Promise<boolean> {
  try {
    const r = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ to: userId, messages: [{ type: "text", text }] }),
    });
    return r.ok;
  } catch { return false; }
}
