import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditWrite = {
  apiKeyId: string;
  companyId: string;
  method: string;
  path: string;
  action: string;
  status: number;
  summary?: string;
};

/** Best-effort audit insert — never fails the request. */
export async function writeAgentAudit(entry: AuditWrite): Promise<void> {
  try {
    const admin = createAdminClient();
    if (!admin) return;
    await admin.from("api_audit_log").insert({
      api_key_id: entry.apiKeyId,
      company_id: entry.companyId,
      method: entry.method,
      path: entry.path,
      action: entry.action,
      status: entry.status,
      summary: entry.summary ?? "",
    });
  } catch (err) {
    console.error("[writeAgentAudit]", err);
  }
}

export function maskEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at < 1) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const head = local[0] ?? "*";
  return `${head}***@${domain}`;
}
