import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink",
        "placeholder:text-muted outline-none transition-colors",
        "focus:border-blue focus:bg-surface focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]",
        className,
      )}
      {...props}
    />
  );
}
