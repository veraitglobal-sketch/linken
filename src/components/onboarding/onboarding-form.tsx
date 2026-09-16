"use client";

import Link from "next/link";
import { StatusMessage } from "@/components/a11y/status-message";
import { NetworkMark } from "@/components/marketing/network-mark";
import {
  DetailsStep,
  OrgStep,
  PersonStep,
} from "@/components/onboarding/onboarding-steps";
import { OnboardingSubmit } from "@/components/onboarding/onboarding-submit";
import { STEPS } from "@/components/onboarding/onboarding-ui";
import { useOnboardingForm } from "@/components/onboarding/use-onboarding-form";
import { createCompany } from "@/features/company/create-company";
import { startOnboarding } from "@/features/company/start-onboarding";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import { publicAuthError } from "@/features/company/signup-error";
import { cn } from "@/lib/cn";
import { PageViewBeacon } from "@/components/analytics/page-view-beacon";

type Props = {
  error?: string;
  draft?: OnboardingDraft | null;
  partnerMode?: boolean;
  accountEmail: string | null;
};

export function OnboardingForm({
  error,
  draft = null,
  partnerMode = false,
  accountEmail,
}: Props) {
  const flow = useOnboardingForm(draft, partnerMode, accountEmail);
  const current = STEPS[flow.step]!;
  const notice = publicAuthError(error) || flow.localError;

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
          Step {flow.step + 1} of {STEPS.length}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-[420px]">
          <PageViewBeacon event="signup_started" page="/onboarding" />
          <h1 className="font-display text-[30px] leading-tight font-semibold tracking-[-0.03em] text-ink">
            {flow.resumeLast && flow.step === 2
              ? "Finish your company profile"
              : flow.step === 0 && partnerMode
                ? "Register as a developer partner"
                : current.title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{current.lead}</p>
          {notice ? (
            <StatusMessage tone="alert" className="mt-5">
              {notice}
            </StatusMessage>
          ) : null}

          <form
            noValidate
            action={flow.signedIn ? createCompany : startOnboarding}
            onSubmit={flow.onSubmit}
            className="relative mt-8"
          >
            <PersonStep
              active={flow.step === 0}
              bind={flow.bind}
              signedIn={flow.signedIn}
              accountEmail={accountEmail}
              draft={draft}
              password={flow.password}
              onPassword={flow.onPassword}
            />
            <OrgStep
              active={flow.step === 1}
              bind={flow.bind}
              defaultKind={flow.defaultKind}
              draft={draft}
            />
            <DetailsStep active={flow.step === 2} bind={flow.bind} draft={draft} />

            <div className="mt-6 flex items-center gap-3">
              {flow.step > 0 ? (
                <button
                  type="button"
                  onClick={() => flow.setStep((s) => s - 1)}
                  className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-mute"
                >
                  Back
                </button>
              ) : null}
              {flow.step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={flow.next}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
                >
                  Continue
                </button>
              ) : (
                <OnboardingSubmit signedIn={flow.signedIn} partnerMode={partnerMode} />
              )}
            </div>
            {!flow.signedIn && flow.step === STEPS.length - 1 ? (
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                We&rsquo;ll email you a confirmation link. Your profile is
                created once you confirm.
              </p>
            ) : null}
          </form>
        </div>
      </div>

      <div className="text-center">
        {flow.signedIn ? null : (
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
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= flow.step ? "bg-navy" : "bg-line",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
