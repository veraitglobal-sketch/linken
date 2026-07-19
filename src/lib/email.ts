import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site";

async function sendTextEmail(input: {
  to: string;
  subject: string;
  body: string;
  logLabel: string;
  linkForLog: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // TODO: Set RESEND_API_KEY (+ verified from-domain) to send real mail.
    console.info(`[${input.logLabel}] Email not sent (no RESEND_API_KEY). Link:`, input.linkForLog);
    return { ok: true as const, mode: "log" as const, url: input.linkForLog };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "Linken <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.body,
  });

  if (error) {
    console.error(`[${input.logLabel}] Resend error:`, error);
    return { ok: false as const, mode: "resend" as const, error: error.message };
  }

  return { ok: true as const, mode: "resend" as const, url: input.linkForLog };
}

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
  return sendTextEmail({
    to,
    subject: `${requesterName} asks you to confirm a project on Linken`,
    body: [
      `${requesterName} listed “${caseTitle}” as work delivered for your company.`,
      "",
      "Confirm that this project was done for you:",
      confirmUrl,
      "",
      "If you were not expecting this, you can ignore the email.",
    ].join("\n"),
    logLabel: "client-confirmation",
    linkForLog: confirmUrl,
  });
}

type ClaimEmailInput = {
  to: string;
  inviterName: string;
  companyName: string;
  claimToken: string;
};

export async function sendClaimInviteEmail({
  to,
  inviterName,
  companyName,
  claimToken,
}: ClaimEmailInput) {
  const claimUrl = `${getSiteUrl()}/claim/${claimToken}`;
  return sendTextEmail({
    to,
    subject: `${inviterName} listed ${companyName} as a partner on Linken`,
    body: [
      `${inviterName} added ${companyName} as a partner on Linken.`,
      "",
      "A draft profile is waiting for you — claim it to manage partnerships and appear as confirmed:",
      claimUrl,
      "",
      "If this was unexpected, you can ignore the email.",
    ].join("\n"),
    logLabel: "claim-invite",
    linkForLog: claimUrl,
  });
}
