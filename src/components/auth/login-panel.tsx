"use client";

import { useId } from "react";
import Link from "next/link";
import { signIn } from "@/features/auth/actions";
import { StatusMessage } from "@/components/a11y/status-message";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { LoginVerifyNotice } from "@/components/auth/login-verify-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { LegalConsent } from "@/components/legal/legal-consent";
import { publicAuthError } from "@/features/company/signup-error";

type Props = {
  error?: string;
  verify?: string;
  email?: string;
  resent?: string;
  next?: string;
};

export function LoginPanel({
  error,
  verify,
  email,
  resent,
  next = "/dashboard",
}: Props) {
  const showVerify = verify === "1";
  const nextPath =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const errorId = useId();
  const notice = publicAuthError(error);

  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[420px]">
        {showVerify ? (
          <LoginVerifyNotice
            email={email}
            resent={resent}
            nextPath={nextPath}
            error={notice ?? undefined}
          />
        ) : null}
        <div className="animate-rise">
          <h1 className="font-display text-[34px] leading-tight font-semibold tracking-[-0.035em] text-ink">
            Welcome back
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Enter with the account that owns your company profile.
          </p>
        </div>

        <div className="animate-rise-delay mt-7 grid grid-cols-2 gap-1 rounded-full bg-mute p-1">
          <span className="grid h-11 place-items-center rounded-full bg-surface text-[14px] font-semibold text-ink shadow-[0_4px_12px_-6px_rgba(14,31,28,0.3)]">
            Sign in
          </span>
          <Link
            href="/onboarding"
            className="grid h-11 place-items-center rounded-full text-[14px] font-semibold text-ink-soft hover:text-ink"
          >
            Create account
          </Link>
        </div>

        {!showVerify && notice ? (
          <StatusMessage id={errorId} tone="alert" className="mt-4">
            {notice}
          </StatusMessage>
        ) : null}

        <form
          action={signIn}
          className="animate-rise-late mt-6 flex flex-col gap-4"
          aria-describedby={notice && !showVerify ? errorId : undefined}
        >
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="mb-2 block text-[14px] font-semibold text-ink">Email</span>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              aria-invalid={notice ? true : undefined}
            />
          </label>
          <PasswordField
            name="password"
            autoComplete="current-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            forgotHref="/login/forgot"
            aria-invalid={notice ? true : undefined}
          />
          <Button type="submit" className="mt-2 h-12 w-full !rounded-full !bg-navy text-[15px] hover:!bg-navy-deep">
            Sign in
          </Button>
          <LegalConsent action="continue" />
        </form>

        <OAuthButtons next={nextPath} />
        <p className="mt-4 text-center text-[13px] text-ink-soft">
          New to Hansala?{" "}
          <Link href="/onboarding" className="font-semibold text-ink underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
