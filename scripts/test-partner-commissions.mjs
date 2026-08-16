import assert from "node:assert/strict";
import test from "node:test";

/** Mirror src/features/commissions/core.ts + invoice.paid idempotency. */

const PARTNER_COMMISSION_RATE = 0.1;

function commissionCentsFromPaid(amountPaidCents) {
  if (!Number.isFinite(amountPaidCents) || amountPaidCents <= 0) return 0;
  return Math.round(amountPaidCents * PARTNER_COMMISSION_RATE);
}

function shouldAccrueReferral(input) {
  const referrer = input.referredByCompanyId?.trim() || null;
  if (!referrer) return false;
  if (referrer === input.companyId) return false;
  return true;
}

function isUniqueViolation(error) {
  return error?.code === "23505";
}

/** In-memory stand-in for partner_commissions + unique(stripe_invoice_id). */
function createCommissionStore() {
  const byInvoice = new Map();
  return {
    rows: byInvoice,
    insert(row) {
      if (byInvoice.has(row.stripe_invoice_id)) {
        return { error: { code: "23505" } };
      }
      byInvoice.set(row.stripe_invoice_id, row);
      return { error: null };
    },
  };
}

function accrueOnce(store, invoice) {
  const amountPaid = invoice.amount_paid ?? 0;
  const commissionCents = commissionCentsFromPaid(amountPaid);
  if (commissionCents <= 0 || !invoice.id) return "skipped";
  if (
    !shouldAccrueReferral({
      companyId: invoice.company_id,
      referredByCompanyId: invoice.referred_by_company_id,
    })
  ) {
    return "skipped";
  }
  const { error } = store.insert({
    stripe_invoice_id: invoice.id,
    commission_cents: commissionCents,
    invoice_total_cents: amountPaid,
  });
  if (isUniqueViolation(error)) return "duplicate";
  if (error) throw error;
  return "accrued";
}

test("10% of Pro invoice (€79) is 790 cents", () => {
  assert.equal(commissionCentsFromPaid(7900), 790);
});

test("zero or negative paid yields no commission", () => {
  assert.equal(commissionCentsFromPaid(0), 0);
  assert.equal(commissionCentsFromPaid(-100), 0);
});

test("skips when no referrer or self-referral", () => {
  assert.equal(
    shouldAccrueReferral({ companyId: "a", referredByCompanyId: null }),
    false,
  );
  assert.equal(
    shouldAccrueReferral({ companyId: "a", referredByCompanyId: "a" }),
    false,
  );
  assert.equal(
    shouldAccrueReferral({ companyId: "a", referredByCompanyId: "b" }),
    true,
  );
});

test("repeated invoice.paid inserts exactly one commission row", () => {
  const store = createCommissionStore();
  const invoice = {
    id: "in_test_same",
    amount_paid: 7900,
    company_id: "client",
    referred_by_company_id: "partner",
  };

  assert.equal(accrueOnce(store, invoice), "accrued");
  assert.equal(accrueOnce(store, invoice), "duplicate");
  assert.equal(accrueOnce(store, invoice), "duplicate");
  assert.equal(store.rows.size, 1);
  assert.equal(store.rows.get("in_test_same").commission_cents, 790);
});
