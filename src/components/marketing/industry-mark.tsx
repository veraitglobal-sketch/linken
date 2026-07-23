import type { ReactNode } from "react";

type IndustryKey = "services" | "technology" | "trades";

const PATHS: Record<IndustryKey, ReactNode> = {
  services: (
    <>
      <path d="M4 8h16v11H4Z" />
      <path d="M9 8V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v2" />
    </>
  ),
  technology: (
    <>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
    </>
  ),
  trades: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
  ),
};

type Props = {
  type: IndustryKey;
  size?: number;
  className?: string;
};

/** Monoline glyphs drawn to match NetworkMark's weight — a small custom set, not a stock icon library. */
export function IndustryMark({ type, size = 13, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[type]}
    </svg>
  );
}
