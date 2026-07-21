import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { DashboardGroupPanel } from "@/components/groups/dashboard-group-panel";
import { GroupFlash } from "@/components/groups/group-flash";
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
    <WorkspacePage
      title="Company group"
      description="Country branches under one group. Evidence stays on each company."
      action={
        <Link
          href="/dashboard/structure"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Structure tree
        </Link>
      }
    >
      <div className="space-y-8">
        {error ? <GroupFlash tone="error">{error}</GroupFlash> : null}
        {created ? <GroupFlash>Group created.</GroupFlash> : null}
        {invited ? (
          <GroupFlash>Invite sent to {invited}. They must confirm.</GroupFlash>
        ) : null}
        {subsidiary ? (
          <GroupFlash>
            Subsidiary created:{" "}
            <Link
              href={`/c/${subsidiary}`}
              className="font-semibold underline-offset-2 hover:underline"
            >
              {subsidiary}
            </Link>
            . Local managers can claim it later.
          </GroupFlash>
        ) : null}

        {!user ? (
          <p className="text-[14px] text-muted">
            <Link
              href="/login?next=/dashboard/group"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Sign in
            </Link>{" "}
            to manage a company group.
          </p>
        ) : (
          <DashboardGroupPanel data={data} />
        )}
      </div>
    </WorkspacePage>
  );
}
