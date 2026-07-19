"use server";

import { createClient } from "@/lib/supabase/server";
import { getPublicTeam, listCompanyTeam } from "@/features/team/queries";
import type {
  PublicTeamMember,
  TeamInvitation,
  TeamRole,
} from "@/features/team/types";

/** Panel-only: public team cards (name/title/photo). Never email/phone/user_id. */
export async function fetchPublicTeamForPanel(
  companyId: string,
): Promise<PublicTeamMember[]> {
  if (!companyId) return [];
  return getPublicTeam(companyId);
}

export type TeamManageAccess = {
  canManage: boolean;
  /** Owner may invite as admin; admin may only invite members. */
  canInviteAdmin: boolean;
  role: TeamRole | null;
};

/** Owner/admin on this company — gates Add team member + pending invites. */
export async function fetchTeamManageAccess(
  companyId: string,
): Promise<TeamManageAccess> {
  const empty: TeamManageAccess = {
    canManage: false,
    canInviteAdmin: false,
    role: null,
  };
  if (!companyId) return empty;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const [{ data: membership }, { data: company }] = await Promise.all([
      supabase
        .from("company_members")
        .select("role")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("companies")
        .select("owner_id")
        .eq("id", companyId)
        .maybeSingle(),
    ]);

    const isOwner =
      company?.owner_id === user.id || membership?.role === "owner";
    const isAdmin = membership?.role === "admin";

    if (!isOwner && !isAdmin) return empty;

    const role: TeamRole = isOwner ? "owner" : "admin";
    return {
      canManage: true,
      canInviteAdmin: isOwner,
      role,
    };
  } catch {
    return empty;
  }
}

/** Pending invites for owner/admin panel — never for public viewers. */
export async function fetchPendingTeamInvitesForPanel(
  companyId: string,
): Promise<TeamInvitation[]> {
  if (!companyId) return [];
  const access = await fetchTeamManageAccess(companyId);
  if (!access.canManage) return [];
  const { pendingInvites } = await listCompanyTeam(companyId);
  return pendingInvites;
}
