import { caseStudyEvidenceLedger } from "@/lib/case-study-blueprint";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = { company: Company; caseStudy: CaseStudy };

const KIND: Record<
  ReturnType<typeof caseStudyEvidenceLedger>[number]["kind"],
  { label: string; className: string }
> = {
  verified: {
    label: "Verified",
    className: "bg-[#1a5c51]/12 text-blue",
  },
  "self-reported": {
    label: "Self-reported",
    className: "bg-paper text-muted",
  },
  uploaded: {
    label: "Uploaded",
    className: "bg-ember/10 text-ember",
  },
  pending: {
    label: "Pending",
    className: "border border-line bg-surface text-muted",
  },
};

/** Hansala-only — separates claims from confirmed evidence. */
export function CaseStudyEvidenceLedger({ company, caseStudy }: Props) {
  const rows = caseStudyEvidenceLedger(caseStudy, company);

  return (
    <section>
      <div className="mb-4 px-0.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          Evidence ledger
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.035em] text-ink">
          What&apos;s confirmed vs. what&apos;s narrative
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Ordinary case studies mix marketing copy with logos. Hansala tags every
          layer so buyers know exactly what was verified.
        </p>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-[28px] border border-line bg-surface">
        {rows.map((row) => {
          const badge = KIND[row.kind];
          return (
            <li
              key={row.label}
              className="flex flex-wrap items-start justify-between gap-3 px-6 py-5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-ink">{row.label}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {row.detail}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.06em] uppercase ${badge.className}`}
              >
                {badge.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
