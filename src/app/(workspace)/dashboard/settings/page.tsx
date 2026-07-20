import type { Metadata } from "next";
import Link from "next/link";
import { CompanySettingsForm } from "@/components/company/company-settings-form";
import { CompanySettingsLogo } from "@/components/company/company-settings-logo";
import { SettingsFlash } from "@/components/company/settings-flash";
import { SettingsStatusStrip } from "@/components/company/settings-status-strip";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { toSettingsCompany } from "@/features/company/settings-company";
import { extractDomain } from "@/features/verification/domain";
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

function flashMessage(params: {
  saved?: string;
  ok?: string;
}): string | null {
  if (params.saved === "1") return "Profile saved.";
  if (params.ok === "logo") return "Logo refreshed from your website.";
  if (params.ok === "logo-cleared") return "Logo removed.";
  if (params.ok === "logoUpload") return "Logo uploaded.";
  return null;
}

export default async function DashboardSettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("settings");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Company settings" />;
  }

  if (!user) {
    return (
      <WorkspacePage
        title="Company settings"
        description="Edit your public profile."
      >
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/settings"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to edit your company.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage
        title="Company settings"
        description="Edit your public profile."
      >
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
        <p className="text-[14px] text-muted">Could not load company profile.</p>
      </WorkspacePage>
    );
  }

  const settings = toSettingsCompany(full, new URL(getSiteUrl()).host);
  const flash = flashMessage(params);
  const domain = extractDomain(full.website ?? "");

  return (
    <WorkspacePage
      title="Company settings"
      description="Update what appears on your public profile — logo, details, services, and availability."
      action={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/verification"
            className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            Verification
          </Link>
          <Link
            href={`/c/${full.slug}`}
            className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            Public profile
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {params.error ? (
          <SettingsFlash tone="error">{params.error}</SettingsFlash>
        ) : null}
        {flash ? <SettingsFlash>{flash}</SettingsFlash> : null}

        <SettingsStatusStrip
          domain={domain}
          verified={Boolean(full.verified)}
          acceptingClients={settings.acceptingClients}
        />

        <CompanySettingsLogo
          name={full.name}
          logoUrl={full.logo_url}
          website={full.website}
          logoSource={full.logo_source}
          initials={initials(full.name)}
        />
        <CompanySettingsForm company={settings} />
      </div>
    </WorkspacePage>
  );
}
