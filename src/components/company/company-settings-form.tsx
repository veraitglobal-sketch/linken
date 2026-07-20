import { updateCompanyProfile } from "@/features/company/profile-actions";
import type { SettingsCompany } from "@/features/company/settings-company";
import { CompanySettingsFields } from "@/components/company/company-settings-fields";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

export type { SettingsCompany };

type Props = { company: SettingsCompany };

export function CompanySettingsForm({ company }: Props) {
  return (
    <WorkspaceCard>
      <form action={updateCompanyProfile} className="space-y-5">
        <CompanySettingsFields company={company} />
        <Button type="submit" className="h-11">
          Save changes
        </Button>
      </form>
    </WorkspaceCard>
  );
}
