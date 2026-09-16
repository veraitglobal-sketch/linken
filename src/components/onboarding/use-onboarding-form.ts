"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { STEPS } from "@/components/onboarding/onboarding-ui";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";

export function useOnboardingForm(
  draft: OnboardingDraft | null,
  partnerMode: boolean,
  accountEmail: string | null,
) {
  const signedIn = Boolean(accountEmail);
  const defaultKind =
    parseOrganizationKind(draft?.organizationKind ?? "") ??
    (partnerMode ? "developer_partner" : "company");
  const resumeLast = Boolean(signedIn && draft?.name && draft.website);
  const [step, setStep] = useState(resumeLast ? 2 : 0);
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const passwordRef = useRef("");
  const sets = useRef<(HTMLFieldSetElement | null)[]>([]);
  const bind = (i: number) => (el: HTMLFieldSetElement | null) => {
    sets.current[i] = el;
  };

  const capturePassword = (persist: boolean) => {
    const pwd = sets.current[0]?.querySelector<HTMLInputElement>(
      'input[name="password"]',
    );
    const value = pwd?.value || passwordRef.current;
    if (value) passwordRef.current = value;
    if (persist && value) setPassword(value);
    return value;
  };

  const next = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const inputs = sets.current[step]?.querySelectorAll("input, select, textarea") ?? [];
    for (const el of inputs) {
      if (!(el as HTMLInputElement).reportValidity()) return;
    }
    if (step === 0) capturePassword(true);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  /* Native submit. Do not setState on the success path — a re-render here
     empties the parked password before the POST leaves the browser. */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const inputs = sets.current[step]?.querySelectorAll("input, select, textarea") ?? [];
    for (const el of inputs) {
      if (!(el as HTMLInputElement).reportValidity()) {
        e.preventDefault();
        return;
      }
    }
    const passwordValue = capturePassword(false) ?? "";
    const pwd = form.querySelector<HTMLInputElement>('input[name="password"]');
    if (pwd && passwordValue) pwd.value = passwordValue;
    if (!signedIn && passwordValue.length < 6) {
      e.preventDefault();
      setLocalError("Enter your work email and a password of at least 6 characters");
      setStep(0);
    }
  };

  const onPassword = (value: string) => {
    passwordRef.current = value;
    setPassword(value);
  };

  return {
    signedIn,
    defaultKind,
    resumeLast,
    step,
    setStep,
    password,
    onPassword,
    bind,
    next,
    onSubmit,
    localError,
  };
}
