import type { ReactNode } from "react";
import { GroupMemberCard } from "@/components/groups/group-member-card";
import { Button } from "@/components/ui/button";
import type { GroupPublicPage } from "@/features/groups/types";

type Props = {
  page: GroupPublicPage;
  networkMap?: ReactNode;
};

export function GroupProfile({ page, networkMap }: Props) {
  const { group, members, companyCount, countryCount } = page;
  const showMembers = members.length > 0;

  return (
    <div className="pb-10">
      <section className="px-4 pt-3">
        <div className="relative mx-auto overflow-hidden rounded-[32px] bg-[#10231f] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="animate-rise flex flex-wrap items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ec4a8]" />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
              Company group
            </p>
          </div>
          <h1 className="animate-rise-delay mt-5 max-w-2xl font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.96] font-medium tracking-[-0.045em]">
            {group.name}
          </h1>
          {group.description ? (
            <p className="animate-rise-delay mt-4 max-w-xl text-[16px] leading-relaxed text-white/70">
              {group.description}
            </p>
          ) : null}
          <div className="animate-rise-late mt-8 flex flex-wrap items-center gap-3">
            <p className="rounded-2xl border border-white/12 bg-black/25 px-4 py-2 text-[13px] text-white/80">
              {companyCount} {companyCount === 1 ? "company" : "companies"}
              {countryCount > 0
                ? ` · ${countryCount} ${countryCount === 1 ? "country" : "countries"}`
                : ""}
            </p>
            {group.website ? (
              <Button
                href={group.website}
                variant="onDark"
                className="h-10 px-4"
              >
                Website
              </Button>
            ) : null}
          </div>
          <p className="mt-4 max-w-lg text-[12px] leading-relaxed text-white/40">
            Totals count confirmed members only. Each company keeps its own
            confirmed evidence — nothing is merged onto a branch profile.
          </p>
        </div>
      </section>

      {showMembers ? (
        <section className="mx-auto mt-5 max-w-6xl px-4">
          <div className="rounded-[28px] border border-line bg-surface px-5 py-6 sm:px-7 sm:py-7">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              Confirmed members
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,1.9rem)] font-medium tracking-[-0.035em] text-ink">
              Companies in this group
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <GroupMemberCard key={m.companyId} member={m} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {networkMap}
    </div>
  );
}
