import type { Metadata } from "next";
import Link from "next/link";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { EditMyTeamProfile } from "@/components/team/edit-my-team-profile";
import { InviteTeamForm } from "@/components/team/invite-team-form";
import { TeamInviteLocked } from "@/components/team/team-invite-locked";
import { TeamMembersSection } from "@/components/team/team-members-section";
import { TeamPageFlashes } from "@/components/team/team-page-flashes";
import { TeamPendingInvites } from "@/components/team/team-pending-invites";
import { TeamSeatsCard } from "@/components/team/team-seats-card";
import { TeamTabs } from "@/components/team/team-tabs";
import {
  listCompanyTeam,
  viewerCompanyMembership,
} from "@/features/team/queries";
import { getEntitlements } from "@/features/plan/entitlements";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { PRODUCT } from "@/lib/product-model";

export const metadata: Metadata = {
  title: "Team access",
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
  const seats = getEntitlements(sessionCompany?.plan).maxTeamMembers;
  const usedSeats = members.length + pendingInvites.length;
  const canInviteMore = usedSeats < seats;

  return (
    <WorkspacePage
      wide
      title="Team access"
      description={`Who can work here. Public team appears on ${PRODUCT.company.label} when they opt in.`}
      stats={
        company && (me || canManage)
          ? [
              { label: "Members", value: members.length },
              { label: "On profile", value: members.filter((m) => m.publicVisible).length },
              { label: "Pending", value: pendingInvites.length, attention: pendingInvites.length > 0 },
              { label: "Seats", value: `${usedSeats} / ${seats}` },
            ]
          : undefined
      }
      action={
        company?.slug ? (
          <Link
            href={`/c/${company.slug}#team`}
            className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            {PRODUCT.company.label}
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
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
              action={
                canManage && tab !== "invite" ? (
                  <Link
                    href="/dashboard/team?tab=invite"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                    Invite teammate
                  </Link>
                ) : null
              }
            />
            {tab === "you" && me ? (
              <EditMyTeamProfile
                companyId={company.id}
                me={me}
                needsSetup={needsSetup}
              />
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                  {tab === "invite" && canManage ? (
                    canInviteMore ? (
                      <InviteTeamForm companyId={company.id} />
                    ) : (
                      <TeamInviteLocked maxSeats={seats} />
                    )
                  ) : (
                    <TeamMembersSection
                      members={members}
                      currentUserId={user?.id}
                      canManage={canManage}
                      companyId={company.id}
                    />
                  )}
                </div>
                <aside className="space-y-4">
                  {canManage ? (
                    <TeamPendingInvites
                      pendingInvites={pendingInvites}
                      back={`/dashboard/team?tab=${tab}`}
                    />
                  ) : null}
                  <TeamSeatsCard used={usedSeats} seats={seats} />
                </aside>
              </div>
            )}
          </>
        ) : null}
      </div>
    </WorkspacePage>
  );
}
