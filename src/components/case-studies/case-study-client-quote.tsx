import { ClientConfirmedBadge } from "@/components/case-studies/client-confirmed-badge";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  caseStudy: CaseStudy;
  hideCompanyQuote?: boolean;
};

export function CaseStudyClientQuote({ caseStudy, hideCompanyQuote = false }: Props) {
  const quote = caseStudy.clientQuote.trim();
  if (!quote || hideCompanyQuote) return null;

  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const attribution = caseStudy.clientConfirmation?.confirmedBy?.name ?? "Client";

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#0e1f1c] px-8 py-12 text-white sm:px-12 sm:py-14">
      <div className="stage-grain absolute inset-0 opacity-40" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
          In their words
        </p>
        <blockquote className="mt-6 font-display text-[clamp(1.35rem,3vw,2rem)] font-medium leading-snug tracking-[-0.03em] text-white/92">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <p className="mt-6 text-[14px] text-white/55">— {attribution}</p>
        {confirmed && caseStudy.clientConfirmation ? (
          <div className="mt-6 flex justify-center">
            <ClientConfirmedBadge confirmation={caseStudy.clientConfirmation} />
          </div>
        ) : (
          <p className="mt-4 text-[12px] text-white/40">
            Unverified — written by {caseStudy.clientLabel || "the company"}. Strongest
            when the client confirms on Hansala.
          </p>
        )}
      </div>
    </section>
  );
}
