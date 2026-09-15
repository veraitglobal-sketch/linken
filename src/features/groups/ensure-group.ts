import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createGroupCore,
  getGroupForCompanyCore,
  type CoreResult,
} from "@/features/groups/core";

/** Group for this firm, creating one and seeding membership if needed. */
export async function ensureGroupForCompany(
  admin: SupabaseClient,
  input: { ownerUserId: string; companyId: string; companyName: string },
): Promise<CoreResult<{ groupId: string }>> {
  let resolved = await getGroupForCompanyCore(
    admin,
    input.companyId,
    input.ownerUserId,
  );

  if (!resolved.ok) {
    const created = await createGroupCore(admin, {
      ownerUserId: input.ownerUserId,
      companyId: input.companyId,
      name: `${input.companyName} group`,
    });
    if (!created.ok) return created;
    resolved = await getGroupForCompanyCore(
      admin,
      input.companyId,
      input.ownerUserId,
    );
    if (!resolved.ok) return resolved;
  }

  const groupId = resolved.data.group.id;
  const member = resolved.data.members.find((m) => m.company_id === input.companyId);
  if (member?.status === "confirmed") {
    return { ok: true, data: { groupId } };
  }

  const now = new Date().toISOString();
  if (member) {
    const { error } = await admin
      .from("company_group_members")
      .update({ status: "confirmed", confirmed_at: now })
      .eq("group_id", groupId)
      .eq("company_id", input.companyId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from("company_group_members").insert({
      group_id: groupId,
      company_id: input.companyId,
      status: "confirmed",
      confirmed_at: now,
    });
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true, data: { groupId } };
}
