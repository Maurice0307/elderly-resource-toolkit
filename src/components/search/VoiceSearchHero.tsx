"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};
type SpeechRecognitionErrorEvent = { error: string; message?: string };
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function VoiceSearchHero() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState("");
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const r = new Ctor();
    r.lang = "zh-TW";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      setText(t);
      if (t.trim()) {
        router.push(`/search?q=${encodeURIComponent(t.trim())}&mode=intent`);
      }
    };
    r.onerror = (e) => {
      setError(`語音辨識錯誤：${e.error}`);
      setListening(false);
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    return () => {
      try { r.stop(); } catch {}
    };
  }, [router]);

  function toggle() {
    if (!recogRef.current) return;
    setError("");
    if (listening) {
      recogRef.current.stop();
    } else {
      try {
        recogRef.current.start();
        setListening(true);
      } catch (e) {
        setError(`無法啟動麥克風：${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    router.push(`/search?q=${encodeURIComponent(text.trim())}&mode=intent`);
  }

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例：腳痛怎麼辦、附近有共餐嗎"
          className="flex-1 rounded-2xl px-6 py-5 text-xl outline-none"
          style={{ background: "#FFFBEB", color: "#1C1917", border: "2px solid rgba(253,230,138,0.7)" }}
        />
        <button
          type="submit"
          className="rounded-2xl px-7 py-5 text-xl font-bold transition"
          style={{ background: "#FFFBEB", color: "#92400E" }}
        >
          搜尋
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={!supported}
          aria-label={listening ? "停止錄音" : "開始語音搜尋"}
          className="inline-flex items-center justify-center gap-3 rounded-full px-10 py-5 text-xl font-bold shadow-xl transition"
          style={{
            background: listening ? "#DC2626" : "#FFFBEB",
            color: listening ? "#FFFFFF" : "#92400E",
            cursor: supported ? "pointer" : "not-allowed",
            opacity: supported ? 1 : 0.6,
          }}
        >
          {listening ? "🔴 錄音中…點擊停止" : "🎙 按一下說話"}
        </button>
        {!supported && (
          <p className="text-base" style={{ color: "#FDE68A" }}>
            您的瀏覽器不支援語音辨識，請改用 Chrome 或 Safari
          </p>
        )}
        {error && (
          <p className="text-base" style={{ color: "#FECACA" }}>{error}</p>
        )}
        {listening && (
          <p className="text-base" style={{ color: "#FDE68A" }}>請說話，例如：「腳痛怎麼辦」</p>
        )}
      </div>
    </div>
  );
}
