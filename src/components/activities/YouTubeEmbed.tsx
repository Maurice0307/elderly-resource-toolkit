"use client";

import { useState } from "react";

type Props = {
  url: string;
  title: string;
  startSeconds?: number;
};

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

// Lite-style YouTube embed: shows poster first, loads iframe only on click.
// Saves bandwidth & avoids loading YouTube JS until user actually wants the video.
export function YouTubeEmbed({ url, title, startSeconds }: Props) {
  const [loaded, setLoaded] = useState(false);
  const id = extractYouTubeId(url);

  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-lg font-semibold"
        style={{ background: "#FEF3C7", color: "#92400E" }}
      >
        ▶ 觀看示範影片（外部連結）
      </a>
    );
  }

  const startParam = startSeconds ? `?start=${startSeconds}&autoplay=1` : "?autoplay=1";
  const embedSrc = `https://www.youtube-nocookie.com/embed/${id}${startParam}`;
  const poster = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16 / 9", background: "#1C1917" }}
    >
      {loaded ? (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`播放：${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dim overlay so the play button stands out */}
          <span className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
          {/* Play badge */}
          <span
            className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-3xl shadow-lg transition group-hover:scale-110"
            style={{ background: "#FFFFFF", color: "#B71C1C" }}
            aria-hidden
          >
            ▶
          </span>
          <span
            className="absolute bottom-3 left-3 rounded-full px-3 py-1 text-sm font-semibold"
            style={{ background: "rgba(0,0,0,0.6)", color: "#FFFFFF" }}
          >
            點擊播放 · YouTube
          </span>
        </button>
      )}
    </div>
  );
}
