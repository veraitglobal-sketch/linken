import type { Metadata } from "next";
import Link from "next/link";
import {
  WorkspaceCard,
  WorkspacePage,
} from "@/components/dashboard/workspace-page";
import { EditMyTeamProfile } from "@/components/team/edit-my-team-profile";
import { InviteTeamForm } from "@/components/team/invite-team-form";
import { TeamMemberRow } from "@/components/team/team-member-row";
import { cancelTeamInvitation } from "@/features/team/actions";
import {
  listCompanyTeam,
  viewerCompanyMembership,
} from "@/features/team/queries";
import { Button } from "@/components/ui/button";

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
  }>;
};

export default async function DashboardTeamPage({ searchParams }: Props) {
  const {
    error,
    invited,
    cancelled,
    joined,
    profileUpdated,
  } = await searchParams;
  const { user, membership, company } = await viewerCompanyMembership();

  const canManage =
    membership?.role === "owner" || membership?.role === "admin";

  const { members, pendingInvites } =
    company && membership
      ? await listCompanyTeam(company.id)
      : { members: [], pendingInvites: [] };

  const me = members.find((m) => m.userId === user?.id) ?? null;
  const needsSetup = Boolean(
    me && (!me.displayName.trim() || !me.displayTitle.trim()),
  );

  return (
    <WorkspacePage
      title="Team"
      description="Invite colleagues by email. They join only after accepting — and appear on the public profile only if they opt in."
    >
      <div className="space-y-5">
        {error ? (
          <p className="rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        {invited ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Invite sent. They become a member only after accepting the link.
          </p>
        ) : null}
        {cancelled ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Invite cancelled.
          </p>
        ) : null}
        {joined ? (
          <p className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-ink">
            You joined the team. Edit your card below anytime.
          </p>
        ) : null}
        {profileUpdated ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Profile updated.
          </p>
        ) : null}

        {!user ? (
          <p className="text-sm text-[#64748b]">
            <Link
              href="/login?next=/dashboard/team"
              className="font-semibold underline"
            >
              Sign in
            </Link>{" "}
            to manage teammates.
          </p>
        ) : null}

        {user && !membership ? (
          <p className="text-sm text-[#64748b]">
            <Link href="/onboarding" className="font-semibold underline">
              Create your company
            </Link>{" "}
            first, or accept a team invite from email.
          </p>
        ) : null}

        {company && me ? (
          <>
            <EditMyTeamProfile
              companyId={company.id}
              me={me}
              needsSetup={needsSetup}
            />

            <WorkspaceCard>
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                Members
              </h3>
              <ul className="mt-4 space-y-2">
                {members.map((m) => (
                  <TeamMemberRow
                    key={m.userId}
                    member={m}
                    isYou={m.userId === user?.id}
                  />
                ))}
                {members.length === 0 ? (
                  <li className="text-sm text-[#94a3b8]">No members yet.</li>
                ) : null}
              </ul>
            </WorkspaceCard>

            {canManage && pendingInvites.length > 0 ? (
              <WorkspaceCard>
                <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                  Pending invites
                </h3>
                <ul className="mt-4 space-y-2">
                  {pendingInvites.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8eaee] px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink">
                          {inv.inviteName}
                          {inv.inviteTitle ? (
                            <span className="font-normal text-[#64748b]">
                              {" "}
                              · {inv.inviteTitle}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-[11px] text-[#94a3b8]">
                          {inv.inviteEmail} · {inv.role} · Pending
                        </p>
                      </div>
                      <form action={cancelTeamInvitation}>
                        <input
                          type="hidden"
                          name="invitation_id"
                          value={inv.id}
                        />
                        <input
                          type="hidden"
                          name="back"
                          value="/dashboard/team"
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          className="h-8 px-3 text-[11px]"
                        >
                          Cancel
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              </WorkspaceCard>
            ) : null}

            {canManage ? <InviteTeamForm companyId={company.id} /> : null}
          </>
        ) : null}
      </div>
    </WorkspacePage>
  );
}
