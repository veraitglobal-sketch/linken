import "server-only";

import { emptyScheduling, type CompanyScheduling } from "@/features/scheduling/types";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

function mapRow(row: {
  scheduling_provider?: string | null;
  scheduling_url?: string | null;
  scheduling_label?: string | null;
}): CompanyScheduling {
  const provider =
    row.scheduling_provider === "calendly" || row.scheduling_provider === "calcom"
      ? row.scheduling_provider
      : null;
  const url = (row.scheduling_url ?? "").trim() || null;
  if (!provider || !url) return emptyScheduling();
  return {
    provider,
    url,
    label: (row.scheduling_label ?? "").trim() || "Book a call",
  };
}

export async function getSchedulingForCompanyId(
  companyId: string,
): Promise<CompanyScheduling> {
  if (!companyId) return emptyScheduling();
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("companies")
      .select("scheduling_provider, scheduling_url, scheduling_label")
      .eq("id", companyId)
      .maybeSingle();
    return mapRow(data ?? {});
  } catch {
    return emptyScheduling();
  }
}

export async function getSchedulingForActiveCompany(
  companyId: string,
): Promise<CompanyScheduling> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("companies")
      .select("scheduling_provider, scheduling_url, scheduling_label")
      .eq("id", companyId)
      .maybeSingle();
    return mapRow(data ?? {});
  } catch {
    return emptyScheduling();
  }
}
