"use client";

import { useState, useEffect, useActionState } from "react";
import { completeOnboarding, type OnboardingState } from "@/lib/auth/actions";
import { ELIcon } from "@/components/layout/ELIcon";

type District = { id: string; code: string; name: string };
type County = { id: string; code: string; name: string; districts: District[] };

const IDENTITIES = [
  { key: "elder",     icon: "user",  name: "我是長輩", desc: "想找適合自己的資源與服務" },
  { key: "family",    icon: "heart", name: "我是家人", desc: "幫長輩找服務、學陪伴技巧" },
  { key: "volunteer", icon: "like",  name: "我是志工", desc: "想回答問題、分享在地資源" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onboardingAction = completeOnboarding as any;

export function Onboarding({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(onboardingAction, null);
  const [identity, setIdentity] = useState("");
  const [counties, setCounties] = useState<County[]>([]);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [openCounty, setOpenCounty] = useState<string | null>(null);
  const [regionId, setRegionId] = useState("");
  const [regionLabel, setRegionLabel] = useState("");

  useEffect(() => {
    fetch("/api/location/regions").then((r) => r.json())
      .then((d) => setCounties(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  function pickDistrict(county: County, d: District) {
    setRegionId(d.id);
    setRegionLabel(`${county.name} · ${d.name}`);
    setRegionPickerOpen(false);
    setOpenCounty(null);
  }

  return (
    <div className="wv-login-shell" style={{ display: "flex", flexDirection: "column", background: "#fff" }}>
      {/* 進度條 */}
      <div style={{ flexShrink: 0, padding: "20px 24px 8px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#E4D7CC", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", background: "#E0552E" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#6E645C" }}>最後一步</span>
      </div>

      <form action={action} style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 24px 0", overflowY: "auto" }}>
        <input type="hidden" name="identity" value={identity} />
        <input type="hidden" name="region_id" value={regionId} />
        <input type="hidden" name="region_label" value={regionLabel} />

        <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#241F1B" }}>請問您是？</h1>
        <p style={{ margin: "0 0 20px", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>
          {defaultName ? `${defaultName}，` : ""}我們會依照您的身分，優先推薦合適的內容
        </p>

        {/* 身分卡 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {IDENTITIES.map((it) => {
            const active = identity === it.key;
            return (
              <button
                type="button" key={it.key} onClick={() => setIdentity(it.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", borderRadius: 18,
                  background: active ? "#FFF4EF" : "#fff", cursor: "pointer", font: "inherit", textAlign: "left",
                  border: `2px solid ${active ? "#E0552E" : "#F0E6DE"}`,
                  boxShadow: active ? "none" : "0 2px 8px rgba(40,30,20,0.04)",
                }}
              >
                <span style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: active ? "#fff" : "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ELIcon name={it.icon} size={27} color="#F26B43" />
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#241F1B" }}>{it.name}</span>
                  <span style={{ display: "block", marginTop: 3, fontSize: 13.5, color: "#574E47", lineHeight: 1.5 }}>{it.desc}</span>
                </span>
                <span style={{
                  width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                  border: `2px solid ${active ? "#E0552E" : "#E4D7CC"}`, background: active ? "#E0552E" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {active && <ELIcon name="check" size={16} color="#fff" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* 地區 */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 16, color: "#574E47", marginBottom: 8 }}>您的所在地區</div>
          <button
            type="button" onClick={() => setRegionPickerOpen((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px", minHeight: 54, width: "100%", border: "2px solid #E4D7CC", borderRadius: 13, background: "#fff", font: "inherit", cursor: "pointer" }}
          >
            <ELIcon name="pin" size={21} color="#F26B43" />
            <span style={{ flex: 1, textAlign: "left", fontSize: 17, fontWeight: 700, color: regionLabel ? "#241F1B" : "#9B8E85" }}>
              {regionLabel || "選擇縣市與行政區"}
            </span>
            <ELIcon name="chevron" size={16} color="#B23F1E" style={{ transform: regionPickerOpen ? "rotate(270deg)" : "rotate(90deg)" }} />
          </button>

          {regionPickerOpen && (
            <div style={{ marginTop: 8, border: "1.5px solid #F0E6DE", borderRadius: 14, padding: 8, maxHeight: 280, overflowY: "auto" }}>
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
                          style={{ padding: "9px 6px", borderRadius: 10, border: "1.5px solid #E4D7CC", background: "#fff", cursor: "pointer", font: "inherit", fontSize: 14.5, fontWeight: 700, color: "#574E47" }}>
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

        {state?.error && (
          <div style={{ marginTop: 14, background: "#FFF1E8", color: "#C2410C", borderRadius: 12, padding: "12px 16px", fontSize: 15 }}>{state.error}</div>
        )}

        <div style={{ flex: 1 }} />

        {/* 完成 */}
        <div style={{ position: "sticky", bottom: 0, background: "#fff", padding: "16px 0 24px", marginTop: 16 }}>
          <button
            type="submit" disabled={!identity || pending}
            style={{
              width: "100%", height: 56, borderRadius: 999, border: "none",
              background: !identity || pending ? "#E4D7CC" : "#E0552E", color: "#fff",
              fontSize: 18, fontWeight: 800, cursor: !identity || pending ? "not-allowed" : "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              boxShadow: !identity || pending ? "none" : "0 6px 16px rgba(224,85,46,0.26)",
            }}
          >
            {pending ? "設定中…" : <>完成，開始使用 <ELIcon name="arrow" size={20} color="#fff" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
