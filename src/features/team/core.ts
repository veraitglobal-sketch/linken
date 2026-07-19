import "server-only";
import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendTeamJoinInviteEmail } from "@/lib/email";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Stable opaque id — sha256(companyId:userId) hex. Never exposes user_id. */
export function teamMemberId(companyId: string, userId: string): string {
  return createHash("sha256")
    .update(`${companyId}:${userId}`)
    .digest("hex")
    .slice(0, 32);
}

export async function listTeamCore(
  admin: SupabaseClient,
  companyId: string,
): Promise<
  CoreResult<{
    members: {
      member_id: string;
      role: string;
      display_name: string;
      display_title: string;
      photo_url: string | null;
      public_visible: boolean;
      created_at: string;
    }[];
    pending_invitations: {
      id: string;
      invite_name: string;
      invite_title: string;
      invite_email: string;
      role: string;
      created_at: string;
    }[];
  }>
> {
  const [membersRes, invitesRes] = await Promise.all([
    admin
      .from("company_members")
      .select(
        "user_id, role, display_name, display_title, photo_url, public_visible, created_at",
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: true }),
    admin
      .from("team_invitations")
      .select(
        "id, invite_name, invite_title, invite_email, role, status, created_at",
      )
      .eq("company_id", companyId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  if (membersRes.error) {
    return { ok: false, error: membersRes.error.message };
  }

  const members = (membersRes.data ?? []).map((m) => ({
    member_id: teamMemberId(companyId, m.user_id as string),
    role: m.role as string,
    display_name: (m.display_name as string) ?? "",
    display_title: (m.display_title as string) ?? "",
    photo_url: (m.photo_url as string | null) ?? null,
    public_visible: Boolean(m.public_visible),
    created_at: m.created_at as string,
  }));

  const pending_invitations = (invitesRes.data ?? []).map((i) => ({
    id: i.id as string,
    invite_name: i.invite_name as string,
    invite_title: (i.invite_title as string) ?? "",
    invite_email: i.invite_email as string,
    role: i.role === "admin" ? "admin" : "member",
    created_at: i.created_at as string,
  }));

  return { ok: true, data: { members, pending_invitations } };
}

export async function inviteTeamMemberCore(
  admin: SupabaseClient,
  input: {
    companyId: string;
    ownerUserId: string;
    companyName: string;
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    role: "admin" | "member";
  },
): Promise<CoreResult<{ email: string }>> {
  const name = [input.firstName, input.lastName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
  const email = input.email.trim().toLowerCase();
  if (!name || !email.includes("@")) {
    return { ok: false, error: "first_name/last_name and email are required." };
  }

  const { data: token, error } = await admin.rpc("agent_create_team_invitation", {
    p_company_id: input.companyId,
    p_invited_by: input.ownerUserId,
    p_invite_name: name,
    p_invite_title: input.title.trim(),
    p_invite_email: email,
    p_role: input.role === "admin" ? "admin" : "member",
  });

  if (error || !token) {
    return { ok: false, error: error?.message ?? "Could not create invite." };
  }

  await sendTeamJoinInviteEmail({
    to: email,
    inviterName: "Company owner",
    companyName: input.companyName,
    token: String(token),
  });

  return { ok: true, data: { email } };
}

export async function cancelTeamInvitationCore(
  admin: SupabaseClient,
  companyId: string,
  invitationId: string,
): Promise<CoreResult<{ id: string }>> {
  const { data, error } = await admin
    .from("team_invitations")
    .update({
      status: "cancelled",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", invitationId)
    .eq("company_id", companyId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Invitation not found." };
  return { ok: true, data: { id: invitationId } };
}

export async function removeTeamMemberCore(
  admin: SupabaseClient,
  companyId: string,
  memberId: string,
): Promise<CoreResult<{ member_id: string }>> {
  const { data: rows, error } = await admin
    .from("company_members")
    .select("user_id, role")
    .eq("company_id", companyId);

  if (error) return { ok: false, error: error.message };

  const hit = (rows ?? []).find(
    (r) => teamMemberId(companyId, r.user_id as string) === memberId,
  );
  if (!hit) return { ok: false, error: "Member not found." };
  if (hit.role === "owner") {
    return { ok: false, error: "Cannot remove the company owner." };
  }

  const { error: delError } = await admin
    .from("company_members")
    .delete()
    .eq("company_id", companyId)
    .eq("user_id", hit.user_id);

  if (delError) return { ok: false, error: delError.message };
  return { ok: true, data: { member_id: memberId } };
}
