import { cn } from "@/lib/cn";

type Props = {
  href?: string;
  className?: string;
  children?: string;
};

/** First focusable control — revealed on keyboard focus. */
export function SkipLink({
  href = "#main-content",
  className,
  children = "Skip to content",
}: Props) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white",
        "focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
    >
      {children}
    </a>
  );
}
