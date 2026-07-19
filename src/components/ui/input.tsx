import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[8px] border border-line bg-surface px-3.5 text-sm text-ink",
        "placeholder:text-muted outline-none transition-colors",
        "focus:border-accent focus:ring-2 focus:ring-[rgba(26,77,109,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
