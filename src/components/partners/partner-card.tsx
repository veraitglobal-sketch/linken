import Link from "next/link";
import { PartnerManageMenu } from "@/components/partners/partner-manage-menu";
import { PartnerMark } from "@/components/partners/partner-mark";
import type { Partner } from "@/types/partner";

type Props = {
  partner: Partner;
  /** Owner profile — show manage menu when partnershipId is set. */
  editable?: boolean;
  manageBack?: string;
};

export function PartnerCard({
  partner,
  editable = false,
  manageBack,
}: Props) {
  const casesLabel =
    partner.sharedProjects === 1
      ? "1 shared case study"
      : `${partner.sharedProjects} shared case studies`;

  const showManage =
    editable && Boolean(partner.partnershipId) && Boolean(manageBack);

  return (
    <div className="rounded-2xl bg-[#f7f8fa] px-3.5 py-3.5 transition-colors hover:bg-[#eef1f3]">
      <div className="flex items-center gap-3.5">
        <Link
          href={`/c/${partner.slug}?src=partner`}
          className="min-w-0 flex-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink">
              {partner.name}
            </p>
            {partner.verified ? (
              <span className="rounded-lg border border-[#1f6b5c]/25 bg-[#1f6b5c]/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.08em] text-[#1f6b5c] uppercase">
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[13px] text-ink-soft">
            {partner.category} company
          </p>
          {partner.sharedProjects > 0 ? (
            <p className="mt-1 text-[12px] text-muted">{casesLabel}</p>
          ) : null}
        </Link>
        {showManage && partner.partnershipId && manageBack ? (
          <PartnerManageMenu
            partnershipId={partner.partnershipId}
            back={manageBack}
          />
        ) : null}
        <PartnerMark
          name={partner.name}
          initials={partner.logoInitials}
          logoUrl={partner.logoUrl}
        />
      </div>
    </div>
  );
}
