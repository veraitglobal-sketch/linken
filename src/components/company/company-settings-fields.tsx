import type { SettingsCompany } from "@/features/company/settings-company";
import { CompanySettingsDetails } from "@/components/company/company-settings-details";
import { CompanySettingsIdentity } from "@/components/company/company-settings-identity";
import { ServicesTagInput } from "@/components/company/services-tag-input";

export function CompanySettingsFields({
  company,
}: {
  company: SettingsCompany;
}) {
  return (
    <div className="space-y-7">
      <CompanySettingsIdentity company={company} />

      <div className="border-t border-line" />

      <CompanySettingsDetails company={company} />

      <div className="border-t border-line" />

      <div className="space-y-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
          Services & availability
        </p>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Services
          </span>
          <ServicesTagInput defaultServices={company.services} />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-line bg-paper/50 px-4 py-3.5">
          <input
            type="checkbox"
            name="accepting_clients"
            value="true"
            defaultChecked={company.acceptingClients}
            className="mt-1 h-4 w-4 rounded border-line"
          />
          <span>
            <span className="block text-[13px] font-semibold text-ink">
              Accepting new clients
            </span>
            <span className="mt-0.5 block text-[12px] text-muted">
              Shown on your public profile and one-pager.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
