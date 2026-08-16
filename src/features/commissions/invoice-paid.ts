import "server-only";

import type Stripe from "stripe";
import {
  commissionCentsFromPaid,
  isUniqueViolation,
  shouldAccrueReferral,
} from "@/features/commissions/core";
import type { createAdminClient } from "@/lib/supabase/admin";

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

async function companyIdFromCustomer(
  admin: Admin,
  customerId: string | null,
): Promise<string | null> {
  if (!customerId) return null;
  const { data } = await admin
    .from("company_billing")
    .select("company_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.company_id ?? null;
}

/**
 * invoice.paid → 10% accrued for the referrer.
 * Idempotent on stripe_invoice_id (unique); duplicate keys are swallowed.
 */
export async function accrueCommissionFromInvoicePaid(
  admin: Admin,
  invoice: Stripe.Invoice,
): Promise<"accrued" | "skipped" | "duplicate"> {
  const amountPaid = invoice.amount_paid ?? 0;
  const commissionCents = commissionCentsFromPaid(amountPaid);
  if (commissionCents <= 0 || !invoice.id) return "skipped";

  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  const companyId = await companyIdFromCustomer(admin, customerId);
  if (!companyId) return "skipped";

  const { data: company } = await admin
    .from("companies")
    .select("referred_by_company_id")
    .eq("id", companyId)
    .maybeSingle();

  const referrerId = company?.referred_by_company_id ?? null;
  if (!shouldAccrueReferral({ companyId, referredByCompanyId: referrerId })) {
    return "skipped";
  }

  const currency = (invoice.currency || "eur").toLowerCase();
  const { error } = await admin.rpc("accrue_partner_commission", {
    p_referrer_company_id: referrerId,
    p_company_id: companyId,
    p_stripe_invoice_id: invoice.id,
    p_invoice_total_cents: amountPaid,
    p_commission_cents: commissionCents,
    p_currency: currency,
  });

  if (isUniqueViolation(error)) return "duplicate";
  if (error) throw error;
  return "accrued";
}
