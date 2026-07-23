import { dossierProofScore, type DossierLayer } from "@/lib/case-study-dossier";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = { company: Company; caseStudy: CaseStudy };

const KIND_BAR: Record<DossierLayer["kind"], string> = {
  verified: "bg-blue",
  "self-reported": "bg-ember",
  uploaded: "bg-white/40",
  pending: "bg-white/10",
};

export function DossierRail({ company, caseStudy }: Props) {
  const { layers, score, total, verified } = dossierProofScore(caseStudy, company);

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="rounded-[24px] border border-line bg-surface p-5 shadow-[0_16px_48px_rgba(8,20,18,0.08)]">
        <div className="flex items-center gap-4">
          <ProofRing score={score} total={total} />
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-blue uppercase">
              Evidence rail
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink-soft">
              {verified} verified · {score}/{total} layers complete
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {layers.map((layer) => (
            <li
              key={layer.id}
              className="flex items-center gap-3 rounded-xl bg-paper/80 px-3 py-2.5"
            >
              <span
                className={`h-8 w-1 shrink-0 rounded-full ${KIND_BAR[layer.kind]}`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">
                  {layer.label}
                </span>
                <span className="block text-[10px] tracking-[0.08em] text-muted uppercase">
                  {layer.ok ? layer.kind.replace("-", " ") : "missing"}
                </span>
              </span>
              <span className="text-[12px] font-bold text-ink/40">
                {layer.ok ? "✓" : "·"}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
          Scroll the record on the right. This rail stays pinned — buyers always
          see what&apos;s verified.
        </p>
      </div>
    </aside>
  );
}

function ProofRing({ score, total }: { score: number; total: number }) {
  const pct = total ? (score / total) * 100 : 0;
  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--blue) ${pct}%, var(--line) ${pct}%)`,
      }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface font-display text-sm font-medium tabular-nums text-ink">
        {score}/{total}
      </span>
    </div>
  );
}
