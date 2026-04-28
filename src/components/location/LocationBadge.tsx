"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LocationBadge({
  currentName,
  currentCode,
}: {
  currentName: string | null;
  currentCode: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  async function detect() {
    if (!navigator.geolocation) {
      setError("瀏覽器不支援定位");
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
            setError(data.error ?? "定位失敗");
          } else {
            startTransition(() => router.refresh());
          }
        } catch (e) {
          setError(`定位失敗：${e instanceof Error ? e.message : String(e)}`);
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setError(`無法取得位置：${err.message}`);
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  async function clear() {
    setBusy(true);
    try {
      await fetch("/api/location/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "" }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {currentName ? (
        <>
          <span
            className="rounded-full px-4 py-2 text-base font-semibold"
            style={{ background: "rgba(255,251,235,0.15)", color: "#FDE68A", border: "1.5px solid rgba(253,230,138,0.5)" }}
          >
            📍 目前位置：{currentName}
          </span>
          <button
            type="button"
            onClick={detect}
            disabled={busy}
            className="rounded-full px-4 py-2 text-base font-semibold"
            style={{ background: "rgba(255,251,235,0.1)", color: "#FDE68A", border: "1.5px solid rgba(253,230,138,0.4)" }}
          >
            {busy ? "定位中…" : "重新定位"}
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={busy}
            className="rounded-full px-4 py-2 text-base font-semibold"
            style={{ background: "rgba(255,251,235,0.1)", color: "#FDE68A", border: "1.5px solid rgba(253,230,138,0.4)" }}
          >
            清除
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={detect}
          disabled={busy}
          className="rounded-full px-5 py-3 text-base font-semibold"
          style={{ background: "#FFFBEB", color: "#92400E" }}
        >
          {busy ? "定位中…" : "📍 開啟在地推薦（按此分享位置）"}
        </button>
      )}
      {error && (
        <span className="block w-full text-center text-base" style={{ color: "#FECACA" }}>{error}</span>
      )}
      {!!currentCode && (
        <input type="hidden" value={currentCode} readOnly />
      )}
    </div>
  );
}
