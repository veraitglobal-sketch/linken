"use client";

import { useCallback, useState } from "react";
import { HomeVideoLightbox } from "@/components/marketing/home-video-lightbox";
import { HOME_VIDEO, youtubeIdFromUrl } from "@/features/marketing/home-video";
import { cn } from "@/lib/cn";

/** Secondary hero pill — outline, play glyph; opens the explainer in a lightbox. */
export function HomeVideoButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const youtubeId = youtubeIdFromUrl(HOME_VIDEO.youtubeUrl);
  if (!youtubeId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-[50px] items-center justify-center gap-2.5 rounded-full border border-ink px-6 text-[16px] font-semibold text-ink transition-colors duration-200 hover:bg-white/40",
          className,
        )}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M3.2 1.8v10.4L12 7 3.2 1.8Z" fill="currentColor" />
        </svg>
        Watch video
      </button>
      <HomeVideoLightbox
        open={open}
        onClose={close}
        youtubeId={youtubeId}
        title={HOME_VIDEO.title}
      />
    </>
  );
}
