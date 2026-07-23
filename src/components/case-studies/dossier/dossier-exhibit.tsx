import { ClientConfirmedBadge } from "@/components/case-studies/client-confirmed-badge";
import type { CaseStudy } from "@/types/case-study";

type Props = { caseStudy: CaseStudy };

export function DossierExhibit({ caseStudy }: Props) {
  const quote = caseStudy.clientQuote.trim();
  if (!quote) return null;

  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const who = caseStudy.clientConfirmation?.confirmedBy?.name ?? "Client";

  return (
    <section className="relative border-l-4 border-ember pl-6 sm:pl-10">
      <p className="font-mono text-[11px] tracking-[0.18em] text-ember uppercase">
        Exhibit A — client voice
      </p>
      <blockquote className="mt-5 font-display text-[clamp(1.4rem,3.5vw,2.25rem)] font-medium leading-snug tracking-[-0.03em] text-ink">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <p className="mt-5 text-[14px] text-muted">— {who}</p>
      {confirmed && caseStudy.clientConfirmation ? (
        <div className="mt-5">
          <ClientConfirmedBadge confirmation={caseStudy.clientConfirmation} />
        </div>
      ) : null}
    </section>
  );
}
