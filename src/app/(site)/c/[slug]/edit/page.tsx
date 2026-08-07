import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileEditGate } from "@/components/company/profile-edit-gate";
import { ProfileEditHub } from "@/components/company/profile-edit-hub";
import { isCompanyOwnerSlug } from "@/features/case-studies/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { toSettingsCompany } from "@/features/company/settings-company";
import { extractDomain } from "@/features/verification/domain";
import { getPublicHost } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit profile",
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    ok?: string;
    slugChanged?: string;
    coverUpdated?: string;
    coverCleared?: string;
  }>;
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CO"
  );
}

function flashMessage(q: {
  saved?: string;
  ok?: string;
  slugChanged?: string;
  coverUpdated?: string;
  coverCleared?: string;
}): string | null {
  if (q.slugChanged === "1") {
    return "Handle updated. Old links now redirect here automatically.";
  }
  if (q.saved === "1") return "Profile saved.";
  if (q.ok === "logo") return "Logo refreshed from your website.";
  if (q.ok === "logo-cleared") return "Logo removed.";
  if (q.ok === "logoUpload") return "Logo uploaded.";
  if (q.coverUpdated === "1") return "Cover photo updated.";
  if (q.coverCleared === "1") return "Cover photo removed.";
  return null;
}

export default async function CompanyEditPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  const company = await getCompanyForPage(slug);
  if (!company) notFound();

  let user: { id: string } | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) console.error("[CompanyEditPage] auth", error.message);
    user = data.user;
  } catch (err) {
    console.error("[CompanyEditPage] auth throw", err);
    return (
      <ProfileEditGate
        title="Sign in to edit"
        body="Your session could not be verified. Sign in again to continue."
        href={`/login?next=${encodeURIComponent(`/c/${slug}/edit`)}`}
        cta="Sign in"
      />
    );
  }

  if (!user) {
    return (
      <ProfileEditGate
        title="Sign in to edit"
        body="You need to be signed in as the company owner to edit this profile."
        href={`/login?next=${encodeURIComponent(`/c/${slug}/edit`)}`}
        cta="Sign in"
      />
    );
  }

  const isOwner = await isCompanyOwnerSlug(slug);
  if (!isOwner) {
    return (
      <ProfileEditGate
        title="Editing locked"
        body="Only the company owner can edit this profile."
        href={`/c/${slug}`}
        cta="View profile"
      />
    );
  }

  const supabase = await createClient();
  const { data: full, error: loadError } = await supabase
    .from("companies")
    .select(
      "name, slug, tagline, description, category, city, country, website, linkedin_url, facebook_url, services, accepting_clients, verified, invite_reminders_enabled, logo_url, logo_source, cover_image_url",
    )
    .eq("id", company.id)
    .maybeSingle();

  if (loadError) {
    console.error("[CompanyEditPage] load", slug, loadError.message);
    throw new Error(`Could not load company: ${loadError.message}`);
  }
  if (!full) {
    return (
      <ProfileEditGate
        title="Company not found"
        body="We could not load this company profile."
        href={`/c/${slug}`}
        cta="Back to profile"
      />
    );
  }

  const settings = toSettingsCompany(full, getPublicHost());
  const name = String(full.name ?? slug);

  return (
    <ProfileEditHub
      company={settings}
      slug={full.slug}
      name={name}
      logoUrl={full.logo_url}
      website={full.website}
      logoSource={full.logo_source}
      coverImageUrl={full.cover_image_url}
      initials={initials(name)}
      domain={extractDomain(full.website ?? "")}
      verified={Boolean(full.verified)}
      error={q.error}
      flash={flashMessage(q)}
    />
  );
}
