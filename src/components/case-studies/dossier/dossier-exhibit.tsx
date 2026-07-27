import type { CaseStudy } from "@/types/case-study";

type Props = {
  caseStudy: CaseStudy;
  /** Hide company-written quote when a client testimonial is published. */
  hideCompanyQuote?: boolean;
};

export function DossierExhibit({ caseStudy, hideCompanyQuote = false }: Props) {
  const quote = caseStudy.clientQuote.trim();
  if (!quote || hideCompanyQuote) return null;

  const who = caseStudy.clientConfirmation?.confirmedBy?.name ?? "Client";
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  return (
    <section className="py-4 text-center">
      <blockquote className="font-display text-[clamp(1.35rem,3vw,2rem)] font-medium leading-snug tracking-[-0.03em] text-[var(--cf-ink)]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <p className="mt-6 text-[14px] text-[var(--cf-muted)]">— {who}</p>
      {confirmed ? (
        <p className="mt-2 text-[11px] tracking-[0.1em] text-[var(--cf-accent)] uppercase">
          Confirmed on Hansala
        </p>
      ) : (
        <p className="mt-2 text-[11px] tracking-[0.1em] text-[var(--cf-muted)] uppercase">
          Unverified — written by {caseStudy.clientLabel || "the company"}
        </p>
      )}
    </section>
  );
}
