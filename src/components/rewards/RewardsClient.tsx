"use client";

import { useActionState, useState } from "react";
import { createPortal } from "react-dom";
import { redeemReward, type RedeemState } from "@/lib/rewards/actions";
import { ELIcon } from "@/components/layout/ELIcon";

const CATALOG = [
  { name: "美廉社茶葉蛋", cost: 50, where: "美廉社 中壢中山店", stock: "尚有 120 份", icon: "gift" },
  { name: "社區共餐券（1 餐）", cost: 100, where: "中壢老人共餐據點", stock: "尚有 45 張", icon: "social" },
  { name: "平安米 2 公斤", cost: 200, where: "里辦公處 領取", stock: "尚有 30 包", icon: "health" },
  { name: "全聯禮券 100 元", cost: 300, where: "里辦公處 領取", stock: "剩 8 張", icon: "gift" },
  { name: "手機教學一對一", cost: 150, where: "社區活動中心", stock: "名額 6 位", icon: "education" },
  { name: "防詐宣導小禮", cost: 60, where: "里辦公處 領取", stock: "尚有 50 份", icon: "shield" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redeemAction = redeemReward as any;

export function RewardsClient({ points }: { points: number }) {
  const [state, action, pending] = useActionState<RedeemState, FormData>(redeemAction, null);
  const [balance, setBalance] = useState(points);

  // 兌換成功 → 顯示核銷碼（餘額已在按下時樂觀扣除）
  const done = state && "ok" in state ? state : null;

  const codeSheet = done && typeof document !== "undefined"
    ? createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,12,8,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 340, background: "#fff", borderRadius: 22, overflow: "hidden" }}>
            <div style={{ background: "#1E9E54", padding: "16px 20px", color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name="check" size={22} color="#fff" stroke={3} />
              </span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>兌換成功</div>
                <div style={{ fontSize: 13, opacity: 0.92, marginTop: 1 }}>已扣 {done.cost} 點</div>
              </div>
            </div>
            <div style={{ padding: "20px 22px 22px", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{done.name}</div>
              {done.where && <div style={{ fontSize: 13, color: "#9C8E84", marginTop: 3 }}>{done.where}</div>}
              <div style={{ fontSize: 16, fontWeight: 700, color: "#574E47", marginTop: 14 }}>核銷碼</div>
              <div style={{ marginTop: 10, background: "#241F1B", borderRadius: 16, padding: "20px 12px", fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: 8, fontFamily: "ui-monospace, monospace" }}>{done.code}</div>
              <div style={{ marginTop: 14, background: "#FCEBEA", border: "1.5px solid #F5C6C2", borderRadius: 14, padding: "12px 14px", fontSize: 14.5, fontWeight: 700, color: "#C0392B", lineHeight: 1.5 }}>
                請把這個畫面拿給里長或社工核銷
              </div>
              <button onClick={() => window.location.reload()} style={{ marginTop: 18, width: "100%", height: 52, border: "none", borderRadius: 14, background: "#E0552E", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer" }}>完成</button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div style={{ padding: "0 0 28px" }}>
      {/* 點數資產卡 */}
      <div style={{ padding: "14px 18px 0", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ borderRadius: 22, padding: "20px 22px", background: "linear-gradient(135deg,#E0552E,#F2764F)", boxShadow: "0 12px 28px rgba(224,85,46,0.30)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.10)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 9, position: "relative" }}>
            <ELIcon name="gift" size={20} color="#fff" />
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>我的點數</span>
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "flex-end", gap: 8, position: "relative" }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 0.95 }}>{balance}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", paddingBottom: 6 }}>點可用</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.85)", position: "relative" }}>完成學習、回答問題、分享資源都能賺點</div>
        </div>
      </div>

      {/* 商品 */}
      <div style={{ padding: "18px 18px 0", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, marginBottom: 10, paddingLeft: 2 }}>可兌換物資</div>
        {state && "error" in state && (
          <div style={{ marginBottom: 12, background: "#FFF1E8", color: "#C2410C", borderRadius: 12, padding: "12px 16px", fontSize: 15 }}>{state.error}</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {CATALOG.map((item) => {
            const afford = balance >= item.cost;
            return (
              <div key={item.name} style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ELIcon name={item.icon} size={24} color="#F26B43" />
                </span>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "#241F1B", lineHeight: 1.35 }}>{item.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "#6E645C", minWidth: 0 }}>
                  <ELIcon name="pin" size={13} color="#9C8E84" /> <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.where}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#B23F1E" }}>{item.cost} 點</span>
                  <span style={{ fontSize: 11.5, color: "#9C8E84" }}>· {item.stock}</span>
                </div>
                <form action={action}>
                  <input type="hidden" name="name" value={item.name} />
                  <input type="hidden" name="where" value={item.where} />
                  <input type="hidden" name="cost" value={item.cost} />
                  <button type="submit" disabled={!afford || pending} onClick={() => afford && setBalance((b) => b - item.cost)}
                    style={{ width: "100%", height: 38, borderRadius: 11, border: "none", cursor: afford ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: 14, fontWeight: 800, background: afford ? "#E0552E" : "#ECE7E2", color: afford ? "#fff" : "#A89C92", opacity: pending ? 0.6 : 1 }}>
                    {afford ? "兌換" : "點數不足"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
        <p style={{ margin: "16px 2px 0", fontSize: 12.5, color: "#9C8E84", lineHeight: 1.7 }}>兌換後會產生核銷碼，拿給里長或社工即可領取。</p>
      </div>

      {codeSheet}
    </div>
  );
}
