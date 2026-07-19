import { getTrustProfile } from "@/features/trust/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  ManagedProjectRequest,
  ManagedResponse,
  ProjectRequestStatus,
  RequestResponseStatus,
} from "@/types/project-request";

function asStatus(value: string): ProjectRequestStatus {
  if (value === "closed" || value === "expired") return value;
  return "open";
}

function asResponseStatus(value: string): RequestResponseStatus {
  if (
    value === "seen" ||
    value === "shortlisted" ||
    value === "declined" ||
    value === "refunded"
  ) {
    return value;
  }
  return "sent";
}

export async function getManagedRequest(
  token: string,
): Promise<ManagedProjectRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_request_by_manage_token", {
    p_token: token,
  });

  if (error || !data?.[0]) return null;
  const row = data[0] as Record<string, unknown>;

  return {
    id: String(row.id),
    requesterName: String(row.requester_name ?? ""),
    requesterEmail: String(row.requester_email ?? ""),
    requesterCompany: String(row.requester_company ?? ""),
    category: String(row.category ?? ""),
    city: String(row.city ?? ""),
    country: String(row.country ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    budgetHint: String(row.budget_hint ?? ""),
    timeline: String(row.timeline ?? ""),
    status: asStatus(String(row.status ?? "open")),
    maxResponses: Number(row.max_responses ?? 5),
    createdAt: String(row.created_at ?? ""),
    expiresAt: String(row.expires_at ?? ""),
    responsesCount: Number(row.responses_count ?? 0),
  };
}

export async function listManagedResponses(
  token: string,
): Promise<ManagedResponse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "list_responses_for_manage_token",
    { p_token: token },
  );

  if (error || !data) return [];

  const rows = data as Record<string, unknown>[];
  return Promise.all(
    rows.map(async (row) => {
      const companyId = String(row.company_id);
      const companySlug = String(row.company_slug ?? "");
      const trust = await getTrustProfile(companyId, companySlug);
      return {
        responseId: String(row.response_id),
        companyId,
        companyName: String(row.company_name ?? ""),
        companySlug,
        companyVerified: Boolean(row.company_verified),
        message: String(row.message ?? ""),
        status: asResponseStatus(String(row.status ?? "sent")),
        createdAt: String(row.created_at ?? ""),
        trustLevel: trust.level,
      } satisfies ManagedResponse;
    }),
  );
}
