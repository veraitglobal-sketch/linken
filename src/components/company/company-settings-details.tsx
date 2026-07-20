import type { SettingsCompany } from "@/features/company/settings-company";
import { SettingsField } from "@/components/company/settings-field";
import { Input } from "@/components/ui/input";

export function CompanySettingsDetails({
  company,
}: {
  company: SettingsCompany;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
        Details & contact
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Category">
          <Input name="category" defaultValue={company.category} maxLength={80} />
        </SettingsField>
        <SettingsField label="City">
          <Input name="city" defaultValue={company.city} maxLength={80} />
        </SettingsField>
        <SettingsField label="Country">
          <Input name="country" defaultValue={company.country} maxLength={80} />
        </SettingsField>
        <SettingsField
          label="Website"
          hint={
            company.verified ? (
              <p className="mt-1.5 text-[11px] text-ember">
                Changing the domain clears verification — you&apos;ll need to
                prove ownership again.
              </p>
            ) : null
          }
        >
          <Input
            name="website"
            defaultValue={company.website}
            placeholder="https://example.com"
          />
        </SettingsField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="LinkedIn">
          <Input
            name="linkedin_url"
            type="url"
            defaultValue={company.linkedinUrl}
            placeholder="https://linkedin.com/company/…"
          />
        </SettingsField>
        <SettingsField label="Facebook">
          <Input
            name="facebook_url"
            type="url"
            defaultValue={company.facebookUrl}
            placeholder="https://facebook.com/…"
          />
        </SettingsField>
      </div>
    </div>
  );
}
