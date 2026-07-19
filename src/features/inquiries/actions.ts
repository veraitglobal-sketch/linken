"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logProfileEvent } from "@/features/analytics/log";
import { getEntitlements, parsePlan } from "@/features/plan/entitlements";
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
  const serviceInterest = String(formData.get("service_interest") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("company_website") ?? "").trim();

  const back = companySlug ? `/c/${companySlug}` : "/";

  // Honeypot: bots fill hidden fields — silently succeed
  if (honeypot) {
    redirect(`${back}?inquirySent=1`);
  }

  if (!companySlug || !senderName || !isValidEmail(senderEmail)) {
    redirect(
      `${back}?error=${encodeURIComponent("Name and a valid email are required.")}`,
    );
  }
  if (message.length < 10) {
    redirect(
      `${back}?error=${encodeURIComponent("Message must be at least 10 characters.")}`,
    );
  }

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
      `${back}?error=${encodeURIComponent(error?.message ?? "Could not send inquiry.")}`,
    );
  }

  const row = data[0] as {
    inquiry_id: string;
    company_name: string;
    company_slug: string;
  };

  await logProfileEvent(companySlug, "inquiry", "direct");

  const { data: companyPlan } = await supabase
    .from("companies")
    .select("plan")
    .eq("slug", companySlug)
    .maybeSingle();

  const entitlements = getEntitlements(parsePlan(companyPlan?.plan));

  // Instant email only for Pro/Founding. Free sees inquiries in the dashboard.
  // TODO: daily digest email for free plans via cron (separate topic).
  if (entitlements.instantInquiryNotifications) {
    const admin = createAdminClient();
    if (admin) {
      const { data: notifyEmail } = await admin.rpc("get_inquiry_notify_email", {
        p_inquiry_id: row.inquiry_id,
      });

      if (notifyEmail) {
        await sendInquiryNotifyEmail({
          to: notifyEmail as string,
          senderName,
          senderEmail,
          senderCompany,
          serviceInterest,
          message,
          companyName: row.company_name,
          companySlug: row.company_slug,
        });
      }
    } else {
      console.warn(
        "SUPABASE_SERVICE_ROLE_KEY not configured — inquiry notification email skipped.",
      );
    }
  }

  revalidatePath(`/c/${companySlug}`);
  revalidatePath("/dashboard");
  redirect(`${back}?inquirySent=1`);
}

const ALLOWED_STATUS = new Set(["new", "read", "replied", "archived"]);

export async function updateInquiryStatus(formData: FormData) {
  const inquiryId = String(formData.get("inquiry_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!inquiryId || !ALLOWED_STATUS.has(status)) {
    redirect("/dashboard?error=Invalid%20inquiry%20update");
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
      `/dashboard?error=${encodeURIComponent(error.message ?? "Update failed")}`,
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
