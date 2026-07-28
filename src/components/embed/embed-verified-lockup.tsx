import { NetworkMark } from "@/components/marketing/network-mark";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { embedInkClass, embedMutedClass } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  theme?: EmbedTheme;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  className?: string;
};

const SIZES = {
  sm: { box: "h-7 w-7 rounded-md", icon: 12, name: "text-[12px]", sub: "text-[8px]" },
  md: { box: "h-9 w-9 rounded-lg", icon: 15, name: "text-[13px]", sub: "text-[9px]" },
  lg: { box: "h-11 w-11 rounded-lg", icon: 18, name: "text-[15px]", sub: "text-[10px]" },
} as const;

/**
 * Hansala quality mark — the thing hosts want on their site.
 * Precise seal + wordmark. Recognizable without fighting the host brand.
 */
export function EmbedVerifiedLockup({
  theme = "light",
  size = "md",
  subtitle = "Verified",
  className,
}: Props) {
  const dark = theme === "dark";
  const s = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center ring-1",
          s.box,
          dark
            ? "bg-[#7eb8a4] text-[#081412] ring-[#7eb8a4]/40"
            : "bg-[#0e1f1c] text-[#7eb8a4] ring-black/10",
        )}
        aria-hidden
      >
        <NetworkMark size={s.icon} animate={false} />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-[-0.03em]",
            s.name,
            embedInkClass(theme),
          )}
        >
          Hansala
        </span>
        <span
          className={cn(
            "mt-0.5 font-semibold tracking-[0.16em] uppercase",
            s.sub,
            embedMutedClass(theme),
          )}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );
}
