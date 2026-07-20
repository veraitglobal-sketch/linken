import { updateCompanyProfile } from "@/features/company/profile-actions";
import type { SettingsCompany } from "@/features/company/settings-company";
import { CompanySettingsFields } from "@/components/company/company-settings-fields";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

export type { SettingsCompany };

type Props = { company: SettingsCompany };

export function CompanySettingsForm({ company }: Props) {
  return (
    <WorkspaceCard padded={false}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-paper/70 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
            Profile
          </p>
          <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Public company details
          </h2>
          <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-muted">
            These fields appear on your Linken profile. Your public URL slug
            never changes.
          </p>
        </div>
      </div>

      <form action={updateCompanyProfile}>
        <div className="px-5 py-5 sm:px-6">
          <CompanySettingsFields company={company} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper/40 px-5 py-4 sm:px-6">
          <p className="text-[11px] text-muted">
            Saved changes update your public profile immediately.
          </p>
          <Button type="submit" className="h-10 px-5">
            Save changes
          </Button>
        </div>
      </form>
    </WorkspaceCard>
  );
}
