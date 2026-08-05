import "server-only";
import { offerTestimonialAfterConfirm } from "@/features/testimonials/post-confirm-notify";
import { getSiteUrl } from "@/lib/site";

/** After partnership accept — token URL for UI + optional email. */
export async function offerPartnershipTestimonial(input: {
  partnershipId: string;
  toEmail: string | null | undefined;
}): Promise<string | null> {
  const email = input.toEmail?.trim().toLowerCase() ?? "";
  if (email) {
    return offerTestimonialAfterConfirm({
      token: input.partnershipId,
      source: "partnership",
      toEmail: email,
    });
  }

  // Still create the pending row so the success UI can deep-link
  const { ensureTestimonialAfterConfirm } = await import(
    "@/features/testimonials/post-confirm"
  );
  return ensureTestimonialAfterConfirm({
    token: input.partnershipId,
    source: "partnership",
  });
}

export function testimonialOfferQuery(testimonialUrl: string | null): string {
  if (!testimonialUrl) return "";
  const site = getSiteUrl();
  const path = testimonialUrl.startsWith(site)
    ? testimonialUrl.slice(site.length)
    : testimonialUrl;
  return `&tm=${encodeURIComponent(path)}`;
}
