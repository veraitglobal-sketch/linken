import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getDashboardSession } from "@/features/dashboard/session";
import { getCompanyVerification } from "@/features/verification/queries";

export const metadata: Metadata = {
  title: "Verify your domain",
  robots: { index: false, follow: false },
};

/**
 * Mid-step after company creation when auto email-domain verification did not pass.
 * Non-blocking — “Do it later” continues to welcome activation.
 */
export default async function OnboardingVerifyPage() {
  const { user, company } = await getDashboardSession();
  if (!user) redirect("/login?next=/onboarding/verify");
  if (!company) redirect("/onboarding");

  const verification = await getCompanyVerification(company.id);
  if (verification?.verified) {
    redirect("/welcome?from=onboarding");
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-14 sm:py-20">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Almost there
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-[-0.04em] text-ink">
        Verify your domain
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Your work email didn&apos;t match your website domain automatically.
        Verify by email to a mailbox on your site, or use DNS / meta tag.
        Verification unlocks official partnerships and the Verified badge. You
        can do this later — your next goal is still the first mutual
        confirmation.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/dashboard/verification" className="h-11 px-5">
          Verify now
        </Button>
        <Button
          href="/welcome?from=onboarding"
          variant="secondary"
          className="h-11 px-5"
        >
          Do it later
        </Button>
      </div>

      <p className="mt-8 text-[13px] text-muted">
        You can open{" "}
        <Link
          href={`/c/${company.slug}`}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          your profile
        </Link>{" "}
        anytime — verification waits in Workspace → Verification.
      </p>
    </section>
  );
}
