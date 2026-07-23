import { sendBrandedEmail } from "@/lib/email/send";
import { getEmailSiteUrl } from "@/lib/site";

export async function sendInquiryNotifyEmail(input: {
  to: string;
  senderName: string;
  senderEmail: string;
  senderCompany: string;
  serviceInterest: string;
  message: string;
  companyName: string;
  companySlug: string;
}) {
  const dashboardUrl = `${getEmailSiteUrl()}/dashboard`;
  const profileUrl = `${getEmailSiteUrl()}/c/${input.companySlug}`;
  const detail = [
    `From: ${input.senderName}`,
    `Email: ${input.senderEmail}`,
    input.senderCompany ? `Company: ${input.senderCompany}` : null,
    input.serviceInterest ? `Interested in: ${input.serviceInterest}` : null,
    "",
    input.message,
  ]
    .filter(Boolean)
    .join("\n");

  return sendBrandedEmail({
    to: input.to,
    subject: `New inquiry via your Hansala profile from ${input.senderName}`,
    content: {
      eyebrow: "Profile inquiry",
      headline: `New message for ${input.companyName}`,
      paragraphs: ["Someone reached out through your Hansala profile:", detail],
      cta: { label: "Open dashboard", href: dashboardUrl },
      finePrint: `Profile: ${profileUrl}`,
    },
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
  const dashboardUrl = `${getEmailSiteUrl()}/dashboard`;
  const groupUrl = `${getEmailSiteUrl()}/g/${input.groupSlug}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.groupName} invited ${input.companyName} to join on Hansala`,
    content: {
      eyebrow: "Group invite",
      headline: `Join ${input.groupName}`,
      paragraphs: [
        `${input.groupName} invited ${input.companyName} to their company group on Hansala.`,
        "Membership is public only after you confirm.",
      ],
      cta: { label: "Confirm in dashboard", href: dashboardUrl },
      finePrint: `Group page (after confirmation): ${groupUrl}`,
    },
    logLabel: "group-invite",
    linkForLog: dashboardUrl,
  });
}

export async function sendTeamInviteEmail(input: {
  to: string;
  companyName: string;
  inviterHint: string;
}) {
  const loginUrl = `${getEmailSiteUrl()}/login?next=/dashboard`;
  return sendBrandedEmail({
    to: input.to,
    subject: `You're invited to ${input.companyName} on Hansala`,
    content: {
      eyebrow: "Team invite",
      headline: `Join ${input.companyName}`,
      paragraphs: [
        `${input.inviterHint} invited you to help manage ${input.companyName} on Hansala.`,
        "Create an account or sign in with this email address.",
      ],
      cta: { label: "Sign in to Hansala", href: loginUrl },
    },
    logLabel: "team-invite",
    linkForLog: loginUrl,
  });
}
