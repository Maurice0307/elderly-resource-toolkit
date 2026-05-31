"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RegionCounty, RegionDistrict } from "@/app/api/location/regions/route";

export function RegionPicker({
  currentCode,
  currentName,
}: {
  currentCode: string | null;
  currentName: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [counties, setCounties] = useState<RegionCounty[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<RegionCounty | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        setLoading(true);
        fetch("/api/location/regions")
          .then((r) => r.json())
          .then((data) => setCounties(Array.isArray(data) ? data : []))
          .catch(() => setCounties([]))
          .finally(() => setLoading(false));
      }
    } else {
      dialogRef.current?.close();
      setSelectedCounty(null);
    }
  }, [open]);

  async function pickDistrict(district: RegionDistrict) {
    setBusy(true);
    try {
      await fetch("/api/location/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: district.code }),
      });
      setOpen(false);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  async function pickCounty(county: RegionCounty) {
    if (county.districts.length === 0) {
      // No districts — use county directly
      setBusy(true);
      try {
        await fetch("/api/location/set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: county.code }),
        });
        setOpen(false);
        startTransition(() => router.refresh());
      } finally {
        setBusy(false);
      }
    } else {
      setSelectedCounty(county);
    }
  }

  async function clear() {
    setBusy(true);
    try {
      await fetch("/api/location/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "" }),
      });
      setOpen(false);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Trigger row */}
      <div className="flex flex-wrap items-center gap-2">
        {currentName && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-base font-semibold"
            style={{
              background: "var(--bg-accent)",
              color: "#92400E",
              border: "1.5px solid #FDE68A",
            }}
          >
            📍 {currentName}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full px-4 py-2 text-base font-semibold transition hover:opacity-80"
          style={{
            background: "var(--bg-soft)",
            color: "var(--cta)",
            border: "1.5px solid var(--border)",
            minHeight: "var(--hit)",
          }}
        >
          {currentName ? "換地區" : "🔍 選擇地區"}
        </button>
        {currentName && (
          <button
            type="button"
            onClick={clear}
            disabled={busy}
            className="rounded-full px-4 py-2 text-base font-medium transition hover:opacity-80"
            style={{
              background: "var(--bg-soft)",
              color: "var(--text-muted)",
              border: "1.5px solid var(--border)",
              minHeight: "var(--hit)",
            }}
          >
            清除地區
          </button>
        )}
      </div>

      {/* Modal */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === dialogRef.current) setOpen(false); }}
        className="w-full max-w-lg rounded-2xl p-0 shadow-2xl backdrop:bg-black/50"
        style={{ border: "none", maxHeight: "85vh" }}
      >
        <div className="flex flex-col" style={{ maxHeight: "85vh" }}>
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
          >
            <div className="flex items-center gap-3">
              {selectedCounty && (
                <button
                  type="button"
                  onClick={() => setSelectedCounty(null)}
                  className="rounded-full p-1 text-xl transition hover:opacity-70"
                  style={{ color: "var(--cta)" }}
                  aria-label="回縣市列表"
                >
                  ←
                </button>
              )}
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {selectedCounty ? `${selectedCounty.name} — 選擇行政區` : "選擇縣市"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1 text-lg font-bold transition hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              aria-label="關閉"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5" style={{ background: "var(--bg-page)" }}>
            {loading ? (
              <p className="py-10 text-center text-lg" style={{ color: "var(--text-muted)" }}>
                載入中…
              </p>
            ) : !selectedCounty ? (
              /* County grid */
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {counties.map((county) => (
                  <button
                    key={county.id}
                    type="button"
                    onClick={() => pickCounty(county)}
                    disabled={busy}
                    className="rounded-xl py-3 text-base font-semibold transition hover:opacity-80 active:scale-95"
                    style={{
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      border: "2px solid var(--border)",
                      minHeight: "var(--hit)",
                    }}
                  >
                    {county.name}
                  </button>
                ))}
              </div>
            ) : (
              /* District grid */
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {selectedCounty.districts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => pickDistrict(d)}
                    disabled={busy}
                    className="rounded-xl py-3 text-base font-semibold transition hover:opacity-80 active:scale-95"
                    style={{
                      background:
                        currentCode === d.code ? "var(--cta)" : "var(--bg-elevated)",
                      color:
                        currentCode === d.code ? "var(--cta-on)" : "var(--text-primary)",
                      border: "2px solid var(--border)",
                      minHeight: "var(--hit)",
                    }}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
