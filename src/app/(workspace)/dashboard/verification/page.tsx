import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { VerificationCard } from "@/components/verification/verification-card";
import { VerificationDone } from "@/components/verification/verification-done";
import { VerificationLinked } from "@/components/verification/verification-linked";
import { VerificationStatusStrip } from "@/components/verification/verification-status-strip";
import {
  flashSuccessMessage,
  methodLabel,
  VerificationError,
  VerificationSuccess,
} from "@/components/verification/verification-flash";
import { extractDomain, domainsMatch } from "@/features/verification/domain";
import { getEmailVerificationContext } from "@/features/verification/email-verification-context";
import { discoverVerificationEmails } from "@/features/verification/email-verification-discover";
import { getCompanyVerification } from "@/features/verification/queries";
import { assertCompanySection } from "@/features/workspace/company-gate";
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
    domainChanged?: string;
    sent?: string;
  }>;
};

export default async function DashboardVerificationPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("verification");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Verification" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Verification">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/verification"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to verify your company domain.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Verification">
        <p className="text-[14px] text-muted">
          <Link
            href="/onboarding"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const supabase = await createClient();
  const [{ data: full }, verification, tokenRes, emailCtx] = await Promise.all([
    supabase
      .from("companies")
      .select("website, created_by_company_id")
      .eq("id", company.id)
      .maybeSingle(),
    getCompanyVerification(company.id),
    supabase.rpc("get_verify_token", { p_company_id: company.id }),
    getEmailVerificationContext(company.id),
  ]);

  const website = full?.website ?? "";
  const domain = extractDomain(website);
  const shortcutMatch = domainsMatch(website, user.email ?? "");
  const discovery =
    !shortcutMatch.ok && domain
      ? await discoverVerificationEmails()
      : null;
  const verified = Boolean(verification?.verified);
  const verifiedDate = verification?.verifiedAt
    ? new Date(verification.verifiedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

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
    <WorkspacePage
      title="Prove domain ownership"
      description="Verified companies earn stronger trust on the public profile. Subsidiaries verify their own domains separately."
      action={
        <Link
          href={`/c/${company.slug}/edit`}
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Edit profile
        </Link>
      }
    >
      <div className="space-y-4">
        {params.domainChanged === "1" ? (
          <p className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
            Your website domain changed, so verification was cleared. Complete a
            method below to restore the Verified badge.
          </p>
        ) : null}

        <VerificationStatusStrip
          domain={domain}
          verified={verified}
          methodLabel={
            verification?.method ? methodLabel(verification.method) : null
          }
        />

        {verified && domain ? (
          <>
            {flashOk ? (
              <VerificationSuccess message={flashSuccessMessage(flashOk)!} />
            ) : null}
            {params.error ? (
              <VerificationError message={params.error} />
            ) : null}
            <VerificationDone
              domain={domain}
              method={verification?.method ?? null}
              verifiedDate={verifiedDate}
              companySlug={company.slug}
            />
            <VerificationLinked
              companySlug={company.slug}
              linked={Boolean(verification?.websiteLinked)}
            />
          </>
        ) : (
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
            website={website}
            ownerEmail={user.email ?? ""}
            token={(tokenRes.data as string | null) ?? null}
            companySlug={company.slug}
            siteUrl={getSiteUrl()}
            lockDomain={emailCtx?.lockDomain ?? null}
            roleOnly={emailCtx?.roleOnly ?? Boolean(full?.created_by_company_id)}
            sentTo={params.sent ?? null}
            initialAddresses={
              discovery?.ok ? discovery.addresses : undefined
            }
            discoveryError={
              discovery && !discovery.ok ? discovery.error : undefined
            }
            flash={{
              ok: flashOk,
              error: params.error,
            }}
          />
        )}
      </div>
    </WorkspacePage>
  );
}
