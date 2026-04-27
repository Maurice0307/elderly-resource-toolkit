"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginWithEmail, registerWithEmail, signInWithGoogle } from "@/lib/auth/actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [loginState, loginAction, loginPending] = useActionState(loginWithEmail, null);
  const [regState, regAction, regPending] = useActionState(registerWithEmail, null);

  const error = mode === "login" ? loginState?.error : regState?.error;
  const pending = mode === "login" ? loginPending : regPending;

  return (
    <div
      className="w-full max-w-md rounded-3xl p-8 shadow-lg"
      style={{ background: "#FFFFFF", border: "2px solid #E7E5E4" }}
    >
      <Link href="/" className="text-lg font-medium" style={{ color: "#B45309" }}>
        ← 回首頁
      </Link>

      <h1 className="mt-5 text-3xl font-bold" style={{ color: "#1C1917" }}>
        {mode === "login" ? "登入帳號" : "建立帳號"}
      </h1>

      {/* 模式切換 */}
      <div
        className="mt-5 flex rounded-2xl p-1"
        style={{ background: "#F5F0E8" }}
      >
        <button
          type="button"
          onClick={() => setMode("login")}
          className="flex-1 rounded-xl py-3 text-lg font-semibold transition"
          style={
            mode === "login"
              ? { background: "#FFFFFF", color: "#B45309", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }
              : { color: "#78716C" }
          }
        >
          登入
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className="flex-1 rounded-xl py-3 text-lg font-semibold transition"
          style={
            mode === "register"
              ? { background: "#FFFFFF", color: "#B45309", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }
              : { color: "#78716C" }
          }
        >
          註冊
        </button>
      </div>

      {/* Email / Password form */}
      <form
        action={mode === "login" ? loginAction : regAction}
        className="mt-6 space-y-4"
      >
        {mode === "register" && (
          <div>
            <label
              htmlFor="display_name"
              className="mb-2 block text-lg font-medium"
              style={{ color: "#1C1917" }}
            >
              顯示名稱
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              placeholder="例：王小明"
              className="w-full rounded-xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
              style={{
                borderColor: "#E7E5E4",
                color: "#1C1917",
                background: "#FFFBF5",
              }}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-lg font-medium"
            style={{ color: "#1C1917" }}
          >
            電子郵件
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="example@email.com"
            className="w-full rounded-xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
            style={{
              borderColor: "#E7E5E4",
              color: "#1C1917",
              background: "#FFFBF5",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-lg font-medium"
            style={{ color: "#1C1917" }}
          >
            密碼
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? "至少 6 個字元" : ""}
            className="w-full rounded-xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
            style={{
              borderColor: "#E7E5E4",
              color: "#1C1917",
              background: "#FFFBF5",
            }}
          />
        </div>

        {error && (
          <div
            className="rounded-xl px-5 py-3 text-base"
            style={{ background: "#FEE2E2", color: "#991B1B" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl py-5 text-xl font-bold text-white transition disabled:opacity-60"
          style={{ background: "#B45309" }}
        >
          {pending ? "處理中…" : mode === "login" ? "登入" : "建立帳號"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1" style={{ height: 1, background: "#E7E5E4" }} />
        <span className="text-base" style={{ color: "#A8A29E" }}>
          或
        </span>
        <div className="flex-1" style={{ height: 1, background: "#E7E5E4" }} />
      </div>

      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-2xl border py-5 text-xl font-semibold transition hover:bg-gray-50"
          style={{ borderColor: "#E7E5E4", color: "#1C1917" }}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          使用 Google 帳號登入
        </button>
      </form>
    </div>
  );
}
