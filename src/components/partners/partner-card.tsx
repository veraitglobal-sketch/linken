import Link from "next/link";
import { PartnerManageMenu } from "@/components/partners/partner-manage-menu";
import { PartnerMark } from "@/components/partners/partner-mark";
import type { Partner } from "@/types/partner";

type Props = {
  partner: Partner;
  /** Owner profile — show manage menu when partnershipId is set. */
  editable?: boolean;
  manageBack?: string;
  recordHref?: string;
};

export function PartnerCard({
  partner,
  editable = false,
  manageBack,
  recordHref,
}: Props) {
  const casesLabel =
    partner.sharedProjects === 1
      ? "1 shared case study"
      : `${partner.sharedProjects} shared case studies`;

  const showManage =
    editable && Boolean(partner.partnershipId) && Boolean(manageBack);

  return (
    <div className="rounded-xl bg-[#f7f8fa] px-3 py-2.5 transition-colors hover:bg-paper">
      {/* The mark leads.
          It used to sit at the far right of the row — 196px into a 254px card —
          which made the company's own logo the last thing read and the first
          thing cropped. A partner row is an identification: the mark, then who
          it is, then what they do. */}
      <div className="flex items-center gap-2.5">
        <PartnerMark
          name={partner.name}
          initials={partner.logoInitials}
          logoUrl={partner.logoUrl}
        />
        <Link
          href={`/c/${partner.slug}?src=partner`}
          /* 44px minimum. Tightening the row for density left the tappable
             area at 41px — under the floor, and density is never worth a
             target a thumb misses. The row grows three pixels; it is still
             eleven shorter than before. */
          className="flex min-h-11 min-w-0 flex-1 flex-col justify-center"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-semibold text-ink">
              {partner.name}
            </p>
            {/* Only when the partner actually is. Never inferred, never shown
                for a company that has not proved its domain or identity. */}
            {partner.verified ? (
              <span className="inline-flex shrink-0 items-center rounded-md border border-[#1a5c51]/25 bg-[#1a5c51]/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[#1a5c51] uppercase">
                Verified
              </span>
            ) : null}
            {partner.liveOnSite ? (
              <span className="inline-flex shrink-0 items-center rounded-md border border-line bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
                Live on their site
              </span>
            ) : null}
          </div>
          {/* The industry, not "the industry company". `category` already reads
              as a trade — "Cleaning services company" was a word too many. */}
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {partner.category}
          </p>
          {partner.sharedProjects > 0 ? (
            <p className="mt-1 text-[12px] text-muted">{casesLabel}</p>
          ) : null}
        </Link>
        {recordHref ? (
          <Link
            href={recordHref}
            className="shrink-0 text-[11px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Record
          </Link>
        ) : null}
        {showManage && partner.partnershipId && manageBack ? (
          <PartnerManageMenu
            partnershipId={partner.partnershipId}
            back={manageBack}
          />
        ) : null}
      </div>
    </div>
  );
}
