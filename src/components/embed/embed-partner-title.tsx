import { cn } from "@/lib/cn";
import type { EmbedTheme } from "@/components/embed/embed-theme";

type Props = {
  verified: boolean;
  theme: EmbedTheme;
};

/**
 * Title first — real letters only (no bg-clip / transparent tricks).
 * “Developer Partner” in solid silver.
 */
export function EmbedPartnerTitle({ verified, theme }: Props) {
  const dark = theme === "dark";

  return (
    <span className="min-w-0">
      <span
        className={cn(
          "block font-display text-[15px] font-semibold leading-snug tracking-[-0.025em]",
          dark ? "text-[#f2f5f3]" : "text-[#0d1210]",
        )}
      >
        {verified ? "Verified Hansala " : "Hansala "}
        <span
          className={cn(
            "font-bold",
            dark ? "text-[#c5cdc8]" : "text-[#7a8580]",
          )}
        >
          Developer Partner
        </span>
      </span>
    </span>
  );
}
