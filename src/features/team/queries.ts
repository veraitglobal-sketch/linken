import { createClient } from "@/lib/supabase/server";
import type {
  PublicTeamMember,
  TeamInvitation,
  TeamInvitePreview,
  TeamMember,
  TeamRole,
} from "@/features/team/types";

/** Membership for dashboard Team — works for owner/admin/member. */
export async function viewerCompanyMembership() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, membership: null, company: null };

    const { data: membership } = await supabase
      .from("company_members")
      .select(
        "company_id, user_id, role, display_name, display_title, photo_url, public_visible, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!membership) return { user, membership: null, company: null };

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, slug")
      .eq("id", membership.company_id)
      .maybeSingle();

    return {
      user,
      membership: {
        companyId: membership.company_id as string,
        userId: membership.user_id as string,
        role: membership.role as TeamRole,
        displayName: (membership.display_name as string) ?? "",
        displayTitle: (membership.display_title as string) ?? "",
        photoUrl: (membership.photo_url as string | null) ?? null,
        publicVisible: Boolean(membership.public_visible),
        createdAt: membership.created_at as string,
      },
      company: company
        ? {
            id: company.id as string,
            name: company.name as string,
            slug: company.slug as string,
          }
        : null,
    };
  } catch {
    return { user: null, membership: null, company: null };
  }
}

export async function getTeamInvitePreview(
  token: string,
): Promise<TeamInvitePreview | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_team_invite_preview", {
      p_token: token,
    });
    if (error || !data?.[0]) return null;
    const row = data[0];
    return {
      invitationId: row.invitation_id,
      companyId: row.company_id,
      companyName: row.company_name,
      companySlug: row.company_slug,
      inviteName: row.invite_name,
      inviteTitle: row.invite_title ?? "",
      inviteEmail: row.invite_email,
      role: row.role === "admin" ? "admin" : "member",
      status: row.status,
      inviterHint: row.inviter_hint ?? "A teammate",
    };
  } catch {
    return null;
  }
}

export async function listCompanyTeam(companyId: string): Promise<{
  members: TeamMember[];
  pendingInvites: TeamInvitation[];
}> {
  const empty = { members: [] as TeamMember[], pendingInvites: [] as TeamInvitation[] };
  if (!companyId) return empty;

  try {
    const supabase = await createClient();
    const [membersRes, invitesRes] = await Promise.all([
      supabase
        .from("company_members")
        .select(
          "user_id, role, display_name, display_title, photo_url, public_visible, created_at",
        )
        .eq("company_id", companyId)
        .order("created_at", { ascending: true }),
      supabase
        .from("team_invitations")
        .select(
          "id, invite_name, invite_title, invite_email, role, status, created_at",
        )
        .eq("company_id", companyId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    const members: TeamMember[] = (membersRes.data ?? []).map((m) => ({
      userId: m.user_id as string,
      role: m.role as TeamRole,
      displayName: (m.display_name as string) ?? "",
      displayTitle: (m.display_title as string) ?? "",
      photoUrl: (m.photo_url as string | null) ?? null,
      publicVisible: Boolean(m.public_visible),
      createdAt: m.created_at as string,
    }));

    const pendingInvites: TeamInvitation[] = (invitesRes.data ?? []).map(
      (i) => ({
        id: i.id as string,
        inviteName: i.invite_name as string,
        inviteTitle: (i.invite_title as string) ?? "",
        inviteEmail: i.invite_email as string,
        role: i.role === "admin" ? "admin" : "member",
        status: "pending",
        createdAt: i.created_at as string,
      }),
    );

    return { members, pendingInvites };
  } catch {
    return empty;
  }
}

export async function getPublicTeam(
  companyId: string,
): Promise<PublicTeamMember[]> {
  if (!companyId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_team", {
      p_company_id: companyId,
    });
    if (error || !data) return [];
    return data.map(
      (row: {
        display_name: string;
        display_title: string;
        photo_url: string | null;
      }) => ({
        displayName: row.display_name,
        displayTitle: row.display_title ?? "",
        photoUrl: row.photo_url,
      }),
    );
  } catch {
    return [];
  }
}

