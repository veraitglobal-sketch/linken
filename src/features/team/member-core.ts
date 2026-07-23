import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { teamMemberId, type CoreResult } from "@/features/team/core";
import { parseSectionPermissions } from "@/features/workspace/sections";
import type { WorkspaceSection } from "@/features/workspace/sections";

async function resolveMemberUserId(
  admin: SupabaseClient,
  companyId: string,
  memberId: string,
): Promise<{ user_id: string; role: string } | null> {
  const { data: rows, error } = await admin
    .from("company_members")
    .select("user_id, role")
    .eq("company_id", companyId);
  if (error) return null;

  const hit = (rows ?? []).find(
    (r) => teamMemberId(companyId, r.user_id as string) === memberId,
  );
  if (!hit) return null;
  return { user_id: hit.user_id as string, role: hit.role as string };
}

export async function updateTeamMemberCore(
  admin: SupabaseClient,
  input: {
    companyId: string;
    memberId: string;
    display_name?: string;
    display_title?: string;
    public_visible?: boolean;
    role?: "admin" | "member";
  },
): Promise<CoreResult<{ member_id: string }>> {
  const member = await resolveMemberUserId(admin, input.companyId, input.memberId);
  if (!member) return { ok: false, error: "Member not found." };
  if (member.role === "owner") {
    return { ok: false, error: "Cannot edit the company owner." };
  }

  const patch: Record<string, unknown> = {};
  if (input.display_name !== undefined) {
    const v = input.display_name.trim();
    if (!v) return { ok: false, error: "display_name cannot be empty." };
    patch.display_name = v;
  }
  if (input.display_title !== undefined) {
    patch.display_title = input.display_title.trim();
  }
  if (input.public_visible !== undefined) {
    patch.public_visible = Boolean(input.public_visible);
  }
  if (input.role !== undefined) {
    patch.role = input.role === "admin" ? "admin" : "member";
    if (patch.role === "admin") patch.permissions = [];
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No fields to update." };
  }

  const { error } = await admin
    .from("company_members")
    .update(patch)
    .eq("company_id", input.companyId)
    .eq("user_id", member.user_id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { member_id: input.memberId } };
}

export async function setMemberPermissionsCore(
  admin: SupabaseClient,
  input: {
    companyId: string;
    memberId: string;
    permissions: WorkspaceSection[];
  },
): Promise<CoreResult<{ member_id: string; permissions: WorkspaceSection[] }>> {
  const member = await resolveMemberUserId(admin, input.companyId, input.memberId);
  if (!member) return { ok: false, error: "Member not found." };
  if (member.role !== "member") {
    return { ok: false, error: "Permissions apply to members only." };
  }

  const permissions = parseSectionPermissions(input.permissions);
  const { error } = await admin
    .from("company_members")
    .update({ permissions })
    .eq("company_id", input.companyId)
    .eq("user_id", member.user_id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { member_id: input.memberId, permissions } };
}

function extFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function uploadTeamMemberPhotoCore(
  admin: SupabaseClient,
  input: {
    companyId: string;
    memberId: string;
    bytes: Uint8Array;
    contentType: string;
  },
): Promise<CoreResult<{ photo_url: string }>> {
  if (input.bytes.byteLength === 0) return { ok: false, error: "Image is empty." };
  if (input.bytes.byteLength > 8 * 1024 * 1024) {
    return { ok: false, error: "Image must be under 8MB." };
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(input.contentType)) {
    return { ok: false, error: "Use JPG, PNG, or WEBP." };
  }

  const member = await resolveMemberUserId(admin, input.companyId, input.memberId);
  if (!member) return { ok: false, error: "Member not found." };

  const path = `${member.user_id}/avatar.${extFor(input.contentType)}`;
  const { error: uploadError } = await admin.storage
    .from("team-photos")
    .upload(path, input.bytes, { upsert: true, contentType: input.contentType });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: pub } = admin.storage.from("team-photos").getPublicUrl(path);
  const photoUrl = `${pub.publicUrl}?t=${Date.now()}`;

  const { error } = await admin
    .from("company_members")
    .update({ photo_url: photoUrl })
    .eq("company_id", input.companyId)
    .eq("user_id", member.user_id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { photo_url: photoUrl } };
}
