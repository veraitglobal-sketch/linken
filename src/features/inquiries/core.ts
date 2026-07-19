import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ALLOWED = new Set(["new", "read", "replied", "archived"]);

export async function updateInquiryStatusCore(
  admin: SupabaseClient,
  companyId: string,
  inquiryId: string,
  status: string,
): Promise<CoreResult<{ id: string; status: string }>> {
  if (!ALLOWED.has(status)) {
    return {
      ok: false,
      error: "status must be one of: new, read, replied, archived.",
    };
  }

  const { data, error } = await admin
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId)
    .eq("company_id", companyId)
    .select("id, status")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Inquiry not found." };
  return {
    ok: true,
    data: { id: data.id as string, status: data.status as string },
  };
}
