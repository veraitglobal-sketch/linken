import "server-only";

import type { PlatformStaffRole } from "@/features/admin/roles";
import type { PlatformStaffSession } from "@/features/admin/require-platform-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminActionTarget = {
  type: string;
  id: string;
};

export type RunAdminActionInput<T> = {
  actor: PlatformStaffSession;
  action: string;
  target: AdminActionTarget;
  reason: string;
  before?: unknown;
  run: () => Promise<{ result: T; after?: unknown }>;
};

export type RunAdminActionResult<T> =
  | { ok: true; result: T }
  | { ok: false; error: string };

/**
 * Every panel write goes through this helper.
 * Blank reason → refuse. Inserts audit row after a successful mutation.
 */
export async function runAdminAction<T>(
  input: RunAdminActionInput<T>,
): Promise<RunAdminActionResult<T>> {
  const reason = input.reason.trim();
  if (!reason) {
    return { ok: false, error: "A reason is required for every staff action." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Admin client unavailable." };
  }

  let result: T;
  let after: unknown = undefined;
  try {
    const out = await input.run();
    result = out.result;
    after = out.after;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed.";
    return { ok: false, error: message };
  }

  const { error } = await admin.from("admin_audit_log").insert({
    actor_user_id: input.actor.user.id,
    actor_email: input.actor.email,
    role_at_time: input.actor.role as PlatformStaffRole,
    action: input.action,
    target_type: input.target.type,
    target_id: input.target.id,
    reason,
    before: input.before ?? null,
    after: after ?? null,
  });

  if (error) {
    return {
      ok: false,
      error: `Action succeeded but audit insert failed: ${error.message}`,
    };
  }

  return { ok: true, result };
}
