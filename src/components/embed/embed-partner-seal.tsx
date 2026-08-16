import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";
import type { EmbedTheme } from "@/components/embed/embed-theme";

/** Modern seal — mint on navy, soft outer glow. */
export function EmbedPartnerSeal({
  theme,
  className,
}: {
  theme: EmbedTheme;
  className?: string;
}) {
  const dark = theme === "dark";
  return (
    <span
      className={cn(
        "relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px]",
        dark
          ? "bg-[#7eb8a4] text-[#081412] shadow-[0_0_0_1px_rgba(126,184,164,0.35),0_8px_20px_rgba(126,184,164,0.18)]"
          : "bg-[#0e1f1c] text-[#7eb8a4] shadow-[0_0_0_1px_rgba(14,31,28,0.08),0_10px_24px_rgba(8,20,18,0.14)]",
        className,
      )}
      aria-hidden
    >
      <NetworkMark size={18} animate={false} />
    </span>
  );
}
