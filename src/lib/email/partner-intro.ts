import { sendBrandedEmail } from "@/lib/email/send";
import { getEmailSiteUrl } from "@/lib/site";

export async function sendPartnerIntroEmail(input: {
  to: string;
  fromName: string;
  fromSlug: string;
  partnerName: string;
  target: string;
  message: string;
}) {
  const inboxUrl = `${getEmailSiteUrl()}/dashboard/inbox`;
  const profileUrl = `${getEmailSiteUrl()}/c/${input.fromSlug}`;
  const who = input.target.trim()
    ? `They would like an introduction to ${input.target.trim()}.`
    : "They would like an introduction in your confirmed network.";
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.fromName} asks ${input.partnerName} for an intro on Hansala`,
    content: {
      eyebrow: "Partner intro",
      headline: `${input.fromName} asks for an introduction`,
      paragraphs: [
        `${input.fromName} is an official partner of ${input.partnerName} on Hansala.`,
        who,
        input.message.trim() || "No extra note.",
      ],
      cta: { label: "Open inbox", href: inboxUrl },
      finePrint: `Their profile: ${profileUrl}`,
    },
    logLabel: "partner-intro",
    linkForLog: inboxUrl,
  });
}
