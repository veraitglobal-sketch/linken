import type { TrustProfile } from "@/features/trust/queries";
import {
  trustEvidenceLines,
  type TrustEvidenceLine,
} from "@/features/trust/score";

type Props = {
  trust: TrustProfile;
};

const ANCHORS: Record<TrustEvidenceLine["key"], string> = {
  partners: "#partners",
  ongoing: "#references",
  references: "#references",
  "client-cases": "#case-studies",
  "partner-cases": "#case-studies",
};

export function TrustWhyCard({ trust }: Props) {
  if (trust.points === 0) return null;

  const lines = trustEvidenceLines(trust.breakdown);

  if (lines.length === 0) return null;

  return (
    <aside className="rounded-[24px] bg-surface p-4 ring-1 ring-line/70 sm:p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-lime-soft text-navy">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2.2 13 4v3.8c0 3-2.1 5.1-5 6-2.9-.9-5-3-5-6V4l5-1.8Z" />
            <path d="m5.8 8 1.6 1.6 2.9-3" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="font-display text-[16px] leading-tight font-semibold tracking-[-0.03em] text-ink">
            Hansala {trust.level}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {trust.points} point{trust.points === 1 ? "" : "s"} from confirmed evidence only
          </p>
        </div>
      </div>
      <ul className="mt-4 list-none space-y-1 border-t border-line/70 p-0 pt-3">
        {lines.map((line) => (
          <li key={line.key}>
            <a
              href={ANCHORS[line.key]}
              className="flex items-baseline justify-between gap-3 rounded-xl px-2 py-1.5 text-[13.5px] text-ink transition-colors hover:bg-wash"
            >
              <span>{line.label}</span>
              <span className="shrink-0 text-[12.5px] font-semibold text-ink tabular-nums">
                +{line.points}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
