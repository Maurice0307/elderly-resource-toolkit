"use client";

import { useState } from "react";
import type { ActivityStep } from "@/types/domain";
import { YouTubeEmbed } from "./YouTubeEmbed";

type Props = {
  steps: ActivityStep[];
  cardTitle: string;
};

export function StepViewer({ steps, cardTitle }: Props) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  return (
    <div className="mt-6">
      {/* 進度指示 */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold" style={{ color: "var(--cta)" }}>
          第 {current + 1} 步，共 {steps.length} 步
        </span>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`跳到第 ${i + 1} 步`}
              className="h-3 rounded-full transition-all"
              style={{
                width: i === current ? 32 : 12,
                background: i === current ? "var(--cta)" : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      {/* 步驟卡片 */}
      <div
        className="mt-4 rounded-3xl p-6 shadow-sm sm:p-8"
        style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
      >
        <div
          className="inline-block rounded-full px-4 py-1 text-base font-bold"
          style={{ background: "var(--bg-accent)", color: "#92400E" }}
        >
          步驟 {step.order}
        </div>
        <h3
          className="mt-4 text-3xl font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {step.title}
        </h3>

        {/* 步驟示意圖（若有） */}
        {step.image_url ? (
          <div
            className="mt-5 overflow-hidden rounded-2xl"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={step.image_url}
              alt={step.title}
              loading="lazy"
              className="block h-auto w-full"
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : null}

        <p
          className="mt-4 text-xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {step.description}
        </p>

        {/* 步驟教學影片（若有） */}
        {step.video_url ? (
          <div className="mt-5">
            <YouTubeEmbed
              url={step.video_url}
              title={`${cardTitle} — ${step.title}`}
              startSeconds={step.video_start}
            />
          </div>
        ) : null}

        {step.tip ? (
          <div
            className="mt-6 flex gap-3 rounded-2xl px-5 py-4"
            style={{ background: "var(--success-soft)", border: "1px solid #A7F3D0" }}
          >
            <span className="icon-lg text-2xl">💡</span>
            <p className="text-lg leading-relaxed" style={{ color: "#065F46" }}>
              {step.tip}
            </p>
          </div>
        ) : null}
      </div>

      {/* 上一步 / 下一步 */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={isFirst}
          className="rounded-2xl py-5 text-xl font-semibold transition disabled:opacity-40"
          style={{ background: "var(--bg-soft)", color: "var(--text-primary)", minHeight: "var(--hit)" }}
        >
          ← 上一步
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={() => setCurrent(0)}
            className="rounded-2xl py-5 text-xl font-bold"
            style={{ background: "var(--success)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
          >
            🎉 重新開始
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrent((c) => c + 1)}
            className="rounded-2xl py-5 text-xl font-bold"
            style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
          >
            下一步 →
          </button>
        )}
      </div>

      {/* 所有步驟一覽 */}
      <details className="mt-8">
        <summary
          className="cursor-pointer select-none text-lg font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          查看全部步驟
        </summary>
        <ol className="mt-4 space-y-4">
          {steps.map((s, i) => (
            <li
              key={s.order}
              className="flex gap-4 rounded-2xl p-5"
              style={{ background: i === current ? "var(--bg-accent)" : "var(--bg-soft)" }}
            >
              <span
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold"
                style={{ background: i === current ? "var(--cta)" : "var(--text-muted)", color: "var(--cta-on)" }}
              >
                {s.order}
              </span>
              <div>
                <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {s.title}
                </div>
                <div
                  className="mt-1 text-base leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {s.description}
                </div>
                {s.video_url ? (
                  <div className="mt-1 text-sm font-semibold" style={{ color: "var(--alert)" }}>
                    🎬 此步驟有教學影片
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </details>

      {/* 圖卡分享（文字版，不依賴 html-to-image） */}
      <div className="mt-6">
        <p className="text-base font-medium" style={{ color: "var(--cta)" }}>
          🖼 完整圖卡分享功能請在詳情頁使用
        </p>
      </div>
    </div>
  );
}
