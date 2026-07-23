import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedProofMarquee } from "@/components/embed/embed-proof-marquee";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { embedPremiumShell } from "@/components/embed/embed-premium-shell";
import { LogoTile } from "@/components/ui/logo-tile";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  website?: string | null;
  verified: boolean;
  confirmedCount: number;
  proofCompanies?: EmbedProofCompany[];
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Pro — company identity + sliding proof + verified seal. */
export function EmbedProofPanel({
  name,
  initials,
  logoUrl,
  website,
  verified,
  confirmedCount,
  proofCompanies = [],
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const hasLogos = proofCompanies.length > 0;

  return (
    <div
      className={cn(
        "flex min-h-[88px] w-full items-stretch gap-0 overflow-hidden",
        embedPremiumShell(theme, "pro"),
      )}
    >
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 no-underline"
      >
        <LogoTile
          name={name}
          initials={initials}
          logoUrl={logoUrl}
          website={website}
          size="md"
          frameTone={dark ? "dark" : "light"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <p
              className={cn(
                "truncate font-display text-[1.05rem] font-medium tracking-[-0.03em]",
                embedInkClass(theme),
              )}
            >
              {name}
            </p>
            {verified ? (
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold tracking-[0.1em] uppercase",
                  dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
                )}
              >
                Verified
              </span>
            ) : null}
          </div>
          {hasLogos ? (
            <EmbedProofMarquee
              companies={proofCompanies}
              theme={theme}
              className="mt-2"
            />
          ) : (
            <p className={cn("mt-1 text-[12px]", embedMutedClass(theme))}>
              Confirmed on Hansala
            </p>
          )}
        </div>
      </a>

      <div
        className={cn(
          "flex shrink-0 flex-col items-end justify-center gap-2 border-l px-3.5 py-3",
          dark ? "border-white/12 bg-white/[0.03]" : "border-[#0e1f1c]/08 bg-[#0e1f1c]/[0.02]",
        )}
      >
        {confirmedCount > 0 ? (
          <p className="text-right leading-none">
            <span
              className={cn(
                "font-display text-[1.35rem] font-medium tracking-[-0.04em] tabular-nums",
                embedInkClass(theme),
              )}
            >
              {confirmedCount}
            </span>
            <span className={cn("ml-1 text-[10px] font-semibold uppercase", embedMutedClass(theme))}>
              links
            </span>
          </p>
        ) : null}
        <EmbedVerifiedLockup theme={theme} size="sm" />
      </div>
    </div>
  );
}
