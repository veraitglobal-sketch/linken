import Link from "next/link";
import type { ConfirmedGroupBadge } from "@/features/groups/types";
import type { CompanyPosition } from "@/features/ranking/queries-position";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  claimed: boolean;
  accepting: boolean;
  position: CompanyPosition | null;
  groupBadge: ConfirmedGroupBadge | null;
};

export function CompanyHeroChips({
  company,
  claimed,
  accepting,
  position,
  groupBadge,
}: Props) {
  const place = `${company.category} · ${company.city}, ${company.country}`;
  const chip =
    "inline-flex h-8 items-center rounded-full px-3.5 text-[12px] font-semibold";

  return (
    <div className="animate-rise flex flex-wrap items-center gap-2">
      {position?.categorySlug ? (
        <Link
          href={`/best/${position.categorySlug}`}
          className={`${chip} gap-2 bg-white/[0.08] text-on-navy ring-1 ring-white/15 no-underline transition-colors hover:bg-white/15`}
        >
          <span
            className={`size-1.5 rounded-full ${claimed && accepting ? "bg-lime" : "bg-white/40"}`}
          />
          {place}
        </Link>
      ) : (
        <span className={`${chip} gap-2 bg-white/[0.08] text-on-navy ring-1 ring-white/15`}>
          <span
            className={`size-1.5 rounded-full ${claimed && accepting ? "bg-lime" : "bg-white/40"}`}
          />
          {place}
        </span>
      )}
      {position ? (
        <Link
          href={
            position.countryCode
              ? `/best/${position.categorySlug}/${position.countryCode.toLowerCase()}`
              : `/best/${position.categorySlug}`
          }
          title="Position from confirmed records"
          className={`${chip} bg-lime text-navy no-underline transition-colors hover:bg-[#bfe56c]`}
        >
          {position.countryRank && position.countryName
            ? `#${position.countryRank} in ${position.categoryName} · ${position.countryName}`
            : position.worldRank
              ? `#${position.worldRank} in ${position.categoryName}`
              : `Ranked in ${position.categoryName}`}
        </Link>
      ) : null}
      {claimed === false ? (
        <span className={`${chip} bg-white/[0.08] text-on-navy-soft ring-1 ring-white/15`}>
          Unclaimed profile
        </span>
      ) : (
        <span
          className={`${chip} ${
            accepting
              ? "bg-lime text-navy"
              : "bg-white/[0.08] text-on-navy-soft ring-1 ring-white/15"
          }`}
        >
          {accepting ? "Accepting new clients" : "Fully booked"}
        </span>
      )}
      {groupBadge ? (
        <Link
          href={`/g/${groupBadge.slug}`}
          className={`${chip} bg-white/[0.08] text-on-navy ring-1 ring-white/15 transition-colors hover:bg-white/15`}
        >
          Part of {groupBadge.name}
        </Link>
      ) : null}
    </div>
  );
}
