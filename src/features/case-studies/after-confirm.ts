import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function afterClientConfirmation(input: {
  supabase: SupabaseClient;
  token: string;
  companyId: string;
  confirmed: boolean;
}) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data: row } = admin
    ? await admin
        .from("case_study_client_confirmation_requests")
        .select("requested_by_company_id, email")
        .eq("token", input.token)
        .maybeSingle()
    : { data: null };

  const { refreshRank } = await import("@/features/ranking/refresh");
  await refreshRank(
    (row?.requested_by_company_id as string | undefined) ?? null,
    input.companyId,
  );

  if (!input.confirmed) return;

  if (row?.requested_by_company_id) {
    const { logActivationEvent } = await import("@/features/activation/events");
    void logActivationEvent(
      row.requested_by_company_id as string,
      "first_reference_confirmed",
    );
  }

  const {
    data: { user },
  } = await input.supabase.auth.getUser();
  const toEmail =
    user?.email?.trim() || (row?.email as string | undefined)?.trim() || "";
  if (!toEmail) return;

  const { offerTestimonialAfterConfirm } = await import(
    "@/features/testimonials/post-confirm-notify"
  );
  await offerTestimonialAfterConfirm({
    token: input.token,
    source: "case_study",
    toEmail,
  });
}
