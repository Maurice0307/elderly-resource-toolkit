"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="回到頁面頂端"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition hover:scale-105"
      style={{
        background: "var(--cta)",
        color: "var(--cta-on)",
        border: "2px solid rgba(255,255,255,0.4)",
      }}
    >
      ↑
      <span className="sr-only">回到頂端</span>
    </button>
  );
}
