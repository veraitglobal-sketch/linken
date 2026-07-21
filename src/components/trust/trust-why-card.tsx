import type { TrustProfile } from "@/features/trust/queries";

type Props = {
  trust: TrustProfile;
};

export function TrustWhyCard({ trust }: Props) {
  if (trust.points === 0) return null;

  const lines = [
    trust.breakdown.confirmedPartners > 0
      ? {
          label: `${trust.breakdown.confirmedPartners} confirmed partner${trust.breakdown.confirmedPartners === 1 ? "" : "s"}`,
          href: "#partners",
          points: trust.breakdown.confirmedPartners * 2,
        }
      : null,
    trust.breakdown.ongoingReferences > 0
      ? {
          label: `${trust.breakdown.ongoingReferences} ongoing client${trust.breakdown.ongoingReferences === 1 ? "" : "s"}`,
          href: "#references",
          points: trust.breakdown.ongoingReferences * 3,
        }
      : null,
    trust.breakdown.confirmedReferences > 0
      ? {
          label: `${trust.breakdown.confirmedReferences} completed reference${trust.breakdown.confirmedReferences === 1 ? "" : "s"}`,
          href: "#references",
          points: trust.breakdown.confirmedReferences * 2,
        }
      : null,
    trust.breakdown.clientConfirmedCaseStudies > 0
      ? {
          label: `${trust.breakdown.clientConfirmedCaseStudies} client-confirmed case stud${trust.breakdown.clientConfirmedCaseStudies === 1 ? "y" : "ies"}`,
          href: "#case-studies",
          points: trust.breakdown.clientConfirmedCaseStudies * 3,
        }
      : null,
    trust.breakdown.partnerConfirmedCaseStudies > 0
      ? {
          label: `${trust.breakdown.partnerConfirmedCaseStudies} partner-confirmed case stud${trust.breakdown.partnerConfirmedCaseStudies === 1 ? "y" : "ies"}`,
          href: "#case-studies",
          points: trust.breakdown.partnerConfirmedCaseStudies * 2,
        }
      : null,
  ].filter(Boolean) as { label: string; href: string; points: number }[];

  if (lines.length === 0) return null;

  return (
    <aside className="rounded-[28px] border border-line bg-surface px-5 py-5 shadow-[0_18px_50px_rgba(10,20,18,0.06)]">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Why this level
      </p>
      <p className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Hansala {trust.level}
      </p>
      <p className="mt-1 text-[13px] text-ink-soft">
        {trust.points} point{trust.points === 1 ? "" : "s"} from confirmed
        evidence only.
      </p>
      <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
        {lines.map((line) => (
          <li key={line.label}>
            <a
              href={line.href}
              className="flex items-baseline justify-between gap-3 text-[13px] text-ink transition-colors hover:text-[#1a5c51]"
            >
              <span>{line.label}</span>
              <span className="shrink-0 text-[12px] text-muted">
                +{line.points}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
