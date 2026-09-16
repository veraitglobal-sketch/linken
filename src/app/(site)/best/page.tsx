import type { Metadata } from "next";
import Link from "next/link";
import { RankingExplainer } from "@/components/ranking/ranking-explainer";
import { listRankedCategories } from "@/features/ranking/queries";

export const metadata: Metadata = {
  title: "Companies with confirmed work",
  description:
    "Sectors where companies have work confirmed by the companies they worked for. Positions come from confirmed records, never from payment.",
  alternates: { canonical: "/best" },
};

export default async function BestIndexPage() {
  const categories = await listRankedCategories();
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="home-wash bg-wash">
      <section className="relative -mt-[4.25rem] px-4 pt-[8rem] sm:px-6 sm:pt-[9rem] lg:px-8">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-10 rounded-b-[48px] bg-lime sm:rounded-b-[120px]"
        />
        <div className="relative mx-auto max-w-[1180px]">
          <p className="text-[13px] font-semibold tracking-[0.14em] text-navy/70 uppercase">
            Confirmed work
          </p>
          <h1 className="mt-3 max-w-[20ch] font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
            Who has actually done the work, by sector.
          </h1>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
            Every company here is listed because another company confirmed working with
            them. Pick a sector, then a country or worldwide.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-12 sm:px-[18px]">
        {categories.length === 0 ? (
          <div className="mx-auto max-w-[560px] rounded-[28px] bg-surface px-6 py-14 text-center ring-1 ring-line/70">
            <p className="font-display text-[22px] leading-tight font-semibold tracking-[-0.03em] text-ink text-balance">
              No sector has enough confirmed records yet.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              A sector appears once at least three companies in it have work their clients
              and partners confirmed.
            </p>
            <Link
              href="/search"
              className="mt-7 inline-flex h-12 items-center rounded-full bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
            >
              Search companies instead
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-[15px] text-ink-soft">
              <span className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink tabular-nums">
                {categories.length}
              </span>{" "}
              {categories.length === 1 ? "sector" : "sectors"} · {total}{" "}
              {total === 1 ? "company" : "companies"} with confirmed records
            </p>
            <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/best/${category.slug}`}
                    className="group flex h-full items-center justify-between gap-4 rounded-[22px] bg-surface p-5 ring-1 ring-line/70 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(14,31,28,0.35)] hover:ring-ink/15"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[18px] font-semibold tracking-[-0.025em] text-ink">
                        {category.name}
                      </span>
                      <span className="mt-0.5 block text-[14px] text-muted">
                        {category.count}{" "}
                        {category.count === 1 ? "company" : "companies"}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-wash text-ink transition-colors group-hover:bg-navy group-hover:text-lime"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pt-14 pb-24 sm:px-[18px] sm:pb-32">
        <RankingExplainer />
      </section>
    </div>
  );
}
