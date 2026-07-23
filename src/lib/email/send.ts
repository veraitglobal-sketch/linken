import { Resend } from "resend";
import {
  renderBrandedEmail,
  renderPlainText,
  type BrandedEmailContent,
} from "@/lib/email/template";
import { getEmailSiteUrl } from "@/lib/site";

export type SendBrandedInput = {
  to: string;
  subject: string;
  content: BrandedEmailContent;
  logLabel: string;
  linkForLog: string;
};

export async function sendBrandedEmail(input: SendBrandedInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl = getEmailSiteUrl();
  const text = renderPlainText(input.content);
  const html = renderBrandedEmail(siteUrl, input.content);

  if (!apiKey) {
    console.info(
      `[${input.logLabel}] Email not sent (no RESEND_API_KEY). Link:`,
      input.linkForLog,
    );
    return { ok: true as const, mode: "log" as const, url: input.linkForLog };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "Hansala <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
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
