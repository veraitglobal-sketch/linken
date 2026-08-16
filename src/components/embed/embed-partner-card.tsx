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
 * Premium partner credential for agency sites.
 * Engraved plaque: seal + Verified Hansala + silver Developer Partner + firm.
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
      : "Confirm on Hansala";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group box-border block w-full max-w-[460px] no-underline"
    >
      <span
        className={cn(
          "relative block overflow-hidden rounded-chapter border shadow-chapter transition-[box-shadow,transform] duration-200 ease-out",
          "group-hover:-translate-y-px",
          dark
            ? "border-white/[0.08] bg-[#0e1f1c] group-hover:shadow-hero"
            : "border-[#0e1f1c]/[0.10] bg-[#f7f8f7] group-hover:shadow-chapter",
        )}
      >
        {/* Inner engraved frame */}
        <span
          className={cn(
            "pointer-events-none absolute inset-[1px] rounded-[27px] ring-1",
            dark ? "ring-white/[0.06]" : "ring-[#0e1f1c]/[0.05]",
          )}
          aria-hidden
        />
        {/* Top specular edge */}
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px",
            dark
              ? "bg-gradient-to-r from-transparent via-white/25 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#0e1f1c]/15 to-transparent",
          )}
          aria-hidden
        />
        <span
          className="stage-grain pointer-events-none absolute inset-0 opacity-[0.22]"
          aria-hidden
        />

        <span className="relative flex items-center gap-4 px-5 py-5">
          <EmbedPartnerSeal theme={theme} />

          <span className="min-w-0 flex-1">
            <EmbedPartnerTitle verified={verified} theme={theme} />

            <span
              className={cn(
                "mt-3 block h-px w-10",
                dark ? "bg-white/14" : "bg-[#0e1f1c]/12",
              )}
              aria-hidden
            />

            <span
              className={cn(
                "mt-3 block truncate font-display text-[16px] font-semibold leading-tight tracking-[-0.035em]",
                dark ? "text-[#f2f5f3]" : "text-[#0d1210]",
              )}
            >
              {name}
            </span>
            <span
              className={cn(
                "mt-1.5 block text-[11px] font-medium tracking-[0.02em]",
                dark ? "text-[#a8b2ad]" : "text-[#66706b]",
              )}
            >
              {meta}
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}
