import type { Metadata } from "next";
import Link from "next/link";
import { LoginStage } from "@/components/auth/login-stage";
import { resendSignupConfirmation } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ email?: string }> };

/** After onboarding sign-up: the account exists, the company waits as a draft. */
export default async function OnboardingCheckEmailPage({ searchParams }: Props) {
  const { email } = await searchParams;

  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <div className="hidden lg:block">
        <LoginStage intent="company" />
      </div>
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 py-10">
        <div className="w-full max-w-[420px]">
          <span className="grid size-12 place-items-center rounded-2xl bg-lime-soft text-navy">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="mt-6 font-display text-[30px] leading-tight font-semibold tracking-[-0.03em] text-ink">
            Confirm your email
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-ink">{email || "your inbox"}</span>.
            Open it and you&rsquo;ll come back here to create your company
            profile — everything you entered is saved.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            The saved details are kept for 30 minutes on this device.
          </p>

          {email ? (
            <form action={resendSignupConfirmation} className="mt-8">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="next" value="/onboarding" />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-line px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-mute"
              >
                Resend confirmation email
              </button>
            </form>
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
