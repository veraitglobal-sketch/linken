import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-line bg-[#f7f8fa] px-3.5 text-sm text-ink",
        "placeholder:text-muted outline-none transition-colors",
        "focus:border-[#1f6b5c] focus:bg-white focus:ring-2 focus:ring-[rgba(31,107,92,0.15)]",
        className,
      )}
      {...props}
    />
  );
}
