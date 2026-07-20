import type { Metadata } from "next";
import Link from "next/link";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { SectionTitle } from "@/components/ui/section-title";
import { getDashboardSession } from "@/features/dashboard/session";
import {
  getDashboardGroupById,
  getDashboardGroupForCreator,
} from "@/features/groups/dashboard-group";

export const metadata: Metadata = {
  title: "Company group",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    invited?: string;
    subsidiary?: string;
  }>;
};

export default async function DashboardGroupPage({ searchParams }: Props) {
  const { error, created, invited, subsidiary } = await searchParams;
  const { user, group, active } = await getDashboardSession();

  let data = null;
  if (user) {
    data =
      active?.type === "group" && group
        ? await getDashboardGroupById(group.id)
        : await getDashboardGroupForCreator();
  }

  return (
    <div className="max-w-3xl space-y-2 pb-8">
      <SectionTitle
        eyebrow="Network"
        title="Company group"
        description="Organize country branches under one group. Evidence stays on each company profile. Prefer Structure for the tree view."
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
