import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site";

type ConfirmationEmailInput = {
  to: string;
  requesterName: string;
  caseTitle: string;
  token: string;
};

export async function sendClientConfirmationEmail({
  to,
  requesterName,
  caseTitle,
  token,
}: ConfirmationEmailInput) {
  const confirmUrl = `${getSiteUrl()}/confirm/${token}`;
  const subject = `${requesterName} asks you to confirm a project on Linken`;
  const body = [
    `${requesterName} listed “${caseTitle}” as work delivered for your company.`,
    "",
    "Confirm that this project was done for you:",
    confirmUrl,
    "",
    "If you were not expecting this, you can ignore the email.",
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // TODO: Set RESEND_API_KEY (+ verified from-domain) to send real mail.
    console.info("[client-confirmation] Email not sent (no RESEND_API_KEY). Link:", confirmUrl);
    return { ok: true as const, mode: "log" as const, confirmUrl };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "Linken <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text: body,
  });

  if (error) {
    console.error("[client-confirmation] Resend error:", error);
    return { ok: false as const, mode: "resend" as const, error: error.message };
  }

  return { ok: true as const, mode: "resend" as const, confirmUrl };
}
