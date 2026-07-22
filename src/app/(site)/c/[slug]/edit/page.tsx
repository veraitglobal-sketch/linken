import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProfileEditHub } from "@/components/company/profile-edit-hub";
import { isCompanyOwnerSlug } from "@/features/case-studies/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { toSettingsCompany } from "@/features/company/settings-company";
import { extractDomain } from "@/features/verification/domain";
import { getSiteUrl } from "@/lib/site";
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
  slugChanged?: string;
  coverUpdated?: string;
  coverCleared?: string;
}): string | null {
  if (params.slugChanged === "1") {
    return "Handle updated. Old links now redirect here automatically.";
  }
  if (params.saved === "1") return "Profile saved.";
  if (params.ok === "logo") return "Logo refreshed from your website.";
  if (params.ok === "logo-cleared") return "Logo removed.";
  if (params.ok === "logoUpload") return "Logo uploaded.";
  if (params.coverUpdated === "1") return "Cover photo updated.";
  if (params.coverCleared === "1") return "Cover photo removed.";
  return null;
}

export default async function CompanyEditPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  const company = await getCompanyForPage(slug);
  if (!company) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/c/${slug}/edit`)}`);
  }

  const isOwner = await isCompanyOwnerSlug(slug);
  if (!isOwner) {
    redirect(`/c/${slug}`);
  }

  const { data: full } = await supabase
    .from("companies")
    .select(
      "name, slug, tagline, description, category, city, country, website, linkedin_url, facebook_url, services, accepting_clients, verified, logo_url, logo_source, cover_image_url",
    )
    .eq("id", company.id)
    .maybeSingle();

  if (!full) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-[14px] text-muted">
        Could not load company.{" "}
        <Link href={`/c/${slug}`} className="font-semibold text-ink underline">
          Back to profile
        </Link>
      </div>
    );
  }

  const settings = toSettingsCompany(full, new URL(getSiteUrl()).host);

  return (
    <ProfileEditHub
      company={settings}
      slug={full.slug}
      name={full.name}
      logoUrl={full.logo_url}
      website={full.website}
      logoSource={full.logo_source}
      coverImageUrl={full.cover_image_url}
      initials={initials(full.name)}
      domain={extractDomain(full.website ?? "")}
      verified={Boolean(full.verified)}
      error={q.error}
      flash={flashMessage(q)}
    />
  );
}
