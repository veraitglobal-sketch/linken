import Link from "next/link";

type Props = {
  /** Shown under primary auth / create actions. */
  action?: "continue" | "create";
};

/** Minimal Terms + Privacy notice for auth and onboarding. */
export function LegalConsent({ action = "continue" }: Props) {
  const lead =
    action === "create"
      ? "By creating a company you agree to our"
      : "By continuing you agree to our";

  return (
    <p className="text-center text-[12px] leading-relaxed text-muted">
      {lead}{" "}
      <Link
        href="/terms"
        className="font-semibold text-ink underline-offset-2 hover:underline"
      >
        Terms
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        className="font-semibold text-ink underline-offset-2 hover:underline"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
