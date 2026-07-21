import Link from "next/link";
import { CompanySettingsForm } from "@/components/company/company-settings-form";
import { CompanySettingsLogo } from "@/components/company/company-settings-logo";
import { CompanySlugEditor } from "@/components/company/company-slug-editor";
import { ProfileEditLinks } from "@/components/company/profile-edit-links";
import { SettingsFlash } from "@/components/company/settings-flash";
import { SettingsStatusStrip } from "@/components/company/settings-status-strip";
import type { SettingsCompany } from "@/features/company/settings-company";
import { PRODUCT } from "@/lib/product-model";

type Props = {
  company: SettingsCompany;
  slug: string;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  logoSource?: string | null;
  initials: string;
  domain: string | null;
  verified: boolean;
  error?: string;
  flash?: string | null;
};

export function ProfileEditHub({
  company,
  slug,
  name,
  logoUrl,
  website,
  logoSource,
  initials,
  domain,
  verified,
  error,
  flash,
}: Props) {
  const backPath = `/c/${slug}/edit`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <header className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
          {PRODUCT.company.label}
        </p>
        <h1 className="mt-1.5 font-display text-[28px] font-semibold tracking-[-0.04em] text-ink">
          Edit {name}
        </h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">{PRODUCT.oneLiner}</span>
        </p>
        <Link
          href={`/c/${slug}`}
          className="mt-4 inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          View company
        </Link>
      </header>

      <div className="space-y-4">
        {error ? <SettingsFlash tone="error">{error}</SettingsFlash> : null}
        {flash ? <SettingsFlash>{flash}</SettingsFlash> : null}

        <SettingsStatusStrip
          domain={domain}
          verified={verified}
          acceptingClients={company.acceptingClients}
        />

        <ProfileEditLinks slug={slug} />

        <CompanySlugEditor slug={slug} publicHost={company.publicHost} />

        <CompanySettingsLogo
          name={name}
          logoUrl={logoUrl}
          website={website}
          logoSource={logoSource}
          initials={initials}
          backPath={backPath}
        />
        <CompanySettingsForm company={company} backPath={backPath} />
      </div>
    </div>
  );
}
