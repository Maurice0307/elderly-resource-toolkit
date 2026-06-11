"use client";

import { useActionState, useState } from "react";
import { createPortal } from "react-dom";
import { deleteAccount } from "@/lib/auth/actions";
import { ELIcon } from "@/components/layout/ELIcon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteAction = deleteAccount as any;

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<{ error: string } | null, FormData>(deleteAction, null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="click"
        style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 0", width: "100%", background: "transparent", border: "none", borderTop: "1px solid #F0E6DE", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
      >
        <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FDECEC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ELIcon name="close" size={21} color="#D9534F" />
        </span>
        <span style={{ flex: 1, fontSize: 16.5, fontWeight: 700, color: "#D9534F" }}>刪除此帳號</span>
        <ELIcon name="chevron" size={20} color="#C8B8AE" />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div onClick={() => !pending && setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,12,8,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 22, overflow: "hidden" }}>
            <div style={{ padding: "24px 22px 4px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FDECEC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <ELIcon name="close" size={32} color="#D9534F" />
              </div>
              <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#241F1B" }}>確定要刪除帳號嗎？</h2>
              <p style={{ margin: "12px 0 0", fontSize: 15, color: "#574E47", lineHeight: 1.7 }}>
                這個動作<strong style={{ color: "#D9534F" }}>無法復原</strong>。您的收藏、問答、提案、綁定的登入方式都會一起永久刪除。
              </p>
              {state?.error && (
                <div style={{ marginTop: 12, background: "#FFF1E8", color: "#C2410C", borderRadius: 10, padding: "10px 14px", fontSize: 14 }}>{state.error}</div>
              )}
            </div>
            <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              <form action={action}>
                <button type="submit" disabled={pending} style={{ width: "100%", height: 52, borderRadius: 14, border: "none", background: "#D9534F", color: "#fff", fontSize: 16.5, fontWeight: 800, cursor: pending ? "wait" : "pointer", opacity: pending ? 0.7 : 1, fontFamily: "inherit" }}>
                  {pending ? "刪除中…" : "確認永久刪除"}
                </button>
              </form>
              <button onClick={() => setOpen(false)} disabled={pending} style={{ width: "100%", height: 50, borderRadius: 14, border: "1.5px solid #E4D7CC", background: "#fff", color: "#574E47", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                取消，保留帳號
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
