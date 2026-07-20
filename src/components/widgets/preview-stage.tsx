"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Classic transparency checkerboard — forest-tinted paper. */
export const CHECKERBOARD_STYLE: CSSProperties = {
  backgroundColor: "#f1f3f1",
  backgroundImage: `
    linear-gradient(45deg, #e2e6e3 25%, transparent 25%),
    linear-gradient(-45deg, #e2e6e3 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e2e6e3 75%),
    linear-gradient(-45deg, transparent 75%, #e2e6e3 75%)
  `,
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
};

type Props = {
  /** null = checkerboard; hex color = solid site background */
  color: string | null;
  className?: string;
  children: ReactNode;
};

export function PreviewStage({ color, className, children }: Props) {
  return (
    <div
      className={cn(
        "relative flex flex-1 items-start justify-center overflow-auto rounded-2xl border border-line p-4 sm:p-6",
        className,
      )}
      style={color ? { background: color } : CHECKERBOARD_STYLE}
    >
      {children}
    </div>
  );
}
