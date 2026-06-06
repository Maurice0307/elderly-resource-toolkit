"use client";

import { useState } from "react";

type Props = {
  phone: string;
  phoneHint?: string | null;
  resourceName: string;
};

export function CallButton({ phone, phoneHint, resourceName }: Props) {
  const [open, setOpen] = useState(false);
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl py-6 text-2xl font-bold shadow-md transition active:scale-95"
        style={{ background: "var(--success)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
        aria-label={`撥打 ${resourceName} 電話 ${phone}`}
      >
        <span className="icon-lg">📞</span>&nbsp;撥打電話
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="call-dialog-title"
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: "rgba(44,62,80,0.65)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
            style={{ background: "var(--bg-page)" }}
          >
            <p className="text-lg font-semibold" style={{ color: "var(--text-secondary)" }}>
              即將撥打
            </p>
            <h3
              id="call-dialog-title"
              className="mt-1 text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {resourceName}
            </h3>
            <div
              className="mt-4 rounded-2xl px-6 py-5 text-center text-5xl font-black tracking-widest"
              style={{ background: "var(--success-soft)", color: "var(--success)" }}
            >
              {phone}
            </div>

            {phoneHint ? (
              <div
                className="mt-5 rounded-2xl px-5 py-4"
                style={{ background: "var(--bg-accent)", border: "1px solid #FDE68A" }}
              >
                <p className="text-base font-bold" style={{ color: "#92400E" }}>
                  💬 您可以這樣說：
                </p>
                <p
                  className="mt-2 text-xl leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                >
                  {phoneHint}
                </p>
              </div>
            ) : null}

            <div className="mt-7 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl py-5 text-xl font-semibold"
                style={{ background: "var(--border)", color: "var(--text-primary)", minHeight: "var(--hit)" }}
              >
                取消
              </button>
              <a
                href={telHref}
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new Event("resource:interact"));
                }}
                className="inline-flex items-center justify-center rounded-2xl py-5 text-xl font-bold"
                style={{ background: "var(--success)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
              >
                立即撥打
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
