"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/components/a11y/use-focus-trap";

type Props = {
  open: boolean;
  onClose: () => void;
  youtubeId: string;
  title: string;
};

/** Dark lightbox with YouTube embed — Vapi-style in-page watch. */
export function HomeVideoLightbox({
  open,
  onClose,
  youtubeId,
  title,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, onClose, panelRef);

  /* Scroll lock lives only in useFocusTrap. A second lock here captured
     overflow:"hidden" as the "previous" value and restored it on close,
     freezing the page. When closed, force-clear both roots. */
  useEffect(() => {
    if (open) return;
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-deep/70 px-4 py-8 backdrop-blur-[3px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-[#0a1210] shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <p
            id={titleId}
            className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white/90"
          >
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close video"
          >
            <span className="text-[18px] leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        <div className="relative aspect-video w-full bg-black">
          <iframe
            title={title}
            src={src}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
