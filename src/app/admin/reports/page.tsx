import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { resolveReport, reopenReport, deleteReport } from "@/lib/reports/actions";
import { AD, AdPill, AdTab, AdCard, AdPageHead, AdEmpty, adBtn, type Tone } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";

const KIND: Record<string, { label: string; tone: Tone }> = {
  resource: { label: "資源", tone: "info" },
  activity: { label: "活動圖卡", tone: "coral" },
  script: { label: "溝通錦囊", tone: "pending" },
  news: { label: "今日新知", tone: "ok" },
};

type Report = {
  id: string; kind: string; subject: string; reasons: string[];
  note: string | null; status: string; created_at: string;
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireRole("moderator");
  const { view = "open" } = await searchParams;
  const admin = createAdminClient();

  let reports: Report[] = [];
  let tableMissing = false;
  const { data, error } = await admin
    .from("content_reports")
    .select("id, kind, subject, reasons, note, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) tableMissing = true;
  else reports = (data ?? []) as Report[];

  const openCount = reports.filter((r) => r.status === "open").length;
  const shown = reports.filter((r) => (view === "resolved" ? r.status === "resolved" : r.status === "open"));

  return (
    <div>
      <AdPageHead title="問題回報" desc="使用者在資源、活動、錦囊、新知頁按「回報」送出的內容問題" />

      {tableMissing ? (
        <AdCard style={{ border: "1px solid #F5DCBE" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#B45309", marginBottom: 6 }}>尚未啟用回報資料表</div>
          <p style={{ margin: 0, fontSize: 14, color: AD.sub, lineHeight: 1.7 }}>
            回報功能在前台已可使用，但要在這裡看到內容，需先套用資料庫 migration
            <code style={{ background: "#FBF3EC", padding: "1px 6px", borderRadius: 6, margin: "0 4px" }}>0011_content_reports.sql</code>
            （在 Supabase 執行一次即可）。套用後，使用者送出的回報就會出現在這裡。
          </p>
        </AdCard>
      ) : (
        <>
          <div className="flex gap-2">
            <AdTab href="/admin/reports?view=open" active={view !== "resolved"}>
              待處理{openCount > 0 && (
                <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "#E0552E", color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{openCount}</span>
              )}
            </AdTab>
            <AdTab href="/admin/reports?view=resolved" active={view === "resolved"}>已處理</AdTab>
          </div>

          {shown.length === 0 ? (
            <div className="mt-4"><AdEmpty icon="check" title={view === "resolved" ? "沒有已處理的回報" : "目前沒有待處理的回報"} desc={view === "resolved" ? undefined : "使用者回報內容問題後會出現在這裡。"} /></div>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {shown.map((r) => {
                const k = KIND[r.kind] ?? { label: r.kind, tone: "neutral" as Tone };
                return (
                  <AdCard key={r.id} accent={r.status === "open"}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <AdPill tone={k.tone}>{k.label}</AdPill>
                          <span style={{ fontSize: 12.5, color: AD.muted }}>{new Date(r.created_at).toLocaleString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                        </div>
                        <div style={{ marginTop: 7, fontSize: 16, fontWeight: 800, color: AD.ink }}>{r.subject}</div>
                        {r.reasons.length > 0 && (
                          <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {r.reasons.map((reason, i) => (
                              <span key={i} style={{ fontSize: 12.5, padding: "3px 9px", borderRadius: 999, background: "#FFF4EF", color: "#B23F1E", fontWeight: 600 }}>{reason}</span>
                            ))}
                          </div>
                        )}
                        {r.note && (
                          <p style={{ margin: "9px 0 0", fontSize: 14, color: AD.sub, lineHeight: 1.6, background: "#FAF6F2", borderRadius: 10, padding: "10px 12px" }}>
                            <ELIcon name="chat" size={14} color={AD.muted} /> {r.note}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
                        {r.status === "open" ? (
                          <form action={resolveReport.bind(null, r.id)}>
                            <button type="submit" style={adBtn("ok")}><ELIcon name="check" size={15} color="#1E7A43" stroke={2.4} /> 標記已處理</button>
                          </form>
                        ) : (
                          <form action={reopenReport.bind(null, r.id)}>
                            <button type="submit" style={adBtn("neutral")}>重新開啟</button>
                          </form>
                        )}
                        <form action={deleteReport.bind(null, r.id)}>
                          <button type="submit" style={adBtn("alert")}>刪除</button>
                        </form>
                      </div>
                    </div>
                  </AdCard>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
