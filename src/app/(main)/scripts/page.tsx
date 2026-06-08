import { createClient } from "@/lib/supabase/server";
import type { CommunicationScript } from "@/types/domain";
import { ScriptsHub } from "@/components/scripts/ScriptsHub";

export const metadata = { title: "溝通錦囊" };

async function getScripts(): Promise<CommunicationScript[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communication_scripts")
    .select("*")
    .eq("status", "active")
    .order("audience")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as CommunicationScript[];
}

export default async function ScriptsPage() {
  const scripts = await getScripts();

  return (
    <div className="wv-fade">
      {/* 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "34px 0 30px" }}>
        <div className="wv-wrap">
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px, 3.2vw, 32px)", fontWeight: 800, color: "#241F1B" }}>溝通錦囊</h1>
          <p style={{ margin: 0, fontSize: 17, color: "#574E47" }}>真實對話示範，讓每一次互動都更有溫度。卡關的時候，照著說就對了。</p>
        </div>
      </div>

      <ScriptsHub scripts={scripts} />
    </div>
  );
}
