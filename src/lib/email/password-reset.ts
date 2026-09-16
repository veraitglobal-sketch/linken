import { sendBrandedEmail } from "@/lib/email/send";

export async function sendPasswordResetEmail(to: string, code: string) {
  return sendBrandedEmail({
    to,
    subject: "Your Hansala password reset code",
    logLabel: "password-reset",
    linkForLog: "(4-digit code)",
    content: {
      eyebrow: "Account",
      headline: "Reset your password",
      code,
      paragraphs: [
        "Enter this code on Hansala to choose a new password. It expires in 15 minutes.",
      ],
      finePrint: "If you did not ask to reset your password, you can ignore this email.",
    },
  });
}
