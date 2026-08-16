import {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
  sanitizeReferralSlug,
} from "@/features/growth/referral";

/** Absolute partner referral URL — public slug only. */
export function buildPartnerReferralUrl(
  siteUrl: string,
  companySlug: string,
): string | null {
  const slug = sanitizeReferralSlug(companySlug);
  if (!slug) return null;
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/onboarding?ref=${encodeURIComponent(slug)}`;
}

export {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
  sanitizeReferralSlug,
};
