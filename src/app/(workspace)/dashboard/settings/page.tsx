import type { Metadata } from "next";
import Link from "next/link";
import { CompanySettingsForm } from "@/components/company/company-settings-form";
import { CompanySettingsLogo } from "@/components/company/company-settings-logo";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { toSettingsCompany } from "@/features/company/settings-company";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Company settings",
};

type Props = {
  searchParams: Promise<{ error?: string; saved?: string; ok?: string }>;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DashboardSettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanySection("settings");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Company settings" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Company settings" description="Edit your public profile.">
        <p className="text-sm text-[#64748b]">
          <Link href="/login?next=/dashboard/settings" className="font-semibold underline">
            Sign in
          </Link>{" "}
          to edit your company.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Company settings" description="Edit your public profile.">
        <p className="text-sm text-[#64748b]">
          <Link href="/onboarding" className="font-semibold underline">
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const supabase = await createClient();
  const { data: full } = await supabase
    .from("companies")
    .select(
      "name, slug, tagline, description, category, city, country, website, linkedin_url, facebook_url, services, accepting_clients, verified, logo_url, logo_source",
    )
    .eq("id", company.id)
    .maybeSingle();

  if (!full) {
    return (
      <WorkspacePage title="Company settings">
        <p className="text-sm text-[#64748b]">Could not load company profile.</p>
      </WorkspacePage>
    );
  }

  const flash =
    params.saved === "1"
      ? "Profile saved."
      : params.ok === "logo"
        ? "Logo refreshed from your website."
        : params.ok === "logoUpload"
          ? "Logo uploaded."
          : null;

  return (
    <WorkspacePage
      title="Company settings"
      description="Update the details shown on your public profile."
    >
      {params.error ? (
        <p className="mb-4 rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {params.error}
        </p>
      ) : null}
      {flash ? (
        <p className="mb-4 rounded-xl border border-[#1a5c51]/25 bg-[#1a5c51]/8 px-4 py-3 text-sm text-ink">
          {flash}
        </p>
      ) : null}

      <div className="space-y-5">
        <CompanySettingsLogo
          name={full.name}
          logoUrl={full.logo_url}
          website={full.website}
          logoSource={full.logo_source}
          initials={initials(full.name)}
        />
        <CompanySettingsForm
          company={toSettingsCompany(full, new URL(getSiteUrl()).host)}
        />
      </div>
    </WorkspacePage>
  );
}
