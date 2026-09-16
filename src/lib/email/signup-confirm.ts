import { sendBrandedEmail } from "@/lib/email/send";

export async function sendSignupConfirmEmail(to: string, code: string) {
  return sendBrandedEmail({
    to,
    subject: "Your Hansala confirmation code",
    logLabel: "signup-confirm",
    linkForLog: "(4-digit code)",
    content: {
      eyebrow: "Account",
      headline: "Confirm your email",
      code,
      paragraphs: [
        "Enter this code on Hansala to confirm this address. It expires in 15 minutes.",
      ],
      finePrint: "If you did not create a Hansala account, you can ignore this email.",
    },
  });
}

