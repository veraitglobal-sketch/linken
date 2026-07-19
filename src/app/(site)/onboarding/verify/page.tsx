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
 * Non-blocking — “Do it later” continues to the profile.
 */
export default async function OnboardingVerifyPage() {
  const { user, company } = await getDashboardSession();
  if (!user) redirect("/login?next=/onboarding/verify");
  if (!company) redirect("/onboarding");

  const verification = await getCompanyVerification(company.id);
  if (verification?.verified) {
    redirect(`/c/${company.slug}`);
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-14 sm:py-20">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Almost there
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-[-0.04em] text-ink">
        Verify your domain
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Your work email didn’t match your website domain, so we couldn’t verify
        automatically. Domain verification unlocks official partnerships and the
        Verified badge — it takes a few minutes (DNS, meta tag, or matching
        email).
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/dashboard/verification" className="h-11 px-5">
          Verify now
        </Button>
        <Button
          href={`/c/${company.slug}`}
          variant="secondary"
          className="h-11 px-5"
        >
          Do it later
        </Button>
      </div>

      <p className="mt-8 text-[13px] text-[#64748b]">
        You can open your profile anytime — verification waits in{" "}
        <Link
          href="/dashboard/verification"
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Workspace → Verification
        </Link>
        .
      </p>
    </section>
  );
}
