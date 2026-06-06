import Link from "next/link";

export const metadata = { title: "投稿成功" };

export default function ThanksPage() {
  return (
    <main
      style={{
        background: "var(--bg-page)", minHeight: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "32px 18px", paddingBottom: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "4rem", lineHeight: 1 }}>🎉</div>

      <h1 style={{ margin: "16px 0 0", fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)" }}>
        投稿成功，謝謝你！
      </h1>
      <p style={{ margin: "10px 0 0", fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: 280 }}>
        我們的志工審核通過後，這筆資源就會公開顯示，幫助更多需要的人。
      </p>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
        <Link
          href="/submit"
          style={{
            display: "block", background: "var(--cta-soft)", color: "var(--cta-ink)",
            border: "1.5px solid var(--bg-peach)", borderRadius: 14,
            padding: "14px", fontSize: "1rem", fontWeight: 700, textDecoration: "none",
          }}
        >
          再投一筆
        </Link>
        <Link
          href="/"
          style={{
            display: "block", background: "var(--cta)", color: "#fff",
            borderRadius: 14, padding: "14px", fontSize: "1rem", fontWeight: 800, textDecoration: "none",
          }}
        >
          回首頁
        </Link>
      </div>
    </main>
  );
}
