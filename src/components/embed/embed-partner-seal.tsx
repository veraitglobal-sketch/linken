import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";
import type { EmbedTheme } from "@/components/embed/embed-theme";

/** Engraved circular seal — credential weight, not a UI icon tile. */
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
        "relative flex h-[58px] w-[58px] shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          dark
            ? "bg-[linear-gradient(145deg,#2a3d38_0%,#0e1f1c_45%,#081412_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_28px_rgba(0,0,0,0.35)]"
            : "bg-[linear-gradient(145deg,#1a2e2a_0%,#0e1f1c_50%,#081412_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_28px_rgba(8,20,18,0.22)]",
        )}
      />
      <span
        className={cn(
          "absolute inset-[3px] rounded-full ring-1",
          dark ? "ring-[#7eb8a4]/35" : "ring-[#7eb8a4]/40",
        )}
      />
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#7eb8a4] text-[#081412]">
        <NetworkMark size={17} animate={false} />
      </span>
    </span>
  );
}
