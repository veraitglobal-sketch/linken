import { NetworkMark } from "@/components/marketing/network-mark";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  /** How many tiles to fill (0–5). Hansala's graphic row — not star ratings. */
  filled: number;
  theme?: EmbedTheme;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Five mint link-tiles — our answer to Trustpilot's star row.
 * Each filled tile = a confirmed relationship (capped at 5).
 */
export function EmbedTrustStrip({
  filled,
  theme = "light",
  size = "md",
  className,
}: Props) {
  const n = Math.max(0, Math.min(5, Math.floor(filled)));
  const box = size === "sm" ? "h-5 w-5 rounded-[3px]" : "h-6 w-6 rounded-[4px]";
  const icon = size === "sm" ? 9 : 11;

  return (
    <ul
      className={cn("flex shrink-0 items-center gap-0.5", className)}
      aria-label={`${n} of 5 confirmed links shown`}
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
                ? "bg-[#1a5c51] text-white"
                : theme === "dark"
                  ? "bg-white/10 text-white/25"
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
