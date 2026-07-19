import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  tone?: "neutral" | "success" | "accent";
  className?: string;
};

const tones = {
  neutral: "text-muted border-line bg-paper",
  success: "text-success border-[rgba(15,118,110,0.25)] bg-[rgba(15,118,110,0.06)]",
  accent: "text-accent border-line bg-accent-soft",
};

export function Badge({ children, tone = "neutral", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium tracking-[0.04em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
