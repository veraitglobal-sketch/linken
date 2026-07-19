import Link from "next/link";
import { PartnerMark } from "@/components/partners/partner-mark";
import type { Partner } from "@/types/partner";

type Props = {
  partner: Partner;
};

export function PartnerNetworkTile({ partner }: Props) {
  const casesLabel =
    partner.sharedProjects === 1
      ? "1 shared case study"
      : `${partner.sharedProjects} shared case studies`;

  return (
    <Link
      href={`/c/${partner.slug}?src=partner`}
      className="group flex h-full flex-col rounded-[24px] border border-line bg-surface p-5 transition-colors hover:border-[#10231f]/20 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <PartnerMark
          initials={partner.logoInitials}
          logoUrl={partner.logoUrl}
          className="h-16 w-16 rounded-2xl text-lg"
        />
        <span
          className={
            partner.verified
              ? "rounded-lg border border-[#1f6b5c]/25 bg-[#1f6b5c]/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-[#1f6b5c] uppercase"
              : "rounded-lg border border-line bg-[#f7f8fa] px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-muted uppercase"
          }
        >
          {partner.verified ? "Verified partner" : "Partner"}
        </span>
      </div>

      <h3 className="mt-4 font-display text-[1.25rem] font-medium tracking-[-0.03em] text-ink transition-colors group-hover:text-[#1f6b5c]">
        {partner.name}
      </h3>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        {partner.category} company
      </p>
      <p className="mt-1 text-[12px] text-muted">
        {partner.city}
      </p>

      <div className="mt-auto border-t border-line pt-3.5">
        <p className="text-[12px] text-ink-soft">{casesLabel}</p>
        <p className="mt-1 text-[13px] font-semibold text-ink underline-offset-4 group-hover:underline">
          Open profile
        </p>
      </div>
    </Link>
  );
}
