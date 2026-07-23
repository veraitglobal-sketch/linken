import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full resize-y rounded-xl border border-line bg-paper px-3.5 py-3 text-sm leading-relaxed text-ink",
        "placeholder:text-muted outline-none transition-colors",
        "focus:border-blue focus:bg-surface focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]",
        className,
      )}
      {...props}
    />
  );
}
