import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";
import type { EmbedTheme } from "@/components/embed/embed-theme";

/** Compact seal — mint mark on navy, readable at embed size. */
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
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ring-1",
        dark
          ? "bg-[#7eb8a4] text-[#081412] ring-[#7eb8a4]/40"
          : "bg-[#0e1f1c] text-[#7eb8a4] ring-black/10",
        className,
      )}
      aria-hidden
    >
      <NetworkMark size={20} animate={false} />
    </span>
  );
}
