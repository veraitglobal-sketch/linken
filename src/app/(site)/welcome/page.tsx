import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WelcomeSetup } from "@/components/activation/welcome-setup";
import { getActivationChecklist } from "@/features/activation/checklist";
import { getDashboardSession } from "@/features/dashboard/session";

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

  const checklist = await getActivationChecklist(company.id);
  if (!checklist) {
    redirect("/onboarding");
  }

  const from =
    fromRaw === "confirm" || fromRaw === "onboarding" || fromRaw === "claim"
      ? fromRaw
      : "onboarding";

  return (
    <WelcomeSetup
      companySlug={company.slug}
      companyName={company.name}
      checklist={checklist}
      from={from}
    />
  );
}
