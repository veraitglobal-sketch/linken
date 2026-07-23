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

/** Single manila-folder layer on the evidence board. */
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
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`group flex w-full items-start gap-4 rounded-t-[20px] border px-5 py-4 text-left transition-colors ${
          open
            ? "border-white/15 bg-[#142a25] text-white"
            : "border-white/8 bg-[#0e1f1c] text-white/80 hover:border-white/14 hover:bg-[#122822]"
        }`}
      >
        <span
          className={`mt-0.5 font-mono text-[12px] tracking-[0.14em] ${
            done ? "text-blue-soft" : "text-white/30"
          }`}
        >
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[17px] font-medium tracking-[-0.03em]">
            {title}
          </span>
          <span className="mt-0.5 block text-[12px] text-white/45">{subtitle}</span>
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] uppercase ${
            done ? "bg-blue/20 text-blue-soft" : "bg-white/6 text-white/35"
          }`}
        >
          {done ? "Filed" : "Open"}
        </span>
      </button>
      {open ? (
        <div className="rounded-b-[20px] border border-t-0 border-white/10 bg-[#f4f6f4] p-5 sm:p-6">
          {children}
        </div>
      ) : null}
    </div>
  );
}
