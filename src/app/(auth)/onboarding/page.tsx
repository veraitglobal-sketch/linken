import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWorkspace } from "@/components/onboarding/onboarding-workspace";
import { isPlatformStaffUser } from "@/features/admin/is-platform-staff";
import { readOnboardingDraft } from "@/features/company/onboarding-draft";
import { captureReferralFromRefParam } from "@/features/growth/capture-referral";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create company",
  description: "Register your company profile on Hansala.",
};

type Props = {
  searchParams: Promise<{ error?: string; ref?: string; kind?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const { error, ref, kind } = await searchParams;
  await captureReferralFromRefParam(ref);
  const draft = await readOnboardingDraft();
  const kindHint =
    kind === "developer_partner" ? "developer_partner" : undefined;
  const mergedDraft = kindHint
    ? {
        ...(draft ?? {
          name: "",
          category: "",
          city: "",
          website: "",
          description: "",
        }),
        organizationKind: kindHint,
      }
    : draft;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isPlatformStaffUser(user.id, user.email))) {
    redirect("/admin");
  }

  return (
    <OnboardingWorkspace
      error={error}
      draft={mergedDraft}
      partnerMode={kindHint === "developer_partner"}
      accountEmail={user?.email ?? null}
    />
  );
}
