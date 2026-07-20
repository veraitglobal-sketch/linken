import type { ReactNode } from "react";
import { GroupMemberCard } from "@/components/groups/group-member-card";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { flattenMemberTree } from "@/features/groups/tree";
import type { GroupPublicPage } from "@/features/groups/types";

type Props = {
  page: GroupPublicPage;
  networkMap?: ReactNode;
};

function groupInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function GroupProfile({ page, networkMap }: Props) {
  const { group, tree, companyCount, countryCount } = page;
  const flat = flattenMemberTree(tree);
  const showMembers = flat.length > 0;

  return (
    <div className="pb-10">
      <section className="px-4 pt-3">
        <div className="relative mx-auto overflow-hidden rounded-[32px] bg-[#0e1f1c] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="animate-rise flex flex-wrap items-center gap-3">
            <LogoMark
              initials={groupInitials(group.name)}
              logoUrl={group.logoUrl}
              website={group.website}
              size="md"
              className="rounded-2xl ring-1 ring-white/15"
            />
            <div>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7eb8a4]" />
                <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                  Company group
                </p>
              </span>
            </div>
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
              <Button href={group.website} variant="onDark" className="h-10 px-4">
                Website
              </Button>
            ) : null}
          </div>
          <p className="mt-4 max-w-lg text-[12px] leading-relaxed text-white/40">
            Totals count confirmed members only. Evidence stays on each company
            — the tree shows ownership structure, not merged proof.
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
              Structure
            </h2>
            <div className="mt-6 space-y-3">
              {flat.map((m) => (
                <div
                  key={m.companyId}
                  style={{ marginLeft: `${m.depth * 1.25}rem` }}
                  className="min-w-0"
                >
                  <GroupMemberCard member={m} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {networkMap}
    </div>
  );
}
