import { createClient } from "@/lib/supabase/server";
import type {
  MyRequestResponse,
  OpenProjectRequest,
  RequestResponseStatus,
} from "@/types/project-request";

export {
  getManagedRequest,
  listManagedResponses,
} from "@/features/project-requests/manage-queries";

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

export async function listOpenRequests(
  category: string,
  city: string,
): Promise<OpenProjectRequest[]> {
  if (!category.trim() || !city.trim()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_open_requests", {
    p_category: category.trim(),
    p_city: city.trim(),
  });

  if (error || !data) {
    console.error("list_open_requests:", error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    category: String(row.category ?? ""),
    city: String(row.city ?? ""),
    country: String(row.country ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    budgetHint: String(row.budget_hint ?? ""),
    timeline: String(row.timeline ?? ""),
    createdAt: String(row.created_at ?? ""),
    responsesCount: Number(row.responses_count ?? 0),
    maxResponses: Number(row.max_responses ?? 5),
  }));
}

export async function getCreditBalance(companyId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_credits")
    .select("balance")
    .eq("company_id", companyId)
    .maybeSingle();

  return Number(data?.balance ?? 0);
}

export async function listMyRequestResponses(): Promise<MyRequestResponse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_my_request_responses");

  if (error || !data) {
    console.error("list_my_request_responses:", error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    responseId: String(row.response_id),
    requestId: String(row.request_id),
    title: String(row.title ?? ""),
    category: String(row.category ?? ""),
    city: String(row.city ?? ""),
    message: String(row.message ?? ""),
    status: asResponseStatus(String(row.status ?? "sent")),
    createdAt: String(row.created_at ?? ""),
    requesterName: String(row.requester_name ?? ""),
    requesterEmail: String(row.requester_email ?? ""),
    requesterCompany: String(row.requester_company ?? ""),
  }));
}
