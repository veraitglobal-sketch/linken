import "server-only";

import type Stripe from "stripe";
import {
  applySubscription,
  downgradeToFree,
} from "@/features/billing/sync";
import { accrueCommissionFromInvoicePaid } from "@/features/commissions/invoice-paid";
import { parsePlan } from "@/features/plan/entitlements";
import {
  inferSubscriptionChange,
  trackBillingLifecycle,
} from "@/features/product-analytics/billing";
import type { createAdminClient } from "@/lib/supabase/admin";

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

async function priorPlan(admin: Admin, companyId: string) {
  const { data } = await admin
    .from("companies")
    .select("plan")
    .eq("id", companyId)
    .maybeSingle();
  return parsePlan(data?.plan);
}

export async function handleStripeAnalyticsEvent(
  admin: Admin,
  stripe: Stripe,
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) return;
      const companyId = session.metadata?.company_id ?? null;
      if (!companyId) return;
      const previousPlan = await priorPlan(admin, companyId);
      const sub = await stripe.subscriptions.retrieve(
        String(session.subscription),
      );
      await applySubscription(
        admin,
        companyId,
        sub,
        String(session.customer ?? sub.customer),
      );
      const change = inferSubscriptionChange({
        previousPlan,
        nextPlan: "pro",
        isNewCheckout: true,
      });
      if (change) {
        void trackBillingLifecycle({
          companyId,
          event: change,
          plan: "pro",
          previousPlan,
        });
      }
      return;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const companyId = sub.metadata?.company_id ?? null;
      if (!companyId) return;
      const previousPlan = await priorPlan(admin, companyId);
      await applySubscription(admin, companyId, sub, String(sub.customer));
      const nextPlan =
        sub.status === "active" || sub.status === "trialing" ? "pro" : "free";
      const change = inferSubscriptionChange({
        previousPlan,
        nextPlan,
        isNewCheckout: false,
      });
      if (change) {
        void trackBillingLifecycle({
          companyId,
          event: change,
          plan: nextPlan,
          previousPlan,
        });
      }
      return;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const companyId = sub.metadata?.company_id ?? null;
      if (!companyId) return;
      const previousPlan = await priorPlan(admin, companyId);
      await downgradeToFree(admin, companyId);
      void trackBillingLifecycle({
        companyId,
        event: "subscription_cancelled",
        plan: "free",
        previousPlan,
      });
      return;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
      if (!subId) return;
      const sub = await stripe.subscriptions.retrieve(subId);
      const companyId = sub.metadata?.company_id ?? null;
      if (!companyId) return;
      void trackBillingLifecycle({
        companyId,
        event: "payment_failed",
        plan: await priorPlan(admin, companyId),
      });
      return;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await accrueCommissionFromInvoicePaid(admin, invoice);
      return;
    }
    default:
      return;
  }
}
