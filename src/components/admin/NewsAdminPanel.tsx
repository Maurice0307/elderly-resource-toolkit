"use client";

import { useState } from "react";
import { hideNews, restoreNews, deleteNews } from "@/lib/admin/actions";
import { AD, AdPill, AdCard, AdEmpty, adBtn } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";

const newsField: React.CSSProperties = {
  width: "100%", minHeight: 48, padding: "0 14px", borderRadius: 12,
  border: `1.5px solid ${AD.line}`, background: "#fff", color: AD.ink,
  fontSize: 15, fontFamily: "inherit", boxSizing: "border-box",
};

type NewsRow = {
  id: string;
  title: string;
  source_org: string;
  source_url: string;
  tags: string[];
  published_at: string | null;
  fetched_at: string;
  status: string;
};

type Props = { news: NewsRow[] };

export function NewsAdminPanel({ news: initial }: Props) {
  const [url, setUrl] = useState("");
  const [sourceOrg, setSourceOrg] = useState("");
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fetchMsg, setFetchMsg] = useState("");

  async function handleFetch() {
    if (!url.trim() || !sourceOrg.trim()) {
      setFetchMsg("請填入媒體來源和文章網址");
      setFetchState("error");
      return;
    }
    setFetchState("loading");
    setFetchMsg("正在抓取並改寫，請稍候（約 10–20 秒）…");

    try {
      const resp = await fetch("/api/admin/fetch-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), source_org: sourceOrg.trim() }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setFetchState("error");
        setFetchMsg(data.error ?? "未知錯誤");
        return;
      }

      setFetchState("success");
      setFetchMsg(`成功新增：「${data.title}」`);
      setUrl("");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setFetchState("error");
      setFetchMsg(String(e));
    }
  }

  return (
    <div>
      {/* ── 新增表單 ── */}
      <AdCard style={{ padding: "18px 18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: AD.chip, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ELIcon name="megaphone" size={20} color={AD.coral} />
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: AD.ink }}>新增新聞文章</h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: AD.muted }}>貼上文章網址，AI 自動改寫成長輩友善摘要</p>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text" placeholder="媒體來源名稱，例如：幸福熟齡"
            value={sourceOrg} onChange={(e) => setSourceOrg(e.target.value)} style={newsField}
          />
          <input
            type="url" placeholder="文章網址 https://..."
            value={url} onChange={(e) => setUrl(e.target.value)} style={newsField}
          />
          <button
            onClick={handleFetch} disabled={fetchState === "loading"}
            style={{ ...adBtn("coral"), minHeight: 50, fontSize: 16, opacity: fetchState === "loading" ? 0.6 : 1 }}
          >
            {fetchState === "loading" ? "處理中…" : <><ELIcon name="send" size={17} color="#fff" /> 抓取並新增</>}
          </button>
        </div>

        {fetchMsg && (
          <div
            style={{
              marginTop: 12, borderRadius: 12, padding: "11px 14px", fontSize: 14, fontWeight: 600,
              background: fetchState === "success" ? "#E7F6EC" : fetchState === "error" ? "#FCEBEA" : "#FEF1E2",
              color: fetchState === "success" ? "#1E7A43" : fetchState === "error" ? "#C0392B" : "#B45309",
            }}
          >
            {fetchMsg}
          </div>
        )}
      </AdCard>

      {/* ── 新聞列表 ── */}
      <div style={{ marginTop: 22 }}>
        <h2 style={{ margin: "0 2px 12px", fontSize: 18, fontWeight: 800, color: AD.ink }}>
          已收錄新聞（共 {initial.length} 則）
        </h2>

        {initial.length === 0 ? (
          <AdEmpty icon="news" title="還沒有新聞" desc="從上方新增第一則吧！" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {initial.map((item) => {
              const active = item.status === "active";
              return (
                <AdCard key={item.id} accent={active} style={{ opacity: active ? 1 : 0.8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <AdPill tone={active ? "ok" : "neutral"}>
                      {active ? <><ELIcon name="check" size={13} color="#1E9E54" stroke={2.4} /> 上架中</> : "已隱藏"}
                    </AdPill>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 600, color: AD.muted }}>
                      <ELIcon name="news" size={14} color={AD.muted} /> {item.source_org}
                    </span>
                    {item.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 999, background: AD.chip, color: AD.coralDark, fontWeight: 600 }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 15.5, fontWeight: 700, color: AD.ink, lineHeight: 1.5 }}>
                    {item.title}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: AD.muted }}>
                    {new Date(item.published_at ?? item.fetched_at).toLocaleDateString("zh-TW")}
                  </p>

                  <div style={{ marginTop: 13, paddingTop: 13, borderTop: `1px solid ${AD.border}`, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <a href={`/news/${item.id}`} target="_blank" rel="noopener noreferrer" style={adBtn("neutral")}>預覽</a>
                    {active ? (
                      <form action={hideNews.bind(null, item.id)}>
                        <button type="submit" style={adBtn("pending")}>下架</button>
                      </form>
                    ) : (
                      <form action={restoreNews.bind(null, item.id)}>
                        <button type="submit" style={adBtn("ok")}>上架</button>
                      </form>
                    )}
                    <form
                      action={deleteNews.bind(null, item.id)}
                      onSubmit={(e) => { if (!confirm("確定要刪除這則新聞？此動作無法復原。")) e.preventDefault(); }}
                    >
                      <button type="submit" style={adBtn("alert")}>刪除</button>
                    </form>
                  </div>
                </AdCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
