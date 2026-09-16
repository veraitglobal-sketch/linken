import Link from "next/link";
import {
  requestPasswordReset,
  resendPasswordReset,
  verifyPasswordResetCode,
} from "@/features/auth/reset-password-actions";
import { StatusMessage } from "@/components/a11y/status-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  email?: string;
  sent?: boolean;
  resent?: boolean;
  error?: string;
};

export function ForgotPasswordPanel({ email, sent, resent, error }: Props) {
  if (sent && email) {
    return (
      <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-[420px]">
          <h1 className="font-display text-[34px] leading-tight font-semibold tracking-[-0.035em] text-ink">
            Check your email
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {resent
              ? "A new code is on its way to "
              : "If that address has an account, we sent a 4-digit code to "}
            <span className="font-semibold text-ink">{email}</span>.
          </p>
          {error ? (
            <StatusMessage tone="alert" className="mt-4">
              {error}
            </StatusMessage>
          ) : null}
          <form action={verifyPasswordResetCode} className="mt-6 space-y-3">
            <input type="hidden" name="email" value={email} />
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink">
                4-digit code
              </span>
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{4}"
                maxLength={4}
                required
                placeholder="0000"
                className="h-14 w-full rounded-lg border border-line bg-surface px-3.5 text-center font-display text-[28px] tracking-[0.28em] text-ink outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              />
            </label>
            <Button type="submit" className="h-12 w-full !rounded-full !bg-navy text-[15px] hover:!bg-navy-deep">
              Continue
            </Button>
          </form>
          <form action={resendPasswordReset} className="mt-3">
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-line px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-mute"
            >
              Send a new code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[420px]">
        <h1 className="font-display text-[34px] leading-tight font-semibold tracking-[-0.035em] text-ink">
          Forgot password
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Enter the work email on the account. We will send a 4-digit code.
        </p>
        {error ? (
          <StatusMessage tone="alert" className="mt-4">
            {error}
          </StatusMessage>
        ) : null}
        <form action={requestPasswordReset} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="mb-2 block text-[14px] font-semibold text-ink">Email</span>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              defaultValue={email}
              required
            />
          </label>
          <Button type="submit" className="mt-2 h-12 w-full !rounded-full !bg-navy text-[15px] hover:!bg-navy-deep">
            Send code
          </Button>
        </form>
        <p className="mt-4 text-center text-[13px] text-ink-soft">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
