import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { trackReferenceConfirmedAnalytics } from "@/features/references/track-analytics";

type RefRow = {
  id?: string;
  provider_company_id?: string;
  client_name?: string;
  service?: string;
  invite_email?: string | null;
};

export async function afterServiceReferenceConfirmed(input: {
  supabase: SupabaseClient;
  token: string;
  company: { id: string; name: string; slug: string };
  refRow: unknown;
}) {
  const raw = Array.isArray(input.refRow) ? input.refRow[0] : input.refRow;
  const row = (raw ?? {}) as RefRow;

  const { refreshRank } = await import("@/features/ranking/refresh");
  await refreshRank(row.provider_company_id, input.company.id);

  if (!row.provider_company_id || !row.id) return;

  trackReferenceConfirmedAnalytics({
    providerCompanyId: row.provider_company_id,
    confirmerCompanyId: input.company.id,
  });

  const { data: provider } = await input.supabase
    .from("companies")
    .select("name, slug")
    .eq("id", row.provider_company_id)
    .maybeSingle();

  const { emitWebhookEvent } = await import("@/features/webhooks/dispatch");
  emitWebhookEvent(
    row.provider_company_id,
    "reference.confirmed",
    {
      reference_id: row.id,
      client_name: row.client_name ?? null,
      service: row.service ?? null,
      confirmed_by_company_id: input.company.id,
      confirmed_by_company_name: input.company.name,
      for_company_id: row.provider_company_id,
      for_company_name: (provider?.name as string) ?? null,
      for_company_slug: (provider?.slug as string) ?? null,
    },
    `reference_${row.id}`,
  );

  const {
    data: { user },
  } = await input.supabase.auth.getUser();
  let inviteEmail = row.invite_email?.trim() ?? "";
  if (!inviteEmail) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    if (admin) {
      const { data: ref } = await admin
        .from("service_references")
        .select("invite_email")
        .eq("confirm_token", input.token)
        .maybeSingle();
      inviteEmail = (ref?.invite_email as string | undefined)?.trim() ?? "";
    }
  }
  const toEmail = user?.email?.trim() || inviteEmail;
  if (!toEmail) return;

  const { offerTestimonialAfterConfirm } = await import(
    "@/features/testimonials/post-confirm-notify"
  );
  await offerTestimonialAfterConfirm({
    token: input.token,
    source: "reference",
    toEmail,
  });
}
