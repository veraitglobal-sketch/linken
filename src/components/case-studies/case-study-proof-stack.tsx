import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Layer = { ok: boolean; label: string; detail: string };

type Props = {
  company: Company;
  caseStudy: CaseStudy;
};

/** Hansala-only — what is verified vs narrative on this page. */
export function CaseStudyProofStack({ company, caseStudy }: Props) {
  const clientOk = caseStudy.clientConfirmation?.status === "confirmed";
  const partnerCount = caseStudy.partners.filter((p) => p.confirmed).length;
  const companyVerified = Boolean(company.verified);

  const layers: Layer[] = [
    {
      ok: clientOk,
      label: "Client confirmed delivery",
      detail: clientOk
        ? "The receiving company confirmed this project on Hansala."
        : "Pending — invite the client to confirm when the story is ready.",
    },
    {
      ok: partnerCount > 0,
      label: "Partners confirmed roles",
      detail:
        partnerCount > 0
          ? `${partnerCount} partner${partnerCount > 1 ? "s" : ""} confirmed their role on this case.`
          : "Tag Hansala partners and ask them to confirm their contribution.",
    },
    {
      ok: companyVerified,
      label: "Verified company profile",
      detail: companyVerified
        ? `${company.name} has a verified domain on Hansala.`
        : "Domain verification adds a trust layer to the publisher.",
    },
    {
      ok: caseStudy.metrics.length > 0,
      label: "Project metrics published",
      detail:
        caseStudy.metrics.length > 0
          ? "Key numbers are shown on this page — self-reported by the firm."
          : "Add 2–3 metrics in the studio to highlight impact.",
    },
  ];

  const score = layers.filter((l) => l.ok).length;

  return (
    <section>
      <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_14px_48px_rgba(8,20,18,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/80 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
              Hansala proof stack
            </p>
            <p className="mt-1 text-[14px] text-ink-soft">
              Ordinary case studies claim. This one shows what&apos;s confirmed.
            </p>
          </div>
          <p className="font-display text-2xl font-medium tabular-nums tracking-[-0.03em] text-ink">
            {score}/{layers.length}
          </p>
        </div>
        <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
          {layers.map((layer) => (
            <li key={layer.label} className="px-6 py-5">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    layer.ok
                      ? "bg-[#1a5c51]/12 text-blue"
                      : "bg-paper text-muted"
                  }`}
                >
                  {layer.ok ? "✓" : "·"}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{layer.label}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {layer.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
