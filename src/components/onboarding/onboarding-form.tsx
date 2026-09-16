"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { StatusMessage } from "@/components/a11y/status-message";
import { NetworkMark } from "@/components/marketing/network-mark";
import {
  DetailsStep,
  OrgStep,
  PersonStep,
} from "@/components/onboarding/onboarding-steps";
import { OnboardingSubmit } from "@/components/onboarding/onboarding-submit";
import { STEPS } from "@/components/onboarding/onboarding-ui";
import { createCompany } from "@/features/company/create-company";
import { startOnboarding } from "@/features/company/start-onboarding";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";
import { cn } from "@/lib/cn";

type Props = {
  error?: string;
  draft?: OnboardingDraft | null;
  partnerMode?: boolean;
  accountEmail: string | null;
};

/**
 * Three short steps, one form. Inactive steps stay in the DOM (not display:none)
 * so Safari cannot wipe the password before Create. Unsigned posts to
 * startOnboarding; signed-in posts to createCompany.
 */
export function OnboardingForm({
  error,
  draft = null,
  partnerMode = false,
  accountEmail,
}: Props) {
  const signedIn = Boolean(accountEmail);
  const defaultKind =
    parseOrganizationKind(draft?.organizationKind ?? "") ??
    (partnerMode ? "developer_partner" : "company");
  const resumeLast = Boolean(signedIn && draft?.name && draft.website);
  const [step, setStep] = useState(resumeLast ? 2 : 0);
  const [password, setPassword] = useState("");
  const passwordRef = useRef("");
  const sets = useRef<(HTMLFieldSetElement | null)[]>([]);
  const bind = (i: number) => (el: HTMLFieldSetElement | null) => {
    sets.current[i] = el;
  };

  const capturePassword = () => {
    const pwd = sets.current[0]?.querySelector<HTMLInputElement>(
      'input[name="password"]',
    );
    const value = pwd?.value || passwordRef.current;
    if (value) {
      passwordRef.current = value;
      setPassword(value);
    }
    return value;
  };

  const next = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const inputs = sets.current[step]?.querySelectorAll("input, select, textarea") ?? [];
    for (const el of inputs) {
      if (!(el as HTMLInputElement).reportValidity()) return;
    }
    if (step === 0) capturePassword();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  /* Validate the visible step only. A full-form checkValidity() sent people
     back to step 1 whenever Safari had emptied the parked password field. */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const pwd = form.querySelector<HTMLInputElement>('input[name="password"]');
    const value = capturePassword();
    if (pwd && value) pwd.value = value;
    const inputs = sets.current[step]?.querySelectorAll("input, select, textarea") ?? [];
    for (const el of inputs) {
      if (!(el as HTMLInputElement).reportValidity()) {
        e.preventDefault();
        return;
      }
    }
    if (!signedIn && (value?.length ?? 0) < 6) {
      e.preventDefault();
      setStep(0);
    }
  };

  const current = STEPS[step]!;

  return (
    <div className="relative flex min-h-dvh flex-col bg-surface px-6 py-6 sm:px-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 text-ink lg:invisible">
          <span className="grid size-9 place-items-center rounded-xl bg-navy text-lime">
            <NetworkMark size={26} animate={false} />
          </span>
          <span className="font-display text-[18px] font-semibold tracking-[-0.03em]">Hansala</span>
        </Link>
        <span className="text-[13px] text-muted">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-[420px]">
          <h1 className="font-display text-[30px] leading-tight font-semibold tracking-[-0.03em] text-ink">
            {resumeLast && step === 2
              ? "Finish your company profile"
              : step === 0 && partnerMode
                ? "Register as a developer partner"
                : current.title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{current.lead}</p>
          {error ? (
            <StatusMessage tone="alert" className="mt-5">
              {error}
            </StatusMessage>
          ) : null}

          <form
            noValidate
            action={signedIn ? createCompany : startOnboarding}
            onSubmit={onSubmit}
            className="relative mt-8"
          >
            <PersonStep
              active={step === 0}
              bind={bind}
              signedIn={signedIn}
              accountEmail={accountEmail}
              draft={draft}
              password={password}
              onPassword={(v) => {
                passwordRef.current = v;
                setPassword(v);
              }}
            />
            <OrgStep active={step === 1} bind={bind} defaultKind={defaultKind} draft={draft} />
            <DetailsStep active={step === 2} bind={bind} draft={draft} />

            <div className="mt-6 flex items-center gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-mute"
                >
                  Back
                </button>
              ) : null}
              {step < STEPS.length - 1 ? (
                <button
                  key="continue"
                  type="button"
                  onClick={next}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
                >
                  Continue
                </button>
              ) : (
                <OnboardingSubmit signedIn={signedIn} partnerMode={partnerMode} />
              )}
            </div>
            {!signedIn && step === STEPS.length - 1 ? (
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                We&rsquo;ll email you a confirmation link. Your profile is
                created once you confirm.
              </p>
            ) : null}
          </form>
        </div>
      </div>

      <div className="text-center">
        {signedIn ? null : (
          <p className="text-[14px] text-ink-soft">
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent("/onboarding")}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
        <div className="mx-auto mt-4 flex max-w-[260px] gap-2" aria-hidden>
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-navy" : "bg-line")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
