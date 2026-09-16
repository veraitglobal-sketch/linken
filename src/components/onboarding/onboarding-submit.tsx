"use client";

import { useFormStatus } from "react-dom";

type Props = {
  signedIn: boolean;
  partnerMode: boolean;
};

export function OnboardingSubmit({ signedIn, partnerMode }: Props) {
  const { pending } = useFormStatus();
  const label = signedIn
    ? partnerMode
      ? "Create partner workspace"
      : "Create company profile"
    : "Create account";

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep disabled:opacity-60"
    >
      {pending ? "Creating…" : label}
    </button>
  );
}
