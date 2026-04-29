"use client";

import { useState } from "react";
import { hideNews, restoreNews, deleteNews } from "@/lib/admin/actions";

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
      <div
        className="mt-6 rounded-2xl p-6"
        style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
      >
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          新增新聞文章
        </h2>
        <p className="mt-1 text-base" style={{ color: "var(--text-muted)" }}>
          貼上文章網址，AI 自動抓取並改寫成長輩友善摘要
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="媒體來源名稱，例如：幸福熟齡"
            value={sourceOrg}
            onChange={(e) => setSourceOrg(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-lg"
            style={{
              border: "1.5px solid var(--border)",
              background: "var(--bg-page)",
              color: "var(--text-primary)",
            }}
          />
          <input
            type="url"
            placeholder="文章網址 https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-lg"
            style={{
              border: "1.5px solid var(--border)",
              background: "var(--bg-page)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={handleFetch}
            disabled={fetchState === "loading"}
            className="rounded-xl px-6 py-3 text-lg font-bold transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
          >
            {fetchState === "loading" ? "處理中…" : "抓取並新增"}
          </button>
        </div>

        {fetchMsg && (
          <div
            className="mt-3 rounded-xl px-4 py-3 text-base font-medium"
            style={{
              background:
                fetchState === "success"
                  ? "var(--success-soft)"
                  : fetchState === "error"
                    ? "#FEE2E2"
                    : "var(--bg-accent)",
              color:
                fetchState === "success"
                  ? "#065F46"
                  : fetchState === "error"
                    ? "#991B1B"
                    : "#92400E",
            }}
          >
            {fetchMsg}
          </div>
        )}
      </div>

      {/* ── 新聞列表 ── */}
      <div className="mt-8">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          已收錄新聞（共 {initial.length} 則）
        </h2>

        {initial.length === 0 ? (
          <div
            className="mt-4 rounded-2xl p-8 text-center text-lg"
            style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}
          >
            還沒有新聞，從上方新增第一則吧！
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {initial.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-start sm:justify-between"
                style={{
                  background: "var(--bg-elevated)",
                  border: "2px solid var(--border)",
                  borderLeftWidth: 6,
                  borderLeftColor: item.status === "active" ? "var(--success)" : "var(--border)",
                  opacity: item.status === "hidden" ? 0.65 : 1,
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-sm font-semibold"
                      style={{
                        background: item.status === "active" ? "var(--success-soft)" : "#F5F5F4",
                        color: item.status === "active" ? "#065F46" : "#78716C",
                      }}
                    >
                      {item.status === "active" ? "✅ 上架中" : "🚫 已隱藏"}
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                      📰 {item.source_org}
                    </span>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: "var(--bg-accent)", color: "#92400E" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-lg font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                    {new Date(item.published_at ?? item.fetched_at).toLocaleDateString("zh-TW")}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <a
                    href={`/news/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl px-4 py-2 text-base font-semibold transition hover:opacity-80"
                    style={{
                      background: "var(--bg-soft)",
                      color: "var(--text-secondary)",
                      border: "1.5px solid var(--border)",
                    }}
                  >
                    預覽
                  </a>

                  {item.status === "active" ? (
                    <form action={hideNews.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="rounded-xl px-4 py-2 text-base font-semibold transition hover:opacity-80"
                        style={{ background: "#FEF3C7", color: "#92400E", border: "1.5px solid #FDE68A" }}
                      >
                        下架
                      </button>
                    </form>
                  ) : (
                    <form action={restoreNews.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="rounded-xl px-4 py-2 text-base font-semibold transition hover:opacity-80"
                        style={{ background: "var(--success-soft)", color: "#065F46", border: "1.5px solid #A7F3D0" }}
                      >
                        上架
                      </button>
                    </form>
                  )}

                  <form
                    action={deleteNews.bind(null, item.id)}
                    onSubmit={(e) => {
                      if (!confirm("確定要刪除這則新聞？此動作無法復原。")) e.preventDefault();
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-xl px-4 py-2 text-base font-semibold transition hover:opacity-80"
                      style={{ background: "#FEE2E2", color: "#991B1B", border: "1.5px solid #FECACA" }}
                    >
                      刪除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
