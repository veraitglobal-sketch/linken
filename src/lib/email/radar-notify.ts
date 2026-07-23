import { sendBrandedEmail } from "@/lib/email/send";
import { getEmailSiteUrl } from "@/lib/site";

export async function sendProjectRequestManageEmail(input: {
  to: string;
  requesterName: string;
  title: string;
  manageToken: string;
}) {
  const manageUrl = `${getEmailSiteUrl()}/requests/manage/${input.manageToken}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `Your project request on Hansala: ${input.title}`,
    content: {
      eyebrow: "Project request",
      headline: input.title,
      paragraphs: [
        `Hi ${input.requesterName}, your request is live on Hansala Radar.`,
        "Verified firms in your category and city can respond. We will email you when someone replies.",
      ],
      cta: { label: "Track request", href: manageUrl },
    },
    logLabel: "project-request-manage",
    linkForLog: manageUrl,
  });
}

export async function sendProjectRequestDigestEmail(input: {
  to: string;
  companyName: string;
  requestTitles: string[];
}) {
  const radarUrl = `${getEmailSiteUrl()}/dashboard/radar`;
  const list = input.requestTitles.map((t) => `• ${t}`).join("\n");
  return sendBrandedEmail({
    to: input.to,
    subject: `New project request${input.requestTitles.length > 1 ? "s" : ""} via Hansala Radar`,
    content: {
      eyebrow: "Hansala Radar",
      headline: "New project requests",
      paragraphs: [
        `${input.requestTitles.length} request${input.requestTitles.length > 1 ? "s" : ""} match ${input.companyName}:`,
        list,
      ],
      cta: { label: "Open Radar", href: radarUrl },
      finePrint: "You receive at most one digest per day.",
    },
    logLabel: "radar-digest",
    linkForLog: radarUrl,
  });
}

export async function sendRadarWeeklyDigestEmail(input: {
  to: string;
  companyName: string;
  companyLeads: number;
  projectRequests: number;
  unsubscribeUrl?: string;
}) {
  const radarUrl = `${getEmailSiteUrl()}/dashboard/radar`;
  const unsub =
    input.unsubscribeUrl ?? `${getEmailSiteUrl()}/dashboard/radar?unsubscribe=1`;
  return sendBrandedEmail({
    to: input.to,
    subject: `Your Radar this week — ${input.companyLeads + input.projectRequests} new signal${input.companyLeads + input.projectRequests === 1 ? "" : "s"}`,
    content: {
      eyebrow: "Weekly Radar",
      headline: `Signals for ${input.companyName}`,
      paragraphs: [
        `• ${input.companyLeads} new company lead${input.companyLeads === 1 ? "" : "s"}`,
        `• ${input.projectRequests} new project request${input.projectRequests === 1 ? "" : "s"}`,
      ],
      cta: { label: "Open Radar", href: radarUrl },
      finePrint: `Unsubscribe: ${unsub}`,
    },
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
  const inboxUrl = `${getEmailSiteUrl()}/dashboard/inbox?tab=intros`;
  const profileUrl = input.senderSlug
    ? `${getEmailSiteUrl()}/c/${input.senderSlug}`
    : getEmailSiteUrl();
  return sendBrandedEmail({
    to: input.to,
    subject: `New intro via Hansala Radar from ${input.senderName}`,
    content: {
      eyebrow: "Radar intro",
      headline: `Intro from ${input.senderName}`,
      paragraphs: [`Offer: ${input.offer}`, `Profile: ${profileUrl}`],
      cta: { label: "Review in inbox", href: inboxUrl },
    },
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
  const manageUrl = `${getEmailSiteUrl()}/requests/manage/${input.manageToken}`;
  const profileUrl = `${getEmailSiteUrl()}/c/${input.companySlug}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.companyName} responded to “${input.requestTitle}”`,
    content: {
      eyebrow: "Project response",
      headline: `${input.companyName} replied`,
      paragraphs: [
        `Hi ${input.requesterName},`,
        input.message,
        `Company profile: ${profileUrl}`,
      ],
      cta: { label: "View all responses", href: manageUrl },
    },
    logLabel: "project-response-buyer",
    linkForLog: manageUrl,
  });
}
