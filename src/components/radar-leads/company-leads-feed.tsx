import Link from "next/link";
import { CompanyLeadRow } from "@/components/radar-leads/company-lead-row";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import type { RadarCompanyLead } from "@/types/radar-leads";

type Props = {
  leads: RadarCompanyLead[];
  searchesCount: number;
  radarEnabled: boolean;
  verified: boolean;
  balance: number;
  introSuspended: boolean;
};

export function CompanyLeadsFeed({
  leads,
  searchesCount,
  radarEnabled,
  verified,
  balance,
  introSuspended,
}: Props) {
  if (!radarEnabled) return null;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Company leads
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Matches from saved searches. Contact only via intro (2 credits).
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {leads.length} open
        </p>
      </header>

      <WorkspaceCard padded={false}>
        {searchesCount === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
              Define what you&apos;re looking for
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
              Save a search below — matching firms appear here when they claim
              or update.
            </p>
            <a
              href="#saved-searches"
              className="mt-4 inline-flex h-9 items-center rounded-xl border border-line px-3.5 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
            >
              Create a saved search
            </a>
          </div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
              No new matches
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
              We&apos;ll notify you when a matching company appears.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {leads.map((lead, i) => (
              <CompanyLeadRow
                key={lead.id}
                lead={lead}
                verified={verified}
                balance={balance}
                introSuspended={introSuspended}
                index={i}
              />
            ))}
          </ul>
        )}
      </WorkspaceCard>

      {searchesCount > 0 && leads.length > 0 ? (
        <p className="mt-3 text-[12px] text-muted">
          Ranked by freshness — never paid placement.{" "}
          <Link
            href="/dashboard/inbox?tab=intros"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Intros inbox
          </Link>
        </p>
      ) : null}
    </section>
  );
}
