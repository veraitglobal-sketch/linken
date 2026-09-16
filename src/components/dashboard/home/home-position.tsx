import Link from "next/link";
import type { CompanyPosition } from "@/features/ranking/queries-position";

/**
 * Where the company stands, from confirmed records only. No number is shown
 * until the list is a real field — a #1 of two companies would be a lie.
 */
export function HomePosition({ position }: { position: CompanyPosition | null }) {
  if (!position) {
    return (
      <div className="rounded-[24px] border border-line bg-surface px-5 py-5">
        <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
          Your position
        </p>
        <p className="mt-2 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
          No position yet
        </p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          A position appears after another company confirms your work. It cannot
          be bought.
        </p>
      </div>
    );
  }

  const world =
    position.worldRank && position.worldTotal >= 5
      ? `#${position.worldRank} of ${position.worldTotal}`
      : `${position.worldTotal} ${position.worldTotal === 1 ? "company" : "companies"} ranked`;
  const country =
    position.countryRank && position.countryName && position.countryTotal >= 5
      ? `#${position.countryRank} in ${position.countryName}`
      : position.countryName
        ? `${position.countryName}`
        : null;

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-5">
      <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
        Your position
      </p>
      <p className="mt-2 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
        {position.categoryName}
      </p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
        {world}
        {country ? ` · ${country}` : ""}
      </p>
      <p className="mt-1 text-[13px] text-muted tabular-nums">
        {position.points.toFixed(1)} points from confirmed records
      </p>
      <Link
        href={
          position.countryCode
            ? `/best/${position.categorySlug}/${position.countryCode.toLowerCase()}`
            : `/best/${position.categorySlug}`
        }
        className="mt-4 inline-flex h-10 items-center rounded-full bg-navy px-4 text-[13px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
      >
        Open the list
      </Link>
    </div>
  );
}
