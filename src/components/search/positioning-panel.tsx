import Link from "next/link";
import { ConfirmedCaseStrip } from "@/components/ranking/confirmed-case-strip";
import { PositioningShowcase } from "@/components/search/positioning-showcase";
import { getConfirmedCasesForCompanies } from "@/features/case-studies/queries-public";
import { getCategoryLeaders } from "@/features/ranking/queries-showcase";

/**
 * The state of the field, before anyone has searched.
 *
 * Nothing here is arranged for effect: the sectors are the ones that have
 * enough confirmed records to be a field, and the companies are whoever
 * currently leads them.
 */
export async function PositioningPanel() {
  const groups = await getCategoryLeaders();
  /* Projects first when there are any: a confirmed piece of work says more
     than a position does, and it is the same evidence the position rests on. */
  const cases = await getConfirmedCasesForCompanies(
    groups.flatMap((g) => g.leaders.map((c) => c.id)),
    3,
  );

  return (
    <section aria-label="Sector leaders">
      {cases.length > 0 ? (
        <div className="mb-12 sm:mb-14">
          <ConfirmedCaseStrip cases={cases} heading="Confirmed projects" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-tight font-semibold tracking-[-0.035em] text-ink">
            Positions held by confirmed work
          </h2>
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink-soft">
            A sector list is ordered by the records the other side confirmed. No plan and no
            payment moves a company up it.
          </p>
        </div>
        <Link
          href="/best"
          className="text-[14px] font-semibold text-ink underline-offset-4 hover:underline"
        >
          All sectors
        </Link>
      </div>

      <div className="mt-6">
        {groups.length > 0 ? (
          <PositioningShowcase groups={groups} />
        ) : (
          <div className="rounded-[28px] bg-surface px-6 py-12 text-center ring-1 ring-line/70">
            <p className="font-display text-[20px] font-semibold tracking-[-0.03em] text-ink text-balance">
              No sector is a field yet.
            </p>
            <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
              Positions appear once at least five companies in a sector have work their
              clients and partners confirmed. Search a company by name above, or start your
              own record.
            </p>
            <Link
              href="/onboarding"
              className="mt-7 inline-flex h-12 items-center rounded-full bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
            >
              Create your company profile
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
