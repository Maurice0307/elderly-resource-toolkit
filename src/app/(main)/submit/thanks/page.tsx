import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "投稿成功" };

export default function ThanksPage() {
  return (
    <main
      style={{
        background: "#fff", minHeight: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "32px 28px", paddingBottom: 24,
        textAlign: "center",
      }}
    >
      {/* 成功圖示（設計稿：桃色圓底 + 線條圖示） */}
      <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
        <ELIcon name="check" size={46} color="#F26B43" stroke={2.4} />
      </div>

      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#241F1B" }}>
        投稿成功，謝謝你！
      </h1>
      <p style={{ margin: "12px 0 0", fontSize: 16, color: "#574E47", lineHeight: 1.7, maxWidth: 300 }}>
        志工審核通過後，這筆資源就會公開顯示，幫助更多需要的厝邊。
      </p>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "#E0552E", color: "#fff",
            borderRadius: 14, padding: "15px", fontSize: 16.5, fontWeight: 800, textDecoration: "none",
            boxShadow: "0 6px 16px rgba(224,85,46,0.26)",
          }}
        >
          回首頁
        </Link>
        <Link
          href="/submit"
          style={{
            display: "block", background: "#FFF4EF", color: "#B23F1E",
            border: "1.5px solid #FFD6C7", borderRadius: 14,
            padding: "15px", fontSize: 16, fontWeight: 800, textDecoration: "none",
          }}
        >
          再投一筆
        </Link>
      </div>
    </main>
  );
}
