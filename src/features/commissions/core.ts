/** Pure commission math — invoice amount only, never confirmations. */

export const PARTNER_COMMISSION_RATE = 0.1;

/** Round 10% of Stripe amount_paid (already in cents). */
export function commissionCentsFromPaid(amountPaidCents: number): number {
  if (!Number.isFinite(amountPaidCents) || amountPaidCents <= 0) return 0;
  return Math.round(amountPaidCents * PARTNER_COMMISSION_RATE);
}

export function shouldAccrueReferral(input: {
  companyId: string;
  referredByCompanyId: string | null | undefined;
}): boolean {
  const referrer = input.referredByCompanyId?.trim() || null;
  if (!referrer) return false;
  if (referrer === input.companyId) return false;
  return true;
}

/** Postgres unique_violation — Stripe webhook redelivery. */
export function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === "23505";
}
