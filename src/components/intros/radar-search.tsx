import Link from "next/link";
import { IntroForm } from "@/components/intros/intro-form";
import { IntroProof } from "@/components/intros/intro-proof";
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
  /** Computed on the server — avoid Date.now in render. */
  introSuspended: boolean;
};

export function RadarSearch({
  hits,
  filters,
  radarEnabled,
  verified,
  balance,
  introSuspended,
}: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
          Find companies
        </h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Claimed and verified firms only. Send an intro for 2 credits.
        </p>
      </div>

      <form
        method="get"
        action="/dashboard/radar"
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Input name="category" placeholder="Category" defaultValue={filters.category} />
        <Input name="country" placeholder="Country" defaultValue={filters.country} />
        <Input name="city" placeholder="City" defaultValue={filters.city} />
        <select
          name="level"
          defaultValue={filters.level}
          className="h-11 rounded-xl border border-[#e6eaf0] bg-white px-3 text-sm text-ink"
        >
          <option value="">Any level</option>
          <option value="Established">Established+</option>
          <option value="Trusted">Trusted+</option>
          <option value="Pillar">Pillar</option>
        </select>
        <select
          name="accepting"
          defaultValue={filters.accepting}
          className="h-11 rounded-xl border border-[#e6eaf0] bg-white px-3 text-sm text-ink"
        >
          <option value="">Any availability</option>
          <option value="1">Accepting clients</option>
          <option value="0">Not accepting</option>
        </select>
        <Button type="submit" variant="secondary" className="h-11 sm:col-span-2 lg:col-span-5 lg:w-fit">
          Search
        </Button>
      </form>

      {hits.length === 0 ? (
        <p className="text-[14px] text-ink-soft">No matching verified companies.</p>
      ) : (
        <ul className="space-y-3">
          {hits.map((hit) => {
            let disabled: string | undefined;
            if (!radarEnabled) disabled = "Radar — coming soon.";
            else if (!verified) disabled = "Verify your domain to send intros.";
            else if (introSuspended)
              disabled = "Intro privilege temporarily suspended.";
            else if (balance < 2) disabled = "Need 2 credits to send an intro.";
            else if (!hit.receiveIntros) disabled = "Not accepting intros.";

            return (
              <li
                key={hit.id}
                className="rounded-xl border border-line bg-paper px-4 py-4"
              >
                <IntroProof
                  name={hit.name}
                  slug={hit.slug}
                  verified={hit.verified}
                  trustLevel={hit.trustLevel}
                  wouldWorkAgain={hit.wouldWorkAgain}
                />
                <p className="mt-1 text-[12px] text-ink-soft">
                  {hit.category} · {hit.city}
                  {hit.country ? `, ${hit.country}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {hit.acceptingClients ? (
                    <Badge tone="success">Accepting clients</Badge>
                  ) : (
                    <Badge tone="neutral">Fully booked</Badge>
                  )}
                  <Link
                    href={`/c/${hit.slug}`}
                    className="text-[12px] font-medium text-ink underline"
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
    </section>
  );
}
