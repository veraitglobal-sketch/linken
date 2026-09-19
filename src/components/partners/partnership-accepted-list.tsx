import type { PartnershipRow } from "@/features/partners/inbox";
import type { PartnerCreditFlags } from "@/features/credits/types";
import { CheckCreditForm } from "@/components/partners/check-credit-form";
import { CopyCreditButton } from "@/components/partners/copy-credit-button";
import { AcceptedPartnerRow } from "@/components/partners/accepted-partner-row";
import { CsvDownloadButton } from "@/components/partners/csv-download-button";
import { RfpCopyButton } from "@/components/partners/rfp-copy-button";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

export type AcceptedCreditRow = PartnershipRow & {
  snippet: string | null;
  flags: PartnerCreditFlags;
};

type Props = {
  accepted: AcceptedCreditRow[];
  allSnippet: string;
  checkBack?: string;
  companySlug: string;
  rfpText?: string;
  partnerCsv?: string;
  referenceCsv?: string;
};

export function PartnershipAcceptedList({
  accepted,
  allSnippet,
  checkBack = "/dashboard/partners",
  companySlug,
  rfpText = "",
  partnerCsv = "",
  referenceCsv = "",
}: Props) {
  if (accepted.length === 0) return null;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Official partners
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Record, intro, RFP list, and CSV — both sides already confirmed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RfpCopyButton text={rfpText} />
          <CsvDownloadButton
            csv={partnerCsv}
            filename="hansala-partners.csv"
            label="Partners CSV"
          />
          <CsvDownloadButton
            csv={referenceCsv}
            filename="hansala-references.csv"
            label="References CSV"
          />
          {allSnippet ? (
            <CopyCreditButton snippet={allSnippet} label="Copy all credits" />
          ) : null}
          <CheckCreditForm label="Check my site" back={checkBack} />
          <p className="text-[12px] font-medium text-plus">
            {accepted.length} official
          </p>
        </div>
      </header>
      <WorkspaceCard padded={false}>
        <ul className="divide-y divide-line">
          {accepted.map((row) => (
            <AcceptedPartnerRow
              key={row.id}
              row={row}
              checkBack={checkBack}
              companySlug={companySlug}
            />
          ))}
        </ul>
      </WorkspaceCard>
    </section>
  );
}
