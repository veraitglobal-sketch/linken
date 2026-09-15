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
  const primaryHref = recordHref ?? `/c/${partner.slug}?src=partner`;

  return (
    <div className="rounded-none bg-[#f7f8fa] px-3 py-2 transition-colors hover:bg-paper">
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
          href={primaryHref}
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
              <span className="inline-flex shrink-0 items-center rounded-none border border-[#1a5c51]/25 bg-[#1a5c51]/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[#1a5c51] uppercase">
                Verified
              </span>
            ) : null}
            {partner.liveOnSite ? (
              <span className="inline-flex shrink-0 items-center rounded-none border border-line bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
                Live on their site
              </span>
            ) : null}
          </div>
          {/* The industry, not "the industry company". `category` already reads
              as a trade — "Cleaning services company" was a word too many.
              Confirmed status and shared-case count fold onto this same line
              rather than stacking their own — one dense row instead of up to
              four thin ones. */}
          <p className="mt-0.5 truncate text-[12.5px] text-muted">
            {partner.category}
            {recordHref ? (
              <span className="font-semibold text-ink"> · Confirmed</span>
            ) : null}
            {partner.sharedProjects > 0 ? <span> · {casesLabel}</span> : null}
          </p>
        </Link>
        {recordHref ? (
          <Link
            href={`/c/${partner.slug}?src=partner`}
            className="flex min-h-11 shrink-0 items-center text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Profile
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
