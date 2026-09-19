import type { PartnershipRow } from "@/features/partners/inbox";
import {
  PartnershipAcceptedList,
  type AcceptedCreditRow,
} from "@/components/partners/partnership-accepted-list";
import { IncomingPartnerRequests } from "@/components/partners/incoming-partner-requests";
import { PendingPartnerInvites } from "@/components/partners/pending-partner-invites";
import { ConfirmedCsvBar } from "@/components/partners/confirmed-csv-bar";

type Props = {
  incomingPending: PartnershipRow[];
  outgoingPending: PartnershipRow[];
  accepted: AcceptedCreditRow[];
  allSnippet: string;
  checkBack?: string;
  companySlug: string;
  rfpText?: string;
  partnerCsv?: string;
  referenceCsv?: string;
};

export function PartnershipInbox({
  incomingPending,
  outgoingPending,
  accepted,
  allSnippet,
  checkBack,
  companySlug,
  rfpText = "",
  partnerCsv = "",
  referenceCsv = "",
}: Props) {
  if (
    incomingPending.length === 0 &&
    outgoingPending.length === 0 &&
    accepted.length === 0 &&
    !partnerCsv &&
    !referenceCsv
  ) {
    return null;
  }

  return (
    <div className="space-y-10">
      <IncomingPartnerRequests incomingPending={incomingPending} />
      <PendingPartnerInvites rows={outgoingPending} />
      <PartnershipAcceptedList
        accepted={accepted}
        allSnippet={allSnippet}
        checkBack={checkBack}
        companySlug={companySlug}
        rfpText={rfpText}
        partnerCsv={partnerCsv}
        referenceCsv={referenceCsv}
      />
      {accepted.length === 0 ? (
        <ConfirmedCsvBar partnerCsv={partnerCsv} referenceCsv={referenceCsv} />
      ) : null}
    </div>
  );
}
