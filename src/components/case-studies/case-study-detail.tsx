import Link from "next/link";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import { ClientConfirmedBadge } from "@/components/case-studies/client-confirmed-badge";
import { RequestClientConfirmation } from "@/components/case-studies/request-client-confirmation";
import { Button } from "@/components/ui/button";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  editable?: boolean;
  requested?: boolean;
  error?: string;
};

export function CaseStudyDetail({
  company,
  caseStudy,
  editable = false,
  requested = false,
  error,
}: Props) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href={`/c/${company.slug}`}
        className="text-[13px] font-medium text-muted hover:text-ink"
      >
        ← {company.name}
      </Link>

      <p className="mt-8 text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
        Case study · {caseStudy.year} · {caseStudy.location}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
        {caseStudy.title}
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        {caseStudy.summary}
      </p>

      {caseStudy.clientConfirmation?.status === "confirmed" ? (
        <div className="mt-8">
          <ClientConfirmedBadge confirmation={caseStudy.clientConfirmation} />
        </div>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      {requested ? (
        <p className="mt-6 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Confirmation request sent. The client will receive an email with a
          secure link.
        </p>
      ) : null}

      <div className="mt-10 grid gap-8 border-y border-line py-9 sm:grid-cols-2">
        <section>
          <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            Challenge
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-ink-soft">
            {caseStudy.challenge}
          </p>
        </section>
        <section>
          <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            Outcome
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-ink-soft">
            {caseStudy.outcome}
          </p>
        </section>
      </div>

      <section className="py-9">
        <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
          Confirmed partners
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Partner roles on this case were confirmed by each company.
        </p>
        <div className="mt-4">
          <CaseStudyPartners partners={caseStudy.partners} />
        </div>
      </section>

      {editable && caseStudy.clientConfirmation?.status !== "confirmed" ? (
        <section className="border-t border-line py-9">
          <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            Client confirmation
          </h2>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">
            Strongest proof layer — the company that received the work confirms
            the project was delivered for them.
          </p>
          <div className="mt-4">
            <RequestClientConfirmation
              companySlug={company.slug}
              caseSlug={caseStudy.slug}
            />
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-line pt-8">
        <Button href={`/c/${company.slug}`}>Company profile</Button>
        <Button variant="secondary" href="/search">
          Directory
        </Button>
      </div>
    </article>
  );
}
