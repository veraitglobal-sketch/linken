import { EmbedPartnerSeal } from "@/components/embed/embed-partner-seal";
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
 * Modern partner credential for agency sites.
 * Readable type only — no bg-clip. Mint rail + seal as the one accent.
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
      className="group box-border block w-full max-w-[420px] no-underline"
    >
      <span
        className={cn(
          "relative flex overflow-hidden rounded-card border transition-[box-shadow,border-color,transform] duration-200 ease-out",
          "group-hover:-translate-y-px",
          dark
            ? "border-white/[0.10] bg-[#0e1f1c] shadow-[0_20px_48px_rgba(0,0,0,0.35)] group-hover:border-white/[0.16]"
            : "border-[#0e1f1c]/[0.07] bg-white shadow-card group-hover:border-[#0e1f1c]/[0.12] group-hover:shadow-chapter",
        )}
      >
        {/* Mint status rail */}
        <span
          className="w-[3px] shrink-0 bg-[#7eb8a4]"
          aria-hidden
        />

        <span className="flex min-w-0 flex-1 items-start gap-3.5 px-4 py-3.5">
          <EmbedPartnerSeal theme={theme} className="mt-0.5" />

          <span className="min-w-0 flex-1 pt-0.5">
            {verified ? (
              <span
                className={cn(
                  "block text-[10px] font-semibold tracking-[0.16em] uppercase",
                  dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
                )}
              >
                Verified
              </span>
            ) : null}

            <span
              className={cn(
                "mt-1 block font-display text-[14px] leading-[1.25] tracking-[-0.02em]",
                dark ? "text-[#f2f5f3]" : "text-[#0d1210]",
              )}
            >
              <span className="font-semibold">Hansala</span>{" "}
              <span
                className={cn(
                  "font-bold",
                  dark ? "text-[#c5cdc8]" : "text-[#8a9390]",
                )}
              >
                Developer Partner
              </span>
            </span>

            <span
              className={cn(
                "mt-2.5 block h-px w-full max-w-[180px]",
                dark
                  ? "bg-gradient-to-r from-white/18 to-transparent"
                  : "bg-gradient-to-r from-[#0e1f1c]/12 to-transparent",
              )}
              aria-hidden
            />

            <span
              className={cn(
                "mt-2.5 block truncate font-display text-[16px] font-semibold leading-tight tracking-[-0.035em]",
                dark ? "text-white" : "text-[#0d1210]",
              )}
            >
              {name}
            </span>

            <span
              className={cn(
                "mt-1 block text-[11px] font-medium tracking-[0.01em]",
                dark ? "text-[#a8b2ad]" : "text-[#66706b]",
              )}
            >
              {meta}
              <span
                className={cn(
                  "ml-1 opacity-0 transition-opacity duration-150 group-hover:opacity-70",
                  dark ? "text-white" : "text-[#0e1f1c]",
                )}
              >
                →
              </span>
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}
