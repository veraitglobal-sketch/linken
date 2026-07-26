"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookChrome,
  type BookChromeProps,
} from "@/components/scheduling/book-chrome";

type Props = BookChromeProps & {
  open: boolean;
  onClose: () => void;
  profileHref?: string;
};

/** Full-viewport booking rail — portaled to body so hero overflow/transform cannot clip it. */
export function BookSheet({ open, onClose, profileHref, ...chrome }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]" role="presentation">
      <button
        type="button"
        aria-label="Close booking"
        className="absolute inset-0 bg-[#081412]/55 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={chrome.label ?? "Book a call"}
        className="absolute inset-x-0 bottom-0 flex h-[min(92dvh,860px)] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/20 bg-white shadow-[0_-24px_80px_rgba(8,20,18,0.35)] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[min(100%,28rem)] sm:rounded-none sm:rounded-l-[28px] sm:border-l sm:border-t-0 md:w-[min(100%,32rem)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-5">
          {profileHref ? (
            <a
              href={profileHref}
              className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              View profile
            </a>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <BookChrome {...chrome} fill />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
