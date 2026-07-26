import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";
import { dossierProofScore } from "@/lib/case-study-dossier";
import { confirmationLevelLabel } from "@/features/confirmations/meta";

type Props = { company: Company; caseStudy: CaseStudy };

/** Quiet credentials line — proof without SaaS chrome. */
export function CaseFileCredentials({ company, caseStudy }: Props) {
  const { layers } = dossierProofScore(caseStudy, company);
  const clientOk = caseStudy.clientConfirmation?.status === "confirmed";
  const clientName =
    caseStudy.clientConfirmation?.confirmedBy?.name ?? caseStudy.clientLabel;
  const depth = confirmationLevelLabel(
    caseStudy.clientConfirmation?.confirmationLevel,
  );

  const items = [
    clientOk && clientName
      ? {
          label: depth ? `Client confirmed · ${depth}` : "Client confirmed",
          value: clientName,
          ok: true,
        }
      : clientName
        ? { label: "Client", value: clientName, ok: false }
        : null,
    company.verified
      ? { label: "Publisher", value: company.name, ok: true }
      : { label: "Publisher", value: company.name, ok: false },
    caseStudy.metrics.length > 0 || caseStudy.highlightStat
      ? {
          label: "Impact",
          value: caseStudy.highlightStat || `${caseStudy.metrics.length} metrics`,
          ok: true,
        }
      : null,
    caseStudy.galleryUrls.length > 0
      ? { label: "Exhibit", value: `${caseStudy.galleryUrls.length} images`, ok: true }
      : null,
  ].filter((x): x is { label: string; value: string; ok: boolean } => x !== null);

  if (!items.length) return null;

  return (
    <div className="border-t border-[var(--cf-line)] mx-auto max-w-6xl px-6 py-8">
      <ul className="flex flex-wrap items-baseline gap-x-8 gap-y-4">
        {items.map((item) => (
          <li key={item.label} className="min-w-[140px]">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
              {item.label}
            </p>
            <p
              className={`mt-1 text-[15px] font-medium tracking-[-0.02em] ${
                item.ok ? "text-[var(--cf-ink)]" : "text-[var(--cf-muted)]"
              }`}
            >
              {item.value}
              {item.ok ? (
                <span className="ml-1.5 text-[11px] text-[var(--cf-accent)]">✓</span>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[12px] text-[var(--cf-muted)]">
        {layers.filter((l) => l.ok && l.kind === "verified").length} verified layers
        on Hansala
      </p>
    </div>
  );
}
