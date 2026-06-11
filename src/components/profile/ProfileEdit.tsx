"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, sendBindPhoneOtp, verifyBindPhoneOtp } from "@/lib/auth/actions";
import { ELIcon } from "@/components/layout/ELIcon";

type District = { id: string; code: string; name: string };
type County = { id: string; code: string; name: string; districts: District[] };
type State = { error: string } | null;

const IDENTITIES = [
  { key: "elder", icon: "user", name: "長輩" },
  { key: "family", icon: "heart", name: "家人" },
  { key: "volunteer", icon: "like", name: "志工" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateProfileAction = updateProfile as any;

export function ProfileEdit({
  defaultName, defaultIdentity, defaultRegionId, defaultRegionLabel, email, avatarUrl = "",
  linked = [], linkValues = { line: "", google: "", phone: "" },
}: {
  defaultName: string; defaultIdentity: string; defaultRegionId: string; defaultRegionLabel: string; email: string; avatarUrl?: string;
  linked?: string[]; linkValues?: { line: string; google: string; phone: string };
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<State, FormData>(updateProfileAction, null);

  const [name, setName] = useState(defaultName);
  const [identity, setIdentity] = useState(defaultIdentity || "family");
  const [regionId, setRegionId] = useState(defaultRegionId);
  const [regionLabel, setRegionLabel] = useState(defaultRegionLabel);
  const [counties, setCounties] = useState<County[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [openCounty, setOpenCounty] = useState<string | null>(null);

  // 手機綁定（行內 OTP）
  const [phoneBindOpen, setPhoneBindOpen] = useState(false);
  const [bindPhone, setBindPhone] = useState("09");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bindSend, bindSendAction, bindSending] = useActionState<any, FormData>(sendBindPhoneOtp as any, null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bindVerify, bindVerifyAction, bindVerifying] = useActionState<any, FormData>(verifyBindPhoneOtp as any, null);
  const bindSent = bindSend && "sent" in bindSend;

  useEffect(() => {
    fetch("/api/location/regions").then((r) => r.json())
      .then((d) => setCounties(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  function pickDistrict(county: County, d: District) {
    setRegionId(d.id);
    setRegionLabel(`${county.name} · ${d.name}`);
    setPickerOpen(false);
    setOpenCounty(null);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E4D7CC", borderRadius: 12, padding: "0 16px",
    minHeight: 54, fontSize: 17, fontWeight: 600, color: "#241F1B", background: "#fff",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const bindBtnStyle: React.CSSProperties = {
    flexShrink: 0, height: 36, padding: "0 16px", borderRadius: 999, border: "1.5px solid #E0552E",
    background: "#fff", color: "#B23F1E", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
  };
  const bindPrimaryStyle: React.CSSProperties = {
    width: "100%", height: 48, borderRadius: 12, border: "none", background: "#E0552E", color: "#fff",
    fontSize: 15.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ background: "#fff", minHeight: "100%" }}>
      {/* 返回列（含儲存） */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE", background: "#fff", position: "sticky", top: 0, zIndex: 5 }}>
        <button onClick={() => router.push("/profile")} aria-label="返回" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 800, color: "#241F1B" }}>編輯個人資料</div>
      </div>

      <form action={action} style={{ maxWidth: 560, margin: "0 auto", padding: "20px 22px 28px" }}>
        <input type="hidden" name="identity" value={identity} />
        <input type="hidden" name="region_id" value={regionId} />
        <input type="hidden" name="region_label" value={regionLabel} />

        {/* 頭像（首字母） */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 8 }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", boxShadow: "0 6px 16px rgba(224,85,46,0.28)" }} />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, boxShadow: "0 6px 16px rgba(224,85,46,0.28)" }}>
              {(name || "?").slice(0, 1)}
            </div>
          )}
        </div>

        {/* 顯示名稱 */}
        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#574E47", marginBottom: 8 }}>顯示名稱</label>
          <input name="display_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="請輸入您的名字" style={inputStyle} />
        </div>

        {/* 身分 */}
        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#574E47", marginBottom: 8 }}>我的身分</label>
          <div style={{ display: "flex", gap: 8 }}>
            {IDENTITIES.map((it) => {
              const active = identity === it.key;
              return (
                <button type="button" key={it.key} onClick={() => setIdentity(it.key)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 4px", borderRadius: 12, background: active ? "#FFF4EF" : "#fff", border: `2px solid ${active ? "#E0552E" : "#E4D7CC"}`, cursor: "pointer", font: "inherit" }}>
                  <ELIcon name={it.icon} size={24} color={active ? "#F26B43" : "#9C8E84"} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: active ? "#B23F1E" : "#574E47" }}>{it.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 地區 */}
        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#574E47", marginBottom: 8 }}>所在地區</label>
          <button type="button" onClick={() => setPickerOpen((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", ...inputStyle, cursor: "pointer" }}>
            <ELIcon name="pin" size={21} color="#F26B43" />
            <span style={{ flex: 1, textAlign: "left", fontWeight: 700, color: regionLabel ? "#241F1B" : "#9B8E85" }}>
              {regionLabel || "選擇縣市與行政區"}
            </span>
            <ELIcon name="chevron" size={16} color="#B23F1E" style={{ transform: pickerOpen ? "rotate(270deg)" : "rotate(90deg)" }} />
          </button>

          {pickerOpen && (
            <div style={{ marginTop: 8, border: "1.5px solid #F0E6DE", borderRadius: 14, padding: 8, maxHeight: 300, overflowY: "auto" }}>
              {counties.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "#6E645C", fontSize: 15 }}>載入地區資料⋯</div>
              ) : counties.map((c) => (
                <div key={c.code}>
                  <button type="button" onClick={() => setOpenCounty(openCounty === c.code ? null : c.code)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", font: "inherit", fontSize: 16, fontWeight: 800, color: "#241F1B" }}>
                    {c.name}
                    <ELIcon name="chevron" size={15} color="#9B8E85" style={{ transform: openCounty === c.code ? "rotate(270deg)" : "rotate(90deg)" }} />
                  </button>
                  {openCounty === c.code && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, padding: "4px 8px 10px" }}>
                      {c.districts.map((d) => (
                        <button type="button" key={d.code} onClick={() => pickDistrict(c, d)}
                          style={{ padding: "9px 6px", borderRadius: 10, border: `1.5px solid ${regionId === d.id ? "#E0552E" : "#E4D7CC"}`, background: regionId === d.id ? "#FFF4EF" : "#fff", cursor: "pointer", font: "inherit", fontSize: 14.5, fontWeight: 700, color: regionId === d.id ? "#B23F1E" : "#574E47" }}>
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email（唯讀） */}
        {email && (
          <div style={{ marginTop: 20 }}>
            <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#574E47", marginBottom: 8 }}>登入 Email</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, ...inputStyle, background: "#FAF6F2", color: "#6E645C" }}>
              <ELIcon name="lock" size={19} color="#9C8E84" />
              <span style={{ flex: 1, fontWeight: 700 }}>{email}</span>
            </div>
          </div>
        )}

        {/* 帳號連結 */}
        <div style={{ marginTop: 24 }}>
          <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#574E47", marginBottom: 8 }}>登入與帳號連結</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([
              { key: "line", icon: "chat", name: "LINE 帳號", href: "/auth/line?link=1" },
              { key: "google", icon: "user", name: "Google 帳號", href: "/auth/google?link=1" },
              { key: "phone", icon: "phone", name: "手機號碼", href: "" },
            ] as const).map((m) => {
              const on = linked.includes(m.key);
              const value = linkValues[m.key];
              return (
                <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1.5px solid #F0E6DE", borderRadius: 14, background: "#fff" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: m.key === "line" ? "#06C755" : "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ELIcon name={m.icon} size={19} color={m.key === "line" ? "#fff" : "#F26B43"} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 800, color: "#241F1B" }}>{m.name}</div>
                    {on && value && <div style={{ fontSize: 13, color: "#6E645C", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>}
                  </div>
                  {on ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: "#1E9E54", background: "#E7F6EC", borderRadius: 999, padding: "5px 11px", flexShrink: 0 }}>
                      <ELIcon name="check" size={13} color="#1E9E54" /> 已連結
                    </span>
                  ) : m.key === "phone" ? (
                    <button type="button" onClick={() => setPhoneBindOpen((v) => !v)} style={bindBtnStyle}>綁定</button>
                  ) : (
                    <a href={m.href} style={{ ...bindBtnStyle, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>綁定</a>
                  )}
                </div>
              );
            })}
          </div>

          {/* 手機綁定行內 OTP */}
          {!linked.includes("phone") && phoneBindOpen && (
            <div style={{ marginTop: 10, border: "1.5px solid #FFE0D2", background: "#FFF9F6", borderRadius: 14, padding: 14 }}>
              {!bindSent ? (
                <form action={bindSendAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 14, color: "#574E47" }}>輸入手機號碼，我們會發送驗證碼</div>
                  <input name="phone" type="tel" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} style={{ ...inputStyle, minHeight: 48 }} />
                  {bindSend && "error" in bindSend && <div style={{ fontSize: 13.5, color: "#C2410C" }}>{bindSend.error}</div>}
                  <button type="submit" disabled={bindSending} style={{ ...bindPrimaryStyle, opacity: bindSending ? 0.6 : 1 }}>{bindSending ? "發送中…" : "發送驗證碼"}</button>
                </form>
              ) : (
                <form action={bindVerifyAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input type="hidden" name="phone" value={bindSent ? bindSend.phone : bindPhone} />
                  <div style={{ fontSize: 14, color: "#574E47" }}>已發送至 {bindSent ? bindSend.phone : ""}，請輸入 6 位數驗證碼</div>
                  <input name="token" inputMode="numeric" maxLength={6} placeholder="6 位數驗證碼" style={{ ...inputStyle, minHeight: 48, letterSpacing: 6, textAlign: "center", fontWeight: 800 }} />
                  {bindVerify && "error" in bindVerify && <div style={{ fontSize: 13.5, color: "#C2410C" }}>{bindVerify.error}</div>}
                  <button type="submit" disabled={bindVerifying} style={{ ...bindPrimaryStyle, opacity: bindVerifying ? 0.6 : 1 }}>{bindVerifying ? "驗證中…" : "確認綁定"}</button>
                </form>
              )}
            </div>
          )}

          <p style={{ margin: "10px 2px 0", fontSize: 12.5, color: "#9C8E84", lineHeight: 1.6 }}>
            綁定多種登入方式後，無論用哪一種登入都是同一個帳號，紀錄都會留著。
          </p>
        </div>

        {state?.error && (
          <div style={{ marginTop: 16, background: "#FFF1E8", color: "#C2410C", borderRadius: 12, padding: "12px 16px", fontSize: 15 }}>{state.error}</div>
        )}

        <button type="submit" disabled={pending}
          style={{ marginTop: 26, width: "100%", height: 54, borderRadius: 14, border: "none", background: pending ? "#E4D7CC" : "#E0552E", color: "#fff", fontSize: 17, fontWeight: 800, cursor: pending ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {pending ? "儲存中…" : "儲存變更"}
        </button>
      </form>
    </div>
  );
}
