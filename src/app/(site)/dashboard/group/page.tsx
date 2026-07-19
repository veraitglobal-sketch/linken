import type { Metadata } from "next";
import Link from "next/link";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { SectionTitle } from "@/components/ui/section-title";
import { getDashboardGroupForCreator } from "@/features/groups/queries";
import { viewerOwnsClaimedCompany } from "@/features/partners/queries";

export const metadata: Metadata = {
  title: "Company group",
};

type Props = {
  searchParams: Promise<{ error?: string; created?: string; invited?: string; subsidiary?: string }>;
};

export default async function DashboardGroupPage({ searchParams }: Props) {
  const { error, created, invited, subsidiary } = await searchParams;
  const { user } = await viewerOwnsClaimedCompany();
  const data = user ? await getDashboardGroupForCreator() : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle
        eyebrow="Owner"
        title="Company group"
        description="Organize country branches under one group. Evidence stays on each company profile."
      />

      {error ? (
        <p className="mt-6 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      {created ? (
        <p className="mt-6 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Group created.
        </p>
      ) : null}
      {invited ? (
        <p className="mt-6 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Invite sent to {invited}. They must confirm.
        </p>
      ) : null}
      {subsidiary ? (
        <p className="mt-6 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Subsidiary created:{" "}
          <Link href={`/c/${subsidiary}`} className="font-semibold underline">
            {subsidiary}
          </Link>
          . Local managers can claim it later.
        </p>
      ) : null}

      {!user ? (
        <p className="mt-8 text-sm text-ink-soft">
          <Link href="/login?next=/dashboard/group" className="font-semibold underline">
            Sign in
          </Link>{" "}
          to manage a company group.
        </p>
      ) : (
        <div className="mt-8">
          <DashboardGroupPanel data={data} />
        </div>
      )}
    </div>
  );
}
