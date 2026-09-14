import Link from "next/link";
import { PartnerMark } from "@/components/partners/partner-mark";
import { companyPath, companyWithPath } from "@/features/seo/paths";
import type { Partner } from "@/types/partner";

type Props = {
  partner: Partner;
  companySlug: string;
};

export function PartnerNetworkTile({ partner, companySlug }: Props) {
  const casesLabel =
    partner.sharedProjects === 1
      ? "1 shared case study"
      : `${partner.sharedProjects} shared case studies`;
  const recordHref = companyWithPath(companySlug, partner.slug);

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-line bg-surface p-5 transition-colors hover:border-navy/20 hover:bg-white">
      <Link href={recordHref} className="group flex min-h-11 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <PartnerMark
            name={partner.name}
            initials={partner.logoInitials}
            logoUrl={partner.logoUrl}
          />
          <span
            className={
              partner.verified
                ? "rounded-lg border border-blue/25 bg-blue/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-blue uppercase"
                : "rounded-lg border border-line bg-mute px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-muted uppercase"
            }
          >
            {partner.verified ? "Verified partner" : "Partner"}
          </span>
        </div>

        <h3 className="mt-4 font-display text-[1.25rem] font-medium tracking-[-0.03em] text-ink transition-colors group-hover:text-blue">
          {partner.name}
        </h3>
        <p className="mt-1.5 text-[13px] text-muted">{partner.category}</p>
        <p className="mt-1 text-[12px] text-muted">{partner.city}</p>

        <div className="mt-auto border-t border-line pt-3.5">
          <p className="text-[12px] text-muted">{casesLabel}</p>
          {partner.liveOnSite ? (
            <p className="mt-1 font-label text-[11px] font-semibold tracking-[0.06em] text-blue uppercase">
              Live on their site
            </p>
          ) : null}
          <p className="mt-1 text-[13px] font-semibold text-ink underline-offset-4 group-hover:underline">
            Confirmed record
          </p>
        </div>
      </Link>
      <Link
        href={`${companyPath(partner.slug)}?src=partner`}
        className="mt-3 flex min-h-11 items-center text-[13px] font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        Profile
      </Link>
    </article>
  );
}
