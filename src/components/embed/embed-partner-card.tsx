import { EmbedPartnerSeal } from "@/components/embed/embed-partner-seal";
import { EmbedPartnerTitle } from "@/components/embed/embed-partner-title";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  profileUrl: string;
  verified: boolean;
  referredCount: number;
  theme?: EmbedTheme;
};

/**
 * Partner badge — clear type, firm name, no broken gradient text.
 */
export function EmbedPartnerCard({
  name,
  profileUrl,
  verified,
  referredCount,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const meta =
    referredCount > 0
      ? referredCount === 1
        ? "1 company referred"
        : `${referredCount} companies referred`
      : "View on Hansala";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group box-border block w-full max-w-[440px] no-underline"
    >
      <span
        className={cn(
          "relative flex items-center gap-3.5 rounded-[20px] border px-4 py-3.5 transition-colors duration-150",
          dark
            ? "border-white/12 bg-[#0c1412] hover:border-white/20"
            : "border-black/[0.08] bg-white hover:border-black/[0.14]",
        )}
      >
        <EmbedPartnerSeal theme={theme} />

        <span className="min-w-0 flex-1">
          <EmbedPartnerTitle verified={verified} theme={theme} />

          <span
            className={cn(
              "mt-1.5 block truncate font-display text-[17px] font-semibold leading-tight tracking-[-0.035em]",
              dark ? "text-white" : "text-[#0d1210]",
            )}
          >
            {name}
          </span>

          <span
            className={cn(
              "mt-1.5 block text-[11px] leading-none",
              dark ? "text-[#a8b2ad]" : "text-[#66706b]",
            )}
          >
            {meta}
          </span>
        </span>
      </span>
    </a>
  );
}
