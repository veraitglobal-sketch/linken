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

type PartnershipRequestEmailInput = {
  to: string;
  requesterName: string;
  recipientName: string;
};

/** Existing claimed company — open invite to accept on Partners. */
export async function sendPartnershipRequestEmail({
  to,
  requesterName,
  recipientName,
}: PartnershipRequestEmailInput) {
  const inboxUrl = `${getSiteUrl()}/dashboard/partners`;
  return sendTextEmail({
    to,
    subject: `${requesterName} wants to partner with ${recipientName} on Linken`,
    body: [
      `${requesterName} sent a partnership request to ${recipientName} on Linken.`,
      "",
      "Accept it in your workspace to become official partners (then it appears on the network graph):",
      inboxUrl,
      "",
      "If this was unexpected, you can decline in the Partners inbox.",
    ].join("\n"),
    logLabel: "partnership-request",
    linkForLog: inboxUrl,
  });
}

type ReferenceEmailInput = {
  to: string;
  providerName: string;
  clientName: string;
  service: string;
  startedYear: string;
  token: string;
};

export async function sendReferenceConfirmEmail({
  to,
  providerName,
  clientName,
  service,
  startedYear,
  token,
}: ReferenceEmailInput) {
  const url = `${getSiteUrl()}/confirm-reference/${token}`;
  return sendTextEmail({
    to,
    subject: `${providerName} asks you to confirm a service relationship on Linken`,
    body: [
      `${providerName} says they provide “${service}” for ${clientName}${startedYear ? ` since ${startedYear}` : ""}.`,
      "",
      "Confirm this service relationship:",
      url,
      "",
      "If this was unexpected, you can ignore the email.",
    ].join("\n"),
    logLabel: "service-reference",
    linkForLog: url,
  });
}

type InquiryNotifyInput = {
  to: string;
  senderName: string;
  senderEmail: string;
  senderCompany: string;
  serviceInterest: string;
  message: string;
  companyName: string;
  companySlug: string;
};

export async function sendInquiryNotifyEmail({
  to,
  senderName,
  senderEmail,
  senderCompany,
  serviceInterest,
  message,
  companyName,
  companySlug,
}: InquiryNotifyInput) {
  const dashboardUrl = `${getSiteUrl()}/dashboard`;
  return sendTextEmail({
    to,
    subject: `New inquiry via your Linken profile from ${senderName}`,
    body: [
      `Someone reached out to ${companyName} through your Linken profile.`,
      "",
      `From: ${senderName}`,
      `Email: ${senderEmail}`,
      senderCompany ? `Company: ${senderCompany}` : null,
      serviceInterest ? `Interested in: ${serviceInterest}` : null,
      "",
      "Message:",
      message,
      "",
      "Reply by email, or review in your dashboard:",
      dashboardUrl,
      "",
      `Profile: ${getSiteUrl()}/c/${companySlug}`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
    logLabel: "inquiry-notify",
    linkForLog: dashboardUrl,
  });
}

export async function sendGroupInviteEmail(input: {
  to: string;
  groupName: string;
  companyName: string;
  groupSlug: string;
}) {
  const dashboardUrl = `${getSiteUrl()}/dashboard`;
  const groupUrl = `${getSiteUrl()}/g/${input.groupSlug}`;
  return sendTextEmail({
    to: input.to,
    subject: `${input.groupName} invited ${input.companyName} to join on Linken`,
    body: [
      `${input.groupName} invited ${input.companyName} to join their company group on Linken.`,
      "",
      "Confirm or decline in your dashboard:",
      dashboardUrl,
      "",
      `Group page (after confirmation): ${groupUrl}`,
      "",
      "Membership is only public once you confirm.",
    ].join("\n"),
    logLabel: "group-invite",
    linkForLog: dashboardUrl,
  });
}

export async function sendOwnershipTransferEmail(input: {
  to: string;
  companyName: string;
  token: string;
}) {
  const url = `${getSiteUrl()}/transfer/${input.token}`;
  return sendTextEmail({
    to: input.to,
    subject: `Accept ownership of ${input.companyName} on Linken`,
    body: [
      `You have been invited to become the owner of ${input.companyName} on Linken.`,
      "",
      "Sign in (or create an account), then open this link to accept:",
      url,
      "",
      "References and confirmations stay with the company. Group membership is unchanged unless someone ends it.",
      "",
      "If you were not expecting this, ignore the email.",
    ].join("\n"),
    logLabel: "ownership-transfer",
    linkForLog: url,
  });
}

export async function sendTeamInviteEmail(input: {
  to: string;
  companyName: string;
  inviterHint: string;
}) {
  const loginUrl = `${getSiteUrl()}/login?next=/dashboard`;
  return sendTextEmail({
    to: input.to,
    subject: `You're invited to ${input.companyName} on Linken`,
    body: [
      `${input.inviterHint} invited you to help manage ${input.companyName} on Linken.`,
      "",
      "Create an account (or sign in) with this email:",
      loginUrl,
      "",
      // TODO: auto-link membership on registration for this email.
      "After you register, ask the company owner to add you again if access is not linked yet.",
    ].join("\n"),
    logLabel: "team-invite",
    linkForLog: loginUrl,
  });
}

type TeamJoinInviteEmailInput = {
  to: string;
  inviterName: string;
  companyName: string;
  token: string;
};

/** Consent-gated team invite — accept at /join/[token]. */
export async function sendTeamJoinInviteEmail({
  to,
  inviterName,
  companyName,
  token,
}: TeamJoinInviteEmailInput) {
  const joinUrl = `${getSiteUrl()}/join/${token}`;
  return sendTextEmail({
    to,
    subject: `${inviterName} te poziva u tim firme ${companyName} na Linken-u`,
    body: [
      `${inviterName} te poziva u tim firme ${companyName} na Linken-u.`,
      "",
      "Otvori link da prihvatiš ili odbiješ pozivnicu:",
      joinUrl,
      "",
      "Javni prikaz na profilu firme biraš ti — podrazumevano si sakriven.",
      "",
      "Ako nisi očekivao/la ovaj email, možeš ga ignorisati.",
    ].join("\n"),
    logLabel: "team-join-invite",
    linkForLog: joinUrl,
  });
}
