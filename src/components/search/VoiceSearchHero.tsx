"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    [index: number]: { transcript: string };
    0: { transcript: string };
    length: number;
  }>;
};
type SpeechRecognitionErrorEvent = { error: string; message?: string };
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
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
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState("");
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const r = new Ctor();
    r.lang = "zh-TW";
    r.continuous = false;
    r.interimResults = true;

    r.onstart = () => {
      setListening(true);
      setInterim("");
      setError("");
    };

    r.onresult = (e) => {
      let finalT = "";
      let interimT = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const t = res[0]?.transcript ?? "";
        if (res.isFinal) finalT += t;
        else interimT += t;
      }
      if (interimT) setInterim(interimT);
      if (finalT.trim()) {
        const cleaned = finalT.trim();
        setText(cleaned);
        setInterim("");
        if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
        navigateTimerRef.current = setTimeout(() => {
          router.push(`/search?q=${encodeURIComponent(cleaned)}&mode=intent`);
        }, 700);
      }
    };

    r.onerror = (e) => {
      const map: Record<string, string> = {
        "not-allowed": "請允許麥克風權限後再試一次",
        "no-speech": "沒有偵測到聲音，請靠近麥克風再試一次",
        network: "網路問題，請檢查網路連線",
        "audio-capture": "找不到麥克風裝置",
      };
      setError(map[e.error] ?? `語音辨識錯誤：${e.error}`);
      setListening(false);
    };

    r.onend = () => setListening(false);
    recogRef.current = r;

    return () => {
      try { r.abort(); } catch { /* noop */ }
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, [router]);

  function toggle() {
    if (!recogRef.current) return;
    setError("");
    if (listening) {
      recogRef.current.stop();
    } else {
      setText("");
      setInterim("");
      try {
        recogRef.current.start();
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

  const display = listening && interim ? interim : text;

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={display}
          onChange={(e) => {
            setText(e.target.value);
            setInterim("");
          }}
          placeholder="例：腳痛怎麼辦、附近有共餐嗎"
          className="flex-1 rounded-2xl px-6 py-5 text-xl outline-none"
          style={{
            background: "#FFFBEB",
            color: "#1C1917",
            border: `2px solid ${listening ? "#DC2626" : "rgba(253,230,138,0.7)"}`,
            fontStyle: listening && interim ? "italic" : "normal",
          }}
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
          <p className="text-base font-semibold" style={{ color: "#FECACA" }}>{error}</p>
        )}
        {listening && !interim && (
          <p className="text-base" style={{ color: "#FDE68A" }}>請說話，例如：「媽媽腳痛想去醫院」</p>
        )}
        {!listening && text && (
          <p className="text-base" style={{ color: "#FDE68A" }}>聽到：「{text}」，正在搜尋…</p>
        )}
      </div>
    </div>
  );
}
