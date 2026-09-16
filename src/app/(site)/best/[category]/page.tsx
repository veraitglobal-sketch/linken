import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RankingExplainer } from "@/components/ranking/ranking-explainer";
import { RankingPlacePicker } from "@/components/ranking/ranking-place-picker";
import { RankingRow } from "@/components/ranking/ranking-row";
import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { getRankedCountries, getRanking } from "@/features/ranking/queries";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ city?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const slug = canonicalCategorySlug(category);
  if (!slug) return { title: "Not found" };
  const list = await getRanking({ categorySlug: slug });
  if (!list) return { title: "Not found" };
  const title = `Confirmed ${list.categoryName.toLowerCase()} companies`;
  return {
    title,
    description: `${list.total} ${list.categoryName.toLowerCase()} companies with work confirmed by the companies they worked for.`,
    alternates: { canonical: `/best/${list.categorySlug}` },
  };
}

export default async function CategoryRankingPage({ params, searchParams }: Props) {
  const { category } = await params;
  const slug = canonicalCategorySlug(category);
  if (!slug) notFound();
  if (slug !== category) redirect(`/best/${slug}`);
  const { city } = await searchParams;
  const [list, countries] = await Promise.all([
    getRanking({ categorySlug: slug, city: city ?? null }),
    getRankedCountries(slug),
  ]);
  if (!list) notFound();

  return (
    <RankingScreen
      eyebrow="Worldwide"
      list={list}
      countries={countries}
      activeCountry={null}
      city={city ?? null}
    />
  );
}

/* Shared by the worldwide and the per-country page — one screen, one place
   where the empty state and the position rule live. */
export async function RankingScreen({
  eyebrow,
  list,
  countries,
  activeCountry,
  city,
}: {
  eyebrow: string;
  list: NonNullable<Awaited<ReturnType<typeof getRanking>>>;
  countries: Awaited<ReturnType<typeof getRankedCountries>>;
  activeCountry: string | null;
  city: string | null;
}) {
  const where = list.countryName ?? "worldwide";

  return (
    <div className="home-wash bg-wash">
      <section className="relative -mt-[4.25rem] px-4 pt-[8rem] sm:px-6 sm:pt-[9rem] lg:px-8">
        <div aria-hidden className="absolute inset-x-0 top-0 bottom-10 rounded-b-[48px] bg-lime sm:rounded-b-[120px]" />
        <div className="relative mx-auto max-w-[1180px]">
          <p className="text-[13px] font-semibold tracking-[0.14em] text-navy/70 uppercase">{eyebrow}</p>
          <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
            {list.categoryName} companies with confirmed work
          </h1>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
            Ordered by work the other side confirmed — {list.total}{" "}
            {list.total === 1 ? "company" : "companies"} {where === "worldwide" ? "worldwide" : `in ${where}`}.
          </p>
          <div className="mt-8">
            <RankingPlacePicker categorySlug={list.categorySlug} countries={countries} active={activeCountry} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-12 sm:px-[18px]">
        {city ? (
          <p className="mb-4 flex flex-wrap items-center gap-2 text-[14px] text-ink-soft">
            Filtered to <span className="font-semibold text-ink">{city}</span>
            <Link
              href={activeCountry ? `/best/${list.categorySlug}/${activeCountry.toLowerCase()}` : `/best/${list.categorySlug}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Clear
            </Link>
          </p>
        ) : null}

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
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-14 pb-24 sm:px-[18px] sm:pb-32">
        <RankingExplainer />
      </section>
    </div>
  );
}
