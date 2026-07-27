import "server-only";
import type { TestimonialSource } from "@/features/testimonials/types";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

export async function ensureTestimonialAfterConfirm(input: {
  token: string;
  source: Extract<TestimonialSource, "case_study" | "reference">;
}): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("ensure_testimonial_after_confirm", {
      p_token: input.token,
      p_source: input.source,
    });
    if (error || !data) return null;
    const siteUrl = getSiteUrl();
    return `${siteUrl}/testimonial/${data as string}`;
  } catch (err) {
    console.error("[ensureTestimonialAfterConfirm]", err);
    return null;
  }
}
