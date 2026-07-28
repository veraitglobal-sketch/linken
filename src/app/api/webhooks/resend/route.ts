import { NextResponse } from "next/server";
import { Resend } from "resend";
import { extractDomain } from "@/features/verification/domain";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isProductionEnv() {
  return (
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
  );
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    // Never accept unverifiable webhook traffic in production.
    if (isProductionEnv()) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "RESEND_WEBHOOK_SECRET not set" }, { status: 400 });
  }

  const payload = await request.text();
  const resend = new Resend(process.env.RESEND_API_KEY || "re_local_verify_only");

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      webhookSecret: secret,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "email.bounced" && event.type !== "email.complained" && event.type !== "email.delivered") {
    return NextResponse.json({ received: true });
  }
  const eventType = event.type === "email.bounced" ? "bounce" : event.type === "email.complained" ? "complaint" : "delivery";

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin client missing" }, { status: 503 });

  const recipients = event.data.to ?? [];
  for (const to of recipients) {
    const address = to.trim().toLowerCase();
    const domain = extractDomain(address.split("@")[1] ?? "") ?? "";

    // Partial unique index (provider_event_id where not null) can't be an
    // upsert target via the JS client — insert and swallow the duplicate
    // (23505) so Resend's at-least-once retries stay idempotent.
    const { error: insertErr } = await admin.from("email_deliverability_events").insert({
      event_type: eventType,
      email: address,
      domain,
      provider_event_id: `${event.data.email_id}:${address}`,
      payload: event.data,
    });
    if (insertErr && insertErr.code !== "23505") {
      console.error("[resend webhook] insert failed", insertErr.message);
    }

    if (eventType === "bounce" || eventType === "complaint") {
      await admin.from("email_suppressions").upsert(
        { kind: "address", value: address, reason: `auto: ${eventType}` },
        { onConflict: "kind,value" },
      );
    }
  }

  return NextResponse.json({ received: true });
}
