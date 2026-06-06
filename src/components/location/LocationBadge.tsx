"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const SKIP_KEY = "geo_skip_until";
const SKIP_HOURS = 24;

export function LocationBadge({
  currentName,
  currentCode,
  compact = false,
}: {
  currentName: string | null;
  currentCode: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [autoTried, setAutoTried] = useState(false);
  const [, startTransition] = useTransition();
  const triggeredRef = useRef(false);

  function detect(silent: boolean) {
    if (!navigator.geolocation) {
      if (!silent) setError("瀏覽器不支援定位");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/location/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            if (!silent) setError(data.error ?? "定位失敗");
          } else {
            try { localStorage.removeItem(SKIP_KEY); } catch { /* noop */ }
            startTransition(() => router.refresh());
          }
        } catch (e) {
          if (!silent) setError(`定位失敗：${e instanceof Error ? e.message : String(e)}`);
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        // PERMISSION_DENIED = 1
        if (err.code === 1) {
          try {
            localStorage.setItem(SKIP_KEY, String(Date.now() + SKIP_HOURS * 3600 * 1000));
          } catch { /* noop */ }
        }
        if (!silent) setError(`無法取得位置：${err.message}`);
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  // Auto-detect on mount if no region cookie set and user hasn't denied recently
  useEffect(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    if (currentCode) {
      setAutoTried(true);
      return;
    }
    let skipUntil = 0;
    try {
      skipUntil = parseInt(localStorage.getItem(SKIP_KEY) ?? "0", 10) || 0;
    } catch { /* noop */ }
    if (Date.now() < skipUntil) {
      setAutoTried(true);
      return;
    }
    setAutoTried(true);
    detect(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCode]);

  async function clear() {
    setBusy(true);
    try {
      await fetch("/api/location/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "" }),
      });
      try { localStorage.setItem(SKIP_KEY, String(Date.now() + SKIP_HOURS * 3600 * 1000)); } catch { /* noop */ }
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentName ? (
        <>
          {!compact && (
            <span
              className="rounded-full px-4 py-2 text-base font-semibold"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#FFFFFF",
                border: "1.5px solid rgba(255,255,255,0.5)",
              }}
            >
              📍 目前位置：{currentName}
            </span>
          )}
          <button
            type="button"
            onClick={() => detect(false)}
            disabled={busy}
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={compact ? {
              background: "var(--bg-soft)",
              color: "var(--cta-ink)",
              border: "1.5px solid var(--border-strong)",
              minHeight: 32,
            } : {
              background: "rgba(255,255,255,0.1)",
              color: "#FFFFFF",
              border: "1.5px solid rgba(255,255,255,0.4)",
            }}
          >
            {busy ? "定位中…" : "重新定位"}
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={busy}
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={compact ? {
              background: "var(--bg-soft)",
              color: "var(--text-muted)",
              border: "1.5px solid var(--border)",
              minHeight: 32,
            } : {
              background: "rgba(255,255,255,0.1)",
              color: "#FFFFFF",
              border: "1.5px solid rgba(255,255,255,0.4)",
            }}
          >
            清除
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => detect(false)}
          disabled={busy || !autoTried}
          className="rounded-full px-5 py-3 text-base font-semibold"
          style={{ background: "#FFFFFF", color: "var(--cta)", minHeight: "var(--hit)" }}
        >
          {busy ? "📍 定位中…" : "📍 開啟在地推薦"}
        </button>
      )}
      {error && (
        <span className="block w-full text-center text-base" style={{ color: "#FECACA" }}>
          {error}
        </span>
      )}
    </div>
  );
}
