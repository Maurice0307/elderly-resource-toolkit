"use client";

import { useEffect, useState } from "react";
import { ELIcon } from "@/components/layout/ELIcon";

/* 沒有後台權限時的提醒（requireRole 會導向 /profile?denied=admin） */
export function DeniedNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const denied = new URLSearchParams(window.location.search).get("denied");
    if (denied === "admin") {
      setShow(true);
      // 清掉網址參數，重整不再顯示
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{ margin: "12px 18px 0", background: "#FDECEC", border: "1px solid #F5C6C2", borderRadius: 14, padding: "13px 15px", display: "flex", alignItems: "center", gap: 11 }}>
      <span style={{ width: 34, height: 34, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ELIcon name="lock" size={18} color="#D9534F" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: "#C0392B" }}>沒有管理後台權限</div>
        <div style={{ fontSize: 12.5, color: "#9A5A52", marginTop: 1, lineHeight: 1.5 }}>這個區域僅限管理員，如需協助請聯絡超級管理員。</div>
      </div>
      <button onClick={() => setShow(false)} aria-label="關閉" style={{ flexShrink: 0, width: 28, height: 28, minHeight: 0, borderRadius: 999, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ELIcon name="close" size={16} color="#C09590" />
      </button>
    </div>
  );
}
