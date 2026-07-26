import { sendBrandedEmail } from "@/lib/email/send";
import { getEmailSiteUrl } from "@/lib/site";

/** Notify a partner that another firm is displaying a custom logo for them. */
export async function sendLogoWallOverrideEmail(input: {
  to: string;
  partnerName: string;
  ownerName: string;
  ownerSlug: string;
  logoUrl: string;
  rejectToken: string;
}) {
  const rejectUrl = `${getEmailSiteUrl()}/logo-wall/reject?owner=${encodeURIComponent(input.ownerSlug)}&token=${encodeURIComponent(input.rejectToken)}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.ownerName} is showing a logo for ${input.partnerName} on Hansala`,
    content: {
      eyebrow: "Logo wall",
      headline: "A firm is displaying a logo for you",
      paragraphs: [
        `${input.ownerName} uploaded a replacement logo for ${input.partnerName} on their Hansala partner logo wall.`,
        "If this mark is not yours, you can clear it in one click. Your Hansala profile logo is not changed.",
      ],
      cta: { label: "This is not our logo", href: rejectUrl },
      finePrint:
        "You can also opt out of logo display in partner widgets from your company settings.",
    },
    logLabel: "logo-wall-override",
    linkForLog: rejectUrl,
  });
}
