import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminAuditLogRow = {
  id: string;
  actorEmail: string;
  roleAtTime: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
};

export type AdminAuditLogPage = {
  rows: AdminAuditLogRow[];
  total: number;
};

/** Newest-first, paginated. admin_audit_log is append-only. */
export async function listAuditLog(
  limit = 50,
  offset = 0,
): Promise<AdminAuditLogPage> {
  const admin = createAdminClient();
  if (!admin) return { rows: [], total: 0 };

  const { data, count } = await admin
    .from("admin_audit_log")
    .select(
      "id, actor_email, role_at_time, action, target_type, target_id, reason, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    rows: (data ?? []).map((r) => ({
      id: r.id as string,
      actorEmail: r.actor_email as string,
      roleAtTime: r.role_at_time as string,
      action: r.action as string,
      targetType: r.target_type as string,
      targetId: r.target_id as string,
      reason: r.reason as string,
      createdAt: r.created_at as string,
    })),
    total: count ?? 0,
  };
}
