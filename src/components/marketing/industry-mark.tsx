import type { ReactNode } from "react";

type IndustryKey = "architecture" | "construction" | "electrical";

const PATHS: Record<IndustryKey, ReactNode> = {
  architecture: (
    <>
      <path d="M4 19h16" />
      <path d="M6.5 19V9.5L12 5l5.5 4.5V19" />
      <path d="M12 19v-6" />
    </>
  ),
  construction: (
    <>
      <path d="M12 4 8.4 18.5h7.2L12 4Z" />
      <path d="M9.7 12.8h4.6" />
      <path d="M6.8 19h10.4" />
    </>
  ),
  electrical: <path d="M12.5 3 6 13h4.6l-1.1 8L17 11h-4.6l1.1-8Z" />,
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
