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
  sm: { box: "h-8 w-8 rounded-[10px]", icon: 14, name: "text-[12px]", sub: "text-[8px]" },
  md: { box: "h-10 w-10 rounded-[12px]", icon: 17, name: "text-[13px]", sub: "text-[9px]" },
  lg: { box: "h-12 w-12 rounded-[14px]", icon: 20, name: "text-[15px]", sub: "text-[10px]" },
} as const;

/** Hansala Verified lockup — the free-tier signature mark. */
export function EmbedVerifiedLockup({
  theme = "light",
  size = "md",
  subtitle = "Verified",
  className,
}: Props) {
  const dark = theme === "dark";
  const s = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center shadow-[0_2px_8px_rgba(10,23,20,0.12)]",
          s.box,
          dark ? "bg-[#7eb8a4] text-[#081412]" : "bg-[#0e1f1c] text-[#7eb8a4]",
        )}
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
            "mt-0.5 font-semibold tracking-[0.14em] uppercase",
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
