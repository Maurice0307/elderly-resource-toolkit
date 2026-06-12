"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ELIcon } from "@/components/layout/ELIcon";
import { ReportButton } from "@/components/resources/ReportButton";
import type { CommunicationScript } from "@/types/domain";

type NextScript = { slug: string; title: string } | null;

function IconBtn({ name, label, onClick }: { name: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
      <ELIcon name={name} size={21} color="#574E47" />
    </button>
  );
}

/* 對方（長輩 / 長者 / 對方）的回話，渲染成灰色中性泡泡，不要被誤會成「該說的話」 */
function isOther(role: string) {
  return /長輩|長者|對方|阿公|阿嬤|媽|爸/.test(role || "");
}

function SpeechBubble({ kind, role, text, reason }: { kind: "good" | "bad" | "reply"; role?: string; text: string; reason?: string }) {
  if (kind === "reply") {
    // 長輩回話：靠左、灰色，表示這是對方的反應，不是建議用語
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: "#EFE9E3", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ELIcon name="user" size={18} color="#9C8E84" />
        </div>
        <div style={{ maxWidth: "82%", background: "#F2ECE6", border: "1px solid #E6DBD0", borderRadius: 14, borderTopLeftRadius: 4, padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", marginBottom: 5 }}>{role || "長輩"}回應</div>
          <p style={{ margin: 0, fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>{text}</p>
        </div>
      </div>
    );
  }
  const good = kind === "good";
  // 你的話：靠右
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: "row-reverse" }}>
      <div style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: good ? "#E7F6EC" : "#FDECEC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ELIcon name={good ? "check" : "close"} size={18} color={good ? "#1E9E54" : "#D9534F"} />
      </div>
      <div style={{ maxWidth: "84%", background: good ? "#fff" : "#FAF6F2", border: `1px solid ${good ? "#9FDDB6" : "#EADFD5"}`, borderRadius: 14, borderTopRightRadius: 4, padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: good ? "#1E9E54" : "#9C8E84", marginBottom: 5 }}>
          {good ? "這樣說更暖" : "先別這樣說"}
        </div>
        <p style={{ margin: 0, fontSize: 16, color: "#241F1B", lineHeight: 1.6 }}>{text}</p>
        {!good && reason && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #EADFD5", display: "flex", gap: 6, fontSize: 13.5, color: "#D9534F", lineHeight: 1.5 }}>
            <ELIcon name="close" size={14} color="#D9534F" style={{ marginTop: 2 }} />
            <span style={{ flex: 1 }}>{reason}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileScriptDetail({ script, next }: { script: CommunicationScript; next: NextScript }) {
  const router = useRouter();
  const tag = script.tags?.[0] ?? "錦囊";

  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const saveKey = `comm:${script.slug}`;
  useEffect(() => {
    setShareUrl(window.location.href);
    try {
      setSaved(localStorage.getItem(saveKey) === "1");
    } catch {}
  }, [saveKey]);

  const toggleSave = () => {
    setSaved((v) => {
      const nv = !v;
      try {
        if (nv) localStorage.setItem(saveKey, "1");
        else localStorage.removeItem(saveKey);
      } catch {}
      return nv;
    });
  };

  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/scripts");
  };

  const shareMsg = `${script.title}｜幸福好厝邊 溝通錦囊`;
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`${shareMsg}\n${shareUrl}`)}`;
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMsg}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const shareSheet =
    shareOpen && typeof document !== "undefined"
      ? createPortal(
          <div onClick={() => setShareOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#fff", borderRadius: "22px 22px 0 0", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))" }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "#E4D7CC", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 14 }}>分享給家人</div>
              <a href={lineUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#06C755", color: "#fff", borderRadius: 14, padding: "14px 16px", fontSize: 16, fontWeight: 800, textDecoration: "none", marginBottom: 10 }}>
                <ELIcon name="send" size={20} color="#fff" /> 傳到 LINE
              </a>
              <button onClick={copyShare} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#FFF4EF", color: "#B23F1E", border: "1px solid #FFD6C7", borderRadius: 14, padding: "14px 16px", fontSize: 16, fontWeight: 800, cursor: "pointer", minHeight: 0 }}>
                <ELIcon name="chat" size={20} color="#B23F1E" /> {copied ? "已複製！" : "複製資訊"}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="wv-mobile-only" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      {/* 返回列 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE", background: "#fff" }}>
        <button onClick={back} aria-label="返回" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0, fontSize: 22, fontWeight: 800, color: "#241F1B" }}>溝通錦囊</div>
        <IconBtn name="send" label="分享" onClick={() => setShareOpen(true)} />
      </div>

      {/* 情境標題 */}
      <div style={{ background: "#fff", padding: "18px", borderBottom: "1px solid #F0E6DE" }}>
        <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFF1E8", color: "#C2410C", marginBottom: 10 }}>{tag}</span>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{script.title}</h1>
        {script.context && (
          <p style={{ margin: "10px 0 0", fontSize: 16, color: "#574E47", lineHeight: 1.65 }}>{script.context}</p>
        )}
      </div>

      {/* 換句話說 */}
      <div style={{ padding: "18px 18px 6px", fontSize: 18, fontWeight: 800, color: "#241F1B" }}>換句話說</div>
      <div style={{ padding: "12px 18px 6px", display: "flex", flexDirection: "column", gap: 14 }}>
        {script.ng_examples.map((b, i) => (
          <SpeechBubble key={`ng${i}`} kind={isOther(b.role) ? "reply" : "bad"} role={b.role} text={b.text} reason={b.reason} />
        ))}
        {script.ok_examples.map((b, i) => (
          <SpeechBubble key={`ok${i}`} kind={isOther(b.role) ? "reply" : "good"} role={b.role} text={b.text} />
        ))}
      </div>

      {/* 小提醒 */}
      {script.tips.length > 0 && (
        <div style={{ padding: "14px 18px 22px" }}>
          <div style={{ background: "#FFF4EF", border: "1px solid #FFE0D2", borderRadius: 18, padding: "15px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ELIcon name="bulb" size={20} color="#F26B43" />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>{script.tips.length} 個小提醒</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
              {script.tips.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 9, fontSize: 16, color: "#574E47", lineHeight: 1.55 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: "#fff", color: "#B23F1E", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 13.5, color: "#9C8E84" }}>
            內容需要修正？歡迎到「投稿」回報這則錦囊
          </div>
        </div>
      )}

      {/* 回報問題 */}
      <div style={{ display: "flex", justifyContent: "center", padding: "18px 18px 6px" }}>
        <ReportButton subject={script.title} kind="script" />
      </div>

      {/* 底部動作 */}
      <div style={{ position: "sticky", bottom: 0, borderTop: "1px solid #F0E6DE", padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", background: "#fff", display: "flex", gap: 10 }}>
        <button
          onClick={toggleSave}
          style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7, height: 50, padding: "0 18px", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            background: saved ? "#FFF4EF" : "#fff",
            color: saved ? "#B23F1E" : "#574E47",
            border: `1.5px solid ${saved ? "#F0A98E" : "#E4D7CC"}`,
          }}
        >
          <ELIcon name="heart" size={18} color={saved ? "#B23F1E" : "#574E47"} /> {saved ? "已收藏" : "收藏"}
        </button>
        {next ? (
          <button
            onClick={() => router.push(`/scripts/${next.slug}`)}
            style={{ flex: 1, height: 50, borderRadius: 14, border: "none", background: "#E0552E", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
          >
            看下一個情境
          </button>
        ) : (
          <button
            onClick={() => router.push("/scripts")}
            style={{ flex: 1, height: 50, borderRadius: 14, border: "none", background: "#E0552E", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
          >
            回錦囊列表
          </button>
        )}
      </div>

      {shareSheet}
    </div>
  );
}
