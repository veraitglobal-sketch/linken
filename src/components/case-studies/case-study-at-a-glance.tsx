import type { CaseStudy } from "@/types/case-study";
import { confirmationLevelLabel } from "@/features/confirmations/meta";

type Props = { caseStudy: CaseStudy };

type Fact = { label: string; value: string };

export function CaseStudyAtAGlance({ caseStudy }: Props) {
  const clientOk = caseStudy.clientConfirmation?.status === "confirmed";
  const clientName =
    caseStudy.clientConfirmation?.confirmedBy?.name ??
    caseStudy.clientLabel.trim();
  const depth = confirmationLevelLabel(
    caseStudy.clientConfirmation?.confirmationLevel,
  );

  const facts: Fact[] = [
    caseStudy.year ? { label: "Year", value: caseStudy.year } : null,
    caseStudy.location ? { label: "Location", value: caseStudy.location } : null,
    caseStudy.duration ? { label: "Duration", value: caseStudy.duration } : null,
    caseStudy.sector ? { label: "Sector", value: caseStudy.sector } : null,
    clientName
      ? {
          label: clientOk
            ? depth
              ? `Client (confirmed · ${depth})`
              : "Client (confirmed)"
            : "Client",
          value: clientName,
        }
      : null,
  ].filter((f): f is Fact => f !== null);

  if (!facts.length && !caseStudy.services.length) return null;

  return (
    <section className="rounded-[28px] border border-line bg-paper/80 p-6 sm:p-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
        Project at a glance
      </p>
      {facts.length > 0 ? (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                {f.label}
              </dt>
              <dd className="mt-1 text-[15px] font-medium text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {caseStudy.services.length > 0 ? (
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
            Services delivered
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            {caseStudy.services.join(" · ")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
