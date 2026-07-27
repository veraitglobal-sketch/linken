import { sendBrandedEmail } from "@/lib/email/send";
import { getEmailSiteUrl } from "@/lib/site";

export async function sendDomainVerificationEmail(input: {
  to: string;
  domain: string;
  token: string;
  expiresMinutes: number;
}) {
  const verifyUrl = `${getEmailSiteUrl()}/verify-domain/${input.token}`;
  const expiry = `${input.expiresMinutes} minutes`;

  return sendBrandedEmail({
    to: input.to,
    subject: `Verify domain ${input.domain}`,
    content: {
      eyebrow: "Domain verification",
      headline: `Confirm control of ${input.domain}`,
      paragraphs: [
        `Someone requested domain verification for ${input.domain} on Hansala.`,
        `This link expires in ${expiry}. It works once.`,
      ],
      cta: { label: "Verify domain", href: verifyUrl },
      finePrint: "If you did not request this, ignore this email.",
    },
    logLabel: "domain-verification",
    linkForLog: verifyUrl,
  });
}
