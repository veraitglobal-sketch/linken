import type { Metadata } from "next";
import Link from "next/link";
import { LoginStage } from "@/components/auth/login-stage";
import { SignupCodeForm } from "@/components/auth/signup-code-form";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ email?: string; error?: string; resent?: string }> };

/** After onboarding sign-up: enter the 4-digit code from the email. */
export default async function OnboardingCheckEmailPage({ searchParams }: Props) {
  const { email, error, resent } = await searchParams;

  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <div className="hidden lg:block">
        <LoginStage />
      </div>
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 py-10">
        <div className="w-full max-w-[420px]">
          <h1 className="font-display text-[30px] leading-tight font-semibold tracking-[-0.03em] text-ink">
            Confirm your email
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            {resent === "1" ? "A new code is on its way to " : "We sent a 4-digit code to "}
            <span className="font-semibold text-ink">{email || "your inbox"}</span>.
            Enter it here to finish creating your company profile.
          </p>
          {email ? (
            <SignupCodeForm
              email={email}
              nextPath="/onboarding"
              from="check-email"
              error={error}
            />
          ) : null}
          <p className="mt-8 text-[14px] text-ink-soft">
            Wrong address?{" "}
            <Link href="/onboarding" className="font-semibold text-ink underline-offset-2 hover:underline">
              Start again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
