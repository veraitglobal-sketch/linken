import type { SettingsCompany } from "@/features/company/settings-company";
import {
  SettingsField,
  settingsTextareaClass,
} from "@/components/company/settings-field";
import { Input } from "@/components/ui/input";

export function CompanySettingsIdentity({
  company,
}: {
  company: SettingsCompany;
}) {
  return (
    <div className="space-y-4">
      <SectionLabel>Identity</SectionLabel>

      <SettingsField label="Organization name">
        <Input name="name" required defaultValue={company.name} maxLength={120} />
      </SettingsField>

      <SettingsField label="Tagline">
        <Input
          name="tagline"
          defaultValue={company.tagline}
          maxLength={160}
          placeholder="One short line under your name"
        />
      </SettingsField>

      <SettingsField label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={company.description}
          maxLength={4000}
          className={settingsTextareaClass}
          placeholder="What you do and how partners help deliver."
        />
      </SettingsField>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
      {children}
    </p>
  );
}
