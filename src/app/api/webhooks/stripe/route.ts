import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  applySubscription,
  downgradeToFree,
} from "@/features/billing/sync";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function companyIdFromSubscription(
  sub: Stripe.Subscription,
): Promise<string | null> {
  return sub.metadata?.company_id ?? null;
}

async function companyIdFromSession(
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  return session.metadata?.company_id ?? null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client missing" }, { status: 503 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;
        const companyId = await companyIdFromSession(session);
        if (!companyId) break;
        const sub = await stripe.subscriptions.retrieve(String(session.subscription));
        const customerId = String(session.customer ?? sub.customer);
        await applySubscription(admin, companyId, sub, customerId);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = await companyIdFromSubscription(sub);
        if (!companyId) break;
        const customerId = String(sub.customer);
        await applySubscription(admin, companyId, sub, customerId);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = await companyIdFromSubscription(sub);
        if (!companyId) break;
        await downgradeToFree(admin, companyId);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook]", event.type, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
