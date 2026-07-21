import type { Metadata } from "next";
import Link from "next/link";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { EditMyTeamProfile } from "@/components/team/edit-my-team-profile";
import { InviteTeamForm } from "@/components/team/invite-team-form";
import { TeamMembersSection } from "@/components/team/team-members-section";
import { TeamPageFlashes } from "@/components/team/team-page-flashes";
import { TeamPendingInvites } from "@/components/team/team-pending-invites";
import { TeamTabs } from "@/components/team/team-tabs";
import {
  listCompanyTeam,
  viewerCompanyMembership,
} from "@/features/team/queries";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = {
  title: "Team",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    invited?: string;
    cancelled?: string;
    joined?: string;
    profileUpdated?: string;
    accessUpdated?: string;
    tab?: string;
  }>;
};

function resolveTab(
  tabRaw: string | undefined,
  canManage: boolean,
  hasYou: boolean,
  needsSetup: boolean,
): "people" | "invite" | "you" {
  if (tabRaw === "invite" && canManage) return "invite";
  if (tabRaw === "you" && hasYou) return "you";
  if (tabRaw === "people") return "people";
  if (needsSetup && hasYou) return "you";
  return "people";
}

export default async function DashboardTeamPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { needsCompanySwitch, company: sessionCompany } =
    await assertCompanySection("team");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Team" />;
  }

  const { user, membership, company } = await viewerCompanyMembership();
  const canManage =
    membership?.role === "owner" ||
    membership?.role === "admin" ||
    sessionCompany?.role === "operator";

  const { members, pendingInvites } =
    company && membership
      ? await listCompanyTeam(company.id)
      : { members: [], pendingInvites: [] };

  const me = members.find((m) => m.userId === user?.id) ?? null;
  const needsSetup = Boolean(
    me && (!me.displayName.trim() || !me.displayTitle.trim()),
  );
  const tab = resolveTab(sp.tab, canManage, Boolean(me), needsSetup);

  return (
    <WorkspacePage
      title="Team"
      description="People with access to this company. Public only if they opt in."
      action={
        company?.slug ? (
          <Link
            href={`/c/${company.slug}`}
            className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            Public profile
          </Link>
        ) : null
      }
    >
      <div className="space-y-8">
        <TeamPageFlashes
          params={sp}
          needsSetup={Boolean(needsSetup && me && tab !== "you")}
        />

        {!user ? (
          <p className="text-[14px] text-muted">
            <Link
              href="/login?next=/dashboard/team"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Sign in
            </Link>{" "}
            to manage teammates.
          </p>
        ) : null}

        {user && !membership ? (
          <p className="text-[14px] text-muted">
            <Link
              href="/onboarding"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Create your company
            </Link>{" "}
            first, or accept a team invite from email.
          </p>
        ) : null}

        {company && (me || canManage) ? (
          <>
            <TeamTabs
              active={tab}
              membersCount={members.length}
              pendingCount={pendingInvites.length}
              showInvite={canManage}
              showYou={Boolean(me)}
              youNeedsSetup={needsSetup}
            />
            {tab === "people" ? (
              <TeamMembersSection
                members={members}
                pendingInvites={pendingInvites}
                currentUserId={user?.id}
                canManage={canManage}
                companyId={company.id}
              />
            ) : null}
            {tab === "invite" && canManage ? (
              <div className="space-y-10">
                <InviteTeamForm companyId={company.id} />
                <TeamPendingInvites
                  pendingInvites={pendingInvites}
                  back="/dashboard/team?tab=invite"
                />
              </div>
            ) : null}
            {tab === "you" && me ? (
              <EditMyTeamProfile
                companyId={company.id}
                me={me}
                needsSetup={needsSetup}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </WorkspacePage>
  );
}
