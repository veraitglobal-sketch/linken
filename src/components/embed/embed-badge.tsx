import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo-mark";
import {
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  verified: boolean;
  claimed: boolean;
  partnerCount: number;
  caseStudyCount: number;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Badge embed — card with partner / case study counts. */
export function EmbedBadge({
  name,
  initials,
  logoUrl,
  verified,
  claimed,
  partnerCount,
  caseStudyCount,
  profileUrl,
  theme = "light",
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full items-center gap-3 border px-4 py-3 no-underline transition-colors",
        embedShellClass(theme),
      )}
    >
      <LogoMark initials={initials} logoUrl={logoUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "truncate text-sm font-semibold",
              embedInkClass(theme),
            )}
          >
            {name}
          </p>
          {claimed && verified ? <Badge tone="success">Verified</Badge> : null}
          {!claimed ? (
            <span
              className={cn(
                "text-[10px] font-semibold tracking-[0.08em] uppercase",
                embedMutedClass(theme),
              )}
            >
              Unclaimed
            </span>
          ) : null}
        </div>
        <p className={cn("mt-0.5 text-[12px]", embedMutedClass(theme))}>
          {!claimed
            ? "Unclaimed profile"
            : `${partnerCount} verified partner${partnerCount === 1 ? "" : "s"} · ${caseStudyCount} case stud${caseStudyCount === 1 ? "y" : "ies"}`}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 text-[11px] font-semibold tracking-[0.1em] uppercase",
          embedMutedClass(theme),
        )}
      >
        Linken
      </span>
    </a>
  );
}
