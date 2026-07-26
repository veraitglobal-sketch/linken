"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logProfileEvent } from "@/features/analytics/log";
import { sendInquiryNotifyEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendInquiry(formData: FormData) {
  const companySlug = String(formData.get("company_slug") ?? "").trim();
  const senderName = String(formData.get("sender_name") ?? "").trim();
  const senderEmail = String(formData.get("sender_email") ?? "")
    .trim()
    .toLowerCase();
  const senderCompany = String(formData.get("sender_company") ?? "").trim();
  const serviceInterestRaw = String(
    formData.get("service_interest") ?? "",
  ).trim();
  const forMember = String(formData.get("for_member") ?? "").trim();
  const messageRaw = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("company_website") ?? "").trim();
  const backRaw = String(formData.get("back") ?? "").trim();
  const back =
    backRaw.startsWith("/") && !backRaw.startsWith("//")
      ? backRaw
      : companySlug
        ? `/c/${companySlug}`
        : "/";

  // Honeypot: bots fill hidden fields — silently succeed
  if (honeypot) {
    redirect(`${back}${back.includes("?") ? "&" : "?"}inquirySent=1`);
  }

  if (!companySlug || !senderName || !isValidEmail(senderEmail)) {
    redirect(
      `${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent("Name and a valid email are required.")}`,
    );
  }
  if (messageRaw.length < 10) {
    redirect(
      `${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent("Message must be at least 10 characters.")}`,
    );
  }

  // Optional "For: Name, title" — never personal contact data, company inbox only.
  const serviceInterest =
    serviceInterestRaw ||
    (forMember.startsWith("For:") ? forMember : "") ||
    "";
  const message =
    forMember && !messageRaw.startsWith("For:")
      ? `${forMember}\n\n${messageRaw}`
      : messageRaw;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_inquiry", {
    p_company_slug: companySlug,
    p_sender_name: senderName,
    p_sender_email: senderEmail,
    p_sender_company: senderCompany,
    p_message: message,
    p_service_interest: serviceInterest,
  });

  if (error || !data?.[0]) {
    redirect(
      `${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent(error?.message ?? "Could not send inquiry.")}`,
    );
  }

  const row = data[0] as {
    inquiry_id: string;
    company_name: string;
    company_slug: string;
  };

  await logProfileEvent(companySlug, "inquiry", "direct");

  // Instant email for ALL plans — a firm must not miss inbound work.
  const admin = createAdminClient();
  if (!admin) {
    redirect(
      `${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent("Message saved, but notification email is unavailable. Try again later.")}`,
    );
  }

  const { data: companyRow } = await admin
    .from("companies")
    .select("id")
    .eq("slug", row.company_slug)
    .maybeSingle();

  if (companyRow?.id) {
    const { emitWebhookEvent } = await import("@/features/webhooks/dispatch");
    emitWebhookEvent(
      companyRow.id as string,
      "inquiry.created",
      {
        inquiry_id: row.inquiry_id,
        sender_name: senderName,
        sender_email: senderEmail,
        sender_company: senderCompany || null,
        service_interest: serviceInterest || null,
        message: message.slice(0, 2000),
        company_slug: row.company_slug,
      },
      `inquiry_${row.inquiry_id}`,
    );
  }

  const { data: notifyEmail } = await admin.rpc("get_inquiry_notify_email", {
    p_inquiry_id: row.inquiry_id,
  });

  if (notifyEmail) {
    const sent = await sendInquiryNotifyEmail({
      to: notifyEmail as string,
      senderName,
      senderEmail,
      senderCompany,
      serviceInterest,
      message,
      companyName: row.company_name,
      companySlug: row.company_slug,
    });
    if (!sent.ok) {
      redirect(
        `${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent(sent.error ?? "Message saved, but notify email failed.")}`,
      );
    }
  }

  revalidatePath(`/c/${companySlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inbox");
  redirect(`${back}${back.includes("?") ? "&" : "?"}inquirySent=1`);
}

const ALLOWED_STATUS = new Set(["new", "read", "replied", "archived"]);

export async function updateInquiryStatus(formData: FormData) {
  const inquiryId = String(formData.get("inquiry_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!inquiryId || !ALLOWED_STATUS.has(status)) {
    redirect("/dashboard/inbox?error=Invalid%20inquiry%20update");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/dashboard")}`);

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId);

  if (error) {
    redirect(
      `/dashboard/inbox?error=${encodeURIComponent(error.message ?? "Update failed")}`,
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
