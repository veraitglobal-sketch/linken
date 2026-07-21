import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedHansalaSeal } from "@/components/embed/embed-linken-seal";
import { EmbedProofMarquee } from "@/components/embed/embed-proof-marquee";
import { EmbedTrustStrip } from "@/components/embed/embed-trust-strip";
import {
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { LogoTile } from "@/components/ui/logo-tile";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  website?: string | null;
  verified: boolean;
  claimed: boolean;
  confirmedCount: number;
  proofCompanies?: EmbedProofCompany[];
  profileUrl: string;
  theme?: EmbedTheme;
};

/**
 * Trust card: company left, proof slides center, Hansala seal fixed right.
 * Seal is its own link — never nest anchors.
 */
export function EmbedBadge({
  name,
  initials,
  logoUrl,
  website,
  verified,
  claimed,
  confirmedCount,
  proofCompanies = [],
  profileUrl,
  theme = "light",
}: Props) {
  const showVerified = claimed && verified;
  const showProof = claimed && confirmedCount > 0;
  const hasLogos = proofCompanies.length > 0;
  const stripFilled = showProof
    ? Math.min(5, confirmedCount)
    : showVerified
      ? 5
      : 0;

  return (
    <div
      className={cn(
        "relative flex min-h-[80px] w-full items-center gap-3 border py-2.5 pr-2 pl-3.5",
        embedShellClass(theme),
      )}
    >
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3 no-underline"
      >
        <LogoTile
          name={name}
          initials={initials}
          logoUrl={logoUrl}
          website={website}
          size="md"
          frameTone={theme === "dark" ? "dark" : "light"}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <div className="flex min-w-0 items-baseline gap-2">
            <p
              className={cn(
                "truncate font-display text-[1.05rem] font-medium tracking-[-0.03em] leading-tight",
                embedInkClass(theme),
              )}
            >
              {name}
            </p>
            {showProof ? (
              <span
                className={cn("shrink-0 text-[11px]", embedMutedClass(theme))}
              >
                <span
                  className={cn(
                    "font-display text-[13px] font-medium",
                    embedInkClass(theme),
                  )}
                >
                  {confirmedCount}
                </span>{" "}
                confirmed
              </span>
            ) : !claimed ? (
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold tracking-[0.08em] uppercase",
                  embedMutedClass(theme),
                )}
              >
                Unclaimed
              </span>
            ) : null}
          </div>

        {hasLogos ? (
          <EmbedProofMarquee companies={proofCompanies} theme={theme} />
        ) : stripFilled > 0 ? (
            <div className="flex items-center gap-2">
              <EmbedTrustStrip filled={stripFilled} theme={theme} size="sm" />
              {showVerified && !showProof ? (
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    theme === "dark" ? "text-[#7eb8a4]" : "text-[#1a5c51]",
                  )}
                >
                  Verified
                </span>
              ) : null}
            </div>
          ) : !claimed ? (
            <p className={cn("text-[11px]", embedMutedClass(theme))}>
              Unclaimed profile
            </p>
          ) : null}
        </div>
      </a>
      <EmbedHansalaSeal theme={theme} href={profileUrl} />
    </div>
  );
}
