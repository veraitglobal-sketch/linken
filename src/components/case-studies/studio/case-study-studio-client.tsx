"use client";

import { CaseStampEmbedPanel } from "@/components/case-studies/case-stamp-embed-panel";
import { requestClientConfirmation } from "@/features/case-studies/actions";
import { Input } from "@/components/ui/input";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudy: CaseStudy;
  back: string;
  siteUrl: string;
  domainReady: boolean;
};

export function CaseStudyStudioClient({
  companySlug,
  caseStudy,
  back,
  siteUrl,
  domainReady,
}: Props) {
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  if (confirmed) {
    return (
      <div className="space-y-4">
        <div className="rounded-[24px] border border-[#1a5c51]/30 bg-[#1a5c51]/8 px-6 py-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
            Verified proof
          </p>
          <p className="mt-3 font-display text-xl font-medium tracking-[-0.03em] text-ink">
            Client confirmed this project
          </p>
          <p className="mt-2 text-[14px] text-ink-soft">
            This is the strongest trust layer on your public case study.
          </p>
        </div>
        <CaseStampEmbedPanel
          companySlug={companySlug}
          caseStudy={caseStudy}
          siteUrl={siteUrl}
          domainReady={domainReady}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CaseStampEmbedPanel
        companySlug={companySlug}
        caseStudy={caseStudy}
        siteUrl={siteUrl}
        domainReady={domainReady}
      />
      <form
        action={requestClientConfirmation}
        className="rounded-[20px] border border-line bg-surface p-5"
      >
        <input type="hidden" name="companySlug" value={companySlug} />
        <input type="hidden" name="caseSlug" value={caseStudy.slug} />
        <input type="hidden" name="back" value={back} />
        <label className="block">
          <span className="text-[12px] font-medium text-ink">Client email</span>
          <Input
            type="email"
            name="email"
            required
            placeholder="client@company.com"
            className="mt-2"
          />
        </label>
        <button
          type="submit"
          className="mt-4 inline-flex h-11 items-center rounded-xl bg-accent px-6 text-[13px] font-semibold text-white hover:bg-accent-hover"
        >
          Send confirmation request
        </button>
      </form>
    </div>
  );
}
