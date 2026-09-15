import type { EmbedTheme } from "@/components/embed/embed-theme";
import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";

/**
 * The verify line every partner widget carries: the mark, the count, and who
 * checked it. It has no hide setting — the logos mean nothing without it.
 */
export function EmbedLogoLockup({
  count,
  href,
  theme,
  className,
}: {
  count: number;
  href: string;
  theme: EmbedTheme;
  className?: string;
}) {
  const dark = theme === "dark";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Confirmed on Hansala"
      className={cn("inline-flex shrink-0 items-center gap-2.5 no-underline", className)}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          dark ? "bg-[#7eb8a4] text-[#081412]" : "bg-[#0e1f1c] text-[#7eb8a4]",
        )}
      >
        <NetworkMark size={15} animate={false} />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className={cn("text-[14px] font-semibold tracking-[-0.01em]", dark ? "text-white" : "text-[#0d1210]")}>
          {count} confirmed {count === 1 ? "partner" : "partners"}
        </span>
        <span className={cn("mt-0.5 text-[11px]", dark ? "text-white/55" : "text-[#66706b]")}>Verified by Hansala</span>
      </span>
    </a>
  );
}
