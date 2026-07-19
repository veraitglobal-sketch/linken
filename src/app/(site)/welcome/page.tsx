import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WelcomeSetup } from "@/components/activation/welcome-setup";
import { getDashboardSession } from "@/features/dashboard/session";
import { getCompanyVerification } from "@/features/verification/queries";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ from?: string }>;
};

export default async function WelcomePage({ searchParams }: Props) {
  const { from: fromRaw } = await searchParams;
  const { user, company } = await getDashboardSession();

  if (!user) {
    redirect("/login?next=/welcome");
  }
  if (!company) {
    redirect("/onboarding");
  }

  const verification = await getCompanyVerification(company.id);
  const from =
    fromRaw === "confirm" || fromRaw === "onboarding" || fromRaw === "claim"
      ? fromRaw
      : "claim";

  return (
    <WelcomeSetup
      companySlug={company.slug}
      companyName={company.name}
      domainVerified={Boolean(verification?.verified)}
      from={from}
    />
  );
}
