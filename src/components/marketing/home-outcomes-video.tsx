"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HomeVideoLightbox } from "@/components/marketing/home-video-lightbox";
import {
  HOME_VIDEO,
  youtubeIdFromUrl,
} from "@/features/marketing/home-video";

/**
 * Muted loop on the page (motion). Click opens a YouTube lightbox — not a
 * new tab. No sound on the loop.
 */
export function HomeOutcomesVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const youtubeId = youtubeIdFromUrl(HOME_VIDEO.youtubeUrl);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tryPlay = () => {
      void el.play().catch(() => {
        /* Autoplay may be blocked; poster still shows. */
      });
    };
    tryPlay();
    const onVis = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (youtubeId) setOpen(true);
        }}
        disabled={!youtubeId}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-navy text-left shadow-[0_22px_56px_rgba(8,20,18,0.14)] transition-[transform,box-shadow] duration-300 enabled:hover:shadow-[0_28px_64px_rgba(8,20,18,0.2)] disabled:cursor-default sm:aspect-[16/11] sm:rounded-[28px]"
        aria-label={
          youtubeId
            ? `${HOME_VIDEO.label} (opens video)`
            : HOME_VIDEO.label
        }
      >
        <video
          ref={ref}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HOME_VIDEO.poster}
          aria-hidden
        >
          <source src={HOME_VIDEO.src} type="video/mp4" />
        </video>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/55 via-transparent to-navy/10"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2.5 p-5 sm:p-6">
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-white">
            {HOME_VIDEO.label}
          </span>
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_24px_rgba(8,20,18,0.25)] transition-transform duration-200 group-hover:scale-105 group-disabled:scale-100"
            aria-hidden
          >
            <PlayIcon />
          </span>
        </div>
      </button>
      {youtubeId ? (
        <HomeVideoLightbox
          open={open}
          onClose={close}
          youtubeId={youtubeId}
          title={HOME_VIDEO.title}
        />
      ) : null}
    </>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3.2 1.8v10.4L12 7 3.2 1.8Z" fill="currentColor" />
    </svg>
  );
}
