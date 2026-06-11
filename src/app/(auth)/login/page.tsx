"use client";

import Link from "next/link";
import { useActionState, useState, useEffect, useRef } from "react";
import { sendPhoneOtp, verifyPhoneOtp, emailAuth } from "@/lib/auth/actions";
import { BrandLogo } from "@/components/layout/BrandLogo";

/* LINE SVG */
function LineIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

/* Google 彩色 G */
function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.6C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.6 5.6C41.9 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function PhoneIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3.5h3l1.8 4.5-2.3 1.4a11.5 11.5 0 0 0 5 5l1.4-2.3 4.5 1.8v3a2 2 0 0 1-2.1 2A16 16 0 0 1 4.5 5.6 2 2 0 0 1 6 3.5Z" />
    </svg>
  );
}

/* 6 格驗證碼輸入（每格一個數字，自動跳下一格，避免長輩打錯） */
function OtpBoxes() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");

  const setAt = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => { const n = [...prev]; n[i] = d; return n; });
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!t) return;
    e.preventDefault();
    setDigits([0, 1, 2, 3, 4, 5].map((i) => t[i] ?? ""));
    refs.current[Math.min(t.length, 5)]?.focus();
  };

  return (
    <>
      <input type="hidden" name="token" value={code} />
      <div style={{ display: "flex", gap: 8 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            inputMode="numeric"
            aria-label={`第 ${i + 1} 位`}
            style={{
              flex: 1, minWidth: 0, height: 60, textAlign: "center",
              fontSize: 26, fontWeight: 800, color: "#241F1B", background: "#fff",
              border: `2px solid ${d ? "#E0552E" : "#E4D7CC"}`, borderRadius: 13,
              outline: "none", fontFamily: "inherit",
            }}
          />
        ))}
      </div>
    </>
  );
}

type Step = "entry" | "phone" | "otp" | "email";
type SendResult = { error: string } | { sent: true; phone: string } | null;
type VerifyResult = { error: string } | null;

/* cast needed because server action param type is narrower than state union */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendPhoneOtpAction = sendPhoneOtp as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const verifyPhoneOtpAction = verifyPhoneOtp as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const emailAuthAction = emailAuth as any;

export default function LoginPage() {
  const [step, setStep] = useState<Step>("entry");
  const [phoneNum, setPhoneNum] = useState("09");
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) setUrlError(err);
  }, []);

  const [sendState, sendAction, sendPending] = useActionState<SendResult, FormData>(
    sendPhoneOtpAction, null
  );
  const [verifyState, verifyAction, verifyPending] = useActionState<VerifyResult, FormData>(
    verifyPhoneOtpAction, null
  );
  const [emailState, emailFormAction, emailPending] = useActionState<VerifyResult, FormData>(
    emailAuthAction, null
  );

  /* after OTP sent, advance to verify step */
  if (sendState && "sent" in sendState && step === "phone") {
    // will re-render and show OTP input
  }

  const sentPhone = sendState && "sent" in sendState ? sendState.phone : phoneNum;

  return (
    <div className="wv-login-shell" style={{
      display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg,#FFF1E9 0%,#FFE7DD 40%,#FFF4EF 100%)",
    }}>
      {/* Hero */}
      <div style={{ padding: "52px 24px 36px", textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
          background: "linear-gradient(135deg,#F2764F,#E0552E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 28px rgba(224,85,46,0.32)",
        }}>
          <BrandLogo size={38} color="#fff" />
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: "#241F1B" }}>歡迎回來</h1>
        <p style={{ margin: 0, fontSize: 16, color: "#574E47" }}>登入後可以收藏資源、記錄您的學習進度</p>
      </div>

      {/* Card */}
      <div className="wv-login-card" style={{
        flex: 1, background: "#fff", borderRadius: "28px 28px 0 0",
        padding: "32px 24px 40px", display: "flex", flexDirection: "column", gap: 0,
      }}>

        {step === "entry" && (
          <>
            {urlError && (
              <div style={{ background: "#FFF1E8", color: "#C2410C", borderRadius: 12, padding: "12px 16px", fontSize: 14.5, lineHeight: 1.5, marginBottom: 18 }}>
                登入未完成：{urlError}
              </div>
            )}
            {/* LINE button（自訂 OAuth 流程 → /auth/line） */}
            <a
              href="/auth/line"
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                background: "#06C755", color: "#fff", border: "none", borderRadius: 16,
                height: 58, fontSize: 19, fontWeight: 800, cursor: "pointer", textDecoration: "none",
                boxShadow: "0 6px 18px rgba(6,199,85,0.28)", boxSizing: "border-box",
              }}
            >
              <LineIcon size={26} /> 用 LINE 一鍵登入
            </a>
            <p style={{ margin: "10px 0 22px", textAlign: "center", fontSize: 14, color: "#6E645C" }}>
              最快、最方便 · 不用記密碼
            </p>

            {/* 或 divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{ flex: 1, height: 1, background: "#F0E6DE" }} />
              <span style={{ fontSize: 14, color: "#6E645C" }}>或</span>
              <div style={{ flex: 1, height: 1, background: "#F0E6DE" }} />
            </div>

            {/* Google button（自訂 OAuth 流程 → /auth/google） */}
            <a
              href="/auth/google"
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                background: "#fff", color: "#241F1B", border: "1.5px solid #E4D7CC", borderRadius: 16,
                height: 54, fontSize: 17, fontWeight: 800, cursor: "pointer", textDecoration: "none", boxSizing: "border-box",
              }}
            >
              <GoogleIcon size={22} /> 用 Google 登入
            </a>

            {/* Phone button */}
            <button
              onClick={() => setStep("phone")}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                background: "#fff", color: "#241F1B", border: "1.5px solid #E4D7CC", borderRadius: 16,
                height: 54, fontSize: 17, fontWeight: 800, cursor: "pointer", font: "inherit", marginTop: 12,
              }}
            >
              <span style={{ color: "#F26B43", display: "flex" }}><PhoneIcon size={22} /></span> 用手機號碼登入
            </button>

            {/* Skip */}
            <Link
              href="/"
              style={{
                display: "block", textAlign: "center", marginTop: 28,
                fontSize: 16, fontWeight: 800, color: "#B23F1E", textDecoration: "none",
              }}
            >
              先逛逛，暫不登入 ›
            </Link>

            <p style={{ margin: "auto 0 0", paddingTop: 32, textAlign: "center", fontSize: 13, color: "#6E645C", lineHeight: 1.7 }}>
              登入即表示同意{" "}
              <a href="/terms" style={{ color: "#B23F1E", fontWeight: 700 }}>服務條款</a>
              {" "}與{" "}
              <a href="/privacy" style={{ color: "#B23F1E", fontWeight: 700 }}>隱私權政策</a>
            </p>
          </>
        )}

        {step === "phone" && !(sendState && "sent" in sendState) && (
          <>
            <button
              onClick={() => setStep("entry")}
              style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: "#574E47", padding: 0, marginBottom: 24, font: "inherit" }}
            >
              ← 返回
            </button>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>輸入手機號碼</h2>
            <p style={{ margin: "0 0 24px", fontSize: 15, color: "#574E47" }}>我們將發送 6 位數驗證碼至您的手機</p>
            <form action={sendAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                name="phone"
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                placeholder="09XX-XXX-XXX"
                required
                style={{
                  width: "100%", border: "2px solid #E4D7CC", borderRadius: 13, padding: "14px 16px",
                  fontSize: 18, fontWeight: 600, color: "#241F1B", background: "#fff",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
              {sendState && "error" in sendState && (
                <div style={{ background: "#FFF1E8", color: "#C2410C", borderRadius: 10, padding: "10px 14px", fontSize: 15 }}>
                  {sendState.error}
                </div>
              )}
              <button
                type="submit"
                disabled={sendPending}
                style={{
                  width: "100%", background: "#E0552E", color: "#fff", border: "none",
                  borderRadius: 14, height: 54, fontSize: 17, fontWeight: 800,
                  cursor: "pointer", opacity: sendPending ? 0.6 : 1, font: "inherit",
                }}
              >
                {sendPending ? "發送中…" : "發送驗證碼"}
              </button>
            </form>
          </>
        )}

        {step === "phone" && sendState && "sent" in sendState && (
          <>
            <button
              onClick={() => { setStep("phone"); }}
              style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: "#574E47", padding: 0, marginBottom: 24, font: "inherit" }}
            >
              ← 重新發送
            </button>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>輸入驗證碼</h2>
            <p style={{ margin: "0 0 24px", fontSize: 15, color: "#574E47" }}>
              已發送至 {sentPhone}
            </p>
            <form action={verifyAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input type="hidden" name="phone" value={sentPhone} />
              <OtpBoxes />
              {verifyState && "error" in verifyState && (
                <div style={{ background: "#FFF1E8", color: "#C2410C", borderRadius: 10, padding: "10px 14px", fontSize: 15 }}>
                  {verifyState.error}
                </div>
              )}
              <button
                type="submit"
                disabled={verifyPending}
                style={{
                  width: "100%", background: "#E0552E", color: "#fff", border: "none",
                  borderRadius: 14, height: 54, fontSize: 17, fontWeight: 800,
                  cursor: "pointer", opacity: verifyPending ? 0.6 : 1, font: "inherit",
                }}
              >
                {verifyPending ? "驗證中…" : "確認登入"}
              </button>
            </form>
          </>
        )}

        {step === "email" && (
          <>
            <button
              onClick={() => setStep("entry")}
              style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: "#574E47", padding: 0, marginBottom: 22, font: "inherit" }}
            >
              ← 返回
            </button>

            {/* 登入 / 註冊 切換 */}
            <div style={{ display: "flex", gap: 6, background: "#F5EFE9", borderRadius: 14, padding: 5, marginBottom: 22 }}>
              {(["login", "register"] as const).map((m) => {
                const on = emailMode === m;
                return (
                  <button key={m} type="button" onClick={() => setEmailMode(m)}
                    style={{ flex: 1, height: 42, borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: 15.5, fontWeight: 800, background: on ? "#fff" : "transparent", color: on ? "#B23F1E" : "#9C8E84", boxShadow: on ? "0 2px 6px rgba(40,30,20,0.08)" : "none" }}>
                    {m === "login" ? "登入" : "註冊"}
                  </button>
                );
              })}
            </div>

            <form action={emailFormAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input type="hidden" name="mode" value={emailMode} />
              {emailMode === "register" && (
                <input
                  name="display_name"
                  type="text"
                  placeholder="您的稱呼（例：陳秀英）"
                  style={{ width: "100%", border: "2px solid #E4D7CC", borderRadius: 13, padding: "14px 16px", fontSize: 17, fontWeight: 600, color: "#241F1B", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              )}
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                style={{ width: "100%", border: "2px solid #E4D7CC", borderRadius: 13, padding: "14px 16px", fontSize: 17, fontWeight: 600, color: "#241F1B", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              <input
                name="password"
                type="password"
                placeholder="密碼（至少 6 個字）"
                required
                minLength={6}
                style={{ width: "100%", border: "2px solid #E4D7CC", borderRadius: 13, padding: "14px 16px", fontSize: 17, fontWeight: 600, color: "#241F1B", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              {emailState && "error" in emailState && (
                <div style={{ background: "#FFF1E8", color: "#C2410C", borderRadius: 10, padding: "10px 14px", fontSize: 15, lineHeight: 1.5 }}>
                  {emailState.error}
                </div>
              )}
              <button
                type="submit"
                disabled={emailPending}
                style={{ width: "100%", background: "#E0552E", color: "#fff", border: "none", borderRadius: 14, height: 54, fontSize: 17, fontWeight: 800, cursor: "pointer", opacity: emailPending ? 0.6 : 1, font: "inherit" }}
              >
                {emailPending ? "處理中…" : emailMode === "login" ? "登入" : "註冊並開始"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
