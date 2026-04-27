"use client";

import { useState } from "react";
import type { ActivityStep } from "@/types/domain";

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
        <span className="text-base font-semibold" style={{ color: "#B45309" }}>
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
                background: i === current ? "#B45309" : "#E7E5E4",
              }}
            />
          ))}
        </div>
      </div>

      {/* 步驟卡片 */}
      <div
        className="mt-4 min-h-64 rounded-3xl p-8 shadow-sm"
        style={{ background: "#FFFFFF", border: "2px solid #E7E5E4" }}
      >
        <div
          className="inline-block rounded-full px-4 py-1 text-base font-bold"
          style={{ background: "#FEF3C7", color: "#92400E" }}
        >
          步驟 {step.order}
        </div>
        <h3
          className="mt-4 text-3xl font-bold leading-snug"
          style={{ color: "#1C1917" }}
        >
          {step.title}
        </h3>
        <p
          className="mt-4 text-xl leading-relaxed"
          style={{ color: "#44403C" }}
        >
          {step.description}
        </p>
        {step.tip ? (
          <div
            className="mt-6 flex gap-3 rounded-2xl px-5 py-4"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
          >
            <span className="text-2xl">💡</span>
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
          style={{ background: "#F5F0E8", color: "#1C1917" }}
        >
          ← 上一步
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={() => setCurrent(0)}
            className="rounded-2xl py-5 text-xl font-bold text-white"
            style={{ background: "#15803D" }}
          >
            🎉 重新開始
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrent((c) => c + 1)}
            className="rounded-2xl py-5 text-xl font-bold text-white"
            style={{ background: "#B45309" }}
          >
            下一步 →
          </button>
        )}
      </div>

      {/* 所有步驟一覽 */}
      <details className="mt-8">
        <summary
          className="cursor-pointer select-none text-lg font-medium"
          style={{ color: "#78716C" }}
        >
          查看全部步驟
        </summary>
        <ol className="mt-4 space-y-4">
          {steps.map((s, i) => (
            <li
              key={s.order}
              className="flex gap-4 rounded-2xl p-5"
              style={{ background: i === current ? "#FEF3C7" : "#F5F0E8" }}
            >
              <span
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                style={{ background: i === current ? "#B45309" : "#A8A29E" }}
              >
                {s.order}
              </span>
              <div>
                <div className="text-xl font-bold" style={{ color: "#1C1917" }}>
                  {s.title}
                </div>
                <div
                  className="mt-1 text-base leading-relaxed"
                  style={{ color: "#57534E" }}
                >
                  {s.description}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </details>

      {/* 圖卡分享（文字版，不依賴 html-to-image） */}
      <div className="mt-6">
        <p className="text-base font-medium" style={{ color: "#B45309" }}>
          🖼 完整圖卡分享功能請在詳情頁使用
        </p>
      </div>
    </div>
  );
}
