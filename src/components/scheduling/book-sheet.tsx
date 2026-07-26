"use client";

import { useEffect } from "react";
import {
  BookChrome,
  type BookChromeProps,
} from "@/components/scheduling/book-chrome";

type Props = BookChromeProps & {
  open: boolean;
  onClose: () => void;
};

export function BookSheet({ open, onClose, ...chrome }: Props) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-[#081412]/50 backdrop-blur-[3px]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={chrome.label ?? "Book a call"}
        className="flex h-full w-full max-w-lg flex-col border-l border-white/20 bg-white/92 shadow-[-24px_0_64px_rgba(8,20,18,0.28)] backdrop-blur-xl sm:max-w-xl"
      >
        <div className="flex items-center justify-end px-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <BookChrome {...chrome} />
        </div>
      </div>
    </div>
  );
}
