import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo-mark";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  verified: boolean;
  claimed: boolean;
  partnerCount: number;
  caseStudyCount: number;
  profileUrl: string;
};

/** Default embed variant — keep visual contract for existing embeds. */
export function EmbedBadge({
  name,
  initials,
  logoUrl,
  verified,
  claimed,
  partnerCount,
  caseStudyCount,
  profileUrl,
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 border border-line bg-white px-4 py-3 no-underline transition-colors hover:bg-paper"
    >
      <LogoMark initials={initials} logoUrl={logoUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          {claimed && verified ? <Badge tone="success">Verified</Badge> : null}
          {!claimed ? (
            <span className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
              Unclaimed
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[12px] text-muted">
          {!claimed
            ? "Unclaimed profile"
            : `${partnerCount} verified partner${partnerCount === 1 ? "" : "s"} · ${caseStudyCount} case stud${caseStudyCount === 1 ? "y" : "ies"}`}
        </p>
      </div>
      <span className="shrink-0 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
        Linken
      </span>
    </a>
  );
}
