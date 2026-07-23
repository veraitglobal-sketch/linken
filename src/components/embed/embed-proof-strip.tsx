import { NetworkMark } from "@/components/marketing/network-mark";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  filled: number;
  theme?: EmbedTheme;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Trustpilot-style proof row — mint link tiles, never partner logos.
 */
export function EmbedProofStrip({
  filled,
  theme = "light",
  size = "md",
  className,
}: Props) {
  const n = Math.max(0, Math.min(5, Math.floor(filled)));
  const dark = theme === "dark";
  const box =
    size === "sm"
      ? "h-[22px] w-[22px] rounded-[4px]"
      : "h-[26px] w-[26px] rounded-[5px]";
  const icon = size === "sm" ? 10 : 12;

  return (
    <ul
      className={cn("flex shrink-0 items-center gap-[3px]", className)}
      aria-label={`${n} of 5 proof tiles`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const on = i < n;
        return (
          <li
            key={i}
            className={cn(
              "flex items-center justify-center",
              box,
              on
                ? dark
                  ? "bg-[#7eb8a4] text-[#081412]"
                  : "bg-[#1a5c51] text-white"
                : dark
                  ? "bg-white/10 text-white/20"
                  : "bg-[#dfe5e2] text-[#b0b8b4]",
            )}
            aria-hidden
          >
            <NetworkMark size={icon} animate={false} />
          </li>
        );
      })}
    </ul>
  );
}
