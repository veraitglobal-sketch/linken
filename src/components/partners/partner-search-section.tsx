import { PartnerInviteButton } from "@/components/partners/partner-invite-button";
import { CompanyResult } from "@/components/search/company-result";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Input } from "@/components/ui/input";
import type { Company } from "@/types/company";

type Props = {
  q: string;
  results: Company[];
  emptySearch: boolean;
  verified: boolean;
  statusBySlug: Map<string, string>;
  /** Return path after invite (e.g. /c/slug#partners). */
  backPath?: string;
  fromSlug?: string;
};

export function PartnerSearchSection({
  q,
  results,
  emptySearch,
  verified,
  statusBySlug,
  backPath = "/dashboard/partners",
  fromSlug,
}: Props) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Find a company
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          Claimed firms only — they accept to become official on Network.
        </p>
      </header>

      <WorkspaceCard className="mb-4">
        <form action="/dashboard/partners" method="get">
          {fromSlug ? (
            <input type="hidden" name="from" value={fromSlug} />
          ) : null}
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search registered companies"
            aria-label="Search partners"
          />
        </form>
      </WorkspaceCard>

      {results.length > 0 ? (
        <ul className="space-y-2">
          {results.map((company) => {
            const status = statusBySlug.get(company.slug);
            const unclaimed = company.claimed === false;
            return (
              <li key={company.id}>
                <CompanyResult
                  company={company}
                  action={
                    unclaimed ? (
                      <span className="shrink-0 text-[11px] font-medium text-muted">
                        Use draft below
                      </span>
                    ) : (
                      <PartnerInviteButton
                        companySlug={company.slug}
                        companyName={company.name}
                        back={backPath}
                        disabledReason={
                          !verified
                            ? "Verify first"
                            : status === "Official"
                              ? "Official"
                              : status === "Pending"
                                ? "Pending"
                                : status === "Incoming"
                                  ? "Incoming"
                                  : null
                        }
                      />
                    )
                  }
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <WorkspaceCard>
          <div className="py-6 text-center">
            <p className="text-[14px] font-medium text-ink">
              {emptySearch
                ? `No match for “${q.trim()}”`
                : "Search claimed companies"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
              {emptySearch
                ? "Create a draft invite below."
                : "Type a name to find registered firms."}
            </p>
          </div>
        </WorkspaceCard>
      )}
    </section>
  );
}
