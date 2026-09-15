"use client";

import { useId, useState } from "react";
import { signIn, signUp } from "@/features/auth/actions";
import { StatusMessage } from "@/components/a11y/status-message";
import { LoginModeTab } from "@/components/auth/login-mode-tab";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { LoginVerifyNotice } from "@/components/auth/login-verify-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LegalConsent } from "@/components/legal/legal-consent";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";

type Mode = "sign-in" | "create";

type Props = {
  error?: string;
  verify?: string;
  email?: string;
  resent?: string;
  next?: string;
  intent?: "company" | "staff";
};

export function LoginPanel({
  error,
  verify,
  email,
  resent,
  next = "/dashboard",
  intent = "company",
}: Props) {
  const staff = intent === "staff";
  const [mode, setMode] = useState<Mode>("sign-in");
  const isCreate = !staff && mode === "create";
  const showVerify = verify === "1";
  const nextPath =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const errorId = useId();
  const tabId = useId();

  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[420px]">
      {isCreate ? (
        <PageViewBeacon event="signup_started" page="/login" />
      ) : null}
      {showVerify ? (
        <LoginVerifyNotice email={email} resent={resent} nextPath={nextPath} />
      ) : null}
      <div className="animate-rise">
        <h1 className="font-display text-[34px] leading-tight font-semibold tracking-[-0.035em] text-ink">
          {staff ? "Staff sign in" : isCreate ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
          {staff
            ? "Use a staff account. Company logins cannot open this."
            : isCreate
              ? "Start here. Next you register the company profile and publish your link."
              : "Enter with the account that owns your company profile."}
        </p>
      </div>

      {staff ? null : (
        <div
          className="animate-rise-delay mt-7 grid grid-cols-2 gap-1 rounded-full bg-mute p-1"
          role="tablist"
          aria-label="Account mode"
        >
          <LoginModeTab
            id={`${tabId}-signin`}
            active={!isCreate}
            onClick={() => setMode("sign-in")}
            label="Sign in"
          />
          <LoginModeTab
            id={`${tabId}-create`}
            active={isCreate}
            onClick={() => setMode("create")}
            label="Create account"
          />
        </div>
      )}

      {error ? (
        <StatusMessage id={errorId} tone="alert" className="mt-4">
          {error}
        </StatusMessage>
      ) : null}

      <div className="animate-rise-late mt-6 space-y-4">
        <form
          action={isCreate ? signUp : signIn}
          className="flex flex-col gap-4"
          aria-describedby={error ? errorId : undefined}
        >
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="mb-2 block text-[14px] font-semibold text-ink">
              Email
            </span>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder={staff ? "Email" : "you@company.com"}
              required
              aria-invalid={error ? true : undefined}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[14px] font-semibold text-ink">
              Password
            </span>
            <Input
              type="password"
              name="password"
              autoComplete={isCreate ? "new-password" : "current-password"}
              placeholder="At least 6 characters"
              required
              minLength={6}
              aria-invalid={error ? true : undefined}
            />
          </label>
          <Button type="submit" className="mt-2 h-12 w-full !rounded-full !bg-navy text-[15px] hover:!bg-navy-deep">
            {isCreate ? "Create account" : "Sign in"}
          </Button>
          <LegalConsent action={isCreate ? "create" : "continue"} />
        </form>

        {staff ? null : <OAuthButtons next={nextPath} />}

        {staff ? null : (
          <p className="text-center text-[13px] text-ink-soft">
            {isCreate ? (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("sign-in")}
                  className="min-h-11 font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Hansala?{" "}
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className="min-h-11 font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        )}
      </div>
      </div>
    </div>
  );
}
