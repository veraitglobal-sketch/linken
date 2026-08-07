import { cn } from "@/lib/cn";

/** Shared focus ring for text links and icon buttons (WCAG 2.4.7 / 2.4.13). */
export const focusRingClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-soft)]";

export function focusableLinkClass(extra?: string) {
  return cn(
    "min-h-11 inline-flex items-center text-[13px] font-medium text-ink-soft hover:text-ink",
    focusRingClass,
    "rounded-sm",
    extra,
  );
}
