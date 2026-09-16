"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setNetworkDigestOptIn(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "").trim();
  const optIn = String(formData.get("opt_in") ?? "") === "1";
  if (!companyId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_network_digest_opt_in", {
    p_company_id: companyId,
    p_opt_in: optIn,
  });
  if (error) {
    console.error("[network-digest] opt-in:", error.message);
  }
  revalidatePath("/dashboard/insights");
}
