import type { Metadata } from "next";
import Link from "next/link";
import { DashboardAside } from "@/components/dashboard/dashboard-aside";
import { VerificationCard } from "@/components/verification/verification-card";
import { getDashboardSession } from "@/features/dashboard/session";
import { getPendingOwnershipTransfer } from "@/features/ownership/queries";
import { getCompanyVerification } from "@/features/verification/queries";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verification",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    verified?: string;
    linked?: string;
    ok?: string;
    socialSaved?: string;
  }>;
};

export default async function DashboardVerificationPage({ searchParams }: Props) {
  const params = await searchParams;
  const { user, company } = await getDashboardSession();

  if (!user) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/login?next=/dashboard/verification" className="font-semibold underline">
          Sign in
        </Link>{" "}
        to verify your company domain.
      </p>
    );
  }

  if (!company) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/onboarding" className="font-semibold underline">
          Create your company
        </Link>{" "}
        first.
      </p>
    );
  }

  const supabase = await createClient();
  const [{ data: full }, verification, tokenRes, pendingTransfer] =
    await Promise.all([
      supabase
        .from("companies")
        .select("website, linkedin_url, facebook_url")
        .eq("id", company.id)
        .maybeSingle(),
      getCompanyVerification(company.id),
      supabase.rpc("get_verify_token", { p_company_id: company.id }),
      getPendingOwnershipTransfer(company.id),
    ]);

  const flashOk =
    params.verified === "email" ||
    params.verified === "dns" ||
    params.verified === "meta"
      ? params.verified
      : params.linked === "1"
        ? "linked"
        : params.ok === "logo"
          ? "logo"
          : undefined;

  return (
    <div className="space-y-6 pb-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
          Verification
        </p>
        <h1 className="mt-1 font-display text-[clamp(1.6rem,2.5vw,2rem)] font-medium tracking-[-0.04em] text-ink">
          Prove domain ownership
        </h1>
        <p className="mt-1 max-w-xl text-[13px] text-ink-soft">
          Verified companies get stronger trust on the public profile. Subsidiaries
          verify their own domains separately.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <VerificationCard
          verification={
            verification ?? {
              companyId: company.id,
              verified: false,
              method: null,
              verifiedAt: null,
              websiteLinked: false,
              websiteLinkedAt: null,
              lastCheck: null,
            }
          }
          website={full?.website ?? ""}
          ownerEmail={user.email ?? ""}
          token={(tokenRes.data as string | null) ?? null}
          companySlug={company.slug}
          siteUrl={getSiteUrl()}
          flash={{
            ok: flashOk,
            error: params.error,
          }}
        />

        <DashboardAside
          company={company}
          linkedinUrl={full?.linkedin_url ?? ""}
          facebookUrl={full?.facebook_url ?? ""}
          socialSaved={params.socialSaved === "1"}
          pendingTransfer={pendingTransfer}
        />
      </div>
    </div>
  );
}
