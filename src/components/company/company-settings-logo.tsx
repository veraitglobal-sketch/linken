import { refreshLogo } from "@/features/logo/actions";
import { uploadCompanyLogo } from "@/features/company/profile-actions";
import { LogoRetryHint } from "@/components/logo/logo-retry-hint";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type Props = {
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  logoSource?: string | null;
  initials: string;
};

export function CompanySettingsLogo({
  name,
  logoUrl,
  website,
  logoSource,
  initials,
}: Props) {
  const isManual = logoSource === "manual";

  return (
    <WorkspaceCard>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1a5c51] uppercase">
        Logo
      </p>
      <p className="mt-1 text-[13px] text-[#64748b]">
        Upload replaces the auto logo. Fetch pulls from your website when auto
        mode is on.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <LogoMark
          initials={initials}
          logoUrl={logoUrl}
          website={website}
          size="lg"
          className="rounded-2xl"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[12px] text-[#94a3b8]">
            {isManual ? "Source: uploaded (manual)" : "Source: website (auto)"}
            {name ? ` · ${name}` : null}
          </p>
          <LogoRetryHint
            logoSource={logoSource}
            website={website}
            back="/dashboard/settings"
          />
          <form
            action={uploadCompanyLogo}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              required
              className="max-w-full text-[12px] text-[#64748b] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef1f6] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
            />
            <Button type="submit" variant="secondary" className="h-10">
              Upload logo
            </Button>
          </form>
          <form action={refreshLogo}>
            <input type="hidden" name="back" value="/dashboard/settings" />
            <Button
              type="submit"
              variant="ghost"
              className="h-10"
              disabled={isManual || !website}
              title={
                isManual
                  ? "Uploaded logos are not replaced automatically."
                  : !website
                    ? "Add a website first."
                    : "Fetch logo from website"
              }
            >
              Fetch from website
            </Button>
          </form>
        </div>
      </div>
    </WorkspaceCard>
  );
}
