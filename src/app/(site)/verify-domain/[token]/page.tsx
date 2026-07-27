import type { Metadata } from "next";
import Link from "next/link";
import { confirmDomainVerificationToken } from "@/features/verification/email-verification-actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify domain",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function VerifyDomainPage({ params }: Props) {
  const { token } = await params;
  const result = await confirmDomainVerificationToken(token);

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Link not valid
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">{result.error}</p>
        <Link
          href="/dashboard/verification"
          className="mt-6 inline-block text-sm font-semibold underline"
        >
          Back to verification
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
        Domain verified
      </h1>
      <p className="mt-3 text-[15px] text-ink-soft">
        Your company domain is verified. The Verified badge is now active on
        your public profile.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {result.slug ? (
          <Button href={`/c/${result.slug}`} className="h-11 px-5">
            View profile
          </Button>
        ) : null}
        <Button
          href="/dashboard/verification?verified=email"
          variant="secondary"
          className="h-11 px-5"
        >
          Workspace
        </Button>
      </div>
    </section>
  );
}
