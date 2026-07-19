import type { Metadata } from "next";
import Link from "next/link";
import { StructureTree } from "@/components/dashboard/structure-tree";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { Button } from "@/components/ui/button";
import { getDashboardSession } from "@/features/dashboard/session";
import { getDashboardGroupForCreator } from "@/features/groups/queries";

export const metadata: Metadata = {
  title: "Structure",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    invited?: string;
    subsidiary?: string;
  }>;
};

export default async function DashboardStructurePage({ searchParams }: Props) {
  const { error, created, invited, subsidiary } = await searchParams;
  const { user, company } = await getDashboardSession();
  const data = user ? await getDashboardGroupForCreator() : null;

  if (!user) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/login?next=/dashboard/structure" className="font-semibold underline">
          Sign in
        </Link>{" "}
        to manage company structure.
      </p>
    );
  }

  if (!company) {
    return (
      <div className="py-10">
        <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          Register the main company first
        </h1>
        <p className="mt-2 max-w-lg text-[14px] text-ink-soft">
          Create your firm, then add subsidiaries under it. Each branch can grow
          its own sub-companies later.
        </p>
        <Button href="/onboarding" className="mt-5 h-11">
          Create company
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
          Structure
        </p>
        <h1 className="mt-1 font-display text-[clamp(1.6rem,2.5vw,2rem)] font-medium tracking-[-0.04em] text-ink">
          Main company → subsidiaries
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          Like folders in a workflow tool: {company.name} is the root. Add a
          sub-company under it, then that firm can add its own branches. Each
          profile keeps its own verified evidence — the graph only shows
          confirmed links.
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      {created ? (
        <p className="rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Group created.
        </p>
      ) : null}
      {invited ? (
        <p className="rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Invite sent to {invited}. They must confirm.
        </p>
      ) : null}
      {subsidiary ? (
        <p className="rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Subsidiary created:{" "}
          <Link href={`/c/${subsidiary}`} className="font-semibold underline">
            {subsidiary}
          </Link>
          . Local managers can claim it later.
        </p>
      ) : null}

      {data?.tree && data.tree.length > 0 ? (
        <section className="rounded-[28px] border border-line bg-white px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
            Live tree
          </p>
          <h2 className="mt-1 font-display text-lg font-medium tracking-[-0.03em] text-ink">
            Confirmed hierarchy
          </h2>
          <div className="mt-4">
            <StructureTree
              roots={data.tree}
              highlightCompanyId={company.id}
            />
          </div>
        </section>
      ) : null}

      <DashboardGroupPanel data={data} backPath="/dashboard/structure" />

      <p className="text-[12px] text-muted">
        Prefer the classic group page?{" "}
        <Link href="/dashboard/group" className="font-semibold text-ink underline-offset-2 hover:underline">
          Open company group →
        </Link>
      </p>
    </div>
  );
}
