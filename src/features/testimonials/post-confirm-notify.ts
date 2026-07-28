import "server-only";
import { sendPostConfirmTestimonialEmail } from "@/lib/email";
import { ensureTestimonialAfterConfirm } from "@/features/testimonials/post-confirm";
import type { TestimonialSource } from "@/features/testimonials/types";
import { createClient } from "@/lib/supabase/server";

type ConfirmSource = Extract<TestimonialSource, "case_study" | "reference">;

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

  const { data } = await supabase
    .from("service_references")
    .select("provider_company_id, companies!inner(name)")
    .eq("confirm_token", token)
    .eq("status", "confirmed")
    .maybeSingle();
  const row = data as { companies?: { name?: string } } | null;
  return row?.companies?.name?.trim() || null;
}

/** Create testimonial token after confirm and email the confirmer a private link. */
export async function offerTestimonialAfterConfirm(input: {
  token: string;
  source: ConfirmSource;
  toEmail: string;
}): Promise<void> {
  const email = input.toEmail.trim().toLowerCase();
  if (!email) return;

  const testimonialUrl = await ensureTestimonialAfterConfirm({
    token: input.token,
    source: input.source,
  });
  if (!testimonialUrl) return;

  const providerName = await providerNameForConfirm(input.token, input.source);
  if (!providerName) return;

  await sendPostConfirmTestimonialEmail({
    to: email,
    providerName,
    testimonialUrl,
  });
}
