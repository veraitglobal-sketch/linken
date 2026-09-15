"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { StatusMessage } from "@/components/a11y/status-message";
import { LegalConsent } from "@/components/legal/legal-consent";
import { NetworkMark } from "@/components/marketing/network-mark";
import { OrganizationKindField } from "@/components/onboarding/organization-kind-field";
import { CategoryField } from "@/components/categories/category-field";
import { CountrySelect } from "@/components/geo/country-select";
import { createCompany, startOnboarding } from "@/features/company/actions";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";
import { cn } from "@/lib/cn";

type Props = {
  error?: string;
  draft?: OnboardingDraft | null;
  partnerMode?: boolean;
  accountEmail: string | null;
};

const FIELD =
  "h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/10";
const LABEL = "mb-1.5 block text-[13px] font-semibold text-ink";

const STEPS = [
  {
    title: "Who is setting this up?",
    lead: "Your work email is where confirmations and partner requests arrive.",
  },
  {
    title: "Your organization",
    lead: "The name and website clients will recognise.",
  },
  {
    title: "Tell clients what you do",
    lead: "Shown on your profile. You can change it later.",
  },
] as const;

function Req() {
  return <span className="text-muted"> *</span>;
}

function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-[12.5px] leading-relaxed text-muted">{hint}</span> : null}
    </label>
  );
}

/**
 * Three short steps in one form: the person, the organization, the details.
 *
 * Without an account the first step also creates it (work email + password)
 * and the form posts to `startOnboarding`, which keeps the company as a draft
 * until the email is confirmed. Signed in, the email is shown, not asked, and
 * the form posts straight to `createCompany`. Every field stays in the DOM so
 * one submit carries everything; each step validates before the next shows.
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

  /* Back from the confirmation email with a complete draft: open on the last
     step so finishing is one click. */
  const draftComplete = Boolean(
    signedIn && draft?.name && draft.website && draft.category && draft.city && draft.description,
  );
  const [step, setStep] = useState(draftComplete ? 2 : 0);
  const sets = useRef<(HTMLFieldSetElement | null)[]>([]);

  const next = (e: MouseEvent<HTMLButtonElement>) => {
    /* The Continue button is swapped for Submit on the last step. Without this
       the same click could land on the new submit button and send the form. */
    e.preventDefault();
    const inputs = sets.current[step]?.querySelectorAll("input, select, textarea") ?? [];
    for (const el of inputs) {
      if (!(el as HTMLInputElement).reportValidity()) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
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
            {draftComplete && step === 2
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

          <form action={signedIn ? createCompany : startOnboarding} className="mt-8">
            {/* 1 — the person */}
            <fieldset
              ref={(el) => {
                sets.current[0] = el;
              }}
              className={cn("m-0 space-y-4 border-0 p-0", step !== 0 && "hidden")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={<>Full name<Req /></>}>
                  <input
                    name="display_name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    required
                    defaultValue={draft?.displayName ?? ""}
                    className={FIELD}
                  />
                </Field>
                <Field label="Your role">
                  <input
                    name="display_title"
                    autoComplete="organization-title"
                    placeholder="Managing Director"
                    defaultValue={draft?.displayTitle ?? ""}
                    className={FIELD}
                  />
                </Field>
              </div>

              {signedIn ? (
                <div className="rounded-lg bg-mute px-4 py-3">
                  <p className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">
                    Signed in as
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold text-ink">{accountEmail}</p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    Confirmations and partner requests arrive here.
                  </p>
                </div>
              ) : (
                <>
                  <Field
                    label={<>Work email<Req /></>}
                    hint="Use your company address — if it matches your website, your domain is verified automatically."
                  >
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      required
                      className={FIELD}
                    />
                  </Field>
                  <Field label={<>Password<Req /></>}>
                    <input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className={FIELD}
                    />
                  </Field>
                </>
              )}
            </fieldset>

            {/* 2 — the organization */}
            <fieldset
              ref={(el) => {
                sets.current[1] = el;
              }}
              className={cn("m-0 space-y-4 border-0 p-0", step !== 1 && "hidden")}
            >
              <OrganizationKindField defaultKind={defaultKind} />
              <Field label={<>Organization name<Req /></>}>
                <input
                  name="name"
                  autoComplete="organization"
                  placeholder="Official name"
                  required
                  defaultValue={draft?.name ?? ""}
                  className={FIELD}
                />
              </Field>
              <Field label={<>Website<Req /></>} hint="Used for domain verification and shown on your profile.">
                <input
                  name="website"
                  placeholder="https://example.org"
                  required
                  defaultValue={draft?.website ?? ""}
                  className={FIELD}
                />
              </Field>
            </fieldset>

            {/* 3 — the details */}
            <fieldset
              ref={(el) => {
                sets.current[2] = el;
              }}
              className={cn("m-0 space-y-4 border-0 p-0", step !== 2 && "hidden")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={<>Sector<Req /></>}>
                  <CategoryField
                    required
                    defaultValue={draft?.category ?? ""}
                    className={FIELD}
                  />
                </Field>
                <Field label={<>City<Req /></>}>
                  <input
                    name="city"
                    autoComplete="address-level2"
                    placeholder="Berlin"
                    required
                    defaultValue={draft?.city ?? ""}
                    className={FIELD}
                  />
                </Field>
                <Field label={<>Country<Req /></>}>
                  <CountrySelect required className={FIELD} />
                </Field>
              </div>
              <Field label={<>Short description<Req /></>}>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="What you do — and who you work with."
                  defaultValue={draft?.description ?? ""}
                  className={`${FIELD} h-auto min-h-[6rem] resize-none py-2.5 leading-relaxed`}
                />
              </Field>
              <LegalConsent action="create" />
            </fieldset>

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
                <button
                  key="submit"
                  type="submit"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
                >
                  {signedIn
                    ? partnerMode
                      ? "Create partner workspace"
                      : "Create company profile"
                    : "Create account"}
                </button>
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
