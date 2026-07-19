import {
  EmbedLinkenMark,
  EmbedProofRow,
  EmbedVerifiedMark,
  type EmbedProofCompany,
} from "@/components/embed/embed-brand";
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

/** ~72px card — company tile, serif name, proof row, Linken mark. */
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

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative flex min-h-[72px] w-full items-center gap-3 border px-3.5 py-2.5 no-underline",
        embedShellClass(theme),
      )}
    >
      <LogoTile
        name={name}
        initials={initials}
        logoUrl={logoUrl}
        website={website}
        size="md"
        frameTone={theme === "dark" ? "dark" : "light"}
      />
      <div className="min-w-0 flex-1 pr-14">
        <div className="flex min-w-0 items-center gap-1.5">
          <p
            className={cn(
              "truncate font-display text-[1.05rem] font-medium tracking-[-0.03em] leading-tight",
              embedInkClass(theme),
            )}
          >
            {name}
          </p>
          {showVerified ? <EmbedVerifiedMark theme={theme} /> : null}
          {!claimed ? (
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
        {showProof ? (
          <EmbedProofRow
            companies={proofCompanies}
            total={confirmedCount}
            theme={theme}
            compact
            className="mt-1.5"
          />
        ) : !claimed ? (
          <p className={cn("mt-1 text-[11px]", embedMutedClass(theme))}>
            Unclaimed profile
          </p>
        ) : null}
      </div>
      <EmbedLinkenMark
        theme={theme}
        className="absolute right-3 bottom-2.5"
      />
    </a>
  );
}
