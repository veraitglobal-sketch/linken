"use client";

import type { ReactNode } from "react";

type Props = {
  index: string;
  title: string;
  subtitle: string;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function StudioLayer({
  index,
  title,
  subtitle,
  done,
  open,
  onToggle,
  children,
}: Props) {
  return (
    <div className="border-b border-[var(--cf-line)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-baseline gap-6 py-5 text-left transition-colors hover:bg-white/50"
      >
        <span className="w-8 shrink-0 text-[12px] tabular-nums text-[var(--cf-muted)]">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-medium tracking-[-0.03em] text-[var(--cf-ink)]">
            {title}
          </span>
          <span className="mt-0.5 block text-[13px] text-[var(--cf-muted)]">{subtitle}</span>
        </span>
        <span className="text-[11px] text-[var(--cf-muted)]">{done ? "Done" : "—"}</span>
      </button>
      {open ? <div className="border-t border-[var(--cf-line)] bg-white px-6 py-6">{children}</div> : null}
    </div>
  );
}
