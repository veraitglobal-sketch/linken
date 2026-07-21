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
  const from = process.env.RESEND_FROM_EMAIL ?? "Hansala <onboarding@resend.dev>";
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
    subject: `${requesterName} asks you to confirm a project on Hansala`,
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
    subject: `${inviterName} listed ${companyName} as a partner on Hansala`,
    body: [
      `${inviterName} added ${companyName} as a partner on Hansala.`,
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
    subject: `${requesterName} wants to partner with ${recipientName} on Hansala`,
    body: [
      `${requesterName} sent a partnership request to ${recipientName} on Hansala.`,
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

/** Neutral notice when either party ends an accepted partnership. */
export async function sendPartnershipEndedEmail(input: {
  to: string;
  actorName: string;
  peerName: string;
}) {
  const partnersUrl = `${getSiteUrl()}/dashboard/partners`;
  return sendTextEmail({
    to: input.to,
    subject: `Partnership update on Hansala: ${input.actorName}`,
    body: [
      `${input.actorName} ended the partnership with ${input.peerName} on Hansala.`,
      "",
      "The link no longer appears on either public profile or the network map.",
      "Confirmed case study collaborations remain as historical evidence.",
      "",
      "You can send a new partnership request later from Partners:",
      partnersUrl,
    ].join("\n"),
    logLabel: "partnership-ended",
    linkForLog: partnersUrl,
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
    subject: `${providerName} asks you to confirm a service relationship on Hansala`,
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
    subject: `New inquiry via your Hansala profile from ${senderName}`,
    body: [
      `Someone reached out to ${companyName} through your Hansala profile.`,
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
    subject: `${input.groupName} invited ${input.companyName} to join on Hansala`,
    body: [
      `${input.groupName} invited ${input.companyName} to join their company group on Hansala.`,
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
    subject: `Accept ownership of ${input.companyName} on Hansala`,
    body: [
      `You have been invited to become the owner of ${input.companyName} on Hansala.`,
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
    subject: `You're invited to ${input.companyName} on Hansala`,
    body: [
      `${input.inviterHint} invited you to help manage ${input.companyName} on Hansala.`,
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
    subject: `${inviterName} te poziva u tim firme ${companyName} na Hansala-u`,
    body: [
      `${inviterName} te poziva u tim firme ${companyName} na Hansala-u.`,
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

export async function sendProjectRequestManageEmail(input: {
  to: string;
  requesterName: string;
  title: string;
  manageToken: string;
}) {
  const manageUrl = `${getSiteUrl()}/requests/manage/${input.manageToken}`;
  return sendTextEmail({
    to: input.to,
    subject: `Your project request on Hansala: ${input.title}`,
    body: [
      `Hi ${input.requesterName},`,
      "",
      `Your request “${input.title}” is live. Verified firms in your category and city can respond.`,
      "",
      "Track replies and close the request here (bookmark this link):",
      manageUrl,
      "",
      "We will email you when a firm responds.",
    ].join("\n"),
    logLabel: "project-request-manage",
    linkForLog: manageUrl,
  });
}

export async function sendProjectRequestDigestEmail(input: {
  to: string;
  companyName: string;
  requestTitles: string[];
}) {
  const radarUrl = `${getSiteUrl()}/dashboard/radar`;
  const list = input.requestTitles.map((t) => `• ${t}`).join("\n");
  return sendTextEmail({
    to: input.to,
    subject: `New project request${input.requestTitles.length > 1 ? "s" : ""} via Hansala Radar`,
    body: [
      `New project request${input.requestTitles.length > 1 ? "s" : ""} match ${input.companyName} via Hansala Radar:`,
      "",
      list,
      "",
      "Respond from Radar (1 credit each, verified firms only):",
      radarUrl,
      "",
      "You receive at most one of these digests per day.",
    ].join("\n"),
    logLabel: "radar-digest",
    linkForLog: radarUrl,
  });
}

/**
 * Weekly Radar summary (company leads + project requests).
 * TODO(cron): call once / week per radar firm; enforce max 1 send / 7 days.
 */
export async function sendRadarWeeklyDigestEmail(input: {
  to: string;
  companyName: string;
  companyLeads: number;
  projectRequests: number;
  unsubscribeUrl?: string;
}) {
  const radarUrl = `${getSiteUrl()}/dashboard/radar`;
  const unsub =
    input.unsubscribeUrl ?? `${getSiteUrl()}/dashboard/radar?unsubscribe=1`;
  const leads = input.companyLeads;
  const reqs = input.projectRequests;

  return sendTextEmail({
    to: input.to,
    subject: `Your Radar this week — ${leads + reqs} new signal${leads + reqs === 1 ? "" : "s"}`,
    body: [
      `Your Radar this week for ${input.companyName}:`,
      "",
      `• ${leads} new company lead${leads === 1 ? "" : "s"} (saved-search matches)`,
      `• ${reqs} new project request${reqs === 1 ? "" : "s"} in your categories`,
      "",
      "Open Radar:",
      radarUrl,
      "",
      "You receive at most one of these emails per week.",
      `Unsubscribe: ${unsub}`,
    ].join("\n"),
    logLabel: "radar-weekly-digest",
    linkForLog: radarUrl,
  });
}

export async function sendIntroNotifyEmail(input: {
  to: string;
  senderName: string;
  senderSlug: string;
  offer: string;
}) {
  const inboxUrl = `${getSiteUrl()}/dashboard/inbox?tab=intros`;
  const profileUrl = input.senderSlug
    ? `${getSiteUrl()}/c/${input.senderSlug}`
    : getSiteUrl();
  return sendTextEmail({
    to: input.to,
    subject: `New intro via Hansala Radar from ${input.senderName}`,
    body: [
      `${input.senderName} sent you an intro via Hansala Radar.`,
      "",
      `Offer: ${input.offer}`,
      "",
      `Profile: ${profileUrl}`,
      "",
      "Review in your Intros inbox (separate from profile inquiries):",
      inboxUrl,
      "",
      "Reply by email from the inbox — there is no chat on Hansala.",
    ].join("\n"),
    logLabel: "radar-intro-notify",
    linkForLog: inboxUrl,
  });
}

export async function sendProjectResponseBuyerEmail(input: {
  to: string;
  requesterName: string;
  companyName: string;
  companySlug: string;
  requestTitle: string;
  message: string;
  manageToken: string;
}) {
  const manageUrl = `${getSiteUrl()}/requests/manage/${input.manageToken}`;
  const profileUrl = `${getSiteUrl()}/c/${input.companySlug}`;
  return sendTextEmail({
    to: input.to,
    subject: `${input.companyName} responded to “${input.requestTitle}”`,
    body: [
      `Hi ${input.requesterName},`,
      "",
      `${input.companyName} responded to your project request on Hansala.`,
      "",
      "Message:",
      input.message,
      "",
      `Company profile: ${profileUrl}`,
      "",
      "Review all responses and close the request here:",
      manageUrl,
    ].join("\n"),
    logLabel: "project-response-buyer",
    linkForLog: manageUrl,
  });
}
