import { GraphInviteTeamForm } from "@/components/network/graph-invite-team-form";
import { GraphPendingInvites } from "@/components/network/graph-pending-invites";
import { GraphTeamSection } from "@/components/network/graph-team-section";
import { GraphPanelInspectProfile } from "@/components/network/graph-panel-inspect-profile";
import {
  ExternalIcon,
  PersonPlusIcon,
  PlusIcon,
  ShieldIcon,
} from "@/components/network/graph-panel-icons";
import { PanelRow } from "@/components/network/graph-panel-row";
import {
  NetworkOwnershipChart,
  type OwnershipSlice,
} from "@/components/network/network-ownership-chart";
import type { TeamManageAccess } from "@/features/team/panel-actions";
import type {
  NetworkGraphContext,
  NetworkNodeData,
} from "@/features/network/types";

type Props = {
  selected: NetworkNodeData;
  owners?: OwnershipSlice[];
  context?: NetworkGraphContext;
  editable: boolean;
  teamAccess: TeamManageAccess | null;
  showInviteTeam: boolean;
  inviteFlash: string | null;
  pendingRefresh: number;
  onOpenAdd: () => void;
  onShowInviteTeam: () => void;
  onHideInviteTeam: () => void;
  onInviteSent: (email: string) => void;
};

export function GraphPanelInspect({
  selected,
  owners = [],
  context,
  editable,
  teamAccess,
  showInviteTeam,
  inviteFlash,
  pendingRefresh,
  onOpenAdd,
  onShowInviteTeam,
  onHideInviteTeam,
  onInviteSent,
}: Props) {
  const showOwnership =
    owners.length > 1 || owners.some((o) => o.percentage != null || o.type);

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      <GraphPanelInspectProfile selected={selected} context={context} />

      {showOwnership ? <NetworkOwnershipChart owners={owners} /> : null}

      {selected.kind !== "group" && selected.companyId ? (
        <GraphTeamSection
          key={selected.companyId}
          companyId={selected.companyId}
          companySlug={selected.slug}
          companyName={selected.name}
          publicTeamCount={selected.publicTeamCount}
          inquiryBack="/dashboard"
        />
      ) : null}

      {teamAccess?.canManage && selected.companyId ? (
        <GraphPendingInvites
          key={`pending-${selected.companyId}`}
          companyId={selected.companyId}
          refreshKey={pendingRefresh}
        />
      ) : null}

      {inviteFlash ? (
        <p className="mx-3 mt-2 rounded-2xl border border-success/25 bg-success/8 px-3 py-2 text-[12px] font-medium text-ink">
          Invitation sent to {inviteFlash}
        </p>
      ) : null}

      {showInviteTeam &&
      teamAccess?.canManage &&
      teamAccess.canInviteMore &&
      selected.companyId ? (
        <div className="px-3 pt-2">
          <GraphInviteTeamForm
            companyId={selected.companyId}
            canInviteAdmin={teamAccess.canInviteAdmin}
            onCancel={onHideInviteTeam}
            onSent={onInviteSent}
          />
        </div>
      ) : null}

      {showInviteTeam &&
      teamAccess?.canManage &&
      !teamAccess.canInviteMore ? (
        <p className="mx-3 mt-2 rounded-2xl border border-line bg-paper px-3 py-2 text-[12px] text-muted">
          Team seats require Pro.{" "}
          <a
            href="/dashboard/billing"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Upgrade on Billing
          </a>
        </p>
      ) : null}

      <ul className="mt-1">
        {selected.kind !== "group" &&
        selected.domainVerified === false &&
        selected.companyId &&
        selected.companyId === context?.viewerCompanyId ? (
          <PanelRow
            icon={<ShieldIcon />}
            title="Verify domain"
            description="DNS TXT, meta tag, or matching email — required to link firms"
            href="/dashboard/verification"
            chevron
            accent
          />
        ) : null}
        {teamAccess?.canManage && !showInviteTeam ? (
          teamAccess.canInviteMore ? (
            <PanelRow
              icon={<PersonPlusIcon />}
              title="Add team member"
              description="Invite by email — they join after accepting"
              onClick={onShowInviteTeam}
              chevron
              accent
            />
          ) : (
            <PanelRow
              icon={<PersonPlusIcon />}
              title="Add team member"
              description="Requires Pro — upgrade on Billing"
              href="/dashboard/billing"
              chevron
              accent
            />
          )
        ) : null}
        {editable ? (
          <PanelRow
            icon={<PlusIcon />}
            title="Add company"
            description="Partner (dashed) or child firm under ownership (solid arrow)"
            onClick={onOpenAdd}
            chevron
            accent={selected.domainVerified !== false}
          />
        ) : null}
        {selected.href && selected.href !== "#" ? (
          <PanelRow
            icon={<ExternalIcon />}
            title="Open profile"
            description="View the public company page"
            href={selected.href}
            chevron
          />
        ) : null}
      </ul>
    </div>
  );
}
