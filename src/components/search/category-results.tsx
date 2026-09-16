import Link from "next/link";
import { ConfirmedCaseStrip } from "@/components/ranking/confirmed-case-strip";
import { RankingExplainer } from "@/components/ranking/ranking-explainer";
import { RankingPlacePicker } from "@/components/ranking/ranking-place-picker";
import { RankingRow } from "@/components/ranking/ranking-row";
import { getConfirmedCasesForCompanies } from "@/features/case-studies/queries-public";
import { getRankedCountries, getRanking } from "@/features/ranking/queries";

/**
 * The answer, on the search page itself.
 *
 * Picking a sector is the whole question a visitor came with, so the list opens
 * here rather than one navigation away: worldwide immediately, because "all of
 * them" is the honest default when nobody has named a country. A country is a
 * filter on top of that, never a step before it.
 */
export async function CategoryResults({
  categorySlug,
  countryCode,
  city,
}: {
  categorySlug: string;
  countryCode: string | null;
  city: string | null;
}) {
  const [list, countries] = await Promise.all([
    getRanking({ categorySlug, countryCode, city }),
    getRankedCountries(categorySlug),
  ]);

  if (!list) {
    return (
      <p className="mx-auto max-w-[560px] text-center text-[15px] text-ink-soft">
        That sector does not exist yet. Try another word above.
      </p>
    );
  }

  const cases = await getConfirmedCasesForCompanies(list.companies.map((c) => c.id));
  const where = list.countryName ?? "Worldwide";
  const search = (code: string | null) => {
    const params = new URLSearchParams({ mode: "categories", category: list.categorySlug });
    if (code) params.set("country", code.toLowerCase());
    return `/search?${params.toString()}`;
  };

  return (
    <div className="grid gap-10 sm:gap-12">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              {where}
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-tight font-semibold tracking-[-0.035em] text-ink">
              {list.categoryName} companies with confirmed work
            </h2>
            <p className="mt-2 text-[15px] text-ink-soft">
              {list.total} {list.total === 1 ? "company" : "companies"}
              {list.countryName ? ` in ${list.countryName}` : " worldwide"}, ordered by work
              the other side confirmed.
            </p>
          </div>
          <Link
            href={`/best/${list.categorySlug}${countryCode ? `/${countryCode.toLowerCase()}` : ""}`}
            className="text-[14px] font-semibold text-ink underline-offset-4 hover:underline"
          >
            Open this list on its own page
          </Link>
        </div>

        <div className="mt-6">
          <RankingPlacePicker
            categorySlug={list.categorySlug}
            countries={countries}
            active={countryCode}
            hrefFor={search}
          />
        </div>

        {city ? (
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[14px] text-ink-soft">
            Filtered to <span className="font-semibold text-ink">{city}</span>
            <Link href={search(countryCode)} className="font-semibold text-ink underline-offset-2 hover:underline">
              Clear
            </Link>
          </p>
        ) : null}
      </div>

      {cases.length > 0 ? (
        <ConfirmedCaseStrip
          cases={cases}
          heading={`Confirmed projects in ${list.categoryName.toLowerCase()}`}
        />
      ) : null}

      <div>
        {list.companies.length === 0 ? (
          <div className="mx-auto max-w-[560px] rounded-[28px] bg-surface px-6 py-14 text-center ring-1 ring-line/70">
            <p className="font-display text-[22px] leading-tight font-semibold tracking-[-0.03em] text-ink text-balance">
              No confirmed records here yet.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              This list fills as companies confirm each other&rsquo;s work. Nothing is listed
              before both sides agree.
            </p>
            <Link
              href="/onboarding"
              className="mt-7 inline-flex h-12 items-center rounded-full bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
            >
              Create your company profile
            </Link>
          </div>
        ) : (
          <>
            {!list.showPositions ? (
              <p className="mb-4 rounded-2xl bg-surface px-5 py-3.5 text-[14px] leading-relaxed text-ink-soft ring-1 ring-line/70">
                Shown without positions — a list this short is not a field yet. Numbers appear
                once at least five companies here have confirmed records.
              </p>
            ) : null}
            <ol className="grid list-none gap-3 p-0">
              {list.companies.map((company, i) => (
                <RankingRow
                  key={company.slug}
                  company={company}
                  position={list.showPositions ? i + 1 : null}
                />
              ))}
            </ol>
          </>
        )}
      </div>

      <RankingExplainer />
    </div>
  );
}
