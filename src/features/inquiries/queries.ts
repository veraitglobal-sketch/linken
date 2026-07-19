import { createClient } from "@/lib/supabase/server";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

const COLUMNS =
  "id, company_id, sender_name, sender_email, sender_company, message, service_interest, status, created_at";

function mapRow(row: {
  id: string;
  company_id: string;
  sender_name: string;
  sender_email: string;
  sender_company: string;
  message: string;
  service_interest: string;
  status: string;
  created_at: string;
}): Inquiry {
  return {
    id: row.id,
    companyId: row.company_id,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    senderCompany: row.sender_company ?? "",
    message: row.message,
    serviceInterest: row.service_interest ?? "",
    status: row.status as InquiryStatus,
    createdAt: row.created_at,
  };
}

export type InquiryDashboardData = {
  inquiries: Inquiry[];
  newCount: number;
  monthCount: number;
};

export async function getInquiriesForOwnerCompany(
  companyId: string,
): Promise<InquiryDashboardData> {
  const empty: InquiryDashboardData = {
    inquiries: [],
    newCount: 0,
    monthCount: 0,
  };
  if (!companyId) return empty;

  try {
    const supabase = await createClient();
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const [listRes, newRes, monthRes] = await Promise.all([
      supabase
        .from("inquiries")
        .select(COLUMNS)
        .eq("company_id", companyId)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "new"),
      supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("created_at", monthStart.toISOString()),
    ]);

    return {
      inquiries: (listRes.data ?? []).map(mapRow),
      newCount: newRes.count ?? 0,
      monthCount: monthRes.count ?? 0,
    };
  } catch {
    return empty;
  }
}
