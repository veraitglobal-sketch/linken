import "server-only";
import { sendPostConfirmTestimonialEmail } from "@/lib/email";
import { ensureTestimonialAfterConfirm } from "@/features/testimonials/post-confirm";
import type { TestimonialSource } from "@/features/testimonials/types";
import { createClient } from "@/lib/supabase/server";

type ConfirmSource = Extract<
  TestimonialSource,
  "case_study" | "reference" | "partnership"
>;

async function providerNameForConfirm(
  token: string,
  source: ConfirmSource,
): Promise<string | null> {
  const supabase = await createClient();

  if (source === "case_study") {
    const { data } = await supabase
      .from("case_study_client_confirmation_requests")
      .select("requested_by_company_id, companies!inner(name)")
      .eq("token", token)
      .eq("status", "confirmed")
      .maybeSingle();
    const row = data as { companies?: { name?: string } } | null;
    return row?.companies?.name?.trim() || null;
  }

  if (source === "reference") {
    const { data } = await supabase
      .from("service_references")
      .select("provider_company_id, companies!inner(name)")
      .eq("confirm_token", token)
      .eq("status", "confirmed")
      .maybeSingle();
    const row = data as { companies?: { name?: string } } | null;
    return row?.companies?.name?.trim() || null;
  }

  // partnership — token is the partnership id
  const { data: p } = await supabase
    .from("partnerships")
    .select("requester_id")
    .eq("id", token)
    .eq("status", "accepted")
    .maybeSingle();
  if (!p?.requester_id) return null;
  const { data: co } = await supabase
    .from("companies")
    .select("name")
    .eq("id", p.requester_id)
    .maybeSingle();
  return co?.name?.trim() || null;
}

/**
 * Create testimonial token after confirm and email the confirmer a private link.
 * For partnership, `token` is the partnership UUID (see ensure_testimonial_after_confirm).
 */
export async function offerTestimonialAfterConfirm(input: {
  token: string;
  source: ConfirmSource;
  toEmail: string;
}): Promise<string | null> {
  const email = input.toEmail.trim().toLowerCase();
  if (!email) return null;

  const testimonialUrl = await ensureTestimonialAfterConfirm({
    token: input.token,
    source: input.source,
  });
  if (!testimonialUrl) return null;

  const providerName = await providerNameForConfirm(input.token, input.source);
  if (!providerName) return testimonialUrl;

  const sent = await sendPostConfirmTestimonialEmail({
    to: email,
    providerName,
    testimonialUrl,
  });
  if (!sent.ok) {
    console.error("[offerTestimonialAfterConfirm] email failed", sent.error);
  }

  return testimonialUrl;
}
