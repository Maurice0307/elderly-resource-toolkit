import Link from "next/link";

export const metadata = { title: "投稿成功" };

export default function ThanksPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center"
      style={{ background: "var(--bg-page)" }}
    >
      <div className="text-8xl">🎉</div>

      <h1 className="mt-6 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
        投稿成功，謝謝你！
      </h1>
      <p className="mt-4 max-w-md text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        我們的志工審核通過後，這筆資源就會公開顯示，幫助更多需要的人。
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/submit"
          className="rounded-2xl px-8 py-5 text-xl font-semibold transition"
          style={{ background: "var(--bg-accent)", color: "#92400E", border: "2px solid #FDE68A", minHeight: "var(--hit)" }}
        >
          再投一筆
        </Link>
        <Link
          href="/"
          className="rounded-2xl px-8 py-5 text-xl font-bold"
          style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
        >
          回首頁
        </Link>
      </div>
    </main>
  );
}
