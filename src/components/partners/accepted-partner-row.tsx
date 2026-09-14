import Link from "next/link";
import type { AcceptedCreditRow } from "@/components/partners/partnership-accepted-list";
import { CheckCreditForm } from "@/components/partners/check-credit-form";
import { CopyCreditButton } from "@/components/partners/copy-credit-button";
import { EndPartnershipButton } from "@/components/partners/end-partnership-button";
import { PartnerCreditStatus } from "@/components/partners/partner-credit-status";
import { PartnerIntroForm } from "@/components/partners/partner-intro-form";

export function AcceptedPartnerRow({
  row,
  checkBack,
  companySlug,
}: {
  row: AcceptedCreditRow;
  checkBack: string;
  companySlug: string;
}) {
  return (
    <li className="px-5 py-3.5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/c/${row.other.slug}`}
            className="text-[14px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            {row.other.name}
          </Link>
          <PartnerCreditStatus
            publishedByMe={row.flags.publishedByMe}
            publishedByThem={row.flags.publishedByThem}
            hasWebsite={Boolean(row.other.website?.trim())}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {row.snippet ? (
            <>
              <CopyCreditButton snippet={row.snippet} />
              <CheckCreditForm partnershipId={row.id} back={checkBack} />
            </>
          ) : null}
          <Link
            href={`/c/${companySlug}/with/${row.other.slug}`}
            className="inline-flex h-8 items-center rounded-xl bg-navy px-3 text-[11px] font-semibold text-white"
          >
            Record
          </Link>
          <EndPartnershipButton
            partnershipId={row.id}
            back="/dashboard/partners"
          />
        </div>
      </div>
      <div className="mt-2">
        <PartnerIntroForm
          partnerId={row.other.id}
          partnerName={row.other.name}
        />
      </div>
    </li>
  );
}
