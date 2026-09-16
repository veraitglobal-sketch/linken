import type { Metadata } from "next";
import { ForgotPasswordPanel } from "@/components/auth/forgot-password-panel";
import { LoginStage } from "@/components/auth/login-stage";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    email?: string;
    sent?: string;
    resent?: string;
    error?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { email, sent, resent, error } = await searchParams;
  return (
    <section className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <LoginStage />
      <ForgotPasswordPanel
        email={email?.trim()}
        sent={sent === "1"}
        resent={resent === "1"}
        error={error}
      />
    </section>
  );
}
