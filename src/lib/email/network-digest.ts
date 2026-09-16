import { sendBrandedEmail } from "@/lib/email/send";
import { getEmailSiteUrl } from "@/lib/site";

export async function sendNetworkDigestEmail(input: {
  to: string;
  companyName: string;
  companySlug: string;
  profileViews: number;
  embedViews: number;
  partnerHint?: string | null;
}) {
  const site = getEmailSiteUrl();
  const insightsUrl = `${site}/dashboard/insights`;
  const profileUrl = `${site}/c/${input.companySlug}`;
  const pressUrl = `${profileUrl}/press`;
  const paragraphs = [
    `This week on Hansala for ${input.companyName}:`,
    `• ${input.profileViews} unique profile visit${input.profileViews === 1 ? "" : "s"}`,
    `• ${input.embedViews} embed view${input.embedViews === 1 ? "" : "s"}`,
  ];
  if (input.partnerHint) {
    paragraphs.push(input.partnerHint);
  }
  paragraphs.push(
    `Share a pair record or your press kit (${pressUrl}) so confirmed partners can cite you.`,
  );

  return sendBrandedEmail({
    to: input.to,
    subject: `Your network this week — ${input.profileViews + input.embedViews} signal${input.profileViews + input.embedViews === 1 ? "" : "s"}`,
    content: {
      eyebrow: "Network digest",
      headline: `${input.companyName} on Hansala`,
      paragraphs,
      cta: { label: "Open insights", href: insightsUrl },
      finePrint: `Opt out anytime from Insights. Profile: ${profileUrl}`,
    },
    logLabel: "network-digest",
    linkForLog: insightsUrl,
  });
}
