"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ELIcon } from "@/components/layout/ELIcon";
import { submitWish } from "@/lib/proposals/actions";

const WISH_CATS = ["智慧生活", "動動身體", "防詐・假訊息", "生活技能", "創意繪畫", "花草植栽", "手工美勞", "其他"];

export function WishButton({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitWish, null);

  // 送出成功 → 關閉並刷新列表
  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  const btn = (
    <button
      onClick={() => (loggedIn ? setOpen(true) : router.push("/login"))}
      style={{ width: "100%", maxWidth: 480, margin: "0 auto", height: 54, borderRadius: 14, background: "#E0552E", color: "#fff", fontSize: 17, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 16px rgba(224,85,46,0.26)" }}
    >
      <ELIcon name="megaphone" size={20} color="#fff" /> 我要提案
    </button>
  );

  return (
    <>
      {btn}

      {open && typeof document !== "undefined" && createPortal(
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,12,8,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: "22px 22px 0 0", maxHeight: "92dvh", overflowY: "auto", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "#E4D7CC", margin: "0 auto 16px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "#FFF4EF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name="bulb" size={21} color="#E0552E" />
              </span>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B" }}>許願池・我要提案</div>
                <div style={{ fontSize: 13, color: "#9C8E84" }}>寫下你希望有的活動，大家按想要就有機會成真</div>
              </div>
            </div>

            <form action={action} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  你希望有什麼活動？ <span style={{ color: "var(--cta)" }}>*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  maxLength={60}
                  placeholder="例：教用手機掛號看診、台語健康操"
                  style={{ width: "100%", border: "2px solid var(--border-strong)", borderRadius: 13, padding: "12px 14px", fontSize: "1rem", color: "var(--text-primary)", background: "#fff", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  分類（選填）
                </label>
                <select
                  name="category"
                  defaultValue=""
                  style={{ width: "100%", border: "2px solid var(--border-strong)", borderRadius: 13, padding: "12px 14px", fontSize: "1rem", color: "var(--text-primary)", background: "#fff", outline: "none", boxSizing: "border-box" }}
                >
                  <option value="">不指定</option>
                  {WISH_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {state?.error && (
                <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--cta)" }}>{state.error}</p>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, height: 52, borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "#fff", color: "var(--text-secondary)", fontSize: "1.0625rem", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  取消
                </button>
                <button type="submit" disabled={pending} style={{ flex: 1.6, height: 52, borderRadius: 14, border: "none", background: "var(--cta)", color: "#fff", fontSize: "1.0625rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", opacity: pending ? 0.6 : 1, fontFamily: "inherit" }}>
                  <ELIcon name="megaphone" size={19} color="#fff" /> {pending ? "送出中…" : "送出提案"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
