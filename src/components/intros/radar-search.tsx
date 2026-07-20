import Link from "next/link";
import { IntroForm } from "@/components/intros/intro-form";
import { IntroProof } from "@/components/intros/intro-proof";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RadarCompanyHit } from "@/types/intro";

type Props = {
  hits: RadarCompanyHit[];
  filters: {
    category: string;
    country: string;
    city: string;
    level: string;
    accepting: string;
  };
  radarEnabled: boolean;
  verified: boolean;
  balance: number;
  introSuspended: boolean;
};

const selectClass =
  "h-12 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-blue focus:bg-surface";

export function RadarSearch({
  hits,
  filters,
  radarEnabled,
  verified,
  balance,
  introSuspended,
}: Props) {
  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Find companies
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Claimed and verified firms. Send an intro for 2 credits.
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {hits.length} result{hits.length === 1 ? "" : "s"}
        </p>
      </header>

      <WorkspaceCard className="mb-4">
        <form
          method="get"
          action="/dashboard/radar"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input type="hidden" name="tab" value="leads" />
          <Input
            name="category"
            placeholder="Category"
            defaultValue={filters.category}
          />
          <Input
            name="country"
            placeholder="Country"
            defaultValue={filters.country}
          />
          <Input name="city" placeholder="City" defaultValue={filters.city} />
          <select
            name="level"
            defaultValue={filters.level}
            className={selectClass}
          >
            <option value="">Any level</option>
            <option value="Established">Established+</option>
            <option value="Trusted">Trusted+</option>
            <option value="Pillar">Pillar</option>
          </select>
          <select
            name="accepting"
            defaultValue={filters.accepting}
            className={selectClass}
          >
            <option value="">Any availability</option>
            <option value="1">Accepting clients</option>
            <option value="0">Not accepting</option>
          </select>
          <Button
            type="submit"
            variant="secondary"
            className="h-11 sm:col-span-2 lg:col-span-5 lg:w-fit"
          >
            Search
          </Button>
        </form>
      </WorkspaceCard>

      <WorkspaceCard padded={false}>
        {hits.length === 0 ? (
          <div className="px-5 py-10 text-center sm:px-6">
            <p className="text-[14px] font-medium text-ink">No matches</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
              Try a broader category or city.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {hits.map((hit, i) => {
              let disabled: string | undefined;
              if (!radarEnabled) disabled = "Radar — coming soon.";
              else if (!verified)
                disabled = "Verify your domain to send intros.";
              else if (introSuspended)
                disabled = "Intro privilege temporarily suspended.";
              else if (balance < 2)
                disabled = "Need 2 credits to send an intro.";
              else if (!hit.receiveIntros) disabled = "Not accepting intros.";

              return (
                <li
                  key={hit.id}
                  className="linken-widget-enter px-5 py-4 sm:px-6"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <IntroProof
                    name={hit.name}
                    slug={hit.slug}
                    verified={hit.verified}
                    trustLevel={hit.trustLevel}
                    wouldWorkAgain={hit.wouldWorkAgain}
                  />
                  <p className="mt-1 text-[12px] text-muted">
                    {hit.category} · {hit.city}
                    {hit.country ? `, ${hit.country}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {hit.acceptingClients ? (
                      <Badge tone="success">Accepting clients</Badge>
                    ) : (
                      <Badge tone="neutral">Fully booked</Badge>
                    )}
                    <Link
                      href={`/c/${hit.slug}`}
                      className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      Profile
                    </Link>
                  </div>
                  <IntroForm
                    recipientCompanyId={hit.id}
                    recipientName={hit.name}
                    disabledReason={disabled}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </WorkspaceCard>
    </section>
  );
}
