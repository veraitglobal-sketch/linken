import { Resend } from "resend";
import {
  renderBrandedEmail,
  renderPlainText,
  type BrandedEmailContent,
} from "@/lib/email/template";
import { isEmailSuppressed } from "@/lib/email/suppression";
import { maskUrlForLog } from "@/features/security/mask";
import { getEmailSiteUrl } from "@/lib/site";

export type SendBrandedInput = {
  to: string;
  subject: string;
  content: BrandedEmailContent;
  logLabel: string;
  linkForLog: string;
};

function isProductionEmail() {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

function resolveFromAddress():
  | { ok: true; from: string }
  | { ok: false; error: string } {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) {
    if (isProductionEmail()) {
      return {
        ok: false,
        error: "RESEND_FROM_EMAIL is required in production.",
      };
    }
    return { ok: true, from: "Hansala <onboarding@resend.dev>" };
  }
  if (
    isProductionEmail() &&
    /onboarding@resend\.dev/i.test(from)
  ) {
    return {
      ok: false,
      error:
        "RESEND_FROM_EMAIL must use your verified domain in production.",
    };
  }
  return { ok: true, from };
}

export async function sendBrandedEmail(input: SendBrandedInput) {
  if (await isEmailSuppressed(input.to)) {
    console.info(`[${input.logLabel}] Recipient is suppressed — not sending.`);
    return {
      ok: false as const,
      mode: "suppressed" as const,
      error: "Recipient is suppressed.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const siteUrl = getEmailSiteUrl();
  const text = renderPlainText(input.content);
  const html = renderBrandedEmail(siteUrl, input.content);

  if (!apiKey) {
    if (isProductionEmail()) {
      console.error(
        `[${input.logLabel}] RESEND_API_KEY missing — email not sent.`,
      );
      return {
        ok: false as const,
        mode: "resend" as const,
        error: "Email is not configured (RESEND_API_KEY).",
      };
    }
    console.info(
      `[${input.logLabel}] Email not sent (no RESEND_API_KEY). Link:`,
      maskUrlForLog(input.linkForLog),
    );
    return { ok: true as const, mode: "log" as const, url: input.linkForLog };
  }

  const fromResolved = resolveFromAddress();
  if (!fromResolved.ok) {
    console.error(`[${input.logLabel}]`, fromResolved.error);
    return {
      ok: false as const,
      mode: "resend" as const,
      error: fromResolved.error,
    };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromResolved.from,
    to: input.to,
    subject: input.subject,
    text,
    html,
  });

  if (error) {
    console.error(`[${input.logLabel}] Resend error:`, error);
    return { ok: false as const, mode: "resend" as const, error: error.message };
  }

  return { ok: true as const, mode: "resend" as const, url: input.linkForLog };
}
