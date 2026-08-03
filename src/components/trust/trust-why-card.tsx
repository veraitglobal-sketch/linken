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
          <li key={line.key}>
            <a
              href={ANCHORS[line.key]}
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
