import Link from "next/link";
import { BoardPill, BoardShell } from "@/components/search/board-shell";
import { RankedRow } from "@/components/search/board-rows";
import { SectorRail } from "@/components/search/sector-rail";
import { getRankedCountries, getRanking, listRankedCategories } from "@/features/ranking/queries";
import { MIN_RANKED_FOR_POSITIONS } from "@/features/ranking/score";

/**
 * The board with a sector open.
 *
 * Worldwide the moment a sector is picked — nobody has named a country, so all
 * of them is the honest answer. Countries sit on the bar as a filter on top of
 * that, each with its real count; there is no country step in between.
 */
export async function BoardRanking({
  categorySlug,
  countryCode,
  city,
}: {
  categorySlug: string;
  countryCode: string | null;
  city: string | null;
}) {
  const [list, countries, sectors] = await Promise.all([
    getRanking({ categorySlug, countryCode, city }),
    getRankedCountries(categorySlug),
    listRankedCategories({ min: 1 }),
  ]);

  const rail = <SectorRail sectors={sectors} activeSlug={list?.categorySlug ?? categorySlug} />;

  if (!list) {
    return (
      <BoardShell title="That sector does not exist" subtitle="Pick one from the list" rail={rail}>
        <p className="px-2 py-10 text-center text-[15px] text-ink-soft">
          Try a sector on the left, or search a company by name above.
        </p>
      </BoardShell>
    );
  }

  const href = (code: string | null) => {
    const params = new URLSearchParams({ category: list.categorySlug });
    if (code) params.set("country", code.toLowerCase());
    return `/search?${params.toString()}`;
  };
  const where = list.countryName ?? "worldwide";
  const top = list.companies[0]?.points ?? 0;

  return (
    <BoardShell
      title={list.categoryName}
      subtitle={`${list.total} ${list.total === 1 ? "company" : "companies"} with confirmed work · ${where}${city ? ` · ${city}` : ""}`}
      rail={rail}
      actions={
        <>
          <BoardPill href={href(null)} active={countryCode === null}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
              <path d="M3.6 12h16.8M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" stroke="currentColor" strokeWidth="2" />
            </svg>
            Worldwide
          </BoardPill>
          {countries.map((c) => (
            <BoardPill key={c.code} href={href(c.code)} active={countryCode === c.code}>
              {c.name}
              <span className="tabular-nums opacity-70">{c.count}</span>
            </BoardPill>
          ))}
        </>
      }
      status={
        <>
          <span>Ordered by work the other side confirmed.</span>
          <span>
            {list.showPositions
              ? "Positions are earned, never sold."
              : `Positions appear once ${MIN_RANKED_FOR_POSITIONS} companies here have confirmed records.`}
          </span>
          <Link
            href={`/best/${list.categorySlug}${countryCode ? `/${countryCode.toLowerCase()}` : ""}`}
            className="ml-auto font-semibold text-ink underline-offset-4 hover:underline"
          >
            Permanent link to this list
          </Link>
        </>
      }
    >
      {list.companies.length === 0 ? (
        <div className="px-2 py-10 text-center">
          <p className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
            No confirmed records {list.countryName ? `in ${list.countryName}` : "here"} yet.
          </p>
          <p className="mx-auto mt-2 max-w-[48ch] text-[14px] leading-relaxed text-ink-soft">
            This list fills as companies confirm each other&rsquo;s work. Nothing is listed before
            both sides agree.
          </p>
          {countryCode ? (
            <Link
              href={href(null)}
              className="mt-5 inline-flex h-10 items-center rounded-full bg-navy px-4 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
            >
              See it worldwide
            </Link>
          ) : null}
        </div>
      ) : (
        <ol className="grid list-none gap-0.5 p-0">
          {list.companies.map((company, i) => (
            <RankedRow
              key={company.slug}
              company={company}
              position={list.showPositions ? i + 1 : null}
              share={list.companies.length > 1 && top > 0 ? company.points / top : null}
            />
          ))}
        </ol>
      )}
    </BoardShell>
  );
}
